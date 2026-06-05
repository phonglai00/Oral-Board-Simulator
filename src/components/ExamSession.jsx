import { useState, useCallback, useRef, useEffect } from 'react'
import { Timer } from './Timer'
import { QuestionCard } from './QuestionCard'
import { VoiceInput } from './VoiceInput'
import { FollowUp } from './FollowUp'
import { ExaminerResponse } from './ExaminerResponse'
import { scoreAnswer } from '../services/anthropic'
import { useElevenLabs } from '../hooks/useElevenLabs'

const PHASE = { INPUT: 'input', SCORING: 'scoring', FOLLOWUP: 'followup', EXAMINER: 'examiner' }

export function ExamSession({ caseData, onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [phase, setPhase] = useState(PHASE.INPUT)
  const [currentResult, setCurrentResult] = useState(null)
  const [error, setError] = useState(null)
  const resultsRef = useRef([])

  const { speak, stop, replay, isSpeaking, isLoading } = useElevenLabs()

  const question = caseData.questions[qIdx]
  const total = caseData.questions.length

  // Auto-read vignette + question whenever a new question appears.
  // Pass as separate segments so useSpeech inserts a natural pause between them.
  useEffect(() => {
    const segments = [question.context, question.question].filter(Boolean)
    const id = setTimeout(() => speak(segments), 250)
    return () => { clearTimeout(id); stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx])

  const handleAnswer = useCallback(async (candidateAnswer) => {
    stop() // silence the examiner the moment the student submits
    setPhase(PHASE.SCORING)
    setError(null)
    try {
      const scored = await scoreAnswer({
        question: question.question,
        idealAnswer: question.idealAnswer,
        candidateAnswer,
        points: question.points,
      })
      const result = {
        questionId: question.id,
        question: question.question,
        idealAnswer: question.idealAnswer,
        candidateAnswer,
        followUpAnswer: null,
        points: question.points,
        ...scored,
      }
      resultsRef.current = [...resultsRef.current, result]
      setCurrentResult(result)
      // Only ask follow-up for incomplete answers (score 1 or 2)
      setPhase(scored.score < 3 ? PHASE.FOLLOWUP : PHASE.EXAMINER)
    } catch (err) {
      setError('Connection error: ' + err.message + ' — please try again.')
      setPhase(PHASE.INPUT)
    }
  }, [question])

  const handleFollowUp = useCallback((followUpText) => {
    const updatedResult = {
      ...currentResult,
      followUpAnswer: followUpText || null,
      examinerResponse: 'Thank you.',
    }
    resultsRef.current = [...resultsRef.current.slice(0, -1), updatedResult]
    setCurrentResult(updatedResult)
    setPhase(PHASE.EXAMINER)
  }, [currentResult])

  const handleContinue = useCallback(() => {
    const isLast = qIdx + 1 >= total
    if (isLast) {
      onComplete(resultsRef.current)
    } else {
      setCurrentResult(null)
      setQIdx(i => i + 1)
      setPhase(PHASE.INPUT)
    }
  }, [qIdx, total, onComplete])

  const handleTimeExpire = useCallback(() => {
    onComplete(resultsRef.current)
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

        {phase === PHASE.FOLLOWUP && (
          <FollowUp onSubmit={handleFollowUp} />
        )}

        {phase === PHASE.EXAMINER && currentResult && (
          <ExaminerResponse
            response={currentResult.examinerResponse}
            onContinue={handleContinue}
            isLast={qIdx + 1 >= total}
          />
        )}
      </main>
    </div>
  )
}
