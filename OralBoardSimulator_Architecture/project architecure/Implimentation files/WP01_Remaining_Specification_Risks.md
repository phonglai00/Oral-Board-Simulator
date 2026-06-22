# WP-01 Remaining Specification Risks
## Work Package 01 — Static Prompt Foundation
### AI ABOG Oral Board Simulator

**Status:** Post-implementation risk inventory
**Scope:** Risks identified during WP-01 implementation that carry forward to WP-02 and beyond
**Date:** 2026-06-19

---

## Classification Key

**Risk Level:**
- **Critical** — Risk that, if realized, produces a Tier 1 failure mode or constitutional violation in production
- **High** — Risk that significantly degrades simulation fidelity or assessment validity
- **Medium** — Risk that produces measurable quality degradation but does not violate constitutional requirements
- **Low** — Risk that is detectable and correctable without material impact on simulation fidelity

**Source:**
- **Specification Gap (SG)** — Behavior not specified in governing artifacts
- **Implementation Decision (ID)** — Decision made during WP-01 with architectural implications
- **Integration Risk (IR)** — Risk that materializes only when WP-01 layers interact with later work package deliverables
- **Enforcement Boundary (EB)** — Risk arising from the specified boundary between prompt-level and runtime-level enforcement

---

## RISK 01 — Prohibition List Completeness (Gap 1 — Non-Blocking)

**Risk Level:** Critical
**Source:** Specification Gap (SG)
**Governing Artifact:** Constitution v1.1; System Prompt Spec v1 §7

**Description:**
The prohibition list in Layer 1 §3 was assembled from all explicit phrase examples across four governing documents (Constitution v1.1, System Prompt Spec v1 §7, Prompt Architecture v1 §2 Layer 1, Gold Standard Library v1 Part 3). The documents use the formulation "etc." or "and similar phrases" in several places, indicating that the enumerated examples are not exhaustive.

**Specific uncertainty:** The Decision Engine Spec v1 §10 Screen 1 provides the most complete single list of prohibited positive evaluative words (15 specific words) and prohibited negative evaluative words. However, this list is presented as the primary examples for the neutrality screen — not as a complete inventory. Additional prohibited words may exist in Constitution v1.1 that were not enumerated in the collected passages.

**Risk realization scenario:** A prohibited evaluative word not enumerated in Layer 1 §3 appears in an examiner response. It passes the Constitutional Gate because it is not on the explicit prohibited list. It constitutes a neutrality violation. It is delivered to a candidate.

**Recommended resolution before WP-05:**
An ABOG diplomate or oral board examiner should conduct a complete audit of Layer 1 §3 against their experiential knowledge of real oral board examiner language. The objective is to identify any evaluative word or phrase that (a) a real examiner would never say and (b) is not on the current prohibition list. This audit produces the definitive prohibited phrase list.

**Interim mitigation already implemented:** Layer 9 Screen 5 (Authenticity Screen) provides a second gate that catches authenticity failures not caught by the word-level Screen 1. The ABOG Authenticity Test ("Would an ABOG examiner say this?") catches evaluative language that does not match specific prohibited words.

---

## RISK 02 — Static Prompt Assembler Interface Contract (Gap 2 — Non-Blocking)

**Risk Level:** High
**Source:** Specification Gap (SG) / Implementation Risk (IR)
**Governing Artifact:** System Prompt Spec v1 §11; Implementation Roadmap v1 WP-01

**Description:**
The `static_prompt_assembler.js` specification in the Roadmap defines the output files but does not specify the assembler's interface contract: what format it receives Layer 2 and Layer 9 as, what it returns, how it handles encoding, whether it produces a single concatenated string or a structured object, and how its output interfaces with the dynamic injection pipeline that will be built in WP-04.

**Risk realization scenario:** WP-01 and WP-04 make independent interface assumptions. When WP-05 (First Working Examiner Integration) attempts to combine static and dynamic layers, the interfaces are incompatible, requiring architectural rework.

**Recommended resolution before WP-05:**
Define the assembler interface contract as a specification document before WP-04 begins. The contract should specify: input format (file paths vs. pre-loaded strings), output format (single string vs. structured prompt object), encoding handling, delimiter conventions between layers, and the interface the dynamic injection pipeline will consume.

**Interim mitigation:** The RTM specifies layer ordering (A, B, I for static; C–H, J for dynamic per System Prompt Spec v1 §11). This is sufficient for WP-01. The interface contract gap must be resolved before WP-04 dynamic layer injection begins.

---

## RISK 03 — Gold Standard Example Selection Boundary (Gap 3 — Non-Blocking)

**Risk Level:** Medium
**Source:** Specification Gap (SG)
**Governing Artifact:** System Prompt Spec v1 §1; Gold Standard Library v1 Part 4

**Description:**
Layer 1 §6 includes six gold standard behavioral anchors corresponding to the six failure modes most directly addressed by Layer 1. The System Prompt Spec v1 §1 specifies including "a small set of high-quality Gold Standard examples for the highest-risk failure modes" and specifically "only Tier 1 examples." The Gold Standard Library identifies nine Tier 1 failure modes (FM-012, FM-065, FM-045, FM-050, FM-026, FM-011, FM-029, FM-030, FM-023).

