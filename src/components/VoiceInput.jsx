import { useState, useRef, useEffect, useCallback } from 'react'

// iOS Safari requires SpeechRecognition.start() to be called synchronously
// from within a user-gesture handler — no async gap allowed.
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

export function VoiceInput({ onSubmit, disabled, micReady, phase = 'unknown' }) {
  const [text,         setText]         = useState('')
  const [listening,    setListening]    = useState(false)
  const [hasVoice,     setHasVoice]     = useState(false)
  // 'warming' | 'retrying' | 'still-listening' | ''
  const [status,       setStatus]       = useState('')
  const [showFallback, setShowFallback] = useState(false)

  const recogRef       = useRef(null)
  const failCountRef   = useRef(0)
  const silenceTimerRef = useRef(null)
  const warmingTimerRef = useRef(null)
  const startedAtRef   = useRef(0)
  // Ref mirror of `listening` — safe to read inside SR event handlers
  const listeningRef   = useRef(false)
  const userStoppedRef  = useRef(false)
  const restartCountRef = useRef(0)
  // iOS silent-session watchdog — onstart fires but onresult never arrives
  const silentStartWatchdogRef   = useRef(null)
  const watchdogRestartPendingRef = useRef(false)
  const watchdogRetryCountRef    = useRef(0)
  const watchdogRecoveredRef     = useRef(false)

  // Keep listeningRef in sync with state
  useEffect(() => { listeningRef.current = listening }, [listening])

  // ── Pulse animation when mic becomes ready ──────────────────────────────
  useEffect(() => {
    if (micReady) {
      setStatus('warming')
      warmingTimerRef.current = setTimeout(
        () => setStatus(s => s === 'warming' ? '' : s),
        1500,
      )
    } else {
      clearTimeout(warmingTimerRef.current)
      // Don't clobber 'retrying' / 'still-listening' statuses
    }
    return () => clearTimeout(warmingTimerRef.current)
  }, [micReady])

  // ── Set up SpeechRecognition once ──────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setHasVoice(true)

    const r = new SR()
    r.continuous     = true
    r.interimResults = true
    r.lang           = 'en-US'
    console.log('[SR_DIAG]', { event: 'recognition_created', phase, timestamp: Date.now(), isIOS })

    r.onstart = () => {
      console.log('[SR_DIAG]', { event: 'onstart', phase, timestamp: Date.now(), isIOS })

      // iOS-only: onend auto-restart is disabled on iOS (requires user gesture),
      // so a silent zombie session (onstart fires, onresult never arrives) would
      // otherwise hang forever. Arm a watchdog that force-stops it.
      if (isIOS) {
        clearTimeout(silentStartWatchdogRef.current)
        silentStartWatchdogRef.current = setTimeout(() => {
          if (!listeningRef.current) return
          console.log('[SR_DIAG]', { event: 'silent_watchdog_fired', phase, timestamp: Date.now(), isIOS, watchdogRetryCount: watchdogRetryCountRef.current })

          if (watchdogRetryCountRef.current < 3) {
            watchdogRetryCountRef.current += 1
            watchdogRestartPendingRef.current = true
            try {
              console.log('[SR_DIAG]', { event: 'stop_called', phase, timestamp: Date.now(), isIOS, context: 'watchdog' })
              recogRef.current?.stop()
            } catch { /* ignore */ }
          } else {
            // Exhausted retries — terminate the live session and fall back to text input
            try {
              console.log('[SR_DIAG]', { event: 'stop_called', phase, timestamp: Date.now(), isIOS, context: 'watchdog_exhausted' })
              recogRef.current?.stop()
            } catch { /* ignore */ }
            clearTimeout(silenceTimerRef.current)
            clearTimeout(silentStartWatchdogRef.current)
            failCountRef.current += 1
            setShowFallback(true)
            setListening(false)
            console.log('[SR_DIAG]', { event: 'listening_false', phase, timestamp: Date.now(), isIOS, context: 'watchdog_exhausted' })
            listeningRef.current = false
            setStatus('')
          }
        }, 2500)
      }
    }

    r.onresult = (e) => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      console.log('[SR_DIAG]', { event: 'onresult', phase, timestamp: Date.now(), isIOS, transcriptLength: t.length })
      setText(t)

      restartCountRef.current = 0

      // Real transcript activity — the session is alive, disarm the watchdog
      clearTimeout(silentStartWatchdogRef.current)
      watchdogRetryCountRef.current = 0
      if (watchdogRecoveredRef.current) {
        console.log('[SR_DIAG]', { event: 'silent_watchdog_recovered', phase, timestamp: Date.now(), isIOS })
        watchdogRecoveredRef.current = false
      }

      // Reset the 8-second silence timer on every input event
      clearTimeout(silenceTimerRef.current)
      setStatus(s => s === 'still-listening' ? '' : s)
      silenceTimerRef.current = setTimeout(() => {
        if (listeningRef.current) setStatus('still-listening')
      }, 8000)
    }

    r.onend = () => {
      console.log('[SR_DIAG]', { event: 'onend', phase, timestamp: Date.now(), isIOS })
      clearTimeout(silenceTimerRef.current)

      // Watchdog-triggered stop — restart via doStart() once the session has
      // fully terminated (mirrors the existing 150 ms restart pattern below).
      if (watchdogRestartPendingRef.current) {
        watchdogRestartPendingRef.current = false
        if (listeningRef.current && !userStoppedRef.current) {
          setStatus('reconnecting')
          setTimeout(() => {
            if (listeningRef.current && !userStoppedRef.current) {
              watchdogRecoveredRef.current = true
              doStart({ fromWatchdog: true })
            }
          }, 150)
        }
        return
      }

      // Auto-restart if browser terminated the session (not a user or submit stop)
      // and mic is supposed to still be active and we haven't exceeded restart limit
      // and not iOS (iOS requires user gesture to restart)
      if (
        listeningRef.current === true &&
        userStoppedRef.current === false &&
        restartCountRef.current < 3 &&
        !isIOS
      ) {
        restartCountRef.current += 1
        setStatus('reconnecting')
        setTimeout(() => {
          if (listeningRef.current && !userStoppedRef.current) {
            try {
              console.log('[SR_DIAG]', { event: 'start_called', phase, timestamp: Date.now(), isIOS, context: 'onend_restart' })
              recogRef.current.start()
              console.log('[SR_DIAG]', { event: 'start_returned', phase, timestamp: Date.now(), isIOS, context: 'onend_restart' })
              setStatus('')
              silenceTimerRef.current = setTimeout(() => {
                if (listeningRef.current) setStatus('still-listening')
              }, 8000)
            } catch (e) {
              console.log('[SR_DIAG]', { event: 'start_exception', phase, timestamp: Date.now(), isIOS, context: 'onend_restart', error: e?.message })
              // start() failed — fall through to stop state
              setListening(false)
              console.log('[SR_DIAG]', { event: 'listening_false', phase, timestamp: Date.now(), isIOS, context: 'onend_restart_catch' })
              listeningRef.current = false
              setStatus(s => (s === 'still-listening' || s === 'warming' || s === 'reconnecting') ? '' : s)
            }
          }
        }, 150)
        return
      }

      // Normal stop — user initiated, submit initiated, iOS, or restart limit reached
      if (restartCountRef.current >= 3) {
        // Three consecutive restarts with no speech — show text fallback
        failCountRef.current += 1
        if (failCountRef.current >= 2) setShowFallback(true)
      }
      setListening(false)
      console.log('[SR_DIAG]', { event: 'listening_false', phase, timestamp: Date.now(), isIOS, context: 'onend_normal' })
      listeningRef.current = false
      setStatus(s => (s === 'still-listening' || s === 'warming' || s === 'reconnecting') ? '' : s)
    }

    r.onerror = (e) => {
      console.log('[SR_DIAG]', { event: 'onerror', phase, timestamp: Date.now(), isIOS, errorType: e?.error })
      const elapsed = Date.now() - startedAtRef.current
      if (elapsed < 500) {
        // Failed to start — retry once, then offer text fallback
        failCountRef.current += 1
        setListening(false)
        console.log('[SR_DIAG]', { event: 'listening_false', phase, timestamp: Date.now(), isIOS, context: 'onerror_start_fail' })
        listeningRef.current = false

        if (failCountRef.current >= 2) {
          setShowFallback(true)
          setStatus('')
        } else {
          setStatus('retrying')
          setTimeout(() => {
            try {
              startedAtRef.current = Date.now()
              console.log('[SR_DIAG]', { event: 'start_called', phase, timestamp: Date.now(), isIOS, context: 'onerror_retry' })
              r.start()
              console.log('[SR_DIAG]', { event: 'start_returned', phase, timestamp: Date.now(), isIOS, context: 'onerror_retry' })
              setListening(true)
              console.log('[SR_DIAG]', { event: 'listening_true', phase, timestamp: Date.now(), isIOS, context: 'onerror_retry' })
              listeningRef.current = true
            } catch (e) {
              console.log('[SR_DIAG]', { event: 'start_exception', phase, timestamp: Date.now(), isIOS, context: 'onerror_retry', error: e?.message })
              failCountRef.current += 1
              setShowFallback(true)
              setStatus('')
            }
          }, 800)
        }
      } else {
        // Mid-session error — just stop cleanly
        setListening(false)
        console.log('[SR_DIAG]', { event: 'listening_false', phase, timestamp: Date.now(), isIOS, context: 'onerror_midsession' })
        listeningRef.current = false
        setStatus('')
      }
    }

    recogRef.current = r
    return () => {
      try {
        console.log('[SR_DIAG]', { event: 'abort_called', phase, timestamp: Date.now(), isIOS, context: 'cleanup' })
        r.abort()
      } catch { /* ignore */ }
      clearTimeout(silenceTimerRef.current)
      clearTimeout(silentStartWatchdogRef.current)
    }
  }, [])

  // ── doStart: the actual SR.start() call ────────────────────────────────
  // Called synchronously on iOS (from click handler), or after 300 ms on others.
  // `fromWatchdog` distinguishes a watchdog-driven restart from a genuine
  // user-initiated start, so the retry counter survives across the cycle.
  const doStart = useCallback(({ fromWatchdog = false } = {}) => {
    if (!recogRef.current) return
    userStoppedRef.current  = false
    restartCountRef.current = 0
    if (!fromWatchdog) {
      watchdogRetryCountRef.current = 0
      watchdogRecoveredRef.current  = false
    }
    setText('')
    clearTimeout(silenceTimerRef.current)
    try {
      startedAtRef.current = Date.now()
      console.log('[SR_DIAG]', { event: 'start_called', phase, timestamp: Date.now(), isIOS, context: 'doStart' })
      recogRef.current.start()
      console.log('[SR_DIAG]', { event: 'start_returned', phase, timestamp: Date.now(), isIOS, context: 'doStart' })
      setListening(true)
      console.log('[SR_DIAG]', { event: 'listening_true', phase, timestamp: Date.now(), isIOS, context: 'doStart' })
      listeningRef.current = true
      setStatus('')
      // Begin 8-second silence watchdog
      silenceTimerRef.current = setTimeout(() => {
        if (listeningRef.current) setStatus('still-listening')
      }, 8000)
    } catch (e) {
      console.log('[SR_DIAG]', { event: 'start_exception', phase, timestamp: Date.now(), isIOS, context: 'doStart', error: e?.message })
      // Ignore "already started" errors
    }
  }, [])

  // ── Mic button click ────────────────────────────────────────────────────
  function toggleMic() {
    if (disabled || !micReady) return

    if (listening) {
      userStoppedRef.current = true
      console.log('[SR_DIAG]', { event: 'stop_called', phase, timestamp: Date.now(), isIOS, context: 'toggleMic' })
      try { recogRef.current?.stop() } catch { /* ignore */ }
      setListening(false)
      console.log('[SR_DIAG]', { event: 'listening_false', phase, timestamp: Date.now(), isIOS, context: 'toggleMic' })
      listeningRef.current = false
      clearTimeout(silenceTimerRef.current)
      clearTimeout(silentStartWatchdogRef.current)
      watchdogRestartPendingRef.current = false
      setStatus('')
    } else {
      failCountRef.current = 0
      if (isIOS) {
        // iOS Safari: start() must be called synchronously from the click event
        doStart()
      } else {
        // 300 ms delay prevents the tap sound from being picked up as speech
        setTimeout(doStart, 300)
      }
    }
  }

  // ── Submit handler ──────────────────────────────────────────────────────
  function handleSubmit() {
    if (listening) {
      userStoppedRef.current = true
      console.log('[SR_DIAG]', { event: 'stop_called', phase, timestamp: Date.now(), isIOS, context: 'handleSubmit' })
      try { recogRef.current?.stop() } catch { /* ignore */ }
      setListening(false)
      console.log('[SR_DIAG]', { event: 'listening_false', phase, timestamp: Date.now(), isIOS, context: 'handleSubmit' })
      listeningRef.current = false
    }
    clearTimeout(silenceTimerRef.current)
    clearTimeout(silentStartWatchdogRef.current)
    watchdogRestartPendingRef.current = false
    setStatus('')
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
    setShowFallback(false)
    failCountRef.current = 0
  }

  const micDisabled = disabled || !micReady
  const micClass    = [
    'mic-btn',
    listening                ? 'listening' : '',
    status === 'warming'     ? 'warming'   : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="voice-input">
      {/* Mic button — hidden once we fall back to text-only */}
      {hasVoice && !showFallback && (
        <button
          className={micClass}
          onClick={toggleMic}
          disabled={micDisabled}
          aria-label={listening ? 'Stop recording' : 'Start voice input'}
        >
          <span className="mic-icon">{listening ? '⏹' : '🎙'}</span>
          {listening ? 'Stop Recording' : 'Speak Answer'}
        </button>
      )}

      {/* Status messages */}
      {status === 'retrying' && (
        <p className="mic-status">Retrying&hellip;</p>
      )}
      {status === 'reconnecting' && (
        <p className="mic-status">Reconnecting&hellip;</p>
      )}
      {status === 'still-listening' && (
        <p className="mic-status">Still listening&hellip;</p>
      )}
      {showFallback && (
        <p className="mic-status">Voice unavailable — type your answer</p>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          showFallback
            ? 'Type your answer here…'
            : hasVoice
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
