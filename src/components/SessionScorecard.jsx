/**
 * SessionScorecard.jsx
 * Drop this file into: src/components/SessionScorecard.jsx
 *
 * End-of-session scorecard showing:
 *   - Per-question Correctness + Completeness scores side by side
 *   - Session summary stats
 *   - Key Teaching Points + ACOG references per question
 *
 * Props:
 *   questions   {string[]}        - The question text for each item
 *   results     {ScoringResult[]} - Array from parseScoringResponse()
 *   caseTitle   {string}          - e.g. "Case D: Hypertension in Pregnancy"
 *   onRestart   {() => void}      - Callback to start a new session
 *
 * Requires: computeSessionStats from ../utils/scoringPrompt
 *
 * Styling: plain CSS-in-JS via style props — no external CSS file needed.
 * Compatible with any Vite + React setup. No extra dependencies.
 */

import { useState } from 'react';
import { computeSessionStats } from '../utils/scoringPrompt';

// ─── Score pill colors ────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 4) return { bg: '#e6f4ea', text: '#1e6e3a', border: '#a8d5b5' };
  if (score >= 3) return { bg: '#fff8e1', text: '#7c5c00', border: '#ffe082' };
  return { bg: '#fdecea', text: '#8b1a1a', border: '#f5b8b8' };
}

function scoreLabel(score) {
  if (score === 5) return 'Excellent';
  if (score === 4) return 'Good';
  if (score === 3) return 'Adequate';
  if (score === 2) return 'Incomplete';
  return 'Insufficient';
}

// ─── Mini score pill ──────────────────────────────────────────────────────────
function ScorePill({ score, label }) {
  const { bg, text, border } = scoreColor(score);
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '10px 18px',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 10,
      minWidth: 100,
    }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: text, lineHeight: 1 }}>{score}<span style={{ fontSize: 13, fontWeight: 400 }}>/5</span></span>
      <span style={{ fontSize: 11, fontWeight: 600, color: text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 11, color: text, opacity: 0.75 }}>{scoreLabel(score)}</span>
    </div>
  );
}

// ─── Horizontal score bar (for summary) ──────────────────────────────────────
function ScoreBar({ value, max = 5, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        flex: 1,
        height: 8,
        background: '#eee',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 4,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#333', minWidth: 32 }}>{value}</span>
    </div>
  );
}

