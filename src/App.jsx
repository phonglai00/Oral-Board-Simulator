import { useState, useRef } from 'react'
import { ApiTest } from './components/ApiTest'
import { StartScreen } from './components/StartScreen'
import { ExamSession } from './components/ExamSession'
import SessionScorecard from './components/SessionScorecard'
import { CASES } from './data/cases'
// Developer testing — Grader v2 keyboard toggle (Ctrl+Shift+G)
// Registering here keeps the shortcut active on every screen.
import { useGraderV2DevMode } from './hooks/useGraderV2DevMode'

const SCREEN = { API_TEST: 'api_test', START: 'start', EXAM: 'exam', SCORE: 'score' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.API_TEST)
  // isDevMode drives the hidden Grader v2 comparison panel — no UI exposure
  const { isDevMode } = useGraderV2DevMode()
  const [results, setResults] = useState([])
  const [questions, setQuestions] = useState([])
  const [transcript, setTranscript] = useState([])

  // Shuffled queue — refills when all cases have been presented once
  const queueRef = useRef(shuffle(CASES))
  const [caseData, setCaseData] = useState(queueRef.current[0])

  function nextCase() {
    queueRef.current = queueRef.current.slice(1)
    if (queueRef.current.length === 0) queueRef.current = shuffle(CASES)
    setCaseData(queueRef.current[0])
  }

  function handleComplete(r, q, t) {
    setResults(r)
    setQuestions(q)
    setTranscript(t)
    setScreen(SCREEN.SCORE)
  }

  function handleRestart() {
    setResults([])
    setQuestions([])
    setTranscript([])
    nextCase()
    setScreen(SCREEN.START)
  }

  return (
    <>
      {screen === SCREEN.API_TEST && (
        <ApiTest onSuccess={() => setScreen(SCREEN.START)} />
      )}
      {screen === SCREEN.START && (
        <StartScreen caseData={caseData} onBegin={() => setScreen(SCREEN.EXAM)} />
      )}
      {screen === SCREEN.EXAM && (
        <ExamSession
          caseData={caseData}
          onComplete={handleComplete}
          isDevMode={isDevMode}
        />
      )}
      {screen === SCREEN.SCORE && (
        <SessionScorecard
          questions={questions}
          results={results}
          caseTitle={`Case ${caseData.id}: ${caseData.topic}`}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}
