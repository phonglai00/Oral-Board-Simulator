/**
 * scoringPrompt.js — src/utils/scoringPrompt.js
 *
 * Builds the dual-score ABOG examiner prompt and parses the response.
 *
 * AI fields returned:
 *   correctness, completeness (1-5)
 *   correctness_rationale, completeness_rationale
 *   feedback          — scorecard only
 *   probe             — "Is there anything else?" text; non-empty only when
 *                       pushbackMode === 'none' AND either score is 2–3
 *   pushbackMode      — 'none' | 'reflect' | 'consequence' | 'pivot'
 *   pushbackLine      — exact words to speak for reflect/consequence; empty for none/pivot
 *   isDangerous       — true if answer contains unsafe clinical practice
 *   dangerousReason   — scorecard only; empty when isDangerous false
 *   isCurveball       — true if student walked into a common board exam trap
 *   curveballNote     — scorecard only; empty when isCurveball false
 *   teaching_points   — scorecard only
 *   acog_references   — scorecard only
 */

/**
 * @param {string} question
 * @param {string} userAnswer
 * @param {string} caseContext
 * @param {string} [caseId]
 * @param {'standard'|'advanced'} [difficulty]
 * @param {boolean} [isFollowUp]   — true when scoring a follow-up after pushback/probe
 * @param {string}  [priorAnswer]  — the original answer, provided when isFollowUp is true
 * @returns {{ system: string, user: string }}
 */