// ─── Expandable teaching points section ──────────────────────────────────────
function TeachingPoints({ points, acogRefs }) {
  const [open, setOpen] = useState(false);
  const hasContent = points.length > 0 || acogRefs.length > 0;
  if (!hasContent) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          color: '#1a5f9e',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span style={{
          display: 'inline-block',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          fontSize: 12,
        }}>▶</span>
        Key Teaching Points &amp; ACOG References
      </button>

      {open && (
        <div style={{
          marginTop: 8,
          padding: '12px 14px',
          background: '#f0f6ff',
          borderLeft: '3px solid #1a5f9e',
          borderRadius: '0 8px 8px 0',
        }}>
          {points.length > 0 && (
            <div style={{ marginBottom: acogRefs.length > 0 ? 12 : 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a5f9e', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Teaching Points
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {points.map((pt, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#1e3a5f', marginBottom: 4, lineHeight: 1.5 }}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {acogRefs.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1a5f9e', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ACOG References
              </p>
              {acogRefs.map((ref, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: '1px solid #c5d9f0',
                  borderRadius: 6,
                  padding: '8px 10px',
                  marginBottom: i < acogRefs.length - 1 ? 6 : 0,
                }}>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>
                    {ref.bulletin} — {ref.title}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#4a6080', lineHeight: 1.5 }}>{ref.relevance}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Per-question row ─────────────────────────────────────────────────────────
function QuestionRow({ index, question, result }) {
  return (
    <div style={{
      background: '#fff',
      border: result.isDangerous ? '2px solid #f5b8b8' : '1px solid #e0e4ea',
      borderRadius: 12,
      padding: '16px 20px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        {/* Question text + badges */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              Question {index + 1}
            </p>
            {result.isDangerous && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', background: '#fdecea', border: '1px solid #f5b8b8',
                borderRadius: 12, fontSize: 11, fontWeight: 700, color: '#8b1a1a',
              }}>
                ⚠️ Dangerous Answer
              </span>
            )}
            {result.isCurveball && !result.isDangerous && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', background: '#fffbe6', border: '1px solid #ffe58f',
                borderRadius: 12, fontSize: 11, fontWeight: 700, color: '#7c5c00',
              }}>
                💡 Common Trap
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: '#222', margin: '0 0 8px', lineHeight: 1.5 }}>{question}</p>
          {result.isDangerous && result.dangerousReason && (
            <p style={{ fontSize: 13, color: '#8b1a1a', background: '#fdecea', padding: '6px 10px', borderRadius: 6, margin: '0 0 8px', lineHeight: 1.5 }}>
              ⚠️ {result.dangerousReason}
            </p>
          )}
          {result.isCurveball && result.curveballNote && (
            <p style={{ fontSize: 13, color: '#7c5c00', background: '#fffbe6', padding: '6px 10px', borderRadius: 6, margin: '0 0 8px', lineHeight: 1.5 }}>
              💡 Common trap — here's what examiners look for: {result.curveballNote}
            </p>
          )}
          {result.feedback && (
            <p style={{ fontSize: 13, color: '#555', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
              {result.feedback}
            </p>
          )}
        </div>

        {/* Dual score pills — side by side */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <ScorePill score={result.correctness} label="Correctness" />
          <ScorePill score={result.completeness} label="Completeness" />
        </div>
      </div>

      <TeachingPoints points={result.teaching_points || []} acogRefs={result.acog_references || []} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SessionScorecard({ questions, results, caseTitle, onRestart }) {
  const stats = computeSessionStats(results);

  // Map overall avg to a pass/marginal/fail band
  const performanceBand = stats.overallAvg >= 4
    ? { label: 'Ready for Boards', color: '#1e6e3a', bg: '#e6f4ea' }
    : stats.overallAvg >= 3
    ? { label: 'Needs Reinforcement', color: '#7c5c00', bg: '#fff8e1' }
    : { label: 'Significant Gaps', color: '#8b1a1a', bg: '#fdecea' };

  return (
    <div style={{
      maxWidth: 780,
      margin: '0 auto',
      padding: '24px 20px 48px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', margin: '0 0 4px' }}>
          ABOG Board Simulator — Session Complete
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>{caseTitle}</h1>
        <span style={{
          display: 'inline-block',
          padding: '4px 14px',
          background: performanceBand.bg,
          color: performanceBand.color,
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
        }}>
          {performanceBand.label}
        </span>
      </div>

      {/* Summary stats cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 28,
      }}>
        {[
          { label: 'Correctness', value: stats.avgCorrectness, color: '#1a5f9e' },
          { label: 'Completeness', value: stats.avgCompleteness, color: '#7b3fa0' },
          { label: 'Overall Avg', value: stats.overallAvg, color: scoreColor(Math.round(stats.overallAvg)).text },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#f8f9fa',
            borderRadius: 10,
            padding: '14px 16px',
            border: '1px solid #e8eaed',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
              Avg {label}
            </p>
            <ScoreBar value={value} color={color} />
          </div>
        ))}
      </div>

      {/* Per-question breakdown */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#333', margin: '0 0 14px' }}>
        Question-by-Question Review
      </h2>
      <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px' }}>
        Expand each question to see key teaching points and ACOG references.
      </p>

      {questions.map((q, i) => (
        <QuestionRow
          key={i}
          index={i}
          question={q}
          result={results[i] || {
            correctness: 1,
            completeness: 1,
            feedback: '',
            teaching_points: [],
            acog_references: [],
          }}
        />
      ))}

      {/* Restart button */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={onRestart}
          style={{
            padding: '12px 32px',
            background: '#1a3a6e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Start New Session
        </button>
      </div>
    </div>
  );
}
