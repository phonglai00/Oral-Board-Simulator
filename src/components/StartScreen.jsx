// Module-scoped guard — persists across StartScreen remounts (e.g. Restart flow),
// unlike a component-scoped ref which resets on every mount.
let audioUnlocked = false

function unlockAudio() {
  if (audioUnlocked) return
  audioUnlocked = true
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()

    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()

    src.buffer = buf
    src.connect(ctx.destination)

    src.start(0)

    ctx.resume()

    console.log('[TTS_DIAG]', {
      event: 'audio_unlocked',
      timestamp: Date.now(),
    })
  } catch (e) {
    console.warn('[TTS_DIAG] audio_unlock_failed', e)
  }
}

export function StartScreen({ caseData, onBegin }) {
  function handleBegin() {
    unlockAudio()
    onBegin()
  }

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

      <button className="btn-primary" onClick={handleBegin}>
        Begin Examination
      </button>

      <p className="start-meta">
        {caseData.questions.length} questions &middot; {caseData.totalPoints} points total
      </p>
    </div>
  )
}
