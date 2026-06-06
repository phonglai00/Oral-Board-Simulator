import { useState, useCallback, useRef, useEffect } from 'react'
import { Timer } from './Timer'
import { QuestionCard } from './QuestionCard'
import { VoiceInput } from './VoiceInput'
import { FollowUp } from './FollowUp'
import { ExaminerResponse } from './ExaminerResponse'
import { scoreAnswer } from '../services/anthropic'
import { useElevenLabs } from '../hooks/useElevenLabs'
import { isStrongAnswer, shouldShowProbe } from '../utils/scoringPrompt'

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

export function ExamSession({ caseData, onComplete }) {
  const [qIdx,          setQIdx]          = useState(0)
  const [phase,         setPhase]         = useState(PHASE.INPUT)
  const [currentResult, setCurrentResult] = useState(null)
  const [examinerText,  setExaminerText]  = useState('')
  const [error,         setError]         = useState(null)

  const resultsRef   = useRef([])
  const questionsRef = useRef([])

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

  // Auto-read vignette + question on each new question
  useEffect(() => {
    const segments = [question.context, question.question].filter(Boolean)
    const id = setTimeout(() => speak(segments), 250)
    return () => { clearTimeout(id); stop() }
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
    // Allow speech to start before UI jumps
    setTimeout(advance, 2500)
  }, [speak, advance])

  // ── Primary answer handler ────────────────────────────────────────────────────
  const handleAnswer = useCallback(async (candidateAnswer) => {
    stop()
    setPhase(PHASE.SCORING)
    setError(null)

    questionsRef.current = [...questionsRef.current, question.question]

    try {
      const result = await scoreAnswer({
        question:       question.question,
        idealAnswer:    question.idealAnswer,
        candidateAnswer,
        caseContext,
        caseId:         `Case ${caseData.id}`,
        difficulty,
      })

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

      // ── 1. PIVOT: complete absence of core knowledge ──────────────────────
      if (result.pushbackMode === 'pivot') {
        commitPivot(fullResult)
        return
      }

      // ── 2. PUSHBACK: reflect or consequence ───────────────────────────────
      if (result.pushbackMode === 'reflect' || result.pushbackMode === 'consequence') {
        const line = result.pushbackLine || PROBE_TEXT
        speak(line)
        setExaminerText(line)
        setPhase(PHASE.PUSHBACK_PROBE)
        return
      }

      // ── 3. STRONG ANSWER: interrupt and auto-advance ──────────────────────
      if (isStrongAnswer(result)) {
        const phrase = pick(INTERRUPT[difficulty] || INTERRUPT.standard, question.id)
        speak(phrase)
        setTimeout(advance, 600)
        return
      }

      // ── 4. PROBE: scores 2–3 on either dimension ──────────────────────────
      if (shouldShowProbe(result)) {
        speak(PROBE_TEXT)
        setExaminerText(PROBE_TEXT)
        setPhase(PHASE.PROBE)
        return
      }

      // ── 5. NEUTRAL ACKNOWLEDGMENT ─────────────────────────────────────────
      const phrase = pick(NEUTRAL[difficulty] || NEUTRAL.standard, question.id)
      speak(phrase)
      setExaminerText(phrase)
      setPhase(PHASE.EXAMINER)

    } catch (err) {
      setError('Connection error: ' + err.message + ' — please try again.')
      questionsRef.current = questionsRef.current.slice(0, -1)
      setPhase(PHASE.INPUT)
    }
  }, [question, caseContext, caseData.id, difficulty, advance, commitPivot])

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
      const followUpResult = await scoreAnswer({
        question:       question.question,
        idealAnswer:    question.idealAnswer,
        candidateAnswer: followUpText,
        caseContext,
        caseId:         `Case ${caseData.id}`,
        difficulty,
        isFollowUp:     true,
        priorAnswer:    currentResult.candidateAnswer,
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

      // Student corrected / improved — update scores with follow-up result
      const updated = {
        ...currentResult,
        followUpAnswer: followUpText,
        correctness:            followUpResult.correctness,
        completeness:           followUpResult.completeness,
        correctness_rationale:  followUpResult.correctness_rationale,
        completeness_rationale: followUpResult.completeness_rationale,
        feedback:               followUpResult.feedback,
        // Preserve original danger/curveball flags unless follow-up clears them
        isDangerous:    currentResult.isDangerous && followUpResult.isDangerous,
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
  }, [currentResult, question, caseContext, caseData.id, difficulty, commitPivot])

  // ── Follow-up after standard "Is there anything else?" probe ─────────────────
  // Stores the follow-up text and advances. No further probes or pivots.
  const handleProbeAnswer = useCallback((followUpText) => {
    const updated = {
      ...currentResult,
      followUpAnswer: followUpText || null,
    }
    resultsRef.current = [
      ...resultsRef.current.filter(r => r.questionId !== currentResult.questionId),
      updated,
    ]
    setCurrentResult(updated)

    const phrase = pick(NEUTRAL[difficulty] || NEUTRAL.standard, question.id)
    speak(phrase)
    setExaminerText(phrase)
    setPhase(PHASE.EXAMINER)
  }, [currentResult, question.id, difficulty, speak])

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
            <VoiceInput onSubmit={handleAnswer} disabled={false} />
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
          />
        )}

        {/* Standard probe — "Is there anything else?" */}
        {phase === PHASE.PROBE && (
          <FollowUp
            probe={PROBE_TEXT}
            onSubmit={handleProbeAnswer}
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
    </div>
  )
}
