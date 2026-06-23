# Simulator_System_Architecture_v1
**AI ABOG Oral Board Simulator — System-Level Architecture**
**Date:** 2026-06-23
**Status:** Review draft only. Not yet approved. Precedes `Case_Simulation_Engine_Architecture_v1`.

---

## Part 0 — Inputs Incorporated

| # | Input | How it's reflected below |
|---|---|---|
| 1 | Project_Direction_Acknowledgment_v1 | Simulation-engine-centric inversion adopted as the system's spine (Part 1) |
| 2 | Constitution_Evidence_Ledger_v1 | Constitutional Layer placed as a cross-cutting governance layer over the Examiner, not a component itself; confidence-tiered laws remain the authority source, not this document |
| 3 | Constitution_Reconstruction_Boundary_v1 | "No invention of behavior" principle extended to case content (Part 5, Ownership Boundaries) and to this document's own scope discipline |
| 4 | Runtime State concepts | Modeled as a shared, multi-owned state substrate (Part 2, Component 5) rather than a single object |
| 5 | Decision Engine concepts | Reframed per Design Input #3/#5 as uncertainty-reduction, not checklist coverage (Part 2, Component 7) |
| 6 | Candidate Assessment concepts | Positioned as a continuous observer, not a post-hoc scorer (Part 2, Component 8) |
| 7 | Feedback Generation concepts | Positioned strictly downstream of Assessment, unblocked only after session close (Part 2, Component 9) |
| 8 | ABOG Case List PDF impact assessment | Case Conversion Engine and Blueprint Engine scoped directly from real case-list structure (Part 2, Components 3 & 4) |
| 9 | Blueprint Coverage requirements | New first-class engine — Blueprint Engine — not folded into Decision Engine (Part 6) |
| 10 | Candidate-uploaded case list vision | Case Conversion Engine treated as a system-level ingestion path, not an internal CSE detail (Part 2, Component 3) |
| 11 | One Case → Many Pathways | Pathway state modeled as engine output, owned by CSE, consumed read-only downstream (Part 5) |
| 12 | Hidden Story principle | `groundTruth` object kept structurally separate from `revealedState` at the ownership level (Part 5) |
| 13 | Examiner as evidence-gathering system | Decision Engine's optimization target is pass/fail uncertainty reduction, not coverage (Part 2, Component 7) |

This document does not author the Case Simulation Engine itself — it establishes the system boundary the CSE must fit inside.

---

## Part 1 — High-Level Architecture Diagram (text format)

```
                              ┌────────────────────────────┐
                              │   CANDIDATE CASE UPLOAD     │
                              │  (case list / template /    │
                              │   free text)                │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌────────────────────────────┐
                              │   CASE CONVERSION ENGINE    │
                              │  parses, normalizes, flags  │
                              │  gaps, builds Case          │
                              │  Representation objects     │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌────────────────────────────┐
                              │      BLUEPRINT ENGINE       │
                              │  maps candidate's full case  │
                              │  list against ABOG blueprint │
                              │  topics; flags coverage gaps │
                              └──────────────┬───────────────┘
                                             │ (coverage map + selected case)
                                             ▼
                              ┌────────────────────────────┐
                              │   CASE SIMULATION ENGINE    │
                              │  owns patient ground truth,  │
                              │  pathway generation,         │
                              │  severity/deterioration,      │
                              │  hidden story                │
                              └──────────────┬───────────────┘
                                             │ (revealedState, events)
                                             ▼
                              ┌────────────────────────────┐
                              │      RUNTIME STATE          │
                              │  (shared substrate; multiple  │
                              │   owners write distinct       │
                              │   slices — see Part 5)        │
                              └──────────────┬───────────────┘
                                             │
                         ┌───────────────────┼────────────────────┐
                         ▼                   ▼                    ▼
            ┌─────────────────────┐ ┌──────────────────┐ ┌─────────────────────┐
            │ EXAMINER DECISION    │ │ CONSTITUTIONAL    │ │ CANDIDATE ASSESSMENT │
            │ ENGINE                │ │ GATE (cross-cut)  │ │ ENGINE               │
            │ selects next probe;   │ │ screens examiner  │ │ continuously observes │
            │ reduces pass/fail     │ │ output against    │ │ session, builds        │
            │ uncertainty           │ │ Constitution laws │ │ competence estimate    │
            └──────────┬────────────┘ └─────────┬──────────┘ └──────────┬─────────────┘
                       │                         │                      │
                       ▼                         ▼                      │
            ┌─────────────────────────────────────────┐                 │
            │      EXAMINER PROMPT / DIALOGUE LAYER     │                 │
            │   generates constitutionally-compliant     │                 │
            │   spoken/written output to candidate        │                 │
            └──────────────────┬───────────────────────┘                 │
                                ▼                                         │
                          ┌───────────┐                                  │
                          │ CANDIDATE │                                  │
                          └─────┬─────┘                                  │
                                │ (response)                              │
                                └──────────────────────────────────────────┘
                                                                           │
                                                                           ▼
                                                              ┌─────────────────────┐
                                                              │  FEEDBACK GENERATION │
                                                              │  ENGINE (post-session)│
                                                              └─────────────────────┘
```

