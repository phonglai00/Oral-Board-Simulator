/**
 * graderV2.js — src/services/graderV2.js
 *
 * HTTP layer for Grader v2.
 * Intentionally isolated from production anthropic.js — shares NO code with the
 * current Correctness/Completeness grader so that prompt changes are independent.
 *
 * Developer testing infrastructure only.
 * This service is never called unless graderV2Testing === 'true' in localStorage.
 */

import {
  buildV2ScoringPrompt,
  parseV2ScoringResponse,
} from '../utils/graderV2Prompt'

const API_URL = 'https://api.anthropic.com/v1/messages'

function v2Headers() {
  return {
    'Content-Type':                              'application/json',
    'anthropic-version':                         '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
    'x-api-key':                                 import.meta.env.VITE_ANTHROPIC_API_KEY,
  }
}

/**
 * Run the v2 grader against a single question/answer pair.
 *
 * @param {object} params
 * @param {string} params.vignette         — clinical scenario text for this question
 * @param {string} params.question         — examiner question text
 * @param {string} params.candidateAnswer  — candidate's answer
 * @param {string} params.idealAnswer      — reference answer from case data
 * @param {'standard'|'advanced'} [params.difficulty]
 * @returns {Promise<V2ScoringResult>}
 */
export async function scoreAnswerV2({
  vignette,
  question,
  candidateAnswer,
  idealAnswer,
  difficulty = 'standard',
}) {
  const { system, user } = buildV2ScoringPrompt({
    vignette,
    question,
    candidateAnswer,
    idealAnswer,
    difficulty,
  })

  const body = {
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    system,
    messages:   [{ role: 'user', content: user }],
  }

  const res = await fetch(API_URL, {
    method:  'POST',
    headers: v2Headers(),
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `GraderV2 API error ${res.status}`)
  }

  const data = await res.json()
  return parseV2ScoringResponse(data.content[0].text)
}
