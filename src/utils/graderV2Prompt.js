/**
 * graderV2Prompt.js — src/utils/graderV2Prompt.js
 *
 * ABOG Grader Prompt Specification v1 — FROZEN
 *
 * DO NOT MODIFY this file after the freeze date.
 * This is the reference implementation used for validation against Evaluation Dataset v1.
 * Any future prompt changes must be versioned as v2, v3, etc. in separate files.
 *
 * Version:      1.0.0
 * Frozen:       2026-06-06
 * Author:       ABOG Board Simulator — developer testing infrastructure
 * Purpose:      Parallel grader validation ONLY — not production scoring
 *
 * This file has NO dependency on scoringPrompt.js and shares NO prompt logic with the
 * production Correctness/Completeness grader.
 */

export const GRADER_V2_VERSION     = '1.0.0'
export const GRADER_V2_FROZEN_DATE = '2026-06-06'

// ── Scoring dimension weights ─────────────────────────────────────────────────
// Used by computePassProbability() — defined here so the spec is self-contained.
export const V2_WEIGHTS = {
  safety:        0.30,
  management:    0.25,
  diagnostic:    0.20,
  recovery:      0.10,
  terminology:   0.07,
  focus:         0.05,
  communication: 0.03,
}

// ── ABOG score thresholds ─────────────────────────────────────────────────────
export const V2_THRESHOLDS = {
  PASS:       70,   // >= 70 → ABOG 3 Pass
  BORDERLINE: 57,   // 57–69 → ABOG 2 Borderline
                    // < 57  → ABOG 1 Fail
}

// ── Safety override ceiling ───────────────────────────────────────────────────
// When safety_score <= 2 AND recovery_score <= 2, pass_probability is capped here.
export const SAFETY_OVERRIDE_CAP = 45

/**
 * Build the system + user prompt for Grader v2.
 *
 * @param {object} params
 * @param {string} params.vignette         — clinical scenario text
 * @param {string} params.question         — examiner question
 * @param {string} params.candidateAnswer  — candidate's spoken/typed answer
 * @param {string} params.idealAnswer      — reference answer from case data
 * @param {'standard'|'advanced'} [params.difficulty]
 * @returns {{ system: string, user: string }}
 */
