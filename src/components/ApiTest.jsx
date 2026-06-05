import { useState, useEffect } from 'react'
import { testConnection } from '../services/anthropic'

export function ApiTest({ onSuccess }) {
  const [status, setStatus] = useState('testing')
  const [detail, setDetail] = useState('')

  useEffect(() => { run() }, [])

  async function run() {
    setStatus('testing')
    setDetail('')
    try {
      await testConnection()
      setStatus('success')
      setTimeout(onSuccess, 1200)
    } catch (err) {
      setStatus('error')
      setDetail(err.message)
    }
  }

  return (
    <div className="api-test">
      <div className="start-logo">ABOG Oral Board Simulator</div>

      {status === 'testing' && (
        <>
          <div className="spinner" />
          <p className="api-test-status">Connecting to AI examiner&hellip;</p>
        </>
      )}

      {status === 'success' && (
        <div className="api-test-result success">AI examiner connected</div>
      )}

      {status === 'error' && (
        <>
          <div className="api-test-result error">
            Connection failed: {detail}
          </div>
          <p className="api-test-help">
            Make sure your <code>.env</code> file contains{' '}
            <code>VITE_ANTHROPIC_API_KEY=sk-ant-...</code> and that you
            restarted the dev server after editing it.
          </p>
          <button className="btn-ghost" onClick={run}>
            Retry
          </button>
        </>
      )}
    </div>
  )
}
