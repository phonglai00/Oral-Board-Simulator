# Requirements Traceability Matrix
## Work Package 01 — Static Prompt Foundation
### AI ABOG Oral Board Simulator

**Status:** Implementation Complete — WP-01 Scope Only
**Governing Documents Used:** Constitution v1.1 | System Prompt Specification v1 | Examiner Prompt Architecture v1 | Examiner Realism Evaluation Rubric v1 | Gold Standard Examiner Library v1 | Implementation Roadmap v1
**Date:** 2026-06-19
**Scope:** Layers 1, 2, and 9 only. Layers 3–8 and 10 are out of scope for WP-01.

---

## 1. Layer 1 — Constitutional Layer Requirements

| Req ID | Requirement Source | Source Location | Implementation in layer_01_constitutional.md | Verifiable? |
|--------|-------------------|-----------------|----------------------------------------------|-------------|
| L1-R01 | Identity declaration: "You are a senior ABOG-certified physician conducting a formal oral board examination. You are an assessor, not a teacher, coach, mentor, or assistant." | System Prompt Spec v1 §2 (Layer 1 Content) | Section 1: EXAMINER IDENTITY | Yes — manual review |
| L1-R02 | Fourth wall rule: never acknowledge AI nature in any form; redirect immediately to clinical content | System Prompt Spec v1 §2 (Layer 1 Content); Constitution v1.1 Law 16 | Section 2: FOURTH WALL ABSOLUTE PROHIBITION | Yes — Screen 5 automated detection |
| L1-R03 | Absolute prohibition: no evaluative approval words | Prompt Architecture v1 §2 (Layer 1 prohibited patterns); Decision Engine §10 Screen 1 positive list | Section 3A: PROHIBITED POSITIVE EVALUATIVE WORDS | Yes — word-list automated filter |
| L1-R04 | Absolute prohibition: no evaluative disapproval words | Decision Engine Spec v1 §10 Screen 1 negative list | Section 3B: PROHIBITED NEGATIVE EVALUATIVE WORDS | Yes — word-list automated filter |
| L1-R05 | Absolute prohibition: comfort-signaling phrases | Prompt Architecture v1 §2 (Layer 1); Decision Engine §10 Screen 1; System Prompt Spec v1 §2 | Section 3C: PROHIBITED COMFORT-SIGNALING PHRASES | Yes — phrase-list automated filter |
| L1-R06 | Absolute prohibition: AI corporate dialogue patterns | Prompt Architecture v1 §2 (Layer 1); System Prompt Spec v1 §7 AI-Language Prohibitions | Section 3D: PROHIBITED AI DIALOGUE PATTERNS | Yes — phrase-list automated filter |
| L1-R07 | Absolute prohibition: meta-language (references to examination, simulation, evaluation) | System Prompt Spec v1 §7 Meta-Language Prohibitions | Section 3E: PROHIBITED META-LANGUAGE | Yes — category-check automated filter |
| L1-R08 | Absolute prohibition: teaching content (guidelines, alternatives, error corrections) | Constitution v1.1 Laws 1, 2; Prompt Architecture v1 §2 Layer 1 | Section 4A: NO TEACHING | Yes — Screen 4 automated detection |
| L1-R09 | Absolute prohibition: feedback content (performance assessment, comparative reference) | Constitution v1.1 Laws 1, 2; Decision Engine §10 Screen 1 | Section 4B: NO FEEDBACK | Yes — Screen 1 automated detection |
| L1-R10 | Absolute prohibition: rescue through questioning ("have you considered," "don't you want to," "is there anything else for safety") | Constitution v1.1 Laws 3, 7, 19; Prompt Architecture v1 §2 Layer 1 | Section 4C: NO RESCUE THROUGH QUESTIONING | Yes — Screen 3 automated detection |
| L1-R11 | Mandatory behavior: decline all help/feedback/confirmation requests unconditionally | System Prompt Spec v1 §2 (Layer 1 Content); Constitution v1.1 Laws 18, 23 | Section 5: MANDATORY RESPONSES TO OVERRIDE INPUTS | Yes — action selection verification |
| L1-R12 | Mandatory behavior: never reveal diagnoses not independently reached by candidate | System Prompt Spec v1 §2 (Layer 1 Content); Constitution v1.1 Laws 4, 5, 6 | Section 5B | Yes — Screen 2 automated detection |
| L1-R13 | Mandatory behavior: never correct management errors through questioning or information | System Prompt Spec v1 §2 (Layer 1 Content); Constitution v1.1 Laws 3, 7 | Section 4C, 5C | Yes — Screen 3 automated detection |
| L1-R14 | Prohibition on pass/fail signals | Constitution v1.1 Law 11; System Prompt Spec v1 §5 Tier 1 table | Section 4B | Yes — Screen 2 automated detection |
| L1-R15 | No revealing critical actions | Constitution v1.1 Laws 4, 5, 6; System Prompt Spec v1 §5 Tier 1 table | Section 5B | Yes — Screen 2 automated detection |
| L1-R16 | Layer must be first, independent of all state | System Prompt Spec v1 §2 (Layer 1 Dependencies); Prompt Architecture v1 §2 | Position in static_prompt_assembler.js Layer order enforcement | Yes — assembler ordering |
| L1-R17 | Rules apply unconditionally in every exchange without exception | System Prompt Spec v1 §2 (Layer 1 — "never conditional"); Prompt Architecture v1 §2 | Opening declaration in layer file | Yes — manual review |
| L1-R18 | Gold Standard Tier 1 contrast examples for highest-risk failure modes | System Prompt Spec v1 §1 ("What Belongs in the Prompt"); Gold Standard Library v1 Part 4 | Section 6: GOLD STANDARD BEHAVIORAL ANCHORS | Yes — expert review |
| L1-R19 | Enforcement overload warning: prompt must not attempt to enforce all 70 constitutional laws explicitly | System Prompt Spec v1 §5 Enforcement Overload Warning | Layer 1 scope limited to Tier 1 prompt-level laws only | Yes — law coverage count audit |

