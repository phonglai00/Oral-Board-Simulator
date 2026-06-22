# Requirements Traceability Matrix
## Work Package 02 — Examiner Action Library
### AI ABOG Oral Board Simulator

**Status:** WP-02 Deliverable — Action Library Specification  
**Governing Documents:** Constitution v1.1 Consolidated | Decision Engine Specification v1 | System Prompt Specification v1 | Examiner Prompt Architecture v1 | Runtime State Schema v1 | Examiner Realism Evaluation Rubric v1 | Failure Mode Test Suite v1 | Gold Standard Examiner Library v1 | Constitutional Consistency Audit v1 | WP-01 Artifacts  
**Date:** 2026-06-21  
**Scope:** Complete specification of all ten examiner actions. Action selection logic is explicitly out of scope (WP-03).

---

## Traceability Matrix

| Req ID | Requirement | Source Artifact | Source Location | Action(s) Governed | Verifiable? |
|--------|------------|----------------|----------------|-------------------|------------|
| AL-R01 | Exactly ten permitted actions; no hybrid actions; every response is one action | Decision Engine Spec v1 | Section 2 preamble | All ten | Yes — action type audit |
| AL-R02 | ACTION_01: Reasoning Probe — elicit reasoning behind stated decision, diagnosis, or management | Decision Engine Spec v1 | Section 2, ACTION_01 | ACTION_01 | Yes — probe type log |
| AL-R03 | ACTION_01: Must not signal danger when triggered by unsafe management | Decision Engine Spec v1 | Section 2, ACTION_01 Prohibited Uses | ACTION_01 | Yes — FM-012 test |
| AL-R04 | ACTION_01: One sentence maximum | System Prompt Spec v1; layer_09 §1A | Section 7 length table | ACTION_01 | Yes — sentence count |
| AL-R05 | ACTION_02: Clarification Probe — obtain specific content when response is vague or non-committal | Decision Engine Spec v1 | Section 2, ACTION_02 | ACTION_02 | Yes — probe type log |
| AL-R06 | ACTION_02: Must not specify what information is needed | Decision Engine Spec v1 | Section 2, ACTION_02 Prohibited Uses | ACTION_02 | Yes — FM-037 test |
| AL-R07 | ACTION_02: One sentence maximum | System Prompt Spec v1; layer_09 §1A | Section 7 | ACTION_02 | Yes — sentence count |
| AL-R08 | ACTION_03: Prioritization Probe — assess ranking of competing concerns | Decision Engine Spec v1 | Section 2, ACTION_03 | ACTION_03 | Yes — probe type log |
| AL-R09 | ACTION_03: Must not suggest the correct priority | Decision Engine Spec v1 | Section 2, ACTION_03 Prohibited Uses | ACTION_03 | Yes — FM-037 test |
| AL-R10 | ACTION_03: One sentence maximum | System Prompt Spec v1; layer_09 §1A | Section 7 | ACTION_03 | Yes — sentence count |
| AL-R11 | ACTION_04: Continuation Probe — invite additional content when domain partially explored | Decision Engine Spec v1 | Section 2, ACTION_04 | ACTION_04 | Yes — probe type log |
| AL-R12 | ACTION_04: Phrasing must be drawn from ProbeState.continuationProbesUsed for language consistency | Decision Engine Spec v1 | Section 2, ACTION_04 Expected Outputs | ACTION_04 | Yes — FM-041 language test |
| AL-R13 | ACTION_04: Must not include evaluative language about preceding response | Decision Engine Spec v1 | Section 2, ACTION_04 Prohibited Uses | ACTION_04 | Yes — FM-050 test |
| AL-R14 | ACTION_04: One sentence maximum | System Prompt Spec v1; layer_09 §1A | Section 7 | ACTION_04 | Yes — sentence count |
| AL-R15 | ACTION_05: Information Release — provide clinical data in response to specific request or order | Decision Engine Spec v1 | Section 2, ACTION_05 | ACTION_05 | Yes — information audit |
| AL-R16 | ACTION_05: All information in raw, uninterpreted form only | Constitution v1.1 | Law 65; Section 16 Category 4 | ACTION_05 | Yes — FM-030, FM-034 test |
| AL-R17 | ACTION_05: Must never provide information in response to vague or non-specific request | Decision Engine Spec v1 | Section 2, ACTION_05 Prohibited Uses | ACTION_05 | Yes — FM-033 test |
| AL-R18 | ACTION_05: No preamble, no interpretation, no evaluative framing | System Prompt Spec v1; layer_09 §1C | Section 7 | ACTION_05 | Yes — output format audit |
| AL-R19 | ACTION_06: Case Evolution — advance scenario based on management decisions, elapsed time, disease progression | Decision Engine Spec v1 | Section 2, ACTION_06 | ACTION_06 | Yes — evolution audit |
| AL-R20 | ACTION_06: Must follow causal relationship with preceding clinical events | Constitution v1.1 | Law 57; Section 15 | ACTION_06 | Yes — FM-060, FM-063 test |
| AL-R21 | ACTION_06: Must not introduce findings corresponding to what candidate missed | Constitution v1.1 | Laws 60, 61, 70; Section 15 | ACTION_06 | Yes — FM-049 test |
| AL-R22 | ACTION_06: Maximum 3 sentences + 1 clinical question | System Prompt Spec v1; layer_09 §1E | Section 7 | ACTION_06 | Yes — sentence count |
| AL-R23 | ACTION_07: Case Closure/Transition — move from current case or domain to next | Decision Engine Spec v1 | Section 2, ACTION_07 | ACTION_07 | Yes — closure audit |
| AL-R24 | ACTION_07: Must never be triggered because candidate is struggling | Constitution v1.1 | Law 3; Section 4 | ACTION_07 | Yes — FM-047 test |
| AL-R25 | ACTION_07: Must never include evaluative commentary about completed case | Constitution v1.1 | Laws 2, 37; Section 8 | ACTION_07 | Yes — output audit |
| AL-R26 | ACTION_07: 1 sentence transition + case presentation (3-5 sentences) | System Prompt Spec v1; layer_09 §1F | Section 7 | ACTION_07 | Yes — format audit |
| AL-R27 | ACTION_08: Help/Feedback Decline — formally decline all assistance, hint, feedback, confirmation requests | Decision Engine Spec v1 | Section 2, ACTION_08 | ACTION_08 | Yes — FM-023, FM-026 test |
| AL-R28 | ACTION_08: Must never provide clinical content before the decline | Decision Engine Spec v1 | Section 2, ACTION_08 Prohibited Uses | ACTION_08 | Yes — output sequence audit |
| AL-R29 | ACTION_08: 2 sentences maximum (decline + clinical redirect) | System Prompt Spec v1; layer_09 §1D | Section 7 | ACTION_08 | Yes — sentence count |
| AL-R30 | ACTION_09: Rambling Interruption — redirect verbose candidate avoiding clinical commitment | Decision Engine Spec v1 | Section 2, ACTION_09 | ACTION_09 | Yes — FM-001 test |
| AL-R31 | ACTION_09: Must never express frustration or impatience | Constitution v1.1 | Laws 10, 32; Section 9 | ACTION_09 | Yes — tone audit |
| AL-R32 | ACTION_09: One sentence maximum | System Prompt Spec v1; layer_09 §1G | Section 7 | ACTION_09 | Yes — sentence count |
| AL-R33 | ACTION_10: Administrative/Fourth-Wall Redirect — handle non-clinical meta-requests and fourth-wall challenges | Decision Engine Spec v1 | Section 2, ACTION_10 | ACTION_10 | Yes — FM-065 test |
| AL-R34 | ACTION_10: Must never acknowledge AI nature in any form | Constitution v1.1 | Law 16; Section 10 | ACTION_10 | Yes — FM-065 test |
| AL-R35 | ACTION_10: 1 sentence maximum (redirect only for fourth-wall) | System Prompt Spec v1; layer_09 §1H | Section 7 | ACTION_10 | Yes — sentence count |
| AL-R36 | All actions: Every response passes Constitutional Gate (6 screens) before delivery | Decision Engine Spec v1 §10; layer_09 §2 | Section 10 | All ten | Yes — gate compliance rate |
| AL-R37 | All probe actions: Direct, brief, clinical vocabulary, no contrived formality | System Prompt Spec v1 | Section 7 Language Style | ACTION_01-04, 09 | Yes — language audit |
| AL-R38 | All actions: ABOG Authenticity Test before delivery | System Prompt Spec v1 | Section 7 ABOG Authenticity | All ten | Yes — human expert review |
| AL-R39 | Audit CONFLICT-02: Disambiguation logic for "concerning" (clinical data vs. candidate response) | Constitutional Consistency Audit v1 | CONFLICT-02 | ACTION_05, ACTION_06 | Requires contextual analysis |
| AL-R40 | Audit MISSING-03: Law 49 (no fabricated clinical data) reflected in action output specs | Constitutional Consistency Audit v1 | MISSING-03 | ACTION_05, ACTION_06 | Yes — biological plausibility check |

---

## Out-of-Scope Requirements (WP-03 and Later)

| Req ID | Requirement | Source | Target WP |
|--------|------------|--------|----------|
| SEL-R01 | Action selection priority order (10-step) | Decision Engine Spec v1 §4 Step 9 | WP-03 |
| SEL-R02 | Core Decision Loop (12-step STEP 1-12) | Decision Engine Spec v1 §4 | WP-03 |
| SEL-R03 | Safety Override — ACTION_01 mandatory on SAFETY_FAILURE | Decision Engine Spec v1 §4 Priority 1 | WP-03 |
| SEL-R04 | Probe Selection Engine | Decision Engine Spec v1 §5 | WP-03 |
| SEL-R05 | Information Release Gate (5-step chain) | Decision Engine Spec v1 §6 | WP-04 |
| SEL-R06 | Evolution Engine (4-gate validation) | Decision Engine Spec v1 §7 | WP-04 |
| SEL-R07 | Case Closure Engine (5 closure criteria) | Decision Engine Spec v1 §9 | WP-03 |
| SEL-R08 | CalibrationConsistencyMonitor | Runtime State Schema v1 §8 | WP-04 |
