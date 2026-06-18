import { useCallback, useRef, useState } from 'react'

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'           // Rachel
const MODEL_ID = 'eleven_flash_v2_5'
const API_URL  = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`

export function useElevenLabs() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading,  setIsLoading]  = useState(false)

  const audioRef   = useRef(null)   // current HTMLAudioElement
  const blobUrlRef = useRef(null)   // cached URL for replay
  const abortRef   = useRef(null)   // AbortController for in-flight fetch
  const queueRef   = useRef(Promise.resolve())  // promise chain — serializes speak() calls
  const tSpeakCalledRef  = useRef(0)
  const tBlobCompleteRef = useRef(0)
  const blobCreatedAtRef  = useRef(0)   // Date.now() when blobUrlRef.current was last set
  const blobGenerationRef = useRef(0)   // monotonically increasing id, one per blob created

  // ── Play a blob URL; returns a Promise that resolves when audio ends ──────
  const playBlobUrl = useCallback((url, blobId, meta = {}) => {
    return new Promise((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.onended = null
        audioRef.current.onerror = null
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onplay  = () => {
        const t_play = performance.now()
        console.log('[LATENCY]', { event: 'blob_to_audio_play', ms: Math.round(t_play - tBlobCompleteRef.current), timestamp: Date.now() })
        console.log('[LATENCY]', { event: 'audio_play', timestamp: Date.now() })
        console.log('[TTS_DIAG]', { event: 'audio_play_started', ...meta, blobId, timestamp: Date.now() })
        setIsSpeaking(true)
      }
      audio.onended = () => { setIsSpeaking(false); resolve() }
      // Resolve (not reject) on error so the queue always advances
      audio.onerror = () => {
        console.log('[TTS_DIAG]', {
          event: 'audio_play_failed',
          audioErrorCode: audio.error?.code,
          audioErrorMessage: audio.error?.message,
          ...meta, blobId, timestamp: Date.now(),
        })
        setIsSpeaking(false); resolve()
      }
      audio.play().catch((err) => {
        console.log('[TTS_DIAG]', {
          event: 'audio_play_failed',
          errorName: err?.name,
          errorMessage: err?.message,
          ...meta, blobId, timestamp: Date.now(),
        })
        setIsSpeaking(false); resolve()
      })
    })
  }, [])

  // ── Internal: fetch TTS + play; returns a Promise ────────────────────────
  const _doSpeak = useCallback(async (segments, signal, meta = {}) => {
    const t_doSpeak_entry = performance.now()
    console.log('[LATENCY]', { event: 'queue_stall', ms: Math.round(t_doSpeak_entry - tSpeakCalledRef.current), timestamp: Date.now() })

    const text = segments.join('\n\n')

    const tryFetch = async () => {
      const t_tts_start = performance.now()
      const res = await fetch(API_URL, {
        method: 'POST',
        signal,
        headers: {
          'xi-api-key':   import.meta.env.VITE_ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.65, similarity_boost: 0.75 },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail?.message || `ElevenLabs error ${res.status}`)
      }
      const t_tts_ttfb = performance.now()
      console.log('[LATENCY]', { event: 'elevenlabs_ttfb', ms: Math.round(t_tts_ttfb - t_tts_start), timestamp: Date.now() })
      const blob = await res.blob()
      tBlobCompleteRef.current = performance.now()
      console.log('[LATENCY]', { event: 'elevenlabs_blob_download', ms: Math.round(tBlobCompleteRef.current - t_tts_ttfb), timestamp: Date.now() })
      return blob
    }

    setIsLoading(true)

    let blob
    try {
      blob = await tryFetch()
      console.log('[TTS_DIAG]', { event: 'speak_fetch_success', ...meta, attempt: 1, textPreview: segments.join(' ').slice(0, 120), timestamp: Date.now() })
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[TTS_DIAG]', { event: 'speak_aborted', ...meta, attempt: 1, timestamp: Date.now() })
        setIsLoading(false); return
      }
      // ── Retry once after 1.5 s ───────────────────────────────────────────
      console.log('[TTS_DIAG]', { event: 'speak_fetch_retry', ...meta, timestamp: Date.now() })
      await new Promise(r => setTimeout(r, 1500))
      if (signal.aborted)            { setIsLoading(false); return }
      try {
        blob = await tryFetch()
        console.log('[TTS_DIAG]', { event: 'speak_fetch_success', ...meta, attempt: 2, textPreview: segments.join(' ').slice(0, 120), timestamp: Date.now() })
      } catch (err2) {
        if (err2.name !== 'AbortError') console.error('ElevenLabs TTS error:', err2.message)
        console.log('[TTS_DIAG]', { event: 'speak_fetch_failed', ...meta, error: err2?.message, aborted: err2.name === 'AbortError', timestamp: Date.now() })
        setIsLoading(false)
        return
      }
    }

    if (signal.aborted) {
      console.log('[TTS_DIAG]', { event: 'speak_aborted', ...meta, attempt: 2, discardedBlob: true, timestamp: Date.now() })
      setIsLoading(false); return
    }

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    blobUrlRef.current = URL.createObjectURL(blob)
    blobGenerationRef.current += 1
    blobCreatedAtRef.current = Date.now()
    console.log('[TTS_DIAG]', { event: 'blob_updated', ...meta, blobId: blobGenerationRef.current, textPreview: segments.join(' ').slice(0, 120), timestamp: blobCreatedAtRef.current })

    setIsLoading(false)
    await playBlobUrl(blobUrlRef.current, blobGenerationRef.current, meta)
  }, [playBlobUrl])

  // ── speak(): enqueues onto the promise chain; returns a Promise ───────────
  // If a previous speak is in-flight its fetch is aborted so _doSpeak()
  // exits immediately — the new call starts right after.
  const speak = useCallback((input, meta = {}) => {
    tSpeakCalledRef.current = performance.now()
    const segments = (Array.isArray(input) ? input : [input]).filter(Boolean)
    if (!segments.length) return Promise.resolve()

    console.log('[TTS_DIAG]', { event: 'speak_started', ...meta, textPreview: segments.join(' ').slice(0, 120), timestamp: Date.now() })

    // Abort the in-flight fetch (audio.onended will still fire → queue unblocks)
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    const promise = queueRef.current
      .then(() => _doSpeak(segments, signal, meta))
      .catch(() => {})    // never let an error stall the queue

    queueRef.current = promise
    return promise
  }, [_doSpeak])

  // ── stop(): abort + drain the queue ──────────────────────────────────────
  const stop = useCallback(() => {
    abortRef.current?.abort()
    queueRef.current = Promise.resolve()   // reset so next speak() starts fresh

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.onended = null
      audioRef.current.onerror = null
    }
    setIsSpeaking(false)
    setIsLoading(false)
  }, [])

  // ── replay(): instant playback from cached blob ───────────────────────────
  const replay = useCallback(() => {
    const present = !!blobUrlRef.current
    const ageMs   = present ? Date.now() - blobCreatedAtRef.current : null
    const blobId  = blobGenerationRef.current

    console.log('[TTS_DIAG]', { event: 'replay_clicked', blobId, timestamp: Date.now() })
    console.log('[TTS_DIAG]', { event: 'replay_blob_present', present, blobId, timestamp: Date.now() })
    if (present) {
      console.log('[TTS_DIAG]', { event: 'replay_blob_age_ms', ageMs, blobId, timestamp: Date.now() })
    }
    if (blobUrlRef.current) playBlobUrl(blobUrlRef.current, blobId)
  }, [playBlobUrl])

  return { speak, stop, replay, isSpeaking, isLoading }
}
