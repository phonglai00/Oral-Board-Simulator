import { useState, useCallback, useRef, useEffect } from 'react'
import { Timer } from './Timer'
import { QuestionCard } from './QuestionCard'
import { VoiceInput } from './VoiceInput'
import { ExaminerResponse } from './ExaminerResponse'
import { scoreAnswer } from '../services/anthropic'
import { useElevenLabs } from '../hooks/useElevenLabs'

const PHASE = { INPUT: 'input', SCORING: 'scoring', EXAMINER: 'examiner' }

export function ExamSession({ caseData, onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [phase, setPhase] = useState(PHASE.INPUT)
  const [currentResult, setCurrentResult] = useState(null)
  const [error, setError] = useState(null)
  const resultsRef = useRef([])
  const questionsRef = useRef([])

  const { speak, stop, replay, isSpeaking, isLoading } = useElevenLabs()

  const question = caseData.questions[qIdx]
  const total = caseData.questions.length

  // Build a brief case context string for the scoring prompt
  const caseContext = caseData.questions
    .slice(0, qIdx + 1)
    .map(q => q.context)
    .filter(Boolean)
    .join(' ')

  // Auto-read vignette + question whenever a new question appears.
  useEffect(() => {
    const segments = [question.context, question.question].filter(Boolean)
    const id = setTimeout(() => speak(segments), 250)
    return () => { clearTimeout(id); stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx])

  const handleAnswer = useCallback(async (candidateAnswer) => {
    stop()
    setPhase(PHASE.SCORING)
    setError(null)

    // Track question text for SessionScorecard
    questionsRef.current = [...questionsRef.current, question.question]

    try {
      const result = await scoreAnswer({
        question: question.question,
        idealAnswer: question.idealAnswer,
        candidateAnswer,
        caseContext,
        caseId: `Case ${caseData.id}`,
      })

      const fullResult = {
        questionId: question.id,
        question: question.question,
        idealAnswer: question.idealAnswer,
        candidateAnswer,
        followUpAnswer: null,
        points: question.points,
        ...result,
      }

      resultsRef.current = [...resultsRef.current, fullResult]
      setCurrentResult(fullResult)

      // Speak a brief neutral phrase — no feedback or scores during the exam
      const NEUTRAL = ['Thank you.', 'Got it.', 'Okay.', 'I see.', 'Alright.']
      const neutral = NEUTRAL[question.id % NEUTRAL.length]
      speak(neutral)
      fullResult._neutralPhrase = neutral

      // Always move straight to next question — no probe during exam
      setPhase(PHASE.EXAMINER)
    } catch (err) {
      setError('Connection error: ' + err.message + ' — please try again.')
      questionsRef.current = questionsRef.current.slice(0, -1)
      setPhase(PHASE.INPUT)
    }
  }, [question, caseContext, caseData.id])


  const handleContinue = useCallback(() => {
    const isLast = qIdx + 1 >= total
    if (isLast) {
      const transcript = resultsRef.current.map(r => ({
        question:     r.question,
        answer:       r.followUpAnswer ? `${r.candidateAnswer} [addendum: ${r.followUpAnswer}]` : r.candidateAnswer,
        correctness:  r.correctness,
        completeness: r.completeness,
        feedback:     r.feedback,
      }))
      onComplete(resultsRef.current, questionsRef.current, transcript)
    } else {
      setCurrentResult(null)
      setQIdx(i => i + 1)
      setPhase(PHASE.INPUT)
    }
  }, [qIdx, total, onComplete])

  const handleTimeExpire = useCallback(() => {
    const transcript = resultsRef.current.map(r => ({
      question:     r.question,
      answer:       r.followUpAnswer ? `${r.candidateAnswer} [addendum: ${r.followUpAnswer}]` : r.candidateAnswer,
      correctness:  r.correctness,
      completeness: r.completeness,
      feedback:     r.feedback,
    }))
    onComplete(resultsRef.current, questionsRef.current, transcript)
  }, [onComplete])

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

        {phase === PHASE.EXAMINER && currentResult && (
          <ExaminerResponse
            response={currentResult._neutralPhrase || 'Thank you.'}
            onContinue={handleContinue}
            isLast={qIdx + 1 >= total}
          />
        )}
      </main>
    </div>
  )
}
