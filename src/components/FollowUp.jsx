import { VoiceInput } from './VoiceInput'

export function FollowUp({ probe, onSubmit, micReady, phase = 'unknown' }) {
  const text = probe || 'Is there anything else you would like to add?'
  return (
    <div className="followup">
      <div className="examiner-card">
        <div className="examiner-label">Examiner</div>
        <p className="examiner-text">&ldquo;{text}&rdquo;</p>
      </div>

      <VoiceInput onSubmit={onSubmit} disabled={false} micReady={micReady} phase={phase} />

      <button className="btn-ghost" onClick={() => onSubmit('')}>
        Nothing to add
      </button>
    </div>
  )
}
