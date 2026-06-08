/**
 * GraderV2Panel.jsx — src/components/GraderV2Panel.jsx
 *
 * Developer comparison panel for Grader v2 testing.
 *
 * Only renders when graderV2Testing === 'true' in localStorage.
 * Fixed to the bottom of the viewport, collapsible, clearly labeled DEV.
 *
 * Shows:
 *   Left column  — Current production grader output
 *   Right column — Grader v2 output + pass probability + ABOG score
 *
 * Developer testing infrastructure only — completely hidden from production users.
 */

import { useState } from 'react'
import { exportV2Log, getV2Log, clearV2Log } from '../utils/graderV2Log'
import { V2_WEIGHTS, V2_THRESHOLDS } from '../utils/graderV2Prompt'

// ── Color helpers ─────────────────────────────────────────────────────────────
function dimColor(score, max = 5) {
  const ratio = score / max
  if (ratio >= 0.8) return '#4ade80'   // green
  if (ratio >= 0.6) return '#facc15'   // amber
  return '#f87171'                      // red
}

function abogColor(score) {
  if (score === 3) return '#4ade80'
  if (score === 2) return '#facc15'
  return '#f87171'
}

function probColor(p) {
  if (p >= V2_THRESHOLDS.PASS)       return '#4ade80'
  if (p >= V2_THRESHOLDS.BORDERLINE) return '#facc15'
  return '#f87171'
}

// ── Current grader ABOG proxy ─────────────────────────────────────────────────
// The production grader has no abog_score field; compute it from correctness + completeness.
function currentAbogProxy(result) {
  if (!result) return { score: '-', label: '—' }
  const avg = (result.correctness + result.completeness) / 2
  if (avg >= 4) return { score: 3, label: 'Pass' }
  if (avg >= 3) return { score: 2, label: 'Borderline' }
  return             { score: 1, label: 'Fail' }
}