**Current implementation:** Six of the nine Tier 1 failure modes have gold standard anchors in Layer 1 §6. FM-012 (Unsafe Management), FM-011 (Missed Diagnosis Revealed), FM-029 (Volunteering Unrequested Labs), and FM-023 (Help Provision) were partially addressed through behavioral prohibitions but not through explicit gold standard examples. FM-029 and FM-012 gold standard examples were omitted because the correct behaviors are governed primarily by runtime state (Layer 6 InformationState and Layer 8 Safety Override) rather than by Layer 1 static instruction.

**Risk realization scenario:** The omitted gold standard examples represent failure modes where contrast-learning (correct vs. incorrect examples) would improve model compliance. Without them, the model may produce FM-029 or FM-012 violations that would have been prevented by explicit behavioral anchors.

**Recommended resolution:**
At WP-05 (First Working Examiner Integration), evaluate whether adding FM-012, FM-029, and FM-023 anchors to Layer 1 §6 improves compliance rates. This evaluation requires testing data. The decision to add or omit should be governed by evaluation evidence, not by prior assumption.

**Context window consideration:** Adding all nine Tier 1 gold standard examples increases static prompt size. Context window budget must be evaluated against dynamic layer requirements before committing to expansion.

---

## RISK 04 — Layer 9 Gate Dependency on Layer 8 Action Types (Gap 4 Partial — Non-Blocking)

**Risk Level:** High
**Source:** Integration Risk (IR)
**Governing Artifact:** System Prompt Spec v1 §2 Layer 9; Decision Engine Spec v1 §10

**Description:**
Layer 9 §1 specifies response length constraints by action type (ACTION_01 through ACTION_10). However, Layer 8 (which defines the Action Library) is a WP-02 deliverable. The action type labels used in Layer 9 reference an action library that does not yet exist in the prompt.

**Specific dependency:** The length constraint table in Layer 9 §1 uses action type descriptions (probe, information release, help decline, etc.) because ACTION_01 through ACTION_10 labels are not meaningful to the model without the corresponding definitions in Layer 8. When Layer 8 is added in WP-02, Layer 9 should be updated to reference ACTION numbers directly and consistently.

**Risk realization scenario:** When WP-02 adds Layer 8 with specific action definitions, the action type descriptions in Layer 9 §1 may not map precisely to the WP-02 action library. If action categories in Layer 9 do not match the action library in Layer 8, the length constraints will be ambiguous.

**Recommended resolution:** When WP-02 delivers the action library, Layer 9 §1 must be updated to align action type names exactly with the WP-02 action library definitions. This is a planned Layer 9 revision, not a defect — it is a known dependency. The Layer 9 current formulation (using descriptive action type labels) is appropriate for WP-01 scope and will be updated at WP-02.

**No interim mitigation needed** — this risk is benign until WP-02 integration.

---

## RISK 05 — Prompt Overload Under Full Static Layer Assembly

**Risk Level:** Medium
**Source:** Implementation Decision (ID)
**Governing Artifact:** System Prompt Spec v1 §1 ("Enforcement Overload Warning"); Prompt Architecture v1 §2

**Description:**
Layer 1, Layer 2, and Layer 9 together constitute approximately 3,000–3,500 words of static prompt content. When Layer 8 (Action Library + Core Decision Loop — the longest layer) is added in WP-02/WP-03, and when dynamic injection layers (3–7, 10) are added in WP-04, total prompt size may approach or exceed an effective behavioral absorption threshold.

The System Prompt Spec v1 §5 "Enforcement Overload Warning" explicitly notes: "The runtime prompt must not attempt to enforce all 70 constitutional laws as explicit instructions. Prompt overloading produces two failure modes: the model fails to apply all instructions consistently under cognitive load, and the prompt consumes context window budget."

**Risk realization scenario:** After WP-04 completes full static + dynamic assembly, the model fails to consistently apply Layer 1 constitutional prohibitions that are specified early in a long prompt. The most safety-critical rules degrade in compliance because they are not in the model's active attention window during generation.

**Recommended resolution:**
- After WP-05 (First Working Examiner Integration), evaluate constitutional compliance rates across long sessions (exchange 20+). If compliance degrades in later exchanges, this is a prompt length signal.
- Layer 1 constitutional prohibitions may need to be implemented as runtime filters (hidden instructions, post-generation) rather than as visible prompt instructions. System Prompt Spec v1 §11 specifies this as the preferred long-term architecture for absolute prohibition lists.
- Context window budget allocation should be formally planned before WP-04 begins.

---

## RISK 06 — Constitutional Gate Framing Ambiguity

**Risk Level:** High
**Source:** Implementation Decision (ID)
**Governing Artifact:** System Prompt Spec v1 §2 Layer 9 Failure Risks