export function buildScoringPrompt(
  question,
  userAnswer,
  caseContext,
  caseId     = '',
  difficulty = 'standard',
  isFollowUp = false,
  priorAnswer = '',
) {
  const followUpContext = isFollowUp && priorAnswer
    ? `\n\nNOTE: This is a follow-up response. The candidate's original answer was:\n"${priorAnswer}"\nThe examiner pushed back and the candidate has now responded. If the candidate is doubling down on a dangerous or clinically wrong position, set pushbackMode to "pivot". If they have corrected themselves or added important information, score accordingly.`
    : ''

  const system = `You are an expert ABOG oral board examiner scoring a physician candidate's response.
Score with the precision of a chief examiner preparing a candidate for oral boards.

You must return a JSON object — no prose, no markdown fences, raw JSON only.

JSON shape:
{
  "correctness": <integer 1-5>,
  "completeness": <integer 1-5>,
  "correctness_rationale": "<1-2 sentences explaining the correctness score>",
  "completeness_rationale": "<1-2 sentences explaining the completeness score>",
  "feedback": "<2-3 sentence examiner feedback — constructive, direct, clinical tone — for scorecard display only, never spoken during the exam>",
  "probe": "<include the exact string 'Is there anything else you would add?' ONLY when pushbackMode is 'none' AND either correctness or completeness is 2 or 3 — otherwise empty string>",
  "pushbackMode": "<one of: 'none' | 'reflect' | 'consequence' | 'pivot'>",
  "pushbackLine": "<exact words the examiner speaks for reflect or consequence modes — empty string for none and pivot>",
  "isDangerous": <true if the answer contains something an ABOG examiner would consider unsafe or dangerous clinical practice, otherwise false>,
  "dangerousReason": "<one sentence naming the specific unsafe element — for scorecard display only, never spoken during the exam — empty string if isDangerous is false>",
  "isCurveball": <true if the candidate walked into a common board exam trap — technically defensible in isolation but likely to cost points in this clinical context, otherwise false>,
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

═══ SCORING RUBRICS ═══

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

═══ PUSHBACK MODE RULES ═══

Use EXACTLY ONE of these four values for pushbackMode:

'none':
  The answer is clinically acceptable (even if incomplete). No examiner pushback needed.
  Use this when correctness ≥ 3 and completeness ≥ 3, and nothing unusual or wrong was said.
  Also use when scores are 2-3 but the answer is just incomplete, not clinically questionable.

'reflect':
  The candidate said something clinically unusual, mildly wrong, or worth challenging — but has
  not yet caused clear patient harm. The examiner calmly mirrors the statement back verbatim and
  asks for their reasoning. This gives the candidate ONE opportunity to self-correct.
  pushbackLine must:
    - Quote or paraphrase the specific thing the candidate said
    - Ask them to walk through their reasoning
    - NEVER say the answer is wrong, dangerous, or incorrect
    - NEVER correct or teach
  Example: "So to confirm, you would apply fundal pressure in this situation — walk me through your reasoning on that."
  Example: "You mentioned discharging her home — can you tell me more about what's guiding that decision?"

'consequence':
  The candidate said something that would cause clear, immediate patient harm if acted upon.
  The examiner does NOT label it as wrong or dangerous. Instead, they advance the clinical
  vignette to show the real-world outcome of that choice.
  pushbackLine must:
    - Advance the scenario as a matter of fact, not as a correction
    - Describe the consequence that follows from their action
    - Invite them to manage the new situation
    - NEVER say the answer was wrong, dangerous, or harmful
  Example: "You discharge the patient home. Six hours later she presents to the emergency room actively seizing. What do you do now?"
  Example: "You withhold the magnesium. The patient develops eclampsia. How do you manage her now?"

'pivot':
  Use ONLY in one of two situations:
  (a) The answer reveals a COMPLETE ABSENCE of core knowledge — the candidate has no framework
      for this topic at all (not just incomplete — truly no foundation).
  (b) This is a follow-up response and the candidate is DOUBLING DOWN on a dangerous or
      clinically wrong answer after already receiving reflect or consequence pushback.
  When pivot is set: score correctness = 1, completeness = 1.
  pushbackLine must be empty string — the spoken phrase is chosen by the app, not the AI.

IMPORTANT RULES FOR ALL PUSHBACK:
  - The examiner NEVER teaches, explains, corrects, or gives feedback during the exam
  - The examiner NEVER uses words like "dangerous", "wrong", "incorrect", "harmful", "unsafe"
  - The examiner NEVER tells the candidate what the right answer is
  - All educational content (feedback, dangerousReason, teaching_points) is for the scorecard only

═══ DANGEROUS ANSWER RULES ═══

isDangerous: Set to true when the candidate endorses clearly unsafe clinical practice
  (wrong drug, dangerous dose, contraindicated action, harmful omission, or management
  that would directly and foreseeably cause patient harm).

dangerousReason: Name the specific unsafe element in plain clinical language.
  This appears ONLY on the end-of-session scorecard with a warning badge.
  It is NEVER spoken during the exam.

When isDangerous is true:
  - On a first answer: set pushbackMode to 'reflect' or 'consequence' as clinically appropriate.
    Never set pushbackMode to 'pivot' on a first answer solely because it's dangerous.
  - On a follow-up answer where the candidate doubles down: set pushbackMode to 'pivot'.

═══ CURVEBALL RULES ═══

isCurveball: Set to true when the candidate gave an answer that is a well-known board exam trap —
  technically defensible in some contexts but likely to attract an examiner challenge or cost points
  in THIS clinical scenario (wrong test for this presentation, outdated threshold, management step
  that misses the higher-yield approach, etc.).

curveballNote: Briefly explain the trap and what the examiner expects instead (one sentence).
  Appears on the scorecard only.

═══ PROBE RULES ═══

probe: Include the exact string "Is there anything else you would add?" ONLY when:
  - pushbackMode is 'none' AND
  - Either correctness ≤ 3 OR completeness ≤ 3
  Otherwise: empty string.
  (Probe and pushback are mutually exclusive — pushback takes precedence.)

Case difficulty: ${difficulty}
${difficulty === 'advanced'
  ? 'This is an ADVANCED case. Be more exacting in scoring. Hold candidates to higher completeness standards. More likely to find curveballs. Score 4 only for genuinely excellent answers.'
  : 'This is a STANDARD case. Score fairly. A solid core answer with minor gaps warrants 3-4.'}
${followUpContext}

Teaching points: board-high-yield, 1 sentence each.
ACOG references: cite specific Practice Bulletins or Committee Opinions.
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
    correctness:             1,
    completeness:            1,
    correctness_rationale:   'Unable to parse score.',
    completeness_rationale:  'Unable to parse score.',
    feedback:                'There was an issue scoring this response. Please try again.',
    probe:                   '',
    pushbackMode:            'none',
    pushbackLine:            '',
    isDangerous:             false,
    dangerousReason:         '',
    isCurveball:             false,
    curveballNote:           '',
    teaching_points:         [],
    acog_references:         [],
  };

  const VALID_MODES = new Set(['none', 'reflect', 'consequence', 'pivot']);

  try {
    const cleaned = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const pushbackMode = VALID_MODES.has(parsed.pushbackMode)
      ? parsed.pushbackMode
      : 'none';

    return {
      correctness:             clamp(parseInt(parsed.correctness,  10), 1, 5),
      completeness:            clamp(parseInt(parsed.completeness, 10), 1, 5),
      correctness_rationale:   parsed.correctness_rationale   || '',
      completeness_rationale:  parsed.completeness_rationale  || '',
      feedback:                parsed.feedback                 || '',
      probe:                   parsed.probe                    || '',
      pushbackMode,
      // pushbackLine is only meaningful for reflect/consequence
      pushbackLine: (pushbackMode === 'reflect' || pushbackMode === 'consequence')
        ? (parsed.pushbackLine || '')
        : '',
      isDangerous:             parsed.isDangerous === true,
      dangerousReason:         parsed.dangerousReason          || '',
      isCurveball:             parsed.isCurveball === true,
      curveballNote:           parsed.curveballNote            || '',
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

/**
 * Whether a standard "Is there anything else?" probe should be shown.
 * Only fires when pushbackMode is 'none' AND scores are in the 2-3 range.
 */
export function shouldShowProbe(result) {
  return result.pushbackMode === 'none' &&
         (result.correctness <= 3 || result.completeness <= 3) &&
         !isStrongAnswer(result) &&
         result.probe.length > 0;
}

/**
 * Compute session-level summary stats.
 * @param {ScoringResult[]} results
 */
export function computeSessionStats(results) {
  if (!results.length) {
    return { avgCorrectness: 0, avgCompleteness: 0, overallAvg: 0, totalQuestions: 0 };
  }
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

// ── Fast / Enrichment split ───────────────────────────────────────────────────

/**
 * Fast path prompt — returns only the 9 fields needed for real-time routing.
 * All scoring rubrics and pushback/probe/danger/curveball rules are preserved verbatim.
 */
export function buildFastScoringPrompt(
  question,
  userAnswer,
  caseContext,
  caseId     = '',
  difficulty = 'standard',
  isFollowUp = false,
  priorAnswer = '',
) {
  const followUpContext = isFollowUp && priorAnswer
    ? `\n\nNOTE: This is a follow-up response. The candidate's original answer was:\n"${priorAnswer}"\nThe examiner pushed back and the candidate has now responded. If the candidate is doubling down on a dangerous or clinically wrong position, set pushbackMode to "pivot". If they have corrected themselves or added important information, score accordingly.`
    : ''

  const system = `You are an expert ABOG oral board examiner scoring a physician candidate's response.
Score with the precision of a chief examiner preparing a candidate for oral boards.

You must return a JSON object — no prose, no markdown fences, raw JSON only.

JSON shape (9 fields ONLY — do NOT generate feedback, teaching_points, or acog_references):
{
  "correctness": <integer 1-5>,
  "completeness": <integer 1-5>,
  "correctness_rationale": "<1-2 sentences explaining the correctness score>",
  "completeness_rationale": "<1-2 sentences explaining the completeness score>",
  "probe": "<include the exact string 'Is there anything else you would add?' ONLY when pushbackMode is 'none' AND either correctness or completeness is 2 or 3 — otherwise empty string>",
  "pushbackMode": "<one of: 'none' | 'reflect' | 'consequence' | 'pivot'>",
  "pushbackLine": "<exact words the examiner speaks for reflect or consequence modes — empty string for none and pivot>",
  "isDangerous": <true if the answer contains something an ABOG examiner would consider unsafe or dangerous clinical practice, otherwise false>,
  "isCurveball": <true if the candidate walked into a common board exam trap — technically defensible in isolation but likely to cost points in this clinical context, otherwise false>
}

═══ SCORING RUBRICS ═══

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

═══ PUSHBACK MODE RULES ═══

Use EXACTLY ONE of these four values for pushbackMode:

'none':
  The answer is clinically acceptable (even if incomplete). No examiner pushback needed.
  Use this when correctness ≥ 3 and completeness ≥ 3, and nothing unusual or wrong was said.
  Also use when scores are 2-3 but the answer is just incomplete, not clinically questionable.

'reflect':
  The candidate said something clinically unusual, mildly wrong, or worth challenging — but has
  not yet caused clear patient harm. The examiner calmly mirrors the statement back verbatim and
  asks for their reasoning. This gives the candidate ONE opportunity to self-correct.
  pushbackLine must:
    - Quote or paraphrase the specific thing the candidate said
    - Ask them to walk through their reasoning
    - NEVER say the answer is wrong, dangerous, or incorrect
    - NEVER correct or teach
  Example: "So to confirm, you would apply fundal pressure in this situation — walk me through your reasoning on that."
  Example: "You mentioned discharging her home — can you tell me more about what's guiding that decision?"

'consequence':
  The candidate said something that would cause clear, immediate patient harm if acted upon.
  The examiner does NOT label it as wrong or dangerous. Instead, they advance the clinical
  vignette to show the real-world outcome of that choice.
  pushbackLine must:
    - Advance the scenario as a matter of fact, not as a correction
    - Describe the consequence that follows from their action
    - Invite them to manage the new situation
    - NEVER say the answer was wrong, dangerous, or harmful
  Example: "You discharge the patient home. Six hours later she presents to the emergency room actively seizing. What do you do now?"
  Example: "You withhold the magnesium. The patient develops eclampsia. How do you manage her now?"

'pivot':
  Use ONLY in one of two situations:
  (a) The answer reveals a COMPLETE ABSENCE of core knowledge — the candidate has no framework
      for this topic at all (not just incomplete — truly no foundation).
  (b) This is a follow-up response and the candidate is DOUBLING DOWN on a dangerous or
      clinically wrong answer after already receiving reflect or consequence pushback.
  When pivot is set: score correctness = 1, completeness = 1.
  pushbackLine must be empty string — the spoken phrase is chosen by the app, not the AI.

IMPORTANT RULES FOR ALL PUSHBACK:
  - The examiner NEVER teaches, explains, corrects, or gives feedback during the exam
  - The examiner NEVER uses words like "dangerous", "wrong", "incorrect", "harmful", "unsafe"
  - The examiner NEVER tells the candidate what the right answer is
  - All educational content (feedback, dangerousReason, teaching_points) is for the scorecard only

═══ DANGEROUS ANSWER RULES ═══

isDangerous: Set to true when the candidate endorses clearly unsafe clinical practice
  (wrong drug, dangerous dose, contraindicated action, harmful omission, or management
  that would directly and foreseeably cause patient harm).

When isDangerous is true:
  - On a first answer: set pushbackMode to 'reflect' or 'consequence' as clinically appropriate.
    Never set pushbackMode to 'pivot' on a first answer solely because it's dangerous.
  - On a follow-up answer where the candidate doubles down: set pushbackMode to 'pivot'.

═══ CURVEBALL RULES ═══

isCurveball: Set to true when the candidate gave an answer that is a well-known board exam trap —
  technically defensible in some contexts but likely to attract an examiner challenge or cost points
  in THIS clinical scenario (wrong test for this presentation, outdated threshold, management step
  that misses the higher-yield approach, etc.).

═══ PROBE RULES ═══

probe: Include the exact string "Is there anything else you would add?" ONLY when:
  - pushbackMode is 'none' AND
  - Either correctness ≤ 3 OR completeness ≤ 3
  Otherwise: empty string.
  (Probe and pushback are mutually exclusive — pushback takes precedence.)

Case difficulty: ${difficulty}
${difficulty === 'advanced'
  ? 'This is an ADVANCED case. Be more exacting in scoring. Hold candidates to higher completeness standards. More likely to find curveballs. Score 4 only for genuinely excellent answers.'
  : 'This is a STANDARD case. Score fairly. A solid core answer with minor gaps warrants 3-4.'}
${followUpContext}`

  const user = `Case context: ${caseContext}${caseId ? ` (${caseId})` : ''}

Question asked: ${question}

Candidate's answer: ${userAnswer}

Score this response and return the JSON object.`

  return { system, user }
}

