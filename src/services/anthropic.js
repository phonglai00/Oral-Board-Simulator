const API_URL = 'https://api.anthropic.com/v1/messages'

function headers() {
  return {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
    'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
  }
}

async function callAPI(messages, maxTokens = 600) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages,
    }),
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

export async function scoreAnswer({ question, idealAnswer, candidateAnswer, points }) {
  const prompt = `You are scoring an ABOG (American Board of OB/GYN) oral board exam answer.

QUESTION (worth ${points} point${points > 1 ? 's' : ''}):
${question}

IDEAL ANSWER:
${idealAnswer}

CANDIDATE'S ANSWER:
${candidateAnswer}

Score the candidate on a 1–3 scale:
- 3 = Pass: Covers all or most essential points correctly
- 2 = Borderline: Covers some key points but misses important ones
- 1 = Fail: Misses most key points or is significantly incorrect

Also write a short neutral examiner response exactly as a real ABOG oral board examiner would say — no feedback, no encouragement, no hints. Use only phrases like: "Thank you.", "Okay.", "I see.", "Alright.", or "Is there anything else you would like to add?"

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "score": <1, 2, or 3>,
  "pointsCovered": ["point covered by candidate"],
  "pointsMissed": ["important point the candidate missed"],
  "examinerResponse": "<neutral phrase>"
}`

  const text = await callAPI([{ role: 'user', content: prompt }])
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Unexpected response format from AI')
  return JSON.parse(match[0])
}
