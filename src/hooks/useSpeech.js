import { useCallback, useRef, useState } from 'react'

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? []
  return (
    voices.find(v => v.name === 'Microsoft David - English (United States)') ||
    voices.find(v => v.name === 'Microsoft Mark - English (United States)') ||
    null
  )
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const lastSegmentsRef = useRef([])
  const cancelledRef    = useRef(false)
  const pauseTimerRef   = useRef(null)

  // Speak one segment at a time; call next() after each one ends
  const runSegments = useCallback((segments, voice, index = 0) => {
    if (cancelledRef.current || index >= segments.length) {
      if (!cancelledRef.current) setIsSpeaking(false)
      return
    }

    const utter = new SpeechSynthesisUtterance(segments[index])
    utter.rate   = 0.85   // slightly slower for medical terminology
    utter.pitch  = 1.0
    utter.volume = 1.0
    if (voice) utter.voice = voice

    utter.onend = () => {
      if (cancelledRef.current) return
      if (index < segments.length - 1) {
        // Natural pause between vignette and question
        pauseTimerRef.current = setTimeout(
          () => runSegments(segments, voice, index + 1),
          650
        )
      } else {
        setIsSpeaking(false)
      }
    }
    utter.onerror = () => {
      if (!cancelledRef.current) setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utter)
  }, [])

  const speak = useCallback((input) => {
    if (!window.speechSynthesis) return

    const segments = (Array.isArray(input) ? input : [input]).filter(Boolean)
    if (!segments.length) return

    lastSegmentsRef.current = segments
    cancelledRef.current    = false
    clearTimeout(pauseTimerRef.current)
    window.speechSynthesis.cancel()

    const startSpeaking = () => {
      setIsSpeaking(true)
      // 50ms gap lets cancel() fully clear before the new utterance queues
      setTimeout(() => runSegments(segments, pickVoice()), 50)
    }

    // Chrome populates voices asynchronously — wait if list is empty
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', startSpeaking, { once: true })
    } else {
      startSpeaking()
    }
  }, [runSegments])

  const stop = useCallback(() => {
    cancelledRef.current = true
    clearTimeout(pauseTimerRef.current)
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  const replay = useCallback(() => {
    if (lastSegmentsRef.current.length) speak(lastSegmentsRef.current)
  }, [speak])

  return { speak, stop, replay, isSpeaking }
}