/**
 * Parse fast path response — 9 fields only; scorecard fields get safe fallbacks.
 */
export function parseFastScoringResponse(rawResponse) {
  const fallback = {
    correctness:             1,
    completeness:            1,
    correctness_rationale:   'Unable to parse score.',
    completeness_rationale:  'Unable to parse score.',
    probe:                   '',
    pushbackMode:            'none',
    pushbackLine:            '',
    isDangerous:             false,
    isCurveball:             false,
    // pre-populated scorecard fallbacks
    feedback:                '',
    dangerousReason:         '',
    curveballNote:           '',
    teaching_points:         [],
    acog_references:         [],
  }

  const VALID_MODES = new Set(['none', 'reflect', 'consequence', 'pivot'])

  try {
    const cleaned = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    const pushbackMode = VALID_MODES.has(parsed.pushbackMode)
      ? parsed.pushbackMode
      : 'none'

    return {
      correctness:             clamp(parseInt(parsed.correctness,  10), 1, 5),
      completeness:            clamp(parseInt(parsed.completeness, 10), 1, 5),
      correctness_rationale:   parsed.correctness_rationale  || '',
      completeness_rationale:  parsed.completeness_rationale || '',
      probe:                   parsed.probe                   || '',
      pushbackMode,
      pushbackLine: (pushbackMode === 'reflect' || pushbackMode === 'consequence')
        ? (parsed.pushbackLine || '')
        : '',
      isDangerous:             parsed.isDangerous === true,
      isCurveball:             parsed.isCurveball === true,
      // scorecard fallbacks — filled in by enrichment
      feedback:                '',
      dangerousReason:         '',
      curveballNote:           '',
      teaching_points:         [],
      acog_references:         [],
    }
  } catch (e) {
    console.error('Failed to parse fast scoring response:', e, rawResponse)
    return fallback
  }
}

