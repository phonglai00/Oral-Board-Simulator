import { useState } from 'react'
import { ApiTest } from './components/ApiTest'
import { StartScreen } from './components/StartScreen'
import { ExamSession } from './components/ExamSession'
import { Scorecard } from './components/Scorecard'
import { CASES } from './data/cases'

const SCREEN = { API_TEST: 'api_test', START: 'start', EXAM: 'exam', SCORE: 'score' }

export default function App() {
  const [screen, setScreen] = useState(SCREEN.API_TEST)
  const [results, setResults] = useState(null)
  const caseData = CASES[0]

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
          onComplete={(r) => { setResults(r); setScreen(SCREEN.SCORE) }}
        />
      )}
      {screen === SCREEN.SCORE && (
        <Scorecard
          caseData={caseData}
          results={results}
          onRestart={() => setScreen(SCREEN.START)}
        />
      )}
    </>
  )
}