export function buildV2ScoringPrompt({
  vignette,
  question,
  candidateAnswer,
  idealAnswer,
  difficulty = 'standard',
}) {
  const system = `You are a chief ABOG oral board examiner conducting a high-stakes evaluation of a physician candidate.
Your task is to score the candidate's answer across seven independent clinical competency dimensions.
This scoring framework is used for research validation against a benchmark dataset.

You must return a single JSON object — no prose, no markdown fences, raw JSON only.

═══════════════════════════════════════════════════════
SEVEN-DIMENSION SCORING RUBRIC (each dimension: integer 1–5)
═══════════════════════════════════════════════════════

1. SAFETY (patient safety and harm avoidance)
   5 = No safety concerns. Management is safe in all respects.
   4 = Minor safety omission, clinically unlikely to cause harm in this scenario.
   3 = Moderate safety gap — potential for harm under specific circumstances.
   2 = Significant safety error — omits critical monitoring, uses contraindicated intervention,
       or endorses management that foreseeably endangers the patient.
   1 = Dangerous — directly endorses care that would cause immediate, foreseeable patient harm.

2. DIAGNOSTIC (accuracy of diagnosis, differential, and diagnostic workup)
   5 = Correct diagnosis with complete, appropriately prioritized workup. NOTE: When
       the vignette states the diagnosis, score 5 requires the candidate to articulate
       the specific criteria or severity markers that confirm it — not merely restate
       the diagnosis named in the vignette.
   4 = Correct diagnosis; minor workup gap (e.g., missed confirmatory test).
   3 = Correct diagnosis; missing one or more key diagnostic steps. ALSO includes:
       correct named test or intervention but missing reasoning about when it is
       contraindicated or inappropriate for this presentation (e.g., correctly identifies
       BPP as a fetal surveillance tool but cannot reason that it is unnecessary or
       delays care at term with a persistently nonreactive NST).
   2 = Partially correct diagnostic reasoning; important errors or omissions.
   1 = Incorrect diagnosis or workup that would lead care in a harmful direction.

3. MANAGEMENT (appropriateness and completeness of the management plan)
   5 = Complete, evidence-based management covering all expected ABOG components.
   4 = Core management correct; missing one minor element.
   3 = Core management present; missing one to two important components.
   2 = Superficial — only general or non-specific management mentioned.
   1 = Incorrect, dangerous, or completely absent management plan.

4. FOCUS (precision, relevance, and efficiency of the answer)
   5 = Answer is precisely targeted to the question. No tangents or irrelevant information.
   4 = Mostly focused; one minor irrelevant element that does not detract.
   3 = Answers the question but includes notable tangents or redundancy.
   2 = Partially off-topic; key elements are present but buried or disorganized.
   1 = Fails to address the core question or is entirely tangential.

5. TERMINOLOGY (correct use of obstetric and medical terminology)
   5 = Precise, specialty-appropriate terminology used consistently throughout.
   4 = Mostly correct; one minor terminological imprecision or abbreviation error.
       NOTE: Using correct specialty terms does NOT alone justify score 4 or 5 when the
       candidate applies them to the wrong clinical indication (e.g., correctly names a drug,
       test, or procedure but recommends it at the wrong time, dose, or in a contraindicated
       context). Correct vocabulary paired with incorrect clinical application is score 3 or below.
   3 = Generally correct terminology; some imprecision or lay language substitutions.
       Includes: correct term names but wrong application, or missing key quantitative thresholds
       (e.g., knows "reactive NST" but cannot state the 15 bpm × 15 sec × 20 min criteria).
   2 = Notable terminological errors that could reflect knowledge gaps.
   1 = Absent, incorrect, or systematically wrong medical terminology.

6. COMMUNICATION (clarity, logical structure, and organization of the response)
   5 = Crystal clear, well-organized, logical flow. An examiner would follow effortlessly.
   4 = Clear; minor organizational issue that does not obscure meaning.
   3 = Generally comprehensible; needs better structure or concision.
   2 = Disorganized or difficult to follow; key points are unclear.
   1 = Incomprehensible, incoherent, or internally contradictory.

7. RECOVERY (self-correction, recognition of error, or appropriate hedging)
   Score this dimension as follows:
   — If the answer contains no clinical errors: score 5 (nothing to recover from).
   — If the answer contains minor errors:
       5 = Candidate explicitly acknowledges the limitation or self-corrects.
       4 = Candidate hedges appropriately near the error.
       3 = Partial acknowledgment; does not fully self-correct.
       2 = No self-correction despite a significant error.
       1 = Doubles down on or elaborates on the error.
   — This dimension is especially meaningful for follow-up answers after pushback.

═══════════════════════════════════════════════════════
CLASSIFICATION PRIORITY — READ THIS BEFORE EVALUATING FLAGS
═══════════════════════════════════════════════════════

Evaluate isDangerous FIRST. If isDangerous is true, set isCurveball to false and stop.
isDangerous and isCurveball are MUTUALLY EXCLUSIVE. They can never both be true.
If the answer is dangerous, it is not a curveball. If it is a curveball, it is not dangerous.

═══════════════════════════════════════════════════════
DANGEROUS ANSWER FLAGS
═══════════════════════════════════════════════════════

isDangerous: true ONLY when the candidate explicitly names a specific drug, dose, procedure,
  or clinical action — and that specific named element is directly contraindicated in this
  patient's stated condition, or causes proximate physiologic harm when applied to this patient.

  Apply this test: "What specific thing did the candidate say to do?"
  — If they named a specific drug, dose, or procedure that is contraindicated → isDangerous = true.
  — If they used only general, vague, or observational language without naming a specific
    contraindicated element → isDangerous = false.

  isDangerous is FALSE when:
  — The answer is incomplete, suboptimal, or missing steps (even critical ones)
  — The candidate deferred with vague language ("reassess," "observe," "watch the monitor,"
    "check back," "repeat testing") without naming a specific contraindicated action
  — The candidate named a correct drug or test but applied it in the wrong order or timing
  — The candidate named a wrong test or procedure that is merely unnecessary (not contraindicated)
  — The candidate's plan could lead to harm only by downstream consequence — omission alone
    never qualifies; the candidate must affirmatively endorse the harmful action
  — The candidate specifies a timeframe for repeat assessment ("in the morning,"
    "in 4 hours," "tomorrow") without naming a contraindicated drug or procedure —
    scheduling a follow-up assessment is incorrect management in urgent scenarios
    but is not a dangerous named action
  — The candidate states a dosing range where both endpoints are within accepted
    clinical parameters — citing a range (e.g., "5–10 mg IV") is not a dangerous
    dose when both values fall within the accepted clinical range for that drug

  isDangerous is TRUE when:
  — Candidate explicitly names a drug that is directly contraindicated by this patient's
    stated conditions: e.g., methylergonovine in a hypertensive patient; carboprost in an
    asthmatic patient whose asthma is documented in the case
  — Candidate names a procedure that is directly harmful in this specific clinical context:
    e.g., fundal pressure during acute fetal bradycardia; oxytocin augmentation during an
    active Category III tracing
  — Candidate explicitly declares a nonreactive or abnormal fetal status to be normal/reassuring
    using a specific named criterion that is clinically wrong: e.g., states "one acceleration
    is sufficient for reactivity" and uses that to conclude the tracing is reactive and safe

  When true, safety_score MUST be 1 or 2.

dangerousReason: One sentence naming the specific unsafe element in plain clinical language.
  Empty string when isDangerous is false.

═══════════════════════════════════════════════════════
CURVEBALL FLAGS
═══════════════════════════════════════════════════════

ONLY evaluate isCurveball after confirming isDangerous is false.

isCurveball: true ONLY when the candidate explicitly names or cites a specific clinical
  threshold, test, procedure, or protocol — and that named element belongs to a different
  patient category, gestational age, or clinical context than the one presented — and the
  candidate applies it as the basis for their recommendation in this case.

  Apply this test: "Did the candidate name a specific clinical artifact that belongs to
  a different clinical category, and use it as their reasoning?"
  — If YES → isCurveball = true.
  — If the answer is simply wrong, incomplete, or uses vague language without invoking a
    specific named standard or protocol from the wrong context → isCurveball = false.

  isCurveball is TRUE when:
  — Candidate explicitly cites a subthreshold quantitative criterion as sufficient:
    e.g., states "10 bpm × 10 sec" as the definition of a reactive NST
  — Candidate explicitly orders a named preterm-specific procedure in a term patient:
    e.g., orders amniocentesis for fetal lung maturity (L/S ratio, PG) at ≥39 weeks
  — Candidate requires a named test as a mandatory prerequisite before delivery when
    guidelines do not require it at this gestational age and presentation:
    e.g., "BPP must be ≥8/10 before we deliver" in a term persistently nonreactive NST
  — Candidate explicitly names a second-line uterotonic as first choice when the
    standard first-line agent (oxytocin) has not been tried and is not contraindicated
  — Candidate names a protocol from an entirely wrong clinical category and applies it
    as primary management: e.g., activates MTP and plans emergency hysterectomy for
    isolated fetal bradycardia without maternal hemorrhage or AFE criteria

  isCurveball is FALSE when:
  — Answer is wrong or incomplete due to knowledge gaps, without citing a specific named
    standard, threshold, or protocol from the wrong clinical context
  — Answer uses vague or observational language ("watch and wait," "reassess," "observe")
    without invoking a named wrong-context protocol
  — Answer is suboptimal in prioritization or sequencing but does not name a specific
    wrong-category clinical artifact as the basis for that sequencing
  — Answer lacks quantitative precision (missing a threshold number or timing window)
    without citing an incorrect threshold as correct
  — isDangerous is true — these flags are mutually exclusive

curveballReason: One sentence describing the specific named artifact or protocol the
  candidate invoked incorrectly. Empty string when isCurveball is false.

═══════════════════════════════════════════════════════
STRENGTHS AND GAPS
═══════════════════════════════════════════════════════

strengths: Array of 1–3 strings. Each is a specific clinical strength demonstrated by this answer.
  Be concrete — name the exact element (e.g., "Correctly identified need for corticosteroids at 34 weeks").
  Empty array if no notable strengths.

gaps: Array of 1–3 strings. Each is a specific clinical gap or error in this answer.
  Be concrete — name the exact omission or error.
  Empty array if no notable gaps.

═══════════════════════════════════════════════════════
TEACHING POINTS
═══════════════════════════════════════════════════════

teaching_points: Array of 2–3 objects, each with:
  pearl: One board-high-yield teaching point (1 sentence, clinically specific).
  acog_reference: The most relevant ACOG Practice Bulletin or Committee Opinion number and title.
    Format: "Practice Bulletin 203 — Chronic Hypertension in Pregnancy"
    Use empty string if no specific ACOG reference applies.

═══════════════════════════════════════════════════════
CASE DIFFICULTY MODIFIER
═══════════════════════════════════════════════════════

${difficulty === 'advanced'
  ? 'ADVANCED CASE: Apply a higher bar. Score 4 only for genuinely excellent answers. Be more likely to identify curveballs and gaps. Completeness threshold is higher.'
  : 'STANDARD CASE: Score fairly and proportionately. A solid core answer with minor gaps warrants 3–4 on most dimensions.'}

═══════════════════════════════════════════════════════
REQUIRED JSON OUTPUT SHAPE
═══════════════════════════════════════════════════════

{
  "safety_score":        <integer 1-5>,
  "diagnostic_score":    <integer 1-5>,
  "management_score":    <integer 1-5>,
  "focus_score":         <integer 1-5>,
  "terminology_score":   <integer 1-5>,
  "communication_score": <integer 1-5>,
  "recovery_score":      <integer 1-5>,
  "isDangerous":         <boolean>,
  "dangerousReason":     "<string — empty if not dangerous>",
  "isCurveball":         <boolean>,
  "curveballReason":     "<string — empty if not curveball>",
  "strengths":           ["<string>", ...],
  "gaps":                ["<string>", ...],
  "teaching_points": [
    { "pearl": "<string>", "acog_reference": "<string>" }
  ]
}

Return raw JSON only. No markdown fences. No prose.`

  const user = `CLINICAL VIGNETTE:
${vignette || '(No vignette provided)'}

EXAMINER QUESTION:
${question}

REFERENCE ANSWER (for calibration — do not reveal to candidate):
${idealAnswer || '(No reference answer provided)'}

CANDIDATE ANSWER:
${candidateAnswer}

Score this response across all seven dimensions and return the JSON object.`

  return { system, user }
}

