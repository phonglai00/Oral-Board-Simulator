/**
 * useGraderV2DevMode.js — src/hooks/useGraderV2DevMode.js
 *
 * Hidden developer mode toggle for Grader v2 testing.
 *
 * Activation: Ctrl + Shift + G (from any screen)
 * Persistence: localStorage key 'graderV2Testing'
 *
 * This hook registers the keyboard listener at the window level so the shortcut
 * works regardless of which screen is currently rendered.
 *
 * Developer testing infrastructure only — not exposed in the production UI.
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'graderV2Testing'

export function useGraderV2DevMode() {
  const [isDevMode, setIsDevMode] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  )

  useEffect(() => {
    function handleKeydown(e) {
      // Ctrl + Shift + G (Windows/Linux) or Cmd + Shift + G (macOS)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setIsDevMode(prev => {
          const next = !prev
          localStorage.setItem(STORAGE_KEY, String(next))
          // Brief console confirmation — the only visible signal during toggle
          console.log(
            `%c[GraderV2] Developer mode ${next ? 'ENABLED' : 'DISABLED'}`,
            `color: ${next ? '#4ade80' : '#f87171'}; font-weight: bold; font-size: 13px`,
          )
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  return { isDevMode }
}
