import { VoiceInput } from './VoiceInput'

export function FollowUp({ onSubmit }) {
  return (
    <div className="followup">
      <div className="examiner-card">
        <div className="examiner-label">Examiner</div>
        <p className="examiner-text">
          &ldquo;Is there anything else you would like to add?&rdquo;
        </p>
      </div>

      <VoiceInput onSubmit={onSubmit} disabled={false} />

      <button className="btn-ghost" onClick={() => onSubmit('')}>
        Nothing to add
      </button>
    </div>
  )
}
