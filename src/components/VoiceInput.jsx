import { useState, useRef, useEffect } from 'react'

export function VoiceInput({ onSubmit, disabled }) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [hasVoice, setHasVoice] = useState(false)
  const recogRef = useRef(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setHasVoice(true)
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'
    r.onresult = (e) => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      setText(t)
    }
    r.onend = () => setListening(false)
    recogRef.current = r
  }, [])

  function toggleMic() {
    if (listening) {
      recogRef.current.stop()
      setListening(false)
    } else {
      setText('')
      recogRef.current.start()
      setListening(true)
    }
  }

  function handleSubmit() {
    if (listening) { recogRef.current.stop(); setListening(false) }
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <div className="voice-input">
      {hasVoice && (
        <button
          className={`mic-btn${listening ? ' listening' : ''}`}
          onClick={toggleMic}
          disabled={disabled}
          aria-label={listening ? 'Stop recording' : 'Start voice input'}
        >
          <span className="mic-icon">{listening ? '⏹' : '🎙'}</span>
          {listening ? 'Stop Recording' : 'Speak Answer'}
        </button>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          hasVoice
            ? 'Your spoken answer appears here — or type directly…'
            : 'Type your answer here…'
        }
        disabled={disabled}
        rows={5}
        aria-label="Candidate answer"
      />

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
      >
        Submit Answer
      </button>
    </div>
  )
}