Candidate responses re-enter the Case Simulation Engine (management decisions affect patient state) and the Candidate Assessment Engine (evidence toward competence estimate) simultaneously — this is a fan-out, not a single linear return path.

---

## Part 2 — Major System Components and Responsibilities

| # | Component | Responsibility |
|---|---|---|
| 1 | **Case Conversion Engine** | Ingests uploaded case lists (PDF/template/free text) per the ABOG case-list impact assessment; normalizes domain shorthand into structured Case Representation objects; flags incomplete/ambiguous rows rather than inferring silently; retains raw input for provenance. |
| 2 | **Case Representation Model** | The structured, static "ground truth" shape each converted case is stored as (data model, not a running engine) — referenced by both Blueprint Engine and Case Simulation Engine. |
| 3 | **Blueprint Engine** | Maintains the ABOG blueprint topic list; maps a candidate's full uploaded case set against it; identifies under-covered topics; informs case/pathway selection so that a session's case choice and hypothetical extensions close blueprint gaps rather than only reflecting what the candidate already experienced clinically. |
| 4 | **Case Simulation Engine (CSE)** | Owns patient ground truth (hidden story), generates multiple examination pathways from one case, applies severity-scaled deterioration/consequence rules, and exposes only governed slices of state outward. Does not decide what to ask or how to phrase it. |
| 5 | **Runtime State** | The shared state substrate. Not a single owner — different fields are owned by different upstream engines and read by downstream ones (see Part 5). Provides the interface contract, not the content. |
| 6 | **Constitutional Gate** | Cross-cutting screen (not a pipeline stage) that validates Examiner output against confidence-tiered Constitution laws (per the Evidence Ledger/Boundary doc) before anything reaches the candidate. Operates on the Examiner Prompt/Dialogue Layer's output, not on simulation state. |
| 7 | **Examiner Decision Engine** | Reads Runtime State (never writes patient truth); selects the next probe by estimating which question most reduces uncertainty about pass/fail status (Design Input #3/#5) — not by checklist/topic-coverage completion. |
| 8 | **Examiner Prompt / Dialogue Layer** | Converts the Decision Engine's selected action into constitutionally-governed spoken/written output; this is the only component that talks to the candidate. |
| 9 | **Candidate Assessment Engine** | Continuously observes the session (not just per-question) and maintains a running competence-estimate / uncertainty representation; supplies the Decision Engine's uncertainty-reduction calculation and the eventual session-level scorecard. |
| 10 | **Feedback Generation Engine** | Strictly post-session; consumes the Assessment Engine's final competence record and produces prioritized, personalized coaching output. Has no read access to the Examiner Decision Engine or CSE during the live session. |

---

## Part 3 — Data Flow Between Components (summary)

1. Candidate Case Upload → Case Conversion Engine → Case Representation objects.
2. Case Representation objects → Blueprint Engine (coverage analysis) and → Case Simulation Engine (in parallel; Blueprint Engine's output influences which case/pathway CSE is asked to run, but does not alter CSE's internal patient truth).
3. Case Simulation Engine → Runtime State: writes patient ground truth (hidden, not exposed downstream), revealedState (governed, exposed), pathway/branch state, severity/deterioration events.
4. Runtime State → Examiner Decision Engine (reads revealedState + competence estimate; never reads groundTruth directly) and → Candidate Assessment Engine (reads candidate response history + revealedState).
5. Examiner Decision Engine → Examiner Prompt/Dialogue Layer → Constitutional Gate (screen) → Candidate.
6. Candidate response → fans out to: (a) Case Simulation Engine, if the response constitutes a management decision affecting patient state; (b) Candidate Assessment Engine, as evidence updating the competence estimate.
7. Candidate Assessment Engine's running estimate feeds back into Examiner Decision Engine (closes the adaptive-testing loop) continuously during the session.
8. At session close, Candidate Assessment Engine's finalized record → Feedback Generation Engine (one-way, post-hoc).

---

## Part 4 — Ownership Boundaries (general principle)

Each engine owns its outputs and exposes only governed read interfaces to other components — no component reaches into another's internal state directly. This mirrors the Constitution Reconstruction Boundary's "no invention of behavior" discipline applied to runtime architecture: a component must never assert or alter a fact about a domain it doesn't own (e.g., the Examiner Decision Engine must never decide what is clinically true; the Feedback Engine must never alter the candidate's assessed competence after the fact).