/**
 * Enrichment prompt — receives fast result scores as context and asks for
 * the 5 scorecard-only fields. Does NOT re-score.
 */
export function buildEnrichmentPrompt(
  question,
  userAnswer,
  caseContext,
  caseId     = '',
  difficulty = 'standard',
  fastResult,
) {
  const system = `You are an expert ABOG oral board examiner generating scorecard feedback for a physician candidate.
The answer has already been scored. Your task is to generate ONLY the educational/display fields.

You must return a JSON object — no prose, no markdown fences, raw JSON only.

Scores already determined:
  correctness: ${fastResult.correctness}
  completeness: ${fastResult.completeness}
  isDangerous: ${fastResult.isDangerous}
  isCurveball: ${fastResult.isCurveball}

JSON shape (5 fields ONLY):
{
  "feedback": "<2-3 sentence examiner feedback — constructive, direct, clinical tone — for scorecard display only, never spoken during the exam>",
  "dangerousReason": "<one sentence naming the specific unsafe element — for scorecard display only — empty string if isDangerous is false>",
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

Teaching points: board-high-yield, 1 sentence each.
ACOG references: cite specific Practice Bulletins or Committee Opinions.
If no specific ACOG reference applies, return an empty array.
Case difficulty: ${difficulty}`

  const user = `Case context: ${caseContext}${caseId ? ` (${caseId})` : ''}

Question asked: ${question}

Candidate's answer: ${userAnswer}

Generate the scorecard fields for this response.`

  return { system, user }
}

/**
 * Parse enrichment response — 5 scorecard fields only.
 * On failure returns empty fallback so scorecard degrades gracefully.
 */
export function parseEnrichmentResponse(rawResponse) {
  const fallback = {
    feedback:        '',
    dangerousReason: '',
    curveballNote:   '',
    teaching_points: [],
    acog_references: [],
  }

  try {
    const cleaned = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim()

    const parsed = JSON.parse(cleaned)
    return {
      feedback:        parsed.feedback        || '',
      dangerousReason: parsed.dangerousReason || '',
      curveballNote:   parsed.curveballNote   || '',
      teaching_points: Array.isArray(parsed.teaching_points) ? parsed.teaching_points : [],
      acog_references: Array.isArray(parsed.acog_references) ? parsed.acog_references : [],
    }
  } catch (e) {
    console.error('Failed to parse enrichment response:', e, rawResponse)
    return fallback
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────
function clamp(val, min, max) {
  if (isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}
