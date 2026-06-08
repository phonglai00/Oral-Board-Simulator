/**
 * graderV2Log.js — src/utils/graderV2Log.js
 *
 * localStorage-based comparison log for Grader v2 testing.
 *
 * Stores up to MAX_ENTRIES entries. Oldest entries are dropped when the limit is reached.
 * Provides JSON export (downloads as graderV2ComparisonLog_<date>.json).
 *
 * Developer testing infrastructure only.
 */

const LOG_KEY    = 'graderV2ComparisonLog'
const MAX_ENTRIES = 500

/**
 * Append one comparison entry to the log.
 *
 * @param {object} params
 * @param {string|number} params.questionId
 * @param {string}        params.candidateAnswer
 * @param {object}        params.currentResult    — production grader result
 * @param {object}        params.v2Result         — grader v2 result
 */
export function logV2Comparison({ questionId, candidateAnswer, currentResult, v2Result }) {
  const entry = {
    timestamp:       new Date().toISOString(),
    questionId,
    candidateAnswer,
    currentResult: {
      correctness:   currentResult.correctness,
      completeness:  currentResult.completeness,
      pushbackMode:  currentResult.pushbackMode,
      isDangerous:   currentResult.isDangerous,
      isCurveball:   currentResult.isCurveball,
      feedback:      currentResult.feedback,
    },
    v2Result: {
      safety_score:        v2Result.safety_score,
      diagnostic_score:    v2Result.diagnostic_score,
      management_score:    v2Result.management_score,
      focus_score:         v2Result.focus_score,
      terminology_score:   v2Result.terminology_score,
      communication_score: v2Result.communication_score,
      recovery_score:      v2Result.recovery_score,
      pass_probability:    v2Result.pass_probability,
      abog_score:          v2Result.abog_score,
      abog_label:          v2Result.abog_label,
      isDangerous:         v2Result.isDangerous,
      dangerousReason:     v2Result.dangerousReason,
      isCurveball:         v2Result.isCurveball,
      curveballReason:     v2Result.curveballReason,
      strengths:           v2Result.strengths,
      gaps:                v2Result.gaps,
    },
  }

  try {
    const existing = JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
    const updated  = [...existing, entry].slice(-MAX_ENTRIES)
    localStorage.setItem(LOG_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('[GraderV2Log] Failed to write entry:', e)
  }
}

/** Return all stored log entries (newest last). */
export function getV2Log() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
  } catch {
    return []
  }
}

/** Clear the log. */
export function clearV2Log() {
  localStorage.removeItem(LOG_KEY)
}

/** Download the full log as graderV2ComparisonLog_<YYYY-MM-DD>.json */
export function exportV2Log() {
  const log  = getV2Log()
  const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `graderV2ComparisonLog_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
