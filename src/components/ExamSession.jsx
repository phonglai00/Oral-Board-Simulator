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
// Flow per question:
//   INPUT → SCORING → (DANGEROUS_PROBE?) → (PROBE?) → EXAMINER
// Strong answers (≥4/≥4) skip EXAMINER and auto-advance after speaking.
const PHASE = {
  INPUT:           'input',
  SCORING:         'scoring',
  DANGEROUS_PROBE: 'dangerous_probe',
  PROBE:           'probe',
  EXAMINER:        'examiner',
}

// ── Neutral acknowledgment phrases keyed by difficulty ────────────────────────
const NEUTRAL_PHRASES = {
  standard: ['Thank you.', 'Got it.', 'Okay.', 'I see.', 'Alright.'],
  advanced:  ['Mm-hmm.', 'Go on.', 'Is that all?', 'Mm-hmm.', 'Go on.'],
}

const DANGEROUS_CHALLENGE =
  "I need to stop you there — that approach could harm the patient. Can you reconsider?"

const PROBE_TEXT = "Is there anything else you would add?"

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

  // ── Shared helper: pick and store the neutral acknowledgment phrase ──────────
  function neutralPhrase(qId) {
    const pool = NEUTRAL_PHRASES[difficulty] || NEUTRAL_PHRASES.standard
    return pool[qId % pool.length]
  }

  // ── Advance to next question or end session ──────────────────────────────────
  const advance = useCallback(() => {
    const isLast = qIdx + 1 >= total
    if (isLast) {
      const transcript = resultsRef.current.map(r => ({
        question:     r.question,
        answer:       r.followUpAnswer
          ? `${r.candidateAnswer} [addendum: ${r.followUpAnswer}]`
          : r.candidateAnswer,
        correctness:  r.correctness,
        completeness: r.completeness,
        feedback:     r.feedback,
      }))
      onComplete(resultsRef.current, questionsRef.current, transcript)
    } else {
      setCurrentResult(null)
      setExaminerText('')
      setQIdx(i => i + 1)
      setPhase(PHASE.INPUT)
    }
  }, [qIdx, total, onComplete])

  // ── Primary answer handler ───────────────────────────────────────────────────
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
        questionId:      question.id,
        question:        question.question,
        idealAnswer:     question.idealAnswer,
        candidateAnswer,
        followUpAnswer:  null,
        points:          question.points,
        ...result,
      }

      resultsRef.current = [...resultsRef.current, fullResult]
      setCurrentResult(fullResult)

      // ── Branch 1: dangerous answer ─────────────────────────────────────────
      if (result.isDangerous) {
        await speak(DANGEROUS_CHALLENGE)
        setExaminerText(DANGEROUS_CHALLENGE)
        setPhase(PHASE.DANGEROUS_PROBE)
        return
      }

      // ── Branch 2: pushback first, then decide probe vs. examiner ───────────
      if (result.pushback) {
        await speak(result.pushback)
      }

      // ── Branch 3: strong answer — interrupt and auto-advance ───────────────
      if (isStrongAnswer(result)) {
        const INTERRUPT = ['Okay, let\'s move on.', 'Good, next question.', 'Alright, moving forward.']
        const phrase = INTERRUPT[question.id % INTERRUPT.length]
        speak(phrase)
        // Brief pause so the speech starts before the UI jumps
        setTimeout(advance, 600)
        return
      }

      // ── Branch 4: probe (scores 2–3 on either dimension) ──────────────────
      if (shouldShowProbe(result)) {
        speak(PROBE_TEXT)
        setExaminerText(PROBE_TEXT)
        setPhase(PHASE.PROBE)
        return
      }

      // ── Branch 5: neutral acknowledgment ──────────────────────────────────
      const phrase = neutralPhrase(question.id)
      speak(phrase)
      setExaminerText(phrase)
      setPhase(PHASE.EXAMINER)

    } catch (err) {
      setError('Connection error: ' + err.message + ' — please try again.')
      questionsRef.current = questionsRef.current.slice(0, -1)
      setPhase(PHASE.INPUT)
    }
  }, [question, caseContext, caseData.id, difficulty, advance])

  // ── Follow-up answer (probe or dangerous probe) ──────────────────────────────
  const handleFollowUp = useCallback((followUpText) => {
    const updatedResult = {
      ...currentResult,
      followUpAnswer: followUpText || null,
    }
    resultsRef.current = [...resultsRef.current.slice(0, -1), updatedResult]
    setCurrentResult(updatedResult)

    const phrase = neutralPhrase(question.id)
    speak(phrase)
    setExaminerText(phrase)
    setPhase(PHASE.EXAMINER)
  }, [currentResult, question.id, difficulty])

  // ── Timer expiry ─────────────────────────────────────────────────────────────
  const handleTimeExpire = useCallback(() => {
    const transcript = resultsRef.current.map(r => ({
      question:     r.question,
      answer:       r.followUpAnswer
        ? `${r.candidateAnswer} [addendum: ${r.followUpAnswer}]`
        : r.candidateAnswer,
      correctness:  r.correctness,
      completeness: r.completeness,
      feedback:     r.feedback,
    }))
    onComplete(resultsRef.current, questionsRef.current, transcript)
  }, [onComplete])

  // ── Render ───────────────────────────────────────────────────────────────────
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

        {/* Dangerous answer — one-time probe for corrected answer */}
        {phase === PHASE.DANGEROUS_PROBE && (
          <FollowUp
            probe={DANGEROUS_CHALLENGE}
            onSubmit={handleFollowUp}
          />
        )}

        {/* Standard probe — "Is there anything else you would add?" */}
        {phase === PHASE.PROBE && (
          <FollowUp
            probe={PROBE_TEXT}
            onSubmit={handleFollowUp}
          />
        )}

        {/* Neutral acknowledgment — shown after weak answers or post-probe */}
        {phase === PHASE.EXAMINER && (
          <ExaminerResponse
            response={examinerText || neutralPhrase(question.id)}
            onContinue={advance}
            isLast={qIdx + 1 >= total}
          />
        )}
      </main>
    </div>
  )
}
