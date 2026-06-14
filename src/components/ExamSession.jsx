import { useState, useCallback, useRef, useEffect } from 'react'
import { Timer } from './Timer'
import { QuestionCard } from './QuestionCard'
import { VoiceInput } from './VoiceInput'
import { FollowUp } from './FollowUp'
import { ExaminerResponse } from './ExaminerResponse'
import { scoreAnswer, scoreAnswerFast, scoreAnswerEnrich } from '../services/anthropic'
import { useElevenLabs } from '../hooks/useElevenLabs'
import { isStrongAnswer, shouldShowProbe } from '../utils/scoringPrompt'
// ── Grader v2 — developer testing infrastructure (zero production impact) ─────
import { scoreAnswerV2 } from '../services/graderV2'
import { logV2Comparison } from '../utils/graderV2Log'
import { GraderV2Panel } from './GraderV2Panel'

const ENABLE_RABBIT_HOLE_DEPTH_2 = true

// ── Phase constants ───────────────────────────────────────────────────────────
// Per-question flow:
//   INPUT → SCORING →
//     pushbackMode 'pivot'        → speak pivot phrase, score 1/1, AUTO-ADVANCE
//     pushbackMode 'reflect'|     → speak pushbackLine, show PUSHBACK_PROBE
//       'consequence'
//     isStrongAnswer (≥4/≥4)      → speak interrupt phrase, AUTO-ADVANCE
//     shouldShowProbe (scores 2-3)→ speak probe text, show PROBE
//     else                        → speak neutral phrase, show EXAMINER
//
//   PUSHBACK_PROBE → re-score →
//     pushbackMode 'pivot'        → score 1/1, speak pivot phrase, AUTO-ADVANCE
//     else                        → speak neutral phrase, show EXAMINER
//
//   PROBE → store follow-up text, speak neutral phrase, show EXAMINER
//
//   EXAMINER → button click → advance()
const PHASE = {
  INPUT:          'input',
  SCORING:        'scoring',
  PUSHBACK_PROBE: 'pushback_probe',
  PROBE:          'probe',
  EXAMINER:       'examiner',
}

// ── Examiner phrase pools ─────────────────────────────────────────────────────
// Interrupt: spoken when a strong answer (≥4/≥4) is given — examiner cuts in
const INTERRUPT = {
  standard: ['Okay, let\'s move on.', 'Good, next question.', 'Alright, moving forward.'],
  advanced:  ['Mm-hmm.', 'Go on.', 'Is that all?'],
}
// Neutral: spoken after weak/average answers or after a follow-up
const NEUTRAL = {
  standard: ['Thank you.', 'Got it.', 'Okay.', 'I see.', 'Alright.'],
  advanced:  ['Mm-hmm.', 'Go on.', 'Is that all?'],
}
// Pivot: spoken when the examiner cuts off and advances (no further discussion)
const PIVOT = ['Thank you, let\'s move on.', 'Okay, moving to the next question.']

const PROBE_TEXT = 'Is there anything else you would add?'

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(pool, id) {
  return pool[Math.abs(id) % pool.length]
}

// Mobile browsers are slower to release the audio context after playback
function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768
}

