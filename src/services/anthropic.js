import {
  buildScoringPrompt, parseScoringResponse,
  buildFastScoringPrompt, parseFastScoringResponse,
  buildEnrichmentPrompt, parseEnrichmentResponse,
} from '../utils/scoringPrompt'

const API_URL = 'https://api.anthropic.com/v1/messages'

function headers() {
  return {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
    'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
  }
}

async function callAPI(messages, maxTokens = 800, system = null) {
  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages,
  }
  if (system) body.system = system

  const callLabel = maxTokens <= 400 ? 'fast' : maxTokens <= 700 ? 'enrich' : 'full'
  const t_anthropic_start = performance.now()
  console.log('[LATENCY]', { event: 'anthropic_start', label: callLabel, timestamp: Date.now() })

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  console.log('[LATENCY]', { event: 'anthropic_total', ms: Math.round(performance.now() - t_anthropic_start), label: callLabel, timestamp: Date.now() })
  return data.content[0].text
}

export async function testConnection() {
  return callAPI([{ role: 'user', content: 'Reply with exactly: API connection successful' }], 30)
}

export async function scoreAnswer({
  question,
  idealAnswer,
  candidateAnswer,
  caseContext,
  caseId,
  difficulty,
  isFollowUp  = false,
  priorAnswer = '',
}) {
  const { system, user } = buildScoringPrompt(
    question,
    candidateAnswer,
    caseContext || idealAnswer,
    caseId      || '',
    difficulty  || 'standard',
    isFollowUp,
    priorAnswer,
  )
  const raw = await callAPI([{ role: 'user', content: user }], 900, system)
  return parseScoringResponse(raw)
}

export async function scoreAnswerFast({
  question,
  idealAnswer,
  candidateAnswer,
  caseContext,
  caseId,
  difficulty,
  isFollowUp           = false,
  priorAnswer          = '',
  followUpDepth        = 0,
  priorTargetedElement = '',
}) {
  const { system, user } = buildFastScoringPrompt(
    question,
    candidateAnswer,
    caseContext || idealAnswer,
    caseId      || '',
    difficulty  || 'standard',
    isFollowUp,
    priorAnswer,
    followUpDepth,
    priorTargetedElement,
  )
  const raw = await callAPI([{ role: 'user', content: user }], 400, system)
  return parseFastScoringResponse(raw)
}

export async function scoreAnswerEnrich({
  question,
  candidateAnswer,
  caseContext,
  caseId,
  difficulty,
  fastResult,
}) {
  const { system, user } = buildEnrichmentPrompt(
    question,
    candidateAnswer,
    caseContext || '',
    caseId      || '',
    difficulty  || 'standard',
    fastResult,
  )
  const raw = await callAPI([{ role: 'user', content: user }], 700, system)
  return parseEnrichmentResponse(raw)
}
