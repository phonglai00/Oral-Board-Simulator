/**
 * ValidationHarness_v1.js — validation/ValidationHarness_v1.js
 *
 * Phase 7 Grader v2 Validation Infrastructure
 *
 * Scores all 35 archetypes in EvaluationDataset_v1.json against the live Anthropic API
 * using the frozen Grader v2 prompt specification (graderV2Prompt.js v1.0.0).
 * Writes ValidationReport_v1.json and ValidationSummary.md on completion.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node validation/ValidationHarness_v1.js
 *
 * Requirements:
 *   - Node.js 18+ (native fetch)
 *   - ANTHROPIC_API_KEY environment variable
 *   - Run from project root (obgyn-boards/)
 *
 * This script is developer-only infrastructure. It never runs automatically
 * and does not modify any production source files.
 */

import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join }    from 'path'

import {
  buildV2ScoringPrompt,
  parseV2ScoringResponse,
  GRADER_V2_VERSION,
  GRADER_V2_FROZEN_DATE,
} from '../src/utils/graderV2Prompt.js'

// ── Path resolution ────────────────────────────────────────────────────────────
const __dirname  = dirname(fileURLToPath(import.meta.url))
const DATASET_PATH = join(__dirname, 'EvaluationDataset_v1.json')
const REPORT_PATH  = join(__dirname, 'ValidationReport_v1.json')
const SUMMARY_PATH = join(__dirname, 'ValidationSummary.md')

// ── API constants ──────────────────────────────────────────────────────────────
const API_URL  = 'https://api.anthropic.com/v1/messages'
const MODEL    = 'claude-haiku-4-5-20251001'
const CALL_DELAY_MS  = 400   // conservative delay between API calls
const RETRY_DELAY_MS = 2500  // base retry delay for 429 / 5xx

// ── Preflight ─────────────────────────────────────────────────────────────────
const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('[ValidationHarness] ERROR: ANTHROPIC_API_KEY is not set.')
  console.error('  Usage: ANTHROPIC_API_KEY=sk-... node validation/ValidationHarness_v1.js')
  process.exit(1)
}

// ── Load dataset ───────────────────────────────────────────────────────────────
let dataset
try {
  dataset = JSON.parse(await readFile(DATASET_PATH, 'utf8'))
} catch (err) {
  console.error(`[ValidationHarness] ERROR: Could not read dataset — ${err.message}`)
  process.exit(1)
}

const totalArchetypes = dataset.questions.reduce((n, q) => n + q.archetypes.length, 0)

console.log('═══════════════════════════════════════════════════════')
console.log('  ABOG Grader v2 — Validation Harness v1')
console.log('═══════════════════════════════════════════════════════')
console.log(`  Dataset:       v${dataset.version} (frozen ${dataset.frozen})`)
console.log(`  Grader spec:   v${GRADER_V2_VERSION} (frozen ${GRADER_V2_FROZEN_DATE})`)
console.log(`  Scoring model: ${MODEL}`)
console.log(`  Questions:     ${dataset.questions.length}`)
console.log(`  Archetypes:    ${totalArchetypes}`)
console.log(`  Tolerance:     ±${dataset.score_tolerance} per dimension | ±${dataset.probability_tolerance}% probability`)
console.log('═══════════════════════════════════════════════════════\n')

// ── Score comparison constants (must precede top-level await in scoring loop) ──
const DIMENSIONS = [
  'safety_score',
  'diagnostic_score',
  'management_score',
  'focus_score',
  'terminology_score',
  'communication_score',
  'recovery_score',
]

const ABOG_RANK = { 'Fail': 0, 'Borderline': 1, 'Pass': 2 }

// ── Main scoring loop ──────────────────────────────────────────────────────────
const allResults = []
let passedCount  = 0
let totalCount   = 0
let callNumber   = 0