export function ExamSession({ caseData, onComplete, isDevMode = false }) {
  const [qIdx,          setQIdx]          = useState(0)
  const [phase,         setPhase]         = useState(PHASE.INPUT)
  const [currentResult, setCurrentResult] = useState(null)
  const [examinerText,  setExaminerText]  = useState('')
  const [error,         setError]         = useState(null)
  // micReady becomes true only after question audio fully ends + 500 ms buffer
  const [micReady,      setMicReady]      = useState(false)
  // ── Grader v2 dev state — completely isolated from production logic ────────
  const [v2Result,      setV2Result]      = useState(null)
  const [v2Loading,     setV2Loading]     = useState(false)

  const resultsRef          = useRef([])
  const questionsRef        = useRef([])
  const followUpDepthRef    = useRef(0)
  const targetedElementRef  = useRef('')
  const originalScoreRef    = useRef(null)

  const { speak, stop, replay, isSpeaking, isLoading } = useElevenLabs()

  const question   = caseData.questions[qIdx]
  const total      = caseData.questions.length
  const difficulty = caseData.difficulty || 'standard'

  // Cumulative vignette context fed to the scoring prompt
  const caseContext = caseData.questions
    .slice(0, qIdx + 1)
    .map(q => q.context)
    .filter(Boolean)
    .join(' ')

  // ── Strict audio → mic sequence for each new question ────────────────────
  // Step 1: render question text (already done when effect fires)
  // Step 2: wait 800 ms (+ 400 ms on mobile)
  // Step 3: play ElevenLabs audio  — speak() returns a Promise
  // Step 4: await audio complete
  // Step 5: wait 500 ms
  // Step 6: setMicReady(true) — VoiceInput shows pulse animation
  // Step 7: user taps mic → SpeechRecognition.start()
  useEffect(() => {
    let cancelled = false
    setMicReady(false)

    const run = async () => {
      const delay = 800 + (isMobile() ? 400 : 0)
      await new Promise(r => setTimeout(r, delay))
      if (cancelled) return

      const segments = [question.context, question.question].filter(Boolean)
      await speak(segments)     // resolves when audio playback ends
      if (cancelled) return

      await new Promise(r => setTimeout(r, 500))
      if (cancelled) return

      setMicReady(true)
    }

    run()
    return () => { cancelled = true; stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx])

  // ── Build transcript and end session ─────────────────────────────────────────
  const buildTranscript = () =>
    resultsRef.current.map(r => ({
      question:     r.question,
      answer:       r.followUpAnswer
        ? `${r.candidateAnswer} [addendum: ${r.followUpAnswer}]`
        : r.candidateAnswer,
      correctness:  r.correctness,
      completeness: r.completeness,
      feedback:     r.feedback,
    }))

  // ── Advance to next question or end session ───────────────────────────────────
  const advance = useCallback(() => {
    const isLast = qIdx + 1 >= total
    if (isLast) {
      onComplete(resultsRef.current, questionsRef.current, buildTranscript())
    } else {
      setCurrentResult(null)
      setExaminerText('')
      setMicReady(false)
      setV2Result(null)
      setV2Loading(false)
      followUpDepthRef.current   = 0
      targetedElementRef.current = ''
      originalScoreRef.current   = null
      setQIdx(i => i + 1)
      setPhase(PHASE.INPUT)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, total, onComplete])

  // ── Shared: commit a pivot (score override + auto-advance) ────────────────────
  const commitPivot = useCallback((existingResult) => {
    const pivotPhrase = pick(PIVOT, existingResult.questionId)
    const pivoted = { ...existingResult, correctness: 1, completeness: 1, _pivotTriggered: true }
    resultsRef.current = [
      ...resultsRef.current.filter(r => r.questionId !== existingResult.questionId),
      pivoted,
    ]
    setCurrentResult(pivoted)
    speak(pivotPhrase)
    followUpDepthRef.current   = 0
    targetedElementRef.current = ''
    originalScoreRef.current   = null
    // Allow speech to start before UI jumps
    setTimeout(advance, 2500)
  }, [speak, advance])

  // ── Primary answer handler ────────────────────────────────────────────────────
  const handleAnswer = useCallback(async (candidateAnswer) => {
    console.log('[LATENCY]', { event: 'submit', timestamp: Date.now() })
    stop()
    setMicReady(false)
    setPhase(PHASE.SCORING)
    setError(null)

    questionsRef.current = [...questionsRef.current, question.question]

    try {
      const result = await scoreAnswerFast({
        question:       question.question,
        idealAnswer:    question.idealAnswer,
        candidateAnswer,
        caseContext,
        caseId:         `Case ${caseData.id}`,
        difficulty,
      })

      const t_llm_done = performance.now()
      console.log('[LATENCY]', { event: 'llm_complete', timestamp: Date.now() })

      const fullResult = {
        questionId:     question.id,
        question:       question.question,
        idealAnswer:    question.idealAnswer,
        candidateAnswer,
        followUpAnswer: null,
        points:         question.points,
        ...result,
      }

      resultsRef.current = [...resultsRef.current, fullResult]
      setCurrentResult(fullResult)

      originalScoreRef.current   = { correctness: fullResult.correctness, completeness: fullResult.completeness }
      targetedElementRef.current = fullResult.targetedElement || ''

      // ── Enrichment: fire non-blocking; merges scorecard fields when resolved ──
      const enrichQid = question.id
      scoreAnswerEnrich({
        question:       question.question,
        candidateAnswer,
        caseContext,
        caseId:         `Case ${caseData.id}`,
        difficulty,
        fastResult:     result,
      }).then(enrichment => {
        resultsRef.current = resultsRef.current.map(r =>
          r.questionId === enrichQid ? { ...r, ...enrichment } : r
        )
        setCurrentResult(r => r && r.questionId === enrichQid ? { ...r, ...enrichment } : r)
      }).catch(() => {})

      // ── Grader v2: fire async alongside production routing — non-blocking ──
      // isDevMode is false for all production users; this block never executes in prod.
      if (isDevMode) {
        setV2Loading(true)
        setV2Result(null)
        scoreAnswerV2({
          vignette:        question.context || '',
          question:        question.question,
          candidateAnswer,
          idealAnswer:     question.idealAnswer || '',
          difficulty,
        })
          .then(v2r => {
            setV2Result(v2r)
            setV2Loading(false)
            logV2Comparison({
              questionId:     question.id,
              candidateAnswer,
              currentResult:  fullResult,
              v2Result:       v2r,
            })
          })
          .catch(err => {
            console.error('[GraderV2] Scoring failed:', err.message)
            setV2Loading(false)
          })
      }
      // ── End Grader v2 block ───────────────────────────────────────────────

      // ── 1. PIVOT: complete absence of core knowledge ──────────────────────
      if (result.pushbackMode === 'pivot') {
        console.log('[LATENCY]', { event: 'llm_to_speak_call', ms: Math.round(performance.now() - t_llm_done), timestamp: Date.now() })
        commitPivot(fullResult)
        return
      }

      // ── 2. PUSHBACK: reflect or consequence ───────────────────────────────
      if (result.pushbackMode === 'reflect' || result.pushbackMode === 'consequence') {
        const line = result.pushbackLine || PROBE_TEXT
        setExaminerText(line)
        setPhase(PHASE.PUSHBACK_PROBE)
        setMicReady(false)
        console.log('[LATENCY]', { event: 'llm_to_speak_call', ms: Math.round(performance.now() - t_llm_done), timestamp: Date.now() })
        speak(line).then(() => {
          setTimeout(() => setMicReady(true), 500)
        })
        return
      }

      // ── 3. STRONG ANSWER: interrupt and auto-advance ──────────────────────
      if (isStrongAnswer(result)) {
        const phrase = pick(INTERRUPT[difficulty] || INTERRUPT.standard, question.id)
        console.log('[LATENCY]', { event: 'llm_to_speak_call', ms: Math.round(performance.now() - t_llm_done), timestamp: Date.now() })
        speak(phrase)
        setTimeout(advance, 600)
        return
      }

      // ── 4. PROBE: scores 2–3 on either dimension ──────────────────────────
      if (shouldShowProbe(result)) {
        setExaminerText(PROBE_TEXT)
        setPhase(PHASE.PROBE)
        setMicReady(false)
        console.log('[LATENCY]', { event: 'llm_to_speak_call', ms: Math.round(performance.now() - t_llm_done), timestamp: Date.now() })
        speak(PROBE_TEXT).then(() => {
          setTimeout(() => setMicReady(true), 500)
        })
        return
      }

      // ── 5. NEUTRAL ACKNOWLEDGMENT ─────────────────────────────────────────
      const phrase = pick(NEUTRAL[difficulty] || NEUTRAL.standard, question.id)
      console.log('[LATENCY]', { event: 'llm_to_speak_call', ms: Math.round(performance.now() - t_llm_done), timestamp: Date.now() })
      speak(phrase)
      setExaminerText(phrase)
      setPhase(PHASE.EXAMINER)

    } catch (err) {
      setError('Connection error: ' + err.message + ' — please try again.')
      questionsRef.current = questionsRef.current.slice(0, -1)
      setPhase(PHASE.INPUT)
    }
  }, [question, caseContext, caseData.id, difficulty, advance, commitPivot, stop])

  // ── Follow-up after reflect/consequence pushback ──────────────────────────────
  // Re-scores the follow-up so we can detect if the student is doubling down.
  const handlePushbackAnswer = useCallback(async (followUpText) => {
    stop()
    setPhase(PHASE.SCORING)

    // If student submitted nothing, treat as pivot (they didn't engage)
    if (!followUpText || !followUpText.trim()) {
      commitPivot(currentResult)
      return
    }

    try {
      const followUpResult = await scoreAnswerFast({
        question:             question.question,
        idealAnswer:          question.idealAnswer,
        candidateAnswer:      followUpText,
        caseContext,
        caseId:               `Case ${caseData.id}`,
        difficulty,
        isFollowUp:           true,
        priorAnswer:          currentResult.candidateAnswer,
        followUpDepth:        followUpDepthRef.current,
        priorTargetedElement: targetedElementRef.current,
      })

      // Student doubled down → pivot
      if (followUpResult.pushbackMode === 'pivot') {
        const withFollowUp = { ...currentResult, followUpAnswer: followUpText }
        resultsRef.current = [
          ...resultsRef.current.filter(r => r.questionId !== currentResult.questionId),
          withFollowUp,
        ]
        setCurrentResult(withFollowUp)
        commitPivot(withFollowUp)
        return
      }

      // Depth-2 rabbit hole: new incorrect element found at depth 0 → go deeper
      if (
        ENABLE_RABBIT_HOLE_DEPTH_2 &&
        followUpResult.pushbackMode === 'reflect' &&
        followUpDepthRef.current < 1 &&
        followUpResult.targetedElement
      ) {
        followUpDepthRef.current   = followUpDepthRef.current + 1
        targetedElementRef.current = followUpResult.targetedElement
        const line = followUpResult.pushbackLine || PROBE_TEXT
        setExaminerText(line)
        setPhase(PHASE.PUSHBACK_PROBE)
        setMicReady(false)
        speak(line).then(() => {
          setTimeout(() => setMicReady(true), 500)
        })
        return
      }

      // Student corrected / improved — update scores with follow-up result
      const updated = {
        ...currentResult,
        followUpAnswer:          followUpText,
        correctness:             followUpResult.correctness,
        completeness:            followUpResult.completeness,
        correctness_rationale:   followUpResult.correctness_rationale,
        completeness_rationale:  followUpResult.completeness_rationale,
        feedback:                followUpResult.feedback,
        // Preserve original danger/curveball flags unless follow-up clears them
        isDangerous:     currentResult.isDangerous && followUpResult.isDangerous,
        dangerousReason: followUpResult.isDangerous
          ? followUpResult.dangerousReason
          : currentResult.dangerousReason,
        isCurveball:    currentResult.isCurveball,
        curveballNote:  currentResult.curveballNote,
      }
      resultsRef.current = [
        ...resultsRef.current.filter(r => r.questionId !== currentResult.questionId),
        updated,
      ]
      setCurrentResult(updated)

      // ── Enrichment: fire non-blocking for follow-up result ────────────────
      const enrichQid2 = question.id
      scoreAnswerEnrich({
        question:       question.question,
        candidateAnswer: followUpText,
        caseContext,
        caseId:         `Case ${caseData.id}`,
        difficulty,
        fastResult:     followUpResult,
      }).then(enrichment => {
        resultsRef.current = resultsRef.current.map(r =>
          r.questionId === enrichQid2 ? { ...r, ...enrichment } : r
        )
        setCurrentResult(r => r && r.questionId === enrichQid2 ? { ...r, ...enrichment } : r)
      }).catch(() => {})

      const phrase = pick(NEUTRAL[difficulty] || NEUTRAL.standard, question.id)
      speak(phrase)
      setExaminerText(phrase)
      setPhase(PHASE.EXAMINER)

    } catch (err) {
      // On error: fall through to EXAMINER with original scores
      const phrase = pick(NEUTRAL[difficulty] || NEUTRAL.standard, question.id)
      speak(phrase)
      setExaminerText(phrase)
      setPhase(PHASE.EXAMINER)
    }
  }, [currentResult, question, caseContext, caseData.id, difficulty, commitPivot, stop])

  // ── Follow-up after standard "Is there anything else?" probe ─────────────────
  // Re-scores the probe answer (completeness-capped at 4, never lowers original).
  // Safety fields (isDangerous, isCurveball, feedback, etc.) are never overwritten.
  const handleProbeAnswer = useCallback(async (followUpText) => {
    stop()
    setMicReady(false)
    setPhase(PHASE.SCORING)

    try {
      const probeResult = await scoreAnswerFast({
        question:        question.question,
        candidateAnswer: followUpText || '',
        caseContext,
        caseId:          `Case ${caseData.id}`,
        difficulty,
        isFollowUp:      true,
        priorAnswer:     currentResult.candidateAnswer,
      })

      const finalCorrectness  = Math.max(currentResult.correctness,  Math.min(probeResult.correctness,  4))
      const finalCompleteness = Math.max(currentResult.completeness, Math.min(probeResult.completeness, 4))

      const updated = {
        ...currentResult,
        correctness:  finalCorrectness,
        completeness: finalCompleteness,
        followUpAnswer: followUpText || null,
      }
      resultsRef.current = [
        ...resultsRef.current.filter(r => r.questionId !== currentResult.questionId),
        updated,
      ]
      setCurrentResult(updated)
    } catch (e) {
      const updated = {
        ...currentResult,
        followUpAnswer: followUpText || null,
      }
      resultsRef.current = [
        ...resultsRef.current.filter(r => r.questionId !== currentResult.questionId),
        updated,
      ]
      setCurrentResult(updated)
    }

    const phrase = pick(NEUTRAL[difficulty] || NEUTRAL.standard, question.id)
    speak(phrase)
    setExaminerText(phrase)
    setPhase(PHASE.EXAMINER)
  }, [currentResult, question, caseContext, caseData.id, difficulty, speak, stop])

  // ── Timer expiry ──────────────────────────────────────────────────────────────
  const handleTimeExpire = useCallback(() => {
    onComplete(resultsRef.current, questionsRef.current, buildTranscript())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete])

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="exam-session">
      <header className="exam-header">
        <Timer totalSeconds={1800} onExpire={handleTimeExpire} />
        <div className="progress">
          <span className="progress-cur">{qIdx + 1}</span>
          <span className="progress-sep">/</span>
          <span className="progress-tot">{total}</span>
        </div>
      </header>

      <main className="exam-main">
        <QuestionCard
          question={question}
          caseData={caseData}
          onReplay={replay}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
        />

        {phase === PHASE.INPUT && (
          <>
            {error && <div className="error-msg">{error}</div>}
            <VoiceInput
              onSubmit={handleAnswer}
              disabled={false}
              micReady={micReady}
            />
          </>
        )}

        {phase === PHASE.SCORING && (
          <div className="scoring-indicator">
            <div className="spinner" />
            <p>Examiner reviewing&hellip;</p>
          </div>
        )}

        {/* Pushback follow-up — reflect or consequence */}
        {phase === PHASE.PUSHBACK_PROBE && (
          <FollowUp
            probe={examinerText}
            onSubmit={handlePushbackAnswer}
            micReady={micReady}
          />
        )}

        {/* Standard probe — "Is there anything else?" */}
        {phase === PHASE.PROBE && (
          <FollowUp
            probe={PROBE_TEXT}
            onSubmit={handleProbeAnswer}
            micReady={micReady}
          />
        )}

        {/* Neutral acknowledgment — button to advance */}
        {phase === PHASE.EXAMINER && (
          <ExaminerResponse
            response={examinerText || pick(NEUTRAL[difficulty] || NEUTRAL.standard, question.id)}
            onContinue={advance}
            isLast={qIdx + 1 >= total}
          />
        )}
      </main>

      {/* Grader v2 developer panel — only rendered when dev mode is active */}
      {isDevMode && (
        <GraderV2Panel
          currentResult={currentResult}
          v2Result={v2Result}
          v2Loading={v2Loading}
          questionId={question.id}
        />
      )}
    </div>
  )
}
