/**
 * scoringPrompt.js
 * Drop this file into: src/utils/scoringPrompt.js
 *
 * Replaces your existing single-score prompt with dual scoring:
 *   - Correctness (1–5): factual accuracy
 *   - Completeness (1–5): how thorough the answer is
 *
 * Also generates Key Teaching Points + ACOG references per question,
 * returned in the response but only displayed at end-of-session.
 *
 * Usage:
 *   import { buildScoringPrompt, parseScoringResponse } from './utils/scoringPrompt';
 *
 *   const prompt = buildScoringPrompt(question, userAnswer, caseContext);
 *   const raw = await callAnthropicAPI(prompt);   // your existing API call
 *   const result = parseScoringResponse(raw);
 *   // result = { correctness, completeness, feedback, probe, teachingPoints, acogRefs }
 */

/**
 * Build the scoring prompt to send to Claude.
 *
 * @param {string} question       - The board question asked
 * @param {string} userAnswer     - The candidate's spoken/typed answer
 * @param {string} caseContext    - Brief case summary (e.g. "32yo G2P1 at 36wks with BP 158/102")
 * @param {string} [caseId]       - Optional case identifier for reference (e.g. "Case D")
 * @returns {string}              - System + user prompt string (or split as needed)
 */
export function buildScoringPrompt(question, userAnswer, caseContext, caseId = '') {
  const system = `You are an expert ABOG oral board examiner scoring a physician candidate's response.
Score with the precision of a chief examiner preparing a candidate for oral boards.

You must return a JSON object — no prose, no markdown fences, raw JSON only.

JSON shape:
{
  "correctness": <integer 1-5>,
  "completeness": <integer 1-5>,
  "correctness_rationale": "<1-2 sentences explaining the correctness score>",
  "completeness_rationale": "<1-2 sentences explaining the completeness score>",
  "feedback": "<2-3 sentence examiner feedback to read aloud — constructive, direct, clinical tone>",
  "probe": "<follow-up probe question to ask if either score ≤ 2, otherwise empty string>",
  "teaching_points": [
    "<concise clinical teaching point #1>",
    "<concise clinical teaching point #2>",
    "<concise clinical teaching point #3>"
  ],
  "acog_references": [
    {
      "bulletin": "<e.g. Practice Bulletin 203>",
      "title": "<e.g. Chronic Hypertension in Pregnancy>",
      "relevance": "<one sentence on why this reference applies>"
    }
  ]
}

Scoring rubrics:

CORRECTNESS (factual accuracy):
  5 = Completely correct, no factual errors
  4 = Mostly correct, minor omission or imprecision
  3 = Partially correct, some key facts right but notable errors
  2 = Mostly incorrect, only tangential facts correct
  1 = Incorrect or dangerous answer

COMPLETENESS (thoroughness):
  5 = Covers all expected components an ABOG examiner would want
  4 = Covers most components, missing 1 minor element
  3 = Covers core management but missing 1-2 important components
  2 = Superficial — missing major components
  1 = Incomplete to a dangerous degree

Teaching points should be board-high-yield, 1 sentence each.
ACOG references: cite specific Practice Bulletins or Committee Opinions when applicable.
If no specific ACOG reference applies, return an empty array.`;

  const user = `Case context: ${caseContext}${caseId ? ` (${caseId})` : ''}

Question asked: ${question}

Candidate's answer: ${userAnswer}

Score this response and return the JSON object.`;

  return { system, user };
}

/**
 * Parse the raw text response from Claude into a structured scoring result.
 *
 * @param {string} rawResponse  - Raw text from Claude API
 * @returns {ScoringResult}
 *
 * @typedef {Object} ScoringResult
 * @property {number} correctness           - 1–5
 * @property {number} completeness          - 1–5
 * @property {string} correctness_rationale
 * @property {string} completeness_rationale
 * @property {string} feedback              - Text to read aloud / display
 * @property {string} probe                 - Follow-up probe (empty string if scores > 2)
 * @property {string[]} teaching_points     - Array of teaching point strings
 * @property {AcogRef[]} acog_references    - Array of ACOG reference objects
 *
 * @typedef {Object} AcogRef
 * @property {string} bulletin
 * @property {string} title
 * @property {string} relevance
 */
export function parseScoringResponse(rawResponse) {
  const fallback = {
    correctness: 1,
    completeness: 1,
    correctness_rationale: 'Unable to parse score.',
    completeness_rationale: 'Unable to parse score.',
    feedback: 'There was an issue scoring this response. Please try again.',
    probe: '',
    teaching_points: [],
    acog_references: [],
  };

  try {
    // Strip markdown fences if Claude adds them despite instructions
    const cleaned = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      correctness: clamp(parseInt(parsed.correctness, 10), 1, 5),
      completeness: clamp(parseInt(parsed.completeness, 10), 1, 5),
      correctness_rationale: parsed.correctness_rationale || '',
      completeness_rationale: parsed.completeness_rationale || '',
      feedback: parsed.feedback || '',
      probe: parsed.probe || '',
      teaching_points: Array.isArray(parsed.teaching_points) ? parsed.teaching_points : [],
      acog_references: Array.isArray(parsed.acog_references) ? parsed.acog_references : [],
    };
  } catch (e) {
    console.error('Failed to parse scoring response:', e, rawResponse);
    return fallback;
  }
}

/**
 * Determine whether a follow-up probe should be shown.
 * Fires if correctness ≤ 2 OR completeness ≤ 2 and a probe string exists.
 */
export function shouldShowProbe(result) {
  return (result.correctness <= 2 || result.completeness <= 2) && result.probe.length > 0;
}

/**
 * Compute session-level summary stats from an array of ScoringResult objects.
 *
 * @param {ScoringResult[]} results
 * @returns {{ avgCorrectness: number, avgCompleteness: number, overallAvg: number, totalQuestions: number }}
 */
export function computeSessionStats(results) {
  if (!results.length) return { avgCorrectness: 0, avgCompleteness: 0, overallAvg: 0, totalQuestions: 0 };

  const avgCorrectness = results.reduce((s, r) => s + r.correctness, 0) / results.length;
  const avgCompleteness = results.reduce((s, r) => s + r.completeness, 0) / results.length;
  const overallAvg = (avgCorrectness + avgCompleteness) / 2;

  return {
    avgCorrectness: Math.round(avgCorrectness * 10) / 10,
    avgCompleteness: Math.round(avgCompleteness * 10) / 10,
    overallAvg: Math.round(overallAvg * 10) / 10,
    totalQuestions: results.length,
  };
}

// --- helpers ---
function clamp(val, min, max) {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}