for (const question of dataset.questions) {
  console.log(`\n[${question.id}] ${question.topic} (${question.source_case} Q${question.source_question_number})`)

  for (const archetype of question.archetypes) {
    callNumber++
    const tag = `  [${String(callNumber).padStart(2)}/${totalArchetypes}] ${archetype.id} — ${archetype.label}`
    process.stdout.write(`${tag.padEnd(52)}`)

    let actual     = null
    let comparison = null
    let errorMsg   = null

    try {
      const { system, user } = buildV2ScoringPrompt({
        vignette:        question.vignette,
        question:        question.question,
        candidateAnswer: archetype.candidate_answer,
        idealAnswer:     question.ideal_answer,
        difficulty:      question.difficulty,
      })

      const rawResponse = await callApi({ system, user })
      actual     = parseV2ScoringResponse(rawResponse)
      comparison = compareArchetype(actual, archetype.expected, dataset.score_tolerance, dataset.probability_tolerance)

      if (comparison.overall_pass) {
        passedCount++
        process.stdout.write('✓ PASS\n')
      } else {
        const failures = buildFailureTag(comparison)
        process.stdout.write(`✗ FAIL [${failures}]\n`)
      }
    } catch (err) {
      errorMsg = err.message
      process.stdout.write(`✗ ERROR: ${err.message}\n`)
    }

    allResults.push({
      question_id:     question.id,
      question_topic:  question.topic,
      archetype_id:    archetype.id,
      archetype_label: archetype.label,
      actual,
      expected:        archetype.expected,
      comparison,
      error:           errorMsg,
    })

    totalCount++

    if (callNumber < totalArchetypes) await delay(CALL_DELAY_MS)
  }
}

// ── Generate and write outputs ─────────────────────────────────────────────────
const report = buildReport(dataset, allResults, passedCount, totalCount)
await writeFile(REPORT_PATH, JSON.stringify(report, null, 2))

const summary = buildSummaryMarkdown(report)
await writeFile(SUMMARY_PATH, summary)

const passRate = Math.round((passedCount / totalCount) * 100)
console.log('\n═══════════════════════════════════════════════════════')
console.log(`  Result: ${passedCount}/${totalCount} archetypes passed (${passRate}%)`)
console.log(`  Report:  ${REPORT_PATH}`)
console.log(`  Summary: ${SUMMARY_PATH}`)
console.log('═══════════════════════════════════════════════════════\n')

// ── API call with retry ────────────────────────────────────────────────────────
async function callApi({ system, user }, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(API_URL, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key':         API_KEY,
      },
      body: JSON.stringify({
        model:     MODEL,
        max_tokens: 1200,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data.content[0].text
    }

    // Retryable errors
    if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
      const waitMs = RETRY_DELAY_MS * (attempt + 1)
      process.stdout.write(`\n    [retry ${attempt + 1}/${maxRetries} after ${waitMs}ms — HTTP ${res.status}] `)
      await delay(waitMs)
      continue
    }

    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody?.error?.message || `API error HTTP ${res.status}`)
  }
}

// ── Score comparison ───────────────────────────────────────────────────────────
function compareArchetype(actual, expected, scoreTol, probTol) {
  const dimensions = {}
  let allDimsPass = true

  for (const dim of DIMENSIONS) {
    const act  = actual[dim]
    const exp  = expected[dim]
    const pass = Math.abs(act - exp) <= scoreTol
    dimensions[dim] = { actual: act, expected: exp, delta: act - exp, pass }
    if (!pass) allDimsPass = false
  }

  const probDelta   = actual.pass_probability - expected.pass_probability
  const probPass    = Math.abs(probDelta) <= probTol
  const dangerPass  = actual.isDangerous === expected.isDangerous
  const curvePass   = actual.isCurveball === expected.isCurveball

  const actualRank   = ABOG_RANK[actual.abog_label]  ?? -1
  const expectedRank = ABOG_RANK[expected.abog_label] ?? -1
  const abogPass     = Math.abs(actualRank - expectedRank) <= 1

  const overallPass = allDimsPass && probPass && dangerPass && curvePass && abogPass

  return {
    dimensions,
    pass_probability: {
      actual:   actual.pass_probability,
      expected: expected.pass_probability,
      delta:    probDelta,
      pass:     probPass,
    },
    isDangerous: {
      actual:   actual.isDangerous,
      expected: expected.isDangerous,
      pass:     dangerPass,
    },
    isCurveball: {
      actual:   actual.isCurveball,
      expected: expected.isCurveball,
      pass:     curvePass,
    },
    abog_label: {
      actual:   actual.abog_label,
      expected: expected.abog_label,
      pass:     abogPass,
    },
    all_dims_pass: allDimsPass,
    overall_pass:  overallPass,
  }
}

