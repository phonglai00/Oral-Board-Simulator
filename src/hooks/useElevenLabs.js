import { useCallback, useRef, useState } from 'react'

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'           // Rachel
const MODEL_ID = 'eleven_monolingual_v1'
const API_URL  = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`

export function useElevenLabs() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading,  setIsLoading]  = useState(false)

  const audioRef   = useRef(null)   // current HTMLAudioElement
  const blobUrlRef = useRef(null)   // cached URL so replay needs no extra API call
  const abortRef   = useRef(null)   // AbortController for in-flight fetch

  // Play a blob URL, stopping whatever is currently playing first
  const playBlobUrl = useCallback((url) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onerror = null
    }
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onplay  = () => setIsSpeaking(true)
    audio.onended = () => setIsSpeaking(false)
    audio.onerror = () => setIsSpeaking(false)
    audio.play().catch(() => setIsSpeaking(false))
  }, [])

  const speak = useCallback(async (input) => {
    const segments = (Array.isArray(input) ? input : [input]).filter(Boolean)
    if (!segments.length) return

    // Cancel any in-flight fetch and stop current playback
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsSpeaking(false)
    setIsLoading(true)

    // Join vignette + question with a paragraph break so ElevenLabs
    // produces a natural pause between the clinical scenario and the question.
    const text = segments.join('\n\n')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'xi-api-key':    import.meta.env.VITE_ELEVENLABS_API_KEY,
          'Content-Type':  'application/json',
          'Accept':        'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability:        0.65,
            similarity_boost: 0.75,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail?.message || `ElevenLabs error ${res.status}`)
      }

      const blob = await res.blob()

      // Free previous cached audio
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = URL.createObjectURL(blob)

      setIsLoading(false)
      playBlobUrl(blobUrlRef.current)
    } catch (err) {
      if (err.name === 'AbortError') return  // intentional cancel — stay silent
      console.error('ElevenLabs TTS error:', err.message)
      setIsLoading(false)
    }
  }, [playBlobUrl])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
    setIsLoading(false)
  }, [])

  const replay = useCallback(() => {
    if (blobUrlRef.current) {
      // Audio already fetched — play instantly from cache, no API call
      playBlobUrl(blobUrlRef.current)
    }
  }, [playBlobUrl])

  return { speak, stop, replay, isSpeaking, isLoading }
}
