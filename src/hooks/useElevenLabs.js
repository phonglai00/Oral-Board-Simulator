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

  // ── Play a blob URL; returns a Promise that resolves when audio ends ──────
  const playBlobUrl = useCallback((url) => {
    return new Promise((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.onended = null
        audioRef.current.onerror = null
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onplay  = () => setIsSpeaking(true)
      audio.onended = () => { setIsSpeaking(false); resolve() }
      // Resolve (not reject) on error so the queue always advances
      audio.onerror = () => { setIsSpeaking(false); resolve() }
      audio.play().catch(() => { setIsSpeaking(false); resolve() })
    })
  }, [])

  // ── Internal: fetch TTS + play; returns a Promise ────────────────────────
  const _doSpeak = useCallback(async (segments, signal) => {
    const text = segments.join('\n\n')

    const tryFetch = async () => {
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
      return res.blob()
    }

    setIsLoading(true)

    let blob
    try {
      blob = await tryFetch()
    } catch (err) {
      if (err.name === 'AbortError') { setIsLoading(false); return }
      // ── Retry once after 1.5 s ───────────────────────────────────────────
      await new Promise(r => setTimeout(r, 1500))
      if (signal.aborted)            { setIsLoading(false); return }
      try {
        blob = await tryFetch()
      } catch (err2) {
        if (err2.name !== 'AbortError') console.error('ElevenLabs TTS error:', err2.message)
        setIsLoading(false)
        return
      }
    }

    if (signal.aborted) { setIsLoading(false); return }

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    blobUrlRef.current = URL.createObjectURL(blob)

    setIsLoading(false)
    await playBlobUrl(blobUrlRef.current)
  }, [playBlobUrl])

  // ── speak(): enqueues onto the promise chain; returns a Promise ───────────
  // If a previous speak is in-flight its fetch is aborted so _doSpeak()
  // exits immediately — the new call starts right after.
  const speak = useCallback((input) => {
    const segments = (Array.isArray(input) ? input : [input]).filter(Boolean)
    if (!segments.length) return Promise.resolve()

    // Abort the in-flight fetch (audio.onended will still fire → queue unblocks)
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    const promise = queueRef.current
      .then(() => _doSpeak(segments, signal))
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
    if (blobUrlRef.current) playBlobUrl(blobUrlRef.current)
  }, [playBlobUrl])

  return { speak, stop, replay, isSpeaking, isLoading }
}