function buildFailureTag(comparison) {
  const parts = []
  if (!comparison.all_dims_pass) {
    const failed = DIMENSIONS.filter(d => !comparison.dimensions[d].pass)
      .map(d => d.replace('_score', '').slice(0, 4))
    parts.push(`dims:${failed.join(',')}`)
  }
  if (!comparison.pass_probability.pass) parts.push(`prob:${comparison.pass_probability.delta > 0 ? '+' : ''}${comparison.pass_probability.delta}`)
  if (!comparison.isDangerous.pass)  parts.push(`danger:got ${comparison.isDangerous.actual}`)
  if (!comparison.isCurveball.pass)  parts.push(`curve:got ${comparison.isCurveball.actual}`)
  if (!comparison.abog_label.pass)   parts.push(`abog:got ${comparison.abog_label.actual}`)
  return parts.join(' | ')
}

// ── Report builder ─────────────────────────────────────────────────────────────
function buildReport(ds, results, passed, total) {
  const scored = results.filter(r => r.comparison !== null)

  // Per-dimension accuracy
  const dimensionAccuracy = {}
  for (const dim of DIMENSIONS) {
    const dimPassed = scored.filter(r => r.comparison.dimensions[dim].pass).length
    dimensionAccuracy[dim] = {
      passed:    dimPassed,
      total:     scored.length,
      pass_rate: scored.length ? Math.round((dimPassed / scored.length) * 100) : null,
    }
  }

  // Flag accuracy
  const dangerPassed   = scored.filter(r => r.comparison.isDangerous.pass).length
  const curveballPassed = scored.filter(r => r.comparison.isCurveball.pass).length

  // Per-question summary
  const byQuestion = {}
  for (const q of ds.questions) {
    const qResults = results.filter(r => r.question_id === q.id)
    const qPassed  = qResults.filter(r => r.comparison?.overall_pass).length
    byQuestion[q.id] = {
      topic:     q.topic,
      passed:    qPassed,
      total:     qResults.length,
      pass_rate: Math.round((qPassed / qResults.length) * 100),
    }
  }

  return {
    version:            '1.0.0',
    status:             'complete',
    run_timestamp:      new Date().toISOString(),
    dataset_version:    ds.version,
    grader_spec_version: GRADER_V2_VERSION,
    grader_spec_frozen:  GRADER_V2_FROZEN_DATE,
    scoring_model:      MODEL,
    score_tolerance:    ds.score_tolerance,
    probability_tolerance: ds.probability_tolerance,
    summary: {
      total,
      passed,
      failed:    total - passed,
      pass_rate: Math.round((passed / total) * 100),
    },
    dimension_accuracy: dimensionAccuracy,
    flag_accuracy: {
      isDangerous: {
        passed:    dangerPassed,
        total:     scored.length,
        pass_rate: scored.length ? Math.round((dangerPassed / scored.length) * 100) : null,
      },
      isCurveball: {
        passed:    curveballPassed,
        total:     scored.length,
        pass_rate: scored.length ? Math.round((curveballPassed / scored.length) * 100) : null,
      },
    },
    by_question: byQuestion,
    results,
  }
}