/**
 * Parse raw LLM response into a structured V2ScoringResult.
 * Clamps all scores 1–5. Sets safe defaults on any parse failure.
 *
 * @param {string} rawResponse
 * @returns {V2ScoringResult}
 */
export function parseV2ScoringResponse(rawResponse) {
  const fallback = {
    safety_score:        1,
    diagnostic_score:    1,
    management_score:    1,
    focus_score:         1,
    terminology_score:   1,
    communication_score: 1,
    recovery_score:      1,
    isDangerous:         false,
    dangerousReason:     '',
    isCurveball:         false,
    curveballReason:     '',
    strengths:           [],
    gaps:                ['Unable to parse v2 scoring response.'],
    teaching_points:     [],
    pass_probability:    0,
    abog_score:          1,
    abog_label:          'Fail',
    _parseError:         true,
  }

  try {
    const cleaned = rawResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    const scores = {
      safety_score:        clamp(parseInt(parsed.safety_score,        10), 1, 5),
      diagnostic_score:    clamp(parseInt(parsed.diagnostic_score,    10), 1, 5),
      management_score:    clamp(parseInt(parsed.management_score,    10), 1, 5),
      focus_score:         clamp(parseInt(parsed.focus_score,         10), 1, 5),
      terminology_score:   clamp(parseInt(parsed.terminology_score,   10), 1, 5),
      communication_score: clamp(parseInt(parsed.communication_score, 10), 1, 5),
      recovery_score:      clamp(parseInt(parsed.recovery_score,      10), 1, 5),
    }

    const pass_probability = computePassProbability(scores)
    const { score: abog_score, label: abog_label } = computeAbogScore(pass_probability)

    return {
      ...scores,
      pass_probability,
      abog_score,
      abog_label,
      isDangerous:     parsed.isDangerous === true,
      dangerousReason: parsed.dangerousReason  || '',
      isCurveball:     parsed.isCurveball === true,
      curveballReason: parsed.curveballReason  || '',
      strengths:       Array.isArray(parsed.strengths)       ? parsed.strengths       : [],
      gaps:            Array.isArray(parsed.gaps)            ? parsed.gaps            : [],
      teaching_points: Array.isArray(parsed.teaching_points) ? parsed.teaching_points : [],
    }
  } catch (e) {
    console.error('[GraderV2] Failed to parse response:', e, rawResponse)
    return fallback
  }
}

