export function QuestionCard({ question, caseData, onReplay, isSpeaking, isLoading }) {
  const busy = isLoading || isSpeaking

  return (
    <div className="question-card">
      <div className="question-card-header">
        <div className="question-topic">
          Case {caseData.id} — {caseData.topic}
        </div>
        <button
          className={`replay-btn${isLoading ? ' loading' : isSpeaking ? ' speaking' : ''}`}
          onClick={onReplay}
          disabled={isLoading}
          aria-label={isLoading ? 'Loading audio…' : isSpeaking ? 'Playing…' : 'Replay question audio'}
          title={isLoading ? 'Loading…' : 'Replay question'}
        >
          {isLoading
            ? <span className="replay-spinner" />
            : isSpeaking
              ? <span className="replay-icon-wave">▶</span>
              : <span className="replay-icon">🔈</span>
          }
        </button>
      </div>

      {question.context && (
        <div className="vignette">
          <p>{question.context}</p>
        </div>
      )}

      <div className="question-box">
        <p className="question-text">{question.question}</p>
        <p className="question-pts">
          {question.points} point{question.points > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