// ── Summary markdown builder ───────────────────────────────────────────────────
function buildSummaryMarkdown(report) {
  const { summary, dimension_accuracy, flag_accuracy, by_question } = report

  const verdict =
    summary.pass_rate >= 80 ? '**PASS** — grader calibration is within tolerance across all archetypes.'
    : summary.pass_rate >= 60 ? '**WARN** — grader calibration has notable gaps; review failing archetypes.'
    : '**FAIL** — grader calibration is outside acceptable range; prompt revision required.'

  const dimLabel = {
    safety_score:        'Safety',
    diagnostic_score:    'Diagnostic',
    management_score:    'Management',
    focus_score:         'Focus',
    terminology_score:   'Terminology',
    communication_score: 'Communication',
    recovery_score:      'Recovery',
  }

  const dimRows = DIMENSIONS.map(dim => {
    const s = dimension_accuracy[dim]
    const bar = s.pass_rate !== null ? `${s.pass_rate}%` : 'n/a'
    return `| ${dimLabel[dim].padEnd(14)} | ${String(s.passed).padStart(2)} / ${String(s.total).padEnd(2)} | ${bar.padStart(6)} |`
  }).join('\n')

  const qRows = Object.entries(by_question).map(([id, q]) =>
    `| ${id} | ${q.topic} | ${q.passed} / ${q.total} | ${q.pass_rate}% |`
  ).join('\n')

  const resultRows = report.results.map(r => {
    if (!r.comparison) {
      return `| ${r.question_id} | ${r.archetype_id} | ${r.archetype_label.padEnd(18)} | ERROR | — | — | — | — | ✗ |`
    }
    const c     = r.comparison
    const dims  = c.all_dims_pass ? 'PASS' : `FAIL`
    const prob  = c.pass_probability.pass ? 'PASS' : `${c.pass_probability.actual}≠${c.pass_probability.expected}`
    const dng   = c.isDangerous.pass ? 'PASS' : `got ${c.isDangerous.actual}`
    const crv   = c.isCurveball.pass ? 'PASS' : `got ${c.isCurveball.actual}`
    const abog  = c.abog_label.pass ? 'PASS' : `${c.abog_label.actual}≠${c.abog_label.expected}`
    const mark  = c.overall_pass ? '✓' : '✗'
    return `| ${r.question_id} | ${r.archetype_id} | ${r.archetype_label.padEnd(18)} | ${dims.padEnd(4)} | ${prob.padEnd(10)} | ${dng.padEnd(10)} | ${crv.padEnd(10)} | ${abog.padEnd(14)} | ${mark} |`
  }).join('\n')

  return `# Grader v2 Validation Summary — Phase 7

**Run:** ${report.run_timestamp}
**Dataset:** v${report.dataset_version}
**Grader spec:** v${report.grader_spec_version} (frozen ${report.grader_spec_frozen})
**Scoring model:** ${report.scoring_model}
**Score tolerance:** ±${report.score_tolerance} per dimension
**Probability tolerance:** ±${report.probability_tolerance}%

---

## Overall Result

| Metric | Value |
|--------|-------|
| Archetypes tested | ${summary.total} |
| Passed | ${summary.passed} |
| Failed | ${summary.failed} |
| Pass rate | ${summary.pass_rate}% |
| Verdict | ${verdict} |

---

## Per-Question Summary

| Question | Topic | Passed | Pass Rate |
|----------|-------|--------|-----------|
${qRows}

---

## Dimension Accuracy

| Dimension | Passed | Pass Rate |
|-----------|--------|-----------|
${dimRows}

---

## Flag Detection Accuracy

| Flag | Passed | Pass Rate |
|------|--------|-----------|
| isDangerous | ${flag_accuracy.isDangerous.passed} / ${flag_accuracy.isDangerous.total} | ${flag_accuracy.isDangerous.pass_rate ?? 'n/a'}% |
| isCurveball | ${flag_accuracy.isCurveball.passed} / ${flag_accuracy.isCurveball.total} | ${flag_accuracy.isCurveball.pass_rate ?? 'n/a'}% |

---

## Per-Archetype Results

| Question | Arch | Label              | Dims | Prob       | Dangerous  | Curveball  | ABOG           | Pass |
|----------|------|--------------------|------|------------|------------|------------|----------------|------|
${resultRows}

---

*Generated by ValidationHarness_v1.js*
*Phase 7 Validation Infrastructure — Evaluation Dataset v${report.dataset_version}*
`
}

// ── Utility ───────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
