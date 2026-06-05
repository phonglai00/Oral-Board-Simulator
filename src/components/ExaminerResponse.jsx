export function ExaminerResponse({ response, onContinue, isLast }) {
  return (
    <div className="examiner-response">
      <div className="examiner-card">
        <div className="examiner-label">Examiner</div>
        <p className="examiner-text">&ldquo;{response}&rdquo;</p>
      </div>
      <button className="submit-btn" onClick={onContinue}>
        {isLast ? 'View Results' : 'Continue →'}
      </button>
    </div>
  )
}
