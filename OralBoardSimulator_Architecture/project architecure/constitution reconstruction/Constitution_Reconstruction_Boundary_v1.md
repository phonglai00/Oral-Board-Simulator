# Constitution Reconstruction Boundary v1
**AI ABOG Oral Board Simulator**
**Date:** 2026-06-23
**Status:** Governance document only. Defines the rules that will bind any future reconstruction effort. No constitution text is produced here.

---

## Part 1 — Purpose

The purpose of constitutional reconstruction is to restore, as faithfully as the surviving evidence allows, the behavioral law that governs the AI examiner — without at any point substituting invented rules for missing ones. Reconstruction exists to **recover what was lost**, not to **author what was never written**. Where evidence ends, reconstruction must stop and disclose, not continue and guess. The reconstructed document's authority is derived entirely from its evidentiary traceability; any sentence that cannot be traced to a source artifact is not a reconstruction, it is a new rule wearing the constitution's authority without having earned it. The reconstruction effort's success is measured by how honestly it represents the boundary between recovered and unknown — not by how complete or polished the final document reads.

---

## Part 2 — Reconstruction Principles

**No invention of behavior.** No rule governing examiner conduct may be introduced into the reconstructed document unless it is traceable to surviving evidence (a quotation, a paraphrasable effect description, or a corroborated citation cluster). This extends the project's own stated philosophy ("no invention of behavior," `Implementation Roadmap v1.docx`) from implementation to governance.

**Evidence over assumption.** Plausibility is not evidence. A rule that "sounds like something this constitution would say" must not be written into Laws 1–56 on that basis alone. Every reconstructed sentence must point to a specific citation in `Constitution_Evidence_Ledger_v1.md`.

**Constitutional traceability.** Every reconstructed law and section must carry a visible citation trail back to its source artifact(s), consistent with how the existing architecture documents already cite "Constitutional Law: N" — reconstruction must not break that existing traceability convention, and must extend it to itself (i.e., the reconstructed document must be self-auditable the same way the original was audited in the Constitutional Consistency Audit Report).

**Preservation of uncertainty.** Confidence level is permanent metadata, not a scaffold to be discarded once a sentence is drafted. A Medium-confidence law must still read as Medium-confidence in the final document — it must not be smoothed into prose that looks as authoritative as a High-confidence, verbatim-quoted law. Uncertainty that gets "lost in the writing" is a fabrication risk, even if no new facts were invented.

**Explicit gap disclosure.** Every law and section with no evidence must be visibly marked as missing in the document itself — not omitted, not silently renumbered, not filled with placeholder text that could be mistaken for content. A reader of the reconstructed document must be able to tell, at a glance, which parts are real and which parts do not exist.

---

## Part 3 — Law Reconstruction Rules

### High Confidence (9 laws: 2, 30, 41, 42, 49, 50, 53, 54, 56)
**Allowed:**
- Direct verbatim transcription of the quoted source text.
- Minimal normalization of punctuation/capitalization to match the surviving Section 15/16 style, provided no wording is altered.
- Citation of the exact source artifact and location for each.

**Prohibited:**
- Paraphrasing or "improving" the wording of a verbatim quote.
- Adding examples, elaboration, or illustrative scenarios not present in the source (Sections 15–16 contain worked examples, but Laws 1–56 quotations recovered so far do not — do not invent examples to match that style).
- Merging a High-confidence law with adjacent Medium/Low-confidence material into a single combined sentence that obscures which part is verbatim.

### Medium Confidence (22 laws)
**Allowed:**
- Paraphrase strictly limited to the effect/behavior already described in the source artifact (e.g., Decision Engine Spec's description of Law 10's prohibition on reassurance phrases).
- Inclusion of the specific example phrases already given in the source (e.g., "don't worry," "you're doing fine") as illustrations, since these are themselves sourced, not invented.
- A confidence flag inline or in metadata identifying the law as a paraphrase, not a quotation.

