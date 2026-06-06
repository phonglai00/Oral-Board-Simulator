/**
 * scoringPrompt.js — src/utils/scoringPrompt.js
 *
 * Builds the dual-score ABOG examiner prompt and parses the response.
 * Fields returned by the AI:
 *   correctness, completeness (1-5)
 *   correctness_rationale, completeness_rationale
 *   feedback          — shown on scorecard only
 *   probe             — "Is there anything else?" trigger (scores 2-3)
 *   pushback          — skeptical challenge if student said something unusual
 *   isDangerous       — true if answer contains unsafe clinical practice
 *   dangerousReason   — explanation of what was dangerous
 *   isCurveball       — true if student walked into a common board exam trap
 *   teaching_points   — shown on scorecard only
 *   acog_references   — shown on scorecard only
 */

/**
 * @param {string} question
 * @param {string} userAnswer
 * @param {string} caseContext
 * @param {string} [caseId]
 * @param {'standard'|'advanced'} [difficulty]
 * @returns {{ system: string, user: string }}
 */
export function buildScoringPrompt(question, userAnswer, caseContext, caseId = '', difficulty = 'standard') {
  const system = `You are an expert ABOG oral board examiner scoring a physician candidate's response.
Score with the precision of a chief examiner preparing a candidate for oral boards.

You must return a JSON object — no prose, no markdown fences, raw JSON only.

JSON shape:
{
  "correctness": <integer 1-5>,
  "completeness": <integer 1-5>,
  "correctness_rationale": "<1-2 sentences explaining the correctness score>",
  "completeness_rationale": "<1-2 sentences explaining the completeness score>",
  "feedback": "<2-3 sentence examiner feedback — constructive, direct, clinical tone — for scorecard only>",
  "probe": "<'Is there anything else you would add?' — include this exact phrase if either score is 2 or 3, otherwise empty string>",
  "pushback": "<short skeptical-but-neutral examiner challenge spoken aloud if the candidate said something clinically unusual or questionable — e.g. 'You mentioned fundal pressure — can you tell me more about that?' or 'Are you sure that\\'s the approach you\\'d take?' — empty string if nothing unusual was said>",
  "isDangerous": <true if the answer contains something an ABOG examiner would consider unsafe or dangerous clinical practice, otherwise false>,
  "dangerousReason": "<one sentence explaining what was dangerous — empty string if isDangerous is false>",
  "isCurveball": <true if the candidate walked into a common board exam trap — technically not wrong but likely to attract an examiner challenge or lose points in context, otherwise false>,
  "curveballNote": "<one sentence describing the trap for the scorecard — empty string if isCurveball is false>",
  "teaching_points": [
    "<concise board-high-yield teaching point #1>",
    "<concise board-high-yield teaching point #2>",
    "<concise board-high-yield teaching point #3>"
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

PUSHBACK rules:
  - Only generate a pushback if the candidate stated something clinically atypical, questionable, or worth challenging.
  - Keep it short (one sentence), neutral in tone, and phrased as a natural examiner interjection.
  - Do NOT generate pushback for merely incomplete answers — only for unusual or questionable statements.
  - Empty string if nothing warrants a challenge.

DANGEROUS rules:
  - Set isDangerous: true only for answers that endorse clearly unsafe practice (wrong drug, wrong dose, harmful omission, contraindicated action).
  - dangerousReason must name the specific unsafe element.

CURVEBALL rules:
  - Set isCurveball: true when the candidate gave an answer that is a well-known board exam trap — e.g. ordering a test that seems logical but is not the standard of care, citing an outdated threshold, or stating a management step that is technically defensible but not what ABOG examiners want to hear.
  - curveballNote should briefly explain what the trap is and what the examiner expects instead.

Case difficulty: ${difficulty}
${difficulty === 'advanced' ? 'This is an advanced case. Be more exacting in scoring and more likely to find curveballs.' : 'This is a standard case.'}

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
 * Parse raw Claude response into a structured ScoringResult.
 * @param {string} rawResponse
 * @returns {ScoringResult}
 */
export function parseScoringResponse(rawResponse) {
  const fallback = {
    correctness: 1,
    completeness: 1,
    correctness_rationale: 'Unable to parse score.',
    completeness_rationale: 'Unable to parse score.',
    feedback: 'There was an issue scoring this response. Please try again.',
    probe: '',
    pushback: '',
    isDangerous: false,
    dangerousReason: '',
    isCurveball: false,
    curveballNote: '',
    teaching_points: [],
    acog_references: [],
  };

  try {
    const cleaned = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      correctness:             clamp(parseInt(parsed.correctness, 10), 1, 5),
      completeness:            clamp(parseInt(parsed.completeness, 10), 1, 5),
      correctness_rationale:   parsed.correctness_rationale  || '',
      completeness_rationale:  parsed.completeness_rationale || '',
      feedback:                parsed.feedback               || '',
      probe:                   parsed.probe                  || '',
      pushback:                parsed.pushback               || '',
      isDangerous:             parsed.isDangerous === true,
      dangerousReason:         parsed.dangerousReason        || '',
      isCurveball:             parsed.isCurveball === true,
      curveballNote:           parsed.curveballNote          || '',
      teaching_points:         Array.isArray(parsed.teaching_points)  ? parsed.teaching_points  : [],
      acog_references:         Array.isArray(parsed.acog_references)  ? parsed.acog_references  : [],
    };
  } catch (e) {
    console.error('Failed to parse scoring response:', e, rawResponse);
    return fallback;
  }
}

/** High scores — examiner interrupts and immediately advances. */
export function isStrongAnswer(result) {
  return result.correctness >= 4 && result.completeness >= 4;
}

/** Probe threshold — scores in the 2–3 range on either dimension. */
export function shouldShowProbe(result) {
  return (result.correctness <= 3 || result.completeness <= 3) &&
         !isStrongAnswer(result) &&
         result.probe.length > 0;
}

/**
 * Compute session-level summary stats.
 * @param {ScoringResult[]} results
 */
export function computeSessionStats(results) {
  if (!results.length) return { avgCorrectness: 0, avgCompleteness: 0, overallAvg: 0, totalQuestions: 0 };

  const avgCorrectness  = results.reduce((s, r) => s + r.correctness,  0) / results.length;
  const avgCompleteness = results.reduce((s, r) => s + r.completeness, 0) / results.length;
  const overallAvg      = (avgCorrectness + avgCompleteness) / 2;

  return {
    avgCorrectness:  Math.round(avgCorrectness  * 10) / 10,
    avgCompleteness: Math.round(avgCompleteness * 10) / 10,
    overallAvg:      Math.round(overallAvg      * 10) / 10,
    totalQuestions:  results.length,
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────
function clamp(val, min, max) {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}