**Description:**
Layer 9 §2 specifies the Constitutional Gate as a mandatory pre-delivery checklist that the model applies to its own proposed responses before delivery. The System Prompt Spec v1 §2 explicitly warns: "Gate expressed as a request rather than a requirement — model treats it as optional."

The WP-01 implementation uses mandatory language ("Every proposed response must pass all six screens before delivery") and frames revision as unconditional ("If any screen fails, stop, revise the response, and restart the screen sequence from Screen 1"). However, a model that self-applies a gate to its own outputs faces inherent limitations: a model that would generate a neutrality violation may also fail to detect that violation when self-reviewing.

**Risk realization scenario:** The model generates a response containing "good" before a continuation probe. During self-review (Screen 1), it fails to detect "good" as a prohibited term in this context. The response passes through to delivery.

**Root cause:** This is an inherent limitation of prompt-level constitutional gate implementation. The System Prompt Spec v1 §11 "Translation to Hidden Instructions" section specifically addresses this: "Absolute prohibition lists should be implemented as runtime filters that intercept generated text before delivery, rather than as instructions the model is asked to follow voluntarily."

**Required resolution (WP-05 or WP-07):**
The Constitutional Gate in Layer 9 is specified correctly per the governing architecture and is appropriate as a prompt-level instruction. However, the System Prompt Spec v1 explicitly specifies that the gate should also be implemented as a hidden second-pass evaluation prompt (Category 2 hidden instruction). This hidden gate is the primary enforcement mechanism; the Layer 9 self-check is a secondary cue. The hidden gate implementation is WP-07 scope (Constitutional Gate Implementation). Until WP-07 is complete, Layer 9 Screen compliance depends entirely on model self-review.

**No interim mitigation beyond what is implemented.** This risk is known to the architecture and is addressed by the WP-07 specification. WP-01 has implemented the prompt-level component correctly; the runtime component is future scope.

---

## RISK 07 — Gold Standard Example Contrast Learning Completeness

**Risk Level:** Medium
**Source:** Specification Gap (SG)
**Governing Artifact:** Gold Standard Library v1 Part 4; Prompt Architecture v1 §6

**Description:**
The Gold Standard Library v1 Part 4 specifies: "The system prompt should also include 3–5 examples of incorrect responses for each failure mode, allowing the model to learn the contrast between compliant and non-compliant behavior." Layer 1 §6 includes correct responses (gold standard anchors) for six Tier 1 failure modes but does not include the corresponding incorrect response examples.

**Reason for current omission:** Including 3–5 incorrect response examples per failure mode for six failure modes would add approximately 800–1,200 words to Layer 1. This creates a context window pressure problem. The governing architecture notes that the complete Gold Standard Library (including all incorrect response examples) "is too long" and should not be included in full. Selective inclusion was necessary.

**Risk realization scenario:** Without contrast-learning negative examples in the prompt, the model's boundary between compliant and non-compliant behavior is established only by the prohibition lists and the positive gold standard anchors. Edge cases near the boundary (e.g., near-prohibited phrases like "that's an interesting approach") may not be reliably detected.

**Recommended resolution:**
At WP-05 evaluation, identify the specific failure modes where the model most frequently produces near-boundary violations. Add incorrect response examples specifically for those failure modes in Layer 1 §6 or Layer 9 §3. Context window budget must be verified before expansion.

---

## Summary Table

| Risk ID | Description | Level | Source | Resolution Timing |
|---|---|---|---|---|
| RISK-01 | Prohibition list completeness — enumeration may be incomplete | Critical | SG | Before WP-05: ABOG diplomate audit |
| RISK-02 | Assembler interface contract undefined | High | SG/IR | Before WP-04: formal contract specification |
| RISK-03 | Gold standard example selection boundary — 3 Tier 1 FMs without anchors | Medium | SG | WP-05 evaluation decision |
| RISK-04 | Layer 9 action type labels depend on Layer 8 definitions | High | IR | WP-02 integration: Layer 9 update required |
| RISK-05 | Prompt overload risk under full layer assembly | Medium | ID | WP-05 evaluation; hidden instructions (WP-07) |
| RISK-06 | Constitutional gate self-review limitation | High | ID/EB | WP-07: hidden constitutional gate implementation |
| RISK-07 | Negative contrast examples absent from gold standard anchors | Medium | SG | WP-05 evaluation decision |

**Critical risks (1):** RISK-01 — requires pre-WP-05 resolution by clinical team.
**High risks (3):** RISK-02 requires pre-WP-04 resolution; RISK-04 requires WP-02 integration update; RISK-06 is architecturally expected and addressed by WP-07 scope.
**Medium risks (3):** RISK-03, RISK-05, RISK-07 — all deferred to WP-05 evaluation with evidence-based resolution.

---

*Risks Document Version: WP-01-v1.0*
*Produced: 2026-06-19*
*Next review: WP-02 completion (RISK-04 resolution required)*
*Pre-WP-04 required: RISK-02 resolution*
*Pre-WP-05 required: RISK-01 resolution (ABOG diplomate audit)*