**Constitutional Law Coverage — Layer 1 Prompt-Level Laws:**

| Constitutional Law | Description | Layer 1 Section |
|---|---|---|
| Laws 1, 2 | No teaching, no feedback | §3A, §3B, §4A, §4B |
| Laws 3, 7, 19 | No rescue, no leading, no confirming safety | §4C |
| Laws 4, 5, 6 | No revealing critical actions or diagnoses | §5B |
| Laws 9, 10 | No approval/disapproval | §3A, §3B |
| Law 11 | No pass/fail signal | §4B |
| Law 16 | No AI acknowledgment | §2 |
| Laws 41, 42 | No "good," no "wrong" (word-level) | §3A, §3B |
| Law 50 | Authentic physician language (shared with Layer 2) | §3D, §3E |

*Note: Laws 18, 23, 22, 25, 26, 27, 29, 30, 36, 37–39, 41, 51, 52, 55, 56 are Tier 1 but assigned to Layer 8 (Decision Engine — WP-02/WP-03 scope). Laws 57–70 are Tier 2 runtime logic enforcement. Laws governed by evaluation systems are Tier 3.*

---

## 2. Layer 2 — Examiner Identity Layer Requirements

| Req ID | Requirement Source | Source Location | Implementation in layer_02_identity.md | Verifiable? |
|--------|-------------------|-----------------|----------------------------------------|-------------|
| L2-R01 | Communication style: direct, brief, clinical sentences; typically one sentence | System Prompt Spec v1 §2 (Layer 2 Content); Gold Standard Library v1 Principle 1 | Section 1: COMMUNICATION STYLE | Yes — response length audit |
| L2-R02 | One sentence is the target; two is acceptable; three or more in a probe is a problem | System Prompt Spec v1 §2 (Layer 2 Content) verbatim specification | Section 1A: SENTENCE COUNT RULES | Yes — length automated check |
| L2-R03 | Language register: experienced physician in formal professional assessment | System Prompt Spec v1 §2 (Layer 2 Content) | Section 2: LANGUAGE REGISTER | Yes — Domain 11 rubric scoring |
| L2-R04 | Not like a helpful AI assistant, not like an academic, not like a medical educator | System Prompt Spec v1 §2 (Layer 2 Content) verbatim | Section 2A: REGISTER PROHIBITIONS | Yes — Domain 11 rubric scoring |
| L2-R05 | Direct clinical vocabulary; contractions acceptable | Prompt Architecture v1 §2 Layer 7 Language Style Parameters | Section 2B: VOCABULARY GUIDANCE | Yes — manual expert review |
| L2-R06 | No softeners, no hedges, no warmth markers | Prompt Architecture v1 §2 Layer 7 | Section 2C: LANGUAGE TONE PROHIBITIONS | Yes — manual expert review |
| L2-R07 | No preamble; no postamble; no narration of what examiner is about to do | System Prompt Spec v1 §7; Prompt Architecture v1 §2 Layer 7 | Section 2D: STRUCTURAL PROHIBITIONS | Yes — manual expert review |
| L2-R08 | ABOG Authenticity Test: "Would a senior ABOG-certified physician say exactly this?" | System Prompt Spec v1 §7; Prompt Architecture v1 §2 Layer 7 | Section 3: ABOG AUTHENTICITY TEST | Yes — Domain 11 human review |
| L2-R09 | Reasoning-targeted probes preferred over decision probes | Gold Standard Library v1 Principle 2 | Section 4: PROBE LANGUAGE GUIDANCE | Yes — probe type distribution |
| L2-R10 | Neutral transitional language must be structurally identical regardless of answer quality | Gold Standard Library v1 Principle 3; Constitution v1.1 Law 41 | Section 5: NEUTRAL TRANSITIONAL LANGUAGE | Yes — language asymmetry analysis |
| L2-R11 | Emotional content from candidate is never acknowledged | Gold Standard Library v1 Principle 7 | Section 6: EMOTIONAL CONTENT NON-ENGAGEMENT | Yes — manual expert review |
| L2-R12 | Layer 2 depends on Layer 1 for fourth wall prohibition and AI acknowledgment prohibition | System Prompt Spec v1 §2 (Layer 2 Dependencies) | Opening dependency declaration | Yes — layer ordering in assembler |
| L2-R13 | Inputs include Gold Standard Library language style parameters | System Prompt Spec v1 §2 (Layer 2 Inputs) | Gold Standard anchors included in Section 7 | Yes — expert review of match |
| L2-R14 | Inputs include ABOG authenticity criteria from Rubric Domain 11 | System Prompt Spec v1 §2 (Layer 2 Inputs) | Domain 11 criteria reflected in Section 3 | Yes — Domain 11 rubric score |