// ── Score row component ───────────────────────────────────────────────────────
function ScoreRow({ label, score, max = 5, weight }) {
  const color = dimColor(score, max)
  const pct   = Math.round((score / max) * 100)
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.04em' }}>
          {label}
          {weight !== undefined && (
            <span style={{ color: '#555', marginLeft: 4 }}>({Math.round(weight * 100)}%)</span>
          )}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'monospace' }}>
          {score}/{max}
        </span>
      </div>
      <div style={{ height: 4, background: '#1e2230', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function GraderV2Panel({ currentResult, v2Result, v2Loading, questionId }) {
  const [open,    setOpen]    = useState(true)
  const [logOpen, setLogOpen] = useState(false)
  const [logCount, setLogCount] = useState(() => getV2Log().length)

  const abogProxy = currentAbogProxy(currentResult)

  function handleExport() {
    exportV2Log()
  }

  function handleClear() {
    clearV2Log()
    setLogCount(0)
  }

  function handleToggleLog() {
    setLogCount(getV2Log().length)
    setLogOpen(o => !o)
  }

  // Safety override indicator
  const safetyOverride = v2Result &&
    v2Result.safety_score <= 2 && v2Result.recovery_score <= 2

  return (
    <div style={{
      position:     'fixed',
      bottom:       0,
      left:         0,
      right:        0,
      zIndex:       9999,
      fontFamily:   '"DM Mono", "Courier New", monospace',
      fontSize:     12,
    }}>
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '6px 14px',
          background:      '#0d1117',
          borderTop:       '2px solid #4ade80',
          cursor:          'pointer',
          userSelect:      'none',
        }}
      >
        <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em' }}>
          🔬 GRADER V2 — DEVELOPER MODE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {v2Loading && (
            <span style={{ color: '#facc15', fontSize: 10, letterSpacing: '0.08em' }}>
              ⏳ SCORING…
            </span>
          )}
          {v2Result && !v2Loading && (
            <span style={{
              color:       abogColor(v2Result.abog_score),
              fontWeight:  700,
              fontSize:    11,
              letterSpacing: '0.06em',
            }}>
              V2: {v2Result.abog_label?.toUpperCase()} ({v2Result.pass_probability}%)
            </span>
          )}
          <span style={{ color: '#555', fontSize: 11 }}>{open ? '▼' : '▲'}</span>
        </div>
      </div>

      {/* ── Panel body ─────────────────────────────────────────────────── */}
      {open && (
        <div style={{
          background:  '#0d1117',
          borderTop:   '1px solid #1e2230',
          maxHeight:   '55vh',
          overflowY:   'auto',
          padding:     '14px 16px 16px',
        }}>

          {/* Loading state */}
          {v2Loading && !v2Result && (
            <div style={{ textAlign: 'center', color: '#facc15', padding: '20px 0', fontSize: 11 }}>
              Running Grader v2…
            </div>
          )}

          {/* No result yet */}
          {!v2Loading && !v2Result && (
            <div style={{ textAlign: 'center', color: '#555', padding: '20px 0', fontSize: 11 }}>
              Submit an answer to see comparison output.
            </div>
          )}

          {/* Comparison columns */}
          {v2Result && (
            <div style={{
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 16,
            }}>

              {/* ── LEFT: Current grader ─────────────────────────────── */}
              <div>
                <p style={{ fontSize: 10, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Current Grader (Production)
                </p>

                {currentResult ? (
                  <>
                    <ScoreRow label="Correctness"  score={currentResult.correctness}  />
                    <ScoreRow label="Completeness" score={currentResult.completeness} />

                    <div style={{
                      marginTop:    10,
                      padding:      '8px 10px',
                      background:   '#111827',
                      borderRadius: 6,
                      border:       `1px solid ${abogColor(abogProxy.score)}33`,
                    }}>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 3, letterSpacing: '0.08em' }}>
                        ABOG PROXY (avg correctness + completeness)
                      </div>
                      <div style={{
                        fontSize:   18,
                        fontWeight: 700,
                        color:      abogColor(abogProxy.score),
                      }}>
                        {abogProxy.score} — {abogProxy.label}
                      </div>
                    </div>

                    {currentResult.pushbackMode && currentResult.pushbackMode !== 'none' && (
                      <div style={{ marginTop: 8, fontSize: 10, color: '#facc15' }}>
                        pushbackMode: {currentResult.pushbackMode}
                      </div>
                    )}
                    {currentResult.isDangerous && (
                      <div style={{ marginTop: 4, fontSize: 10, color: '#f87171' }}>
                        ⚠️ DANGEROUS: {currentResult.dangerousReason}
                      </div>
                    )}
                    {currentResult.isCurveball && (
                      <div style={{ marginTop: 4, fontSize: 10, color: '#facc15' }}>
                        💡 CURVEBALL: {currentResult.curveballNote}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#555', fontSize: 11 }}>No production result available.</div>
                )}
              </div>

              {/* ── RIGHT: Grader v2 ─────────────────────────────────── */}
              <div>
                <p style={{ fontSize: 10, color: '#4ade80', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Grader v2 (Testing)
                </p>

                <ScoreRow label="Safety"        score={v2Result.safety_score}        weight={V2_WEIGHTS.safety}        />
                <ScoreRow label="Diagnostic"    score={v2Result.diagnostic_score}    weight={V2_WEIGHTS.diagnostic}    />
                <ScoreRow label="Management"    score={v2Result.management_score}    weight={V2_WEIGHTS.management}    />
                <ScoreRow label="Recovery"      score={v2Result.recovery_score}      weight={V2_WEIGHTS.recovery}      />
                <ScoreRow label="Terminology"   score={v2Result.terminology_score}   weight={V2_WEIGHTS.terminology}   />
                <ScoreRow label="Focus"         score={v2Result.focus_score}         weight={V2_WEIGHTS.focus}         />
                <ScoreRow label="Communication" score={v2Result.communication_score} weight={V2_WEIGHTS.communication} />

                {/* Safety override indicator */}
                {safetyOverride && (
                  <div style={{
                    marginTop:    6,
                    padding:      '5px 8px',
                    background:   'rgba(248,113,113,0.12)',
                    border:       '1px solid #f8717140',
                    borderRadius: 4,
                    fontSize:     10,
                    color:        '#f87171',
                    letterSpacing: '0.05em',
                  }}>
                    ⚠ SAFETY OVERRIDE APPLIED — score capped at {45}
                  </div>
                )}

                {/* Pass probability + ABOG score */}
                <div style={{
                  marginTop:    10,
                  padding:      '8px 10px',
                  background:   '#111827',
                  borderRadius: 6,
                  border:       `1px solid ${abogColor(v2Result.abog_score)}33`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: '0.08em' }}>
                        PASS PROBABILITY
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: probColor(v2Result.pass_probability) }}>
                        {v2Result.pass_probability}%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: '0.08em' }}>
                        ABOG SCORE
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: abogColor(v2Result.abog_score) }}>
                        {v2Result.abog_score} — {v2Result.abog_label}
                      </div>
                    </div>
                  </div>

                  {/* Pass probability bar */}
                  <div style={{ marginTop: 6, height: 6, background: '#1e2230', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width:        `${v2Result.pass_probability}%`,
                      height:       '100%',
                      background:   probColor(v2Result.pass_probability),
                      borderRadius: 3,
                      transition:   'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span style={{ fontSize: 9, color: '#555' }}>0%</span>
                    <span style={{ fontSize: 9, color: '#f87171' }}>Fail &lt;{V2_THRESHOLDS.BORDERLINE}%</span>
                    <span style={{ fontSize: 9, color: '#facc15' }}>Border {V2_THRESHOLDS.BORDERLINE}%</span>
                    <span style={{ fontSize: 9, color: '#4ade80' }}>Pass ≥{V2_THRESHOLDS.PASS}%</span>
                  </div>
                </div>

                {/* Flags */}
                {v2Result.isDangerous && (
                  <div style={{ marginTop: 6, fontSize: 10, color: '#f87171' }}>
                    ⚠️ DANGEROUS: {v2Result.dangerousReason}
                  </div>
                )}
                {v2Result.isCurveball && (
                  <div style={{ marginTop: 4, fontSize: 10, color: '#facc15' }}>
                    💡 CURVEBALL: {v2Result.curveballReason}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Strengths / Gaps / Teaching ─────────────────────────────── */}
          {v2Result && (v2Result.strengths?.length > 0 || v2Result.gaps?.length > 0) && (
            <div style={{
              marginTop:    14,
              paddingTop:   12,
              borderTop:    '1px solid #1e2230',
              display:      'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:          16,
            }}>
              <div>
                <p style={{ fontSize: 10, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Strengths
                </p>
                {v2Result.strengths?.length > 0
                  ? v2Result.strengths.map((s, i) => (
                      <p key={i} style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3, paddingLeft: 8, borderLeft: '2px solid #4ade8066' }}>
                        {s}
                      </p>
                    ))
                  : <p style={{ fontSize: 11, color: '#555' }}>—</p>
                }
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#f87171', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Gaps
                </p>
                {v2Result.gaps?.length > 0
                  ? v2Result.gaps.map((g, i) => (
                      <p key={i} style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3, paddingLeft: 8, borderLeft: '2px solid #f8717166' }}>
                        {g}
                      </p>
                    ))
                  : <p style={{ fontSize: 11, color: '#555' }}>—</p>
                }
              </div>
            </div>
          )}

          {/* ── Teaching points ──────────────────────────────────────────── */}
          {v2Result?.teaching_points?.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #1e2230' }}>
              <p style={{ fontSize: 10, color: '#c8a96e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                Teaching Points
              </p>
              {v2Result.teaching_points.map((tp, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <p style={{ fontSize: 11, color: '#e8e0d0', marginBottom: 1 }}>→ {tp.pearl}</p>
                  {tp.acog_reference && (
                    <p style={{ fontSize: 10, color: '#7a6540', paddingLeft: 12 }}>{tp.acog_reference}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Log controls ─────────────────────────────────────────────── */}
          <div style={{
            marginTop:    14,
            paddingTop:   10,
            borderTop:    '1px solid #1e2230',
            display:      'flex',
            gap:          8,
            alignItems:   'center',
            flexWrap:     'wrap',
          }}>
            <span style={{ fontSize: 10, color: '#555', marginRight: 4 }}>
              LOG: {logCount} entr{logCount === 1 ? 'y' : 'ies'}
            </span>
            <button onClick={handleExport} style={devBtnStyle('#1e2230', '#9ca3af')}>
              Export JSON
            </button>
            <button onClick={handleToggleLog} style={devBtnStyle('#1e2230', '#9ca3af')}>
              {logOpen ? 'Hide Log' : 'Preview Log'}
            </button>
            <button onClick={handleClear} style={devBtnStyle('#1e2230', '#f87171')}>
              Clear Log
            </button>
            <span style={{ fontSize: 10, color: '#333', marginLeft: 'auto' }}>
              Ctrl+Shift+G to toggle dev mode
            </span>
          </div>

          {/* Log preview */}
          {logOpen && (
            <div style={{
              marginTop:  8,
              background: '#070a0e',
              border:     '1px solid #1e2230',
              borderRadius: 4,
              padding:    '8px 10px',
              maxHeight:  160,
              overflowY:  'auto',
              fontSize:   10,
              color:      '#555',
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(getV2Log().slice(-3), null, 2)}
              </pre>
              {getV2Log().length > 3 && (
                <p style={{ marginTop: 4, color: '#333' }}>… {getV2Log().length - 3} older entries hidden. Export to see all.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Minimal dev button style helper ──────────────────────────────────────────
function devBtnStyle(bg, color) {
  return {
    background:    bg,
    color,
    border:        `1px solid ${color}44`,
    borderRadius:  3,
    padding:       '3px 8px',
    fontSize:      10,
    cursor:        'pointer',
    fontFamily:    'inherit',
    letterSpacing: '0.04em',
  }
}