**Prohibited:**
- Extending the described effect beyond what the source states (e.g., inferring additional prohibited words for Law 41/42-style laws that were never cited).
- Resolving ambiguity in the source by guessing — if a source describes an effect loosely, the reconstructed text must preserve that looseness rather than sharpening it into false precision.
- Presenting the paraphrase typographically identical to a High-confidence verbatim quote (no visual conflation of tiers).

### Low Confidence (13 laws)
**Allowed:**
- A scope statement only — naming the topic cluster the law belongs to and the laws it is paired with in every surviving citation (e.g., "Law 18 — paired with Law 23 in all surviving citations; concerns confirming candidate requests for help/hints").
- Explicit statement that the law's distinguishing content (how it differs from its citation partners) is unknown.

**Prohibited:**
- Writing a standalone behavioral rule that asserts what specifically distinguishes this law from the others in its citation cluster — that information does not survive in any source.
- Treating repetition of the same ambiguous pairing across multiple documents as if it increases specificity (it increases confidence that the cluster exists, not what each member uniquely says).

### No Evidence (12 laws: 12, 13, 17, 24, 31, 32, 33, 35, 40, 43, 44, 48)
**Prohibited (absolute):**
- Any behavioral text whatsoever, including "best guess" rules inferred from neighboring law numbers, thematic gap-filling, or stylistic pattern-matching to Sections 15–16.
- Silent renumbering, deletion, or merging of these law numbers to make the document appear complete.
- Placeholder text that resembles a real rule (e.g., a generic restatement of Law 1's neutrality principle relabeled as Law 13) — this is invention by substitution and is exactly what this boundary document exists to prevent.

---

## Part 4 — Gap Handling Policy

Laws **12, 13, 17, 24, 31, 32, 33, 35, 40, 43, 44, and 48** will be represented in the reconstructed document using a standardized, visually distinct gap marker at each law's position in the sequence:

```
**Law N:** [UNRECOVERABLE — no surviving evidence in any reviewed artifact.
Status: Gap Registry, Constitution_Evidence_Ledger_v1.md, Part 5.
Recovery path: original Chat 1/Chat 2 source conversations, if they exist outside this repository.]
```

Rules governing this marker:
1. The marker must appear in numerical sequence — the law number is preserved, not skipped, so the 1–70 sequence remains intact and consistent with the confirmed continuation at Law 57.
2. The marker must never be abbreviated to something that could be mistaken for brevity-of-style rather than absence-of-content (e.g., never just "Law 13: —").
3. The marker must cite the Gap Registry entry it corresponds to, preserving the forensic chain from this boundary document back through the Evidence Ledger to the original scan.
4. If any of these 12 laws is later recovered (e.g., from original chat transcripts), the marker is replaced entirely and the change is logged as a new evidence event, not a silent edit.
5. These 12 gap markers must not be counted toward any "completeness" statistic presented for the reconstructed document — a document with 12 explicit gaps is not 100% complete regardless of how clearly the gaps are marked.

---

## Part 5 — Validation Requirements

Before any reconstructed law or section text is considered provisionally accepted, it must be checked against each of the following without introducing new contradictions beyond those already known and tracked:

- **Prompt Architecture v1** — every Layer 1–10 citation of a constitutional basis must still resolve to text (or an explicit gap marker) at the corresponding law/section in the reconstructed document; no layer may be left pointing at nothing.
- **Decision Engine Specification v1** — the Constitutional Gate's six screens, and the existing MISSING-03 gap (Law 49 enforcement), must remain consistent with reconstructed Laws 41, 42, 49, 51, 52, and the gap markers for any law the Decision Engine cites that falls in the No-Evidence tier.
- **Runtime State Schema v1** — field-level constitutional tags (including the known MISSING-04 gap on Law 56 rephrase-tracking) must continue to point at the correct reconstructed law text or gap marker.
- **Examiner System Prompt Specification v1** — the enforcement-mapping table's law-to-layer assignments must not be invalidated by reconstruction; any law cited there that falls in the Low or No-Evidence tier must be flagged in the validation pass as a known weak link, not silently strengthened.
- **Failure Mode Test Suite v1** — each of the 70 failure modes' "Constitutional Law: N" field must resolve to either reconstructed text or an explicit gap marker; no failure mode may be left citing a law that has been silently altered in meaning from what the FM entry implies.
- **Gold Standard Examiner Library v1** — the 20 gold-standard exchange examples (including the Law 50 example) must remain compatible with the reconstructed phrasing; any rewording of a Medium-confidence law must be re-checked against every example that cites it.
- **Constitutional Consistency Audit Report** — every existing PASS/WARNING/FAIL verdict, and every MISSING-0X/CONFLICT-0X finding, must be explicitly carried forward into the reconstructed document's appendices. A reconstruction that causes a prior PASS to become inconsistent, or that silently resolves a prior WARNING without new evidence, fails validation.

Validation is a **gate**, not a final-polish step — no reconstructed section is published, even internally, until each of the seven artifacts above has been checked against it.

---

## Part 6 — Reconstruction Completion Criteria

A reconstructed constitution may be considered **complete** (not "perfect" or "final," but ready for use as a governing artifact) only when all of the following hold simultaneously:

1. All 9 High-confidence laws are present as verbatim transcriptions with source citations.
2. All 22 Medium-confidence laws are present as paraphrases, each visibly tagged with its confidence tier and source.
3. All 13 Low-confidence laws are present as scope statements only, each visibly tagged and citing its pairing cluster.
4. All 12 No-Evidence laws are present as the standardized gap marker defined in Part 4 — none omitted, none silently filled.
5. Sections 1–14 each carry, at minimum, a title/scope statement with its confidence tier (per the Section Inventory in the Evidence Ledger); Sections 1 and 8 are explicitly flagged as structurally unconfirmed.
6. Sections 15–16 are reproduced verbatim from the recovered primary source, unmodified.
7. The full validation pass (Part 5) has been run against all seven dependent artifacts with zero new, unexplained contradictions.
8. A visible, permanent confidence ledger (per-law, per-section) is published alongside the document itself — not as a separate appendix that can be lost or detached, but bound into the same file or an inseparable companion file.
9. The document carries an explicit statement that it is a reconstruction, not a recovery, and names its evidentiary basis (this boundary document and the Evidence Ledger) as its own governing authority for how it was produced.

Completion under these criteria does **not** mean the document is free of gaps — it means the gaps are fully and honestly accounted for. A document satisfying all nine criteria with 12 explicit law-gaps remaining is "complete" under this policy; a document with zero visible gaps achieved by inventing content is not, regardless of how polished it looks.

---

## Part 7 — Recommendation

**Adopt Path A — Conservative Constitution v1.1 Reconstruction.**

This boundary document is written entirely in service of Path A; Path B (Interpretive Reconstruction, filling the 12 No-Evidence laws and the Section 1–14 body prose by inference) is incompatible with the "No invention of behavior" principle stated in Part 2 and already adopted by the project. A reconstruction governed by these rules cannot simultaneously satisfy Path B's goal of functional completeness, because functional completeness for the 12 No-Evidence laws is achievable only by invention — which Part 3 prohibits absolutely.

**Constitution v2.0 creation (Part 7.B) is not recommended at this stage**, for the same reason stated in the prior Evidence Ledger: v2.0 is a forward-looking governance decision, and it cannot be soundly made until a validated v1.1 conservative reconstruction exists as a stable baseline to revise from. Pursuing v2.0 before completing Path A risks conflating "what the original constitution said" with "what we now think it should say" — a distinction this entire reconstruction effort exists to preserve.

---

*Boundary document only. No constitution generated. No repository files modified, committed, or pushed.*
