import { buildScoringPrompt, parseScoringResponse } from '../utils/scoringPrompt'

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
