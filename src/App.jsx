import { useState } from 'react'
import { ApiTest } from './components/ApiTest'
import { StartScreen } from './components/StartScreen'
import { ExamSession } from './components/ExamSession'
import SessionScorecard from './components/SessionScorecard'
import { CASES } from './data/cases'

const SCREEN = { API_TEST: 'api_test', START: 'start', EXAM: 'exam', SCORE: 'score' }

export default function App() {
  const [screen, setScreen] = useState(SCREEN.API_TEST)
  const [results, setResults] = useState([])
  const [questions, setQuestions] = useState([])
  const [transcript, setTranscript] = useState([])
  const caseData = CASES[0]

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