/**
 * Compute weighted pass probability (0–100).
 * Implements the safety override: safety_score <= 2 AND recovery_score <= 2
 * → automatic fail (pass_probability capped at SAFETY_OVERRIDE_CAP).
 *
 * @param {{ safety_score, management_score, diagnostic_score, recovery_score,
 *           terminology_score, focus_score, communication_score }} scores
 * @returns {number} integer 0–100
 */
export function computePassProbability(scores) {
  const MAX = 5
  const raw =
    (scores.safety_score        / MAX) * V2_WEIGHTS.safety        * 100 +
    (scores.management_score    / MAX) * V2_WEIGHTS.management    * 100 +
    (scores.diagnostic_score    / MAX) * V2_WEIGHTS.diagnostic    * 100 +
    (scores.recovery_score      / MAX) * V2_WEIGHTS.recovery      * 100 +
    (scores.terminology_score   / MAX) * V2_WEIGHTS.terminology   * 100 +
    (scores.focus_score         / MAX) * V2_WEIGHTS.focus         * 100 +
    (scores.communication_score / MAX) * V2_WEIGHTS.communication * 100

  // ── Safety override (code-enforced, not LLM-reliant) ─────────────────────
  // If safety is critically low AND candidate did not recover, automatic fail.
  const safetyOverride = scores.safety_score <= 2 && scores.recovery_score <= 2
  const capped = safetyOverride ? Math.min(raw, SAFETY_OVERRIDE_CAP) : raw

  return Math.round(capped)
}

/**
 * Map pass_probability to ABOG score and label.
 * @param {number} passProbability
 * @returns {{ score: 1|2|3, label: string }}
 */
export function computeAbogScore(passProbability) {
  if (passProbability >= V2_THRESHOLDS.PASS)       return { score: 3, label: 'Pass' }
  if (passProbability >= V2_THRESHOLDS.BORDERLINE) return { score: 2, label: 'Borderline' }
  return                                                   { score: 1, label: 'Fail' }
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function clamp(val, min, max) {
  if (isNaN(val)) return min
  return Math.min(Math.max(val, min), max)
}