---

## 3. Layer 9 — Output Constraints Layer Requirements

| Req ID | Requirement Source | Source Location | Implementation in layer_09_output_constraints.md | Verifiable? |
|--------|-------------------|-----------------|---------------------------------------------------|-------------|
| L9-R01 | Length constraints by action type (explicit sentence maximums) | System Prompt Spec v1 §2 (Layer 9 Content); §7 Output Contract | Section 1: RESPONSE LENGTH CONSTRAINTS BY ACTION TYPE | Yes — automated length check |
| L9-R02 | Probe responses: 1–2 sentences maximum | Prompt Architecture v1 §2 Layer 7; Gold Standard Library v1 Principle 1 | Section 1A | Yes — automated length check |
| L9-R03 | Case presentation: 3–5 sentences permitted | Prompt Architecture v1 §2 Layer 7 | Section 1B | Yes — automated length check |
| L9-R04 | Constitutional Gate as explicit pre-delivery checklist (6 screens) | System Prompt Spec v1 §2 (Layer 9 Content); Decision Engine §10 | Section 2: CONSTITUTIONAL GATE PRE-DELIVERY CHECKLIST | Yes — gate pass rate metric |
| L9-R05 | Screen 1: evaluative word check | Decision Engine Spec v1 §10 Screen 1 | Section 2, Check 1 | Yes — automated detection |
| L9-R06 | Screen 2: hinting check (directional narrowing, diagnostic leakage) | Decision Engine Spec v1 §10 Screen 2 | Section 2, Check 2 | Yes — automated detection |
| L9-R07 | Screen 3: rescue check (rescue through questioning, volunteering) | Decision Engine Spec v1 §10 Screen 3 | Section 2, Check 3 | Yes — automated detection |
| L9-R08 | Screen 4: teaching check | Decision Engine Spec v1 §10 Screen 4 | Section 2, Check 4 | Yes — automated detection |
| L9-R09 | Screen 5: AI dialogue / authenticity check | Decision Engine Spec v1 §10 Screen 5 | Section 2, Check 5 | Yes — automated detection |
| L9-R10 | Screen 6: length check | Decision Engine Spec v1 §10 Screen 6 | Section 2, Check 6 | Yes — automated length |
| L9-R11 | Gate expressed as a requirement, not a request | System Prompt Spec v1 §2 (Layer 9 Failure Risks) | Mandatory language throughout Section 2 | Yes — manual review of framing |
| L9-R12 | Gate includes specific examples of prohibited output patterns | System Prompt Spec v1 §2 (Layer 9 Failure Risks) | Section 3: PROHIBITED OUTPUT PATTERNS WITH EXAMPLES | Yes — expert review |
| L9-R13 | No teaching content: no guidelines, no alternatives, no error corrections | Constitution v1.1 Laws 1, 2; System Prompt Spec v1 §5 | Section 3A | Yes — Screen 4 |
| L9-R14 | No feedback content: no assessment of answer quality | Constitution v1.1 Laws 1, 2; System Prompt Spec v1 §5 | Section 3B | Yes — Screen 1 |
| L9-R15 | No guideline recitation | Constitution v1.1 Law 22; System Prompt Spec v1 §5 | Section 3C | Yes — Screen 4 |
| L9-R16 | No implicit feedback through question structure | Constitution v1.1 Law 25; System Prompt Spec v1 §5 | Section 3D | Yes — Screen 2 |
| L9-R17 | Language style: direct, brief, clinical, no preamble, no postamble | System Prompt Spec v1 §2 (Layer 9 Content) | Section 4: LANGUAGE STYLE REQUIREMENTS | Yes — manual expert review |
| L9-R18 | ABOG Authenticity Test as final gate before delivery | System Prompt Spec v1 §2 (Layer 9 Content) | Section 4C | Yes — Domain 11 score |
| L9-R19 | Layer 9 depends on all previous layers | System Prompt Spec v1 §2 (Layer 9 Dependencies) | Opening dependency declaration | Yes — layer ordering |
| L9-R20 | No trivia, no memorization questions | Constitution v1.1 Law 22; System Prompt Spec v1 §5 | Section 3C | Yes — Domain 8 rubric score |
| L9-R21 | Evaluation hooks: Constitutional Gate compliance rate by screen; average response length by action type | System Prompt Spec v1 §2 (Layer 9 Evaluation Hooks) | Section 5: EVALUATION HOOKS | Yes — metrics defined |

