import { useMemo } from 'react'

function earned(score, pts) {
  if (score === 3) return pts
  if (score === 2) return Math.floor(pts / 2)
  return 0
}

const LABEL = { 3: 'Pass', 2: 'Borderline', 1: 'Fail' }

export function Scorecard({ caseData, results, onRestart }) {
  const { total, possible, verdict, pct } = useMemo(() => {
    const possible = caseData.totalPoints
    const total = results.reduce((s, r) => s + earned(r.score, r.points), 0)
    const pct = Math.round((total / possible) * 100)
    const { pass, marginal } = caseData.scoring
    const verdict =
      total >= pass.threshold ? 'PASS' : total >= marginal.threshold ? 'MARGINAL' : 'FAIL'
    return { total, possible, verdict, pct }
  }, [caseData, results])

  return (
    <div className="scorecard">
      <div className="scorecard-top">
        <div className="start-logo">ABOG Oral Board Simulator</div>
        <h1>Session Complete</h1>

        <div className={`verdict verdict-${verdict.toLowerCase()}`}>
          <span className="verdict-label">{verdict}</span>
          <span className="verdict-score">{total} / {possible}</span>
          <span className="verdict-pct">{pct}%</span>
        </div>

        <div className="thresholds">
          <span className="thr thr-pass">
            Pass ≥{caseData.scoring.pass.threshold} ({caseData.scoring.pass.percent}%)
          </span>
          <span className="thr thr-marginal">
            Marginal {caseData.scoring.marginal.threshold} ({caseData.scoring.marginal.percent}%)
          </span>
          <span className="thr thr-fail">
            Fail &lt;{caseData.scoring.fail.threshold} ({caseData.scoring.fail.percent}%)
          </span>
        </div>
      </div>

      <div className="result-list">
        {results.map((r, i) => (
          <div key={r.questionId} className={`result-card sc-${r.score}`}>
            <div className="result-header">
              <span className="rh-num">Q{i + 1}</span>
              <span className={`rh-label sc-label-${r.score}`}>{LABEL[r.score]}</span>
              <span className="rh-pts">
                {earned(r.score, r.points)} / {r.points} pt{r.points > 1 ? 's' : ''}
              </span>
            </div>

            <p className="r-question">{r.question}</p>

            <div className="r-answers">
              <div className="r-answer-block">
                <div className="r-answer-label">Your Answer</div>
                <p>{r.candidateAnswer}</p>
              </div>
              {r.followUpAnswer && (
                <div className="r-answer-block followup-answer">
                  <div className="r-answer-label">Your Addendum</div>
                  <p>{r.followUpAnswer}</p>
                </div>
              )}
              <div className="r-answer-block ideal">
                <div className="r-answer-label">Ideal Answer</div>
                <p>{r.idealAnswer}</p>
              </div>
            </div>

            {r.pointsMissed?.length > 0 && (
              <div className="r-points missed">
                <div className="r-answer-label">Key Points Missed</div>
                <ul>
                  {r.pointsMissed.map((pt, j) => <li key={j}>{pt}</li>)}
                </ul>
              </div>
            )}

            {r.pointsCovered?.length > 0 && (
              <div className="r-points covered">
                <div className="r-answer-label">Points Covered</div>
                <ul>
                  {r.pointsCovered.map((pt, j) => <li key={j}>{pt}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="btn-primary restart-btn" onClick={onRestart}>
        Restart Exam
      </button>
    </div>
  )
}
