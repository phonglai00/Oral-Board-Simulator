export function StartScreen({ caseData, onBegin }) {
  return (
    <div className="start-screen">
      <div className="start-logo">ABOG Oral Board Simulator</div>

      <div className="start-title">
        <h1>Oral Board Examination</h1>
        <p className="start-subtitle">Case {caseData.id} — {caseData.topic}</p>
      </div>

      <div className="start-divider" />

      <div className="start-instructions">
        {[
          '30-minute countdown begins when you start the exam',
          'Answer each question by speaking or typing your response',
          'The AI examiner responds exactly as a real ABOG examiner — no feedback, no hints',
          'Your full scorecard with missed points is revealed only at the end',
        ].map((text, i) => (
          <div key={i} className="instruction-item">
            <span className="instruction-num">0{i + 1}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onBegin}>
        Begin Examination
      </button>

      <p className="start-meta">
        {caseData.questions.length} questions &middot; {caseData.totalPoints} points total
      </p>
    </div>
  )
}