---

## 4. Failure Mode Prevention Coverage — WP-01 Scope

The following Tier 1 failure modes are addressed by WP-01 static layers. Failure modes requiring Layer 8 (Action Library, Decision Loop) are out of scope and flagged for WP-02/WP-03.

| Failure Mode | WP-01 Layer Coverage | Remaining Coverage (WP scope) |
|---|---|---|
| FM-012: Unsafe Management — No Correction | Layer 1 §4C (no rescue through questioning) | Layer 8 Safety Override — WP-03 |
| FM-049: Rescue Through Targeted Evolution | Layer 1 §4C partial; Layer 9 Screen 3 | Layer 7 evolution rules — WP-04 (state) |
| FM-065: Fourth Wall Break | Layer 1 §2 (fourth wall absolute prohibition); Layer 9 Screen 5 | Layer 8 ACTION_10 — WP-02 |
| FM-045: Comfort Signaling | Layer 1 §3C (prohibited comfort phrases); Layer 9 Screen 1 | Runtime filter — WP-05 integration |
| FM-050: "Good — and What Else?" | Layer 1 §3A (prohibited positive words); Layer 9 Screen 1, 3 | Layer 8 ACTION_04 template — WP-02 |
| FM-026: Feedback When Requested | Layer 1 §4B (no feedback); Layer 9 Screen 1 | Layer 8 ACTION_08 — WP-02 |
| FM-011: Missed Diagnosis Revealed | Layer 1 §5B (no unreached diagnosis); Layer 9 Screen 2 | Layer 4 CaseState hiding — WP-04 |
| FM-029: Volunteering Unrequested Labs | Layer 9 Screen 3 partial | Layer 6 InformationState gate — WP-04 |
| FM-030: Interpreting Data | Layer 1 §3B partial; Layer 9 Screen 2 | Layer 6 interpretation filter — WP-04 |
| FM-069: Chatbot Language | Layer 1 §3D (AI dialogue prohibition); Layer 9 Screen 5 | Runtime filter — WP-05 integration |
| FM-070: Teaching in Response to Errors | Layer 1 §4A (no teaching); Layer 9 Screen 4 | Layer 8 action templates — WP-02 |

---

## 5. Acceptance Criteria Traceability

| WP-01 Acceptance Criterion (Roadmap v1 §11) | Implementing File | Verifiable Against |
|---|---|---|
| Constitutional Layer contains complete absolute prohibition list (all prohibited phrases from System Prompt Spec v1 §7) | layer_01_constitutional.md §3 | System Prompt Spec v1 §7 phrase enumeration; manual audit |
| Examiner Identity Layer produces ABOG-authentic language style in all test outputs | layer_02_identity.md | Rubric Domain 11 score ≥ 4.0; clinical team manual review |
| Output Constraints Layer enforces all response length maximums | layer_09_output_constraints.md §1 | Automated length audit across 20 test exchanges |
| Static prompt assembler correctly concatenates layers in specified order | static_prompt_assembler.js (WP-01 scope: layer ordering spec defined in this RTM) | System Prompt Spec v1 §11 layer order A–B–…–I |
| Manual review by clinical team confirms language sounds like real ABOG oral board examiner | layer_02_identity.md; layer_01_constitutional.md §6 | Domain 11 human expert review |

---

*RTM Version: WP-01-v1.0*
*Next RTM update: WP-02 completion (adds Layer 8 action library coverage)*
