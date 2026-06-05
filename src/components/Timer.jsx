import { useState, useEffect, useRef } from 'react'

export function Timer({ totalSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true
        onExpire?.()
      }
      return
    }
    const id = setInterval(() => setRemaining(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [remaining, onExpire])

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const warn = remaining < 300
  const crit = remaining < 60

  return (
    <div className={`timer${warn ? ' warn' : ''}${crit ? ' crit' : ''}`}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  )
}