---

## Part 5 — Component Ownership of Specific Concerns

| Concern | Owner | Explicitly NOT owner |
|---|---|---|
| **Patient truth** (groundTruth / hidden story) | Case Simulation Engine | Examiner Decision Engine, Examiner Prompt Layer, Runtime State (Runtime State only stores what CSE writes to it) |
| **Information release** (what becomes visible, and when) | Case Simulation Engine (governs the four information categories: automatic, candidate-elicited, ordered, interpreted), enacted through Runtime State's revealedState slice | Examiner Decision Engine (decides *what to ask about* released information, not *whether* it's released) |
| **Blueprint coverage** | Blueprint Engine | Case Simulation Engine (CSE has no awareness of blueprint topics — it only runs the case it's given), Examiner Decision Engine (consumes coverage state but does not compute it) |
| **Candidate assessment** | Candidate Assessment Engine | Examiner Decision Engine (uses the estimate, doesn't own or directly compute the scorecard), Feedback Generation Engine (consumes the finalized record, doesn't recompute it) |
| **Question selection** | Examiner Decision Engine | Case Simulation Engine (CSE has no say in what's asked), Blueprint Engine (informs case/pathway selection at session setup, not turn-by-turn question selection) |

---

## Part 6 — Future Core Engines Identified

Three engines are identified as the system's structural core, each requiring its own dedicated architecture artifact:

1. **Blueprint Engine** — newly identified in this document (surfaced by the ABOG Case List PDF impact assessment, Design Input #9/#10). Not previously scoped as a standalone engine in the prior Strategic Realignment 7-component CSE preview; it sits upstream of and is distinct from the CSE.
2. **Case Simulation Engine** — previously identified as highest-priority missing artifact; this document confirms and narrows its boundary (owns patient truth, pathway generation, severity tiers, hidden story; does not own blueprint coverage or question selection).
3. **Examiner Decision Engine** — previously identified as high-priority, after CSE; this document confirms its reframed optimization target (pass/fail uncertainty reduction per Design Input #3/#5) and clarifies it is a pure consumer of Runtime State, never a writer of patient truth or blueprint coverage.

---

## Part 7 — Dependency Order for Future Architecture Documents

```
1. Simulator_System_Architecture_v1            [THIS DOCUMENT — establishes boundaries]
        │
        ▼
2. Case_Simulation_Engine_Architecture_v1       [defines Case Representation Model,
                                                  Patient State Model, Case Conversion
                                                  Engine, Clinical Progression Engine,
                                                  Multiple Pathway Architecture,
                                                  Simulation Engine/Examiner Interface,
                                                  Hidden Story Architecture]
        │
        ▼
3. Blueprint_Engine_Architecture_v1             [NEW — defines blueprint topic model,
                                                  coverage scoring, case/pathway
                                                  selection influence; depends on Case
                                                  Representation Model from step 2]
        │
        ▼
4. Examiner_Decision_Architecture_v1            [re-specifies examiner as a state
                                                  consumer; depends on both CSE's
                                                  exposed interface (step 2) and
                                                  Blueprint Engine's coverage state
                                                  (step 3)]
        │
        ▼
5. Runtime_State_Architecture (extension)       [formalizes the multi-owner state
                                                  substrate described in Part 5;
                                                  can only be finalized once steps
                                                  2–4 have defined what each owner
                                                  writes]
        │
        ▼
6. Question_Corpus_Architecture_v1              [as previously sequenced — after CSE
                                                  and Examiner Decision Architecture]
```

Candidate Assessment Architecture and Feedback Generation Architecture remain correctly positioned as existing, already-active layers (per the Strategic Realignment document) and are not blocking dependencies for steps 2–6, but should be revalidated against the Candidate Assessment Engine's continuous-observation role (Part 2, Component 9) once step 4 is complete.

---

## Part 9 — Future Knowledge Assets

Two knowledge assets are anticipated but not yet implemented. Both are *inputs* into existing components — neither introduces a new owner, alters the ownership table in Part 5, or changes the dependency order in Part 7.

### 1. Examiner Knowledge Corpus

A future structured corpus of board-style question material: PDF question banks, recorded questioning patterns, and board-style probe phrasings. Not yet implemented; this is forward-looking scope only.

- **Consumed by:** Examiner Decision Engine, as additional candidate probe material when selecting a next question.
- **Not an owner of:** question selection. The corpus is a library the Decision Engine may draw from — it does not decide what gets asked, when, or why. That authority remains entirely with the Examiner Decision Engine, per Part 5.
- **Relationship to existing roadmap item:** this is the same artifact previously sequenced as `Question_Corpus_Architecture_v1` (Part 7, step 6). This section does not move it earlier in the dependency order — it remains last, after the Examiner Decision Engine's interface is defined, since the corpus is consumed by that engine and cannot be specified before the engine's consumption contract exists.

### 2. Resident Recall Intelligence Layer

A future, optional layer aggregating resident recollections of recent oral board sessions — emerging examiner trends, shifting blueprint emphasis, informally observed questioning patterns not yet reflected in formal blueprint documentation.

- **Consumed by:** Blueprint Engine, as an optional secondary signal alongside the formal ABOG blueprint topic list, when assessing coverage gaps or weighting which topics deserve more probing attention.
- **Not an owner of:** blueprint coverage itself. The Blueprint Engine remains the sole owner of coverage determination (Part 5); this layer only supplies an additional, lower-confidence signal the Blueprint Engine may weigh — it does not compute coverage independently or bypass the Blueprint Engine to influence question selection or case selection directly.
- **Confidence handling:** consistent with the evidentiary discipline established in `Constitution_Reconstruction_Boundary_v1`, any signal from this layer must be tagged by provenance/confidence (formal blueprint vs. informal resident recall) and must never be presented to downstream components as equivalent in authority to the formal blueprint — this preserves the same "preservation of uncertainty" principle already adopted for constitutional reconstruction, applied here to blueprint signal quality.

### Why neither asset changes existing boundaries

Both assets are **inputs consumed by an existing owner**, not new owners and not new write paths into Runtime State. The Examiner Knowledge Corpus only enriches what material the Decision Engine has available; the Resident Recall Intelligence Layer only enriches what signal the Blueprint Engine weighs. Neither asset gains write access to patient truth, information release, candidate assessment, or question selection — the five ownership rows in Part 5 are unchanged.

---

## Part 10 — Explicit Non-Scope of This Document

This document does not specify: physiological parameter schemas, severity-tier transition logic, blueprint topic taxonomy, probe-selection algorithms, or assessment scoring formulas. Those belong to the architecture documents sequenced in Part 7 and must not be inferred from this document's diagrams.

---

*Review draft only. No architecture finalized. No code modified. No repository files committed or pushed.*
