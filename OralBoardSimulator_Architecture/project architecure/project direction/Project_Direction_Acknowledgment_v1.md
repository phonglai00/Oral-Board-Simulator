# Project Direction Acknowledgment
## AI ABOG Oral Board Simulator — Strategic Realignment
### Architecture-First Response to Project Update

**Date:** 2026-06-20
**Status:** Direction received and incorporated
**Governing Documents Reviewed:** All 21 project artifacts
**Constitutional Compliance:** Maintained throughout

---

## Part 1 — Acknowledgment of Strategic Direction

The following project direction decisions are acknowledged as authoritative and will govern all future architecture and implementation recommendations:

| Decision | Acknowledged |
|----------|-------------|
| Long-term goal is a dynamic Case Simulation Engine, not a static Q&A system | ✅ |
| Foundation is Case Representation → Runtime State → Case Simulation Engine | ✅ |
| The AI examiner reads simulation state; it does not BE the simulation engine | ✅ |
| Consequences depend on mistake severity (Minor / Moderate / Critical / Catastrophic) | ✅ |
| Same uploaded case supports multiple examination pathways | ✅ |
| Examiner operates as an evidence-gathering system estimating pass/fail probability | ✅ |
| Every case contains a hidden underlying story | ✅ |
| Highest-priority artifact: Case_Simulation_Engine_Architecture_v1 | ✅ |
| PDF corpus to be ingested only after three specified architecture artifacts are complete | ✅ |

---

## Part 2 — Gap Analysis Against Existing Artifacts

### What the Existing Architecture Stack Already Covers

The existing 12 governing architecture documents are more valuable than the strategic update implies — they specify components that sit *above* the Simulation Engine in the stack. They do not become obsolete. They become correctly positioned.

| Existing Artifact | Correct Position in New Architecture | Status |
|------------------|-------------------------------------|--------|
| Constitution v1.1 | Governs Examiner behavior layer — unchanged | Active |
| Runtime State Schema v1 | Partially covers simulation state; requires extension for patient physiological state | Requires extension |
| Decision Engine Specification v1 | Governs Examiner layer — correctly positioned above simulation engine | Active |
| System Prompt Specification v1 | Governs Examiner layer — correctly positioned | Active |
| Prompt Architecture v1 | Governs Examiner layer — correctly positioned | Active |
| Candidate Assessment Architecture v1 | Governs Assessment layer — correctly positioned | Active |
| Feedback Generation Architecture v1 | Governs Feedback layer — correctly positioned | Active |
| Evaluator Architecture v1 | Governs QA layer — correctly positioned | Active |
| Regression Architecture v1 | Governs Change Governance layer | Active |
| Gold Standard Library v1 | Governs Examiner behavioral benchmarks | Active |
| Failure Mode Test Suite v1 | Governs Examiner failure detection | Active |
| Realism Evaluation Rubric v1 | Governs Examiner evaluation | Active |

### What Is Missing — The Simulation Foundation Gap

The strategic update correctly identifies that three foundational architecture artifacts have not yet been produced:

| Missing Artifact | Gap Description | Priority |
|-----------------|----------------|---------|
| **Case_Simulation_Engine_Architecture_v1** | No specification for how case state is initialized from an uploaded case, how patient physiological state evolves, how consequence severity is calculated, or how the engine exposes state to the examiner | **HIGHEST — immediate** |
| **Examiner_Decision_Architecture_v1** | The existing Decision Engine Specification governs action selection, but does not specify how the examiner interfaces with the simulation engine as an external system vs. internal state. This artifact must re-specify the examiner's relationship to a runtime simulation state object it reads but does not control | **HIGH — after CSE** |
| **Question_Corpus_Architecture_v1** | No specification for how the PDF corpus is structured, indexed, and queried to support dynamic examination pathways. Must not treat the corpus as a question bank | **HIGH — after CSE and EDA** |

---

## Part 3 — Architectural Insight Formalization

### The Architectural Inversion the Update Identifies

The existing architecture stack was designed with the examiner at the center:

```
[Examiner Prompt] ← reads → [State Objects]
```

The strategic update correctly reframes this. The simulation engine is the center. The examiner is a consumer of simulation output:

```
[Case Upload]
      ↓
[Case Conversion Engine]    ← converts case to simulation-ready model
      ↓
[Case Simulation Engine]    ← owns patient state, manages clinical progression
      ↓
[State Objects]             ← Runtime State Schema (extended)
      ↓
[Examiner Decision Engine]  ← reads state, selects action
      ↓
[Examiner Prompt Layers]    ← generates constitutionally compliant response
      ↓
[Candidate]
      ↓
[Assessment Engine]         ← observes session, collects evidence
      ↓
[Feedback Engine]           ← produces educational output
```

### What the Runtime State Schema Currently Covers vs. What Is Needed

The existing Runtime State Schema v1 was designed to support prompt-layer state injection. It tracks:
- Examination session metadata
- Case progress (critical actions, clinical phase)
- Candidate behavior (communication style, verbosity, safety failures)
- Information release history
- Evolution event history
- Probe depth history
- Constitutional compliance log

**What it does not specify** — the patient physiological state model that the Simulation Engine must own:
- Physiological parameter values (hemodynamic status, laboratory trends, fetal condition)
- Consequence severity tier (Minor / Moderate / Critical / Catastrophic)
- Deterioration trajectory and pace
- Multiple simultaneous active pathophysiological processes
- The hidden underlying story — the full clinical truth known to the simulator
- Branching pathway state — which examination pathway this session is following

The Case Simulation Engine Architecture must specify this patient state model. The Runtime State Schema will then require a targeted extension to interface with it.

### The Separation of Concerns This Clarifies

| Concern | Owner | Not Owner |
|---------|-------|-----------|
| What is clinically true about this patient | Case Simulation Engine | Examiner |
| What the examiner reveals about the patient | Information Management Engine | Simulation Engine |
| What the examiner asks next | Decision Engine | Simulation Engine |
| Whether the examiner's response is constitutional | Constitutional Gate | Simulation Engine |
| What the candidate demonstrated | Assessment Engine | Examiner |
| How the patient changes after a management decision | Simulation Engine | Examiner |
| How the examiner reacts to that change | Examiner Decision Engine | Simulation Engine |

The examiner's constitutional obligation to never teach, never rescue, and never hint is entirely preserved under this architecture. The simulation engine produces clinical reality. The examiner reports it neutrally and probes it constitutionally.

---

## Part 4 — Case_Simulation_Engine_Architecture_v1 Scope Preview

Based on the strategic direction, the following components must be specified in the Case Simulation Engine Architecture. This is not the architecture itself — it is the scope definition for that artifact.

### Component 1 — Case Representation Model

The structure into which an uploaded case (whether a resident's case list, a structured template, or a free-text case) is converted. Must define:
- The clinical data fields the engine requires
- The hidden underlying story (full clinical truth, not visible to candidate)
- The information inventory (what becomes available under which conditions)
- The critical action map (what constitutes correct, acceptable, and unsafe management)
- Consequence parameters (severity tiers and deterioration parameters per missed action)
- Multiple valid pathway definitions (same case, different examination trajectories)

### Component 2 — Patient State Model

The representation of the patient's clinical condition at any moment in simulation time. Must define:
- Physiological parameters tracked by the engine
- Baseline state (case presentation)
- State transition rules (how parameters change in response to time, management decisions, and natural disease progression)
- The four consequence severity tiers:
  - **Minor**: Minimal consequence; patient remains stable; examiner continues probing
  - **Moderate**: Delayed deterioration; parameter drift begins; candidate has time to correct
  - **Critical**: Significant deterioration; clinical picture worsens measurably; urgency increases
  - **Catastrophic**: Rapid deterioration; patient at immediate risk; examiner forces safety-priority probing

### Component 3 — Case Conversion Engine

The process by which an uploaded case becomes a simulation-ready Case Representation. Must define:
- Accepted input formats (resident case list format, structured template, free text)
- Conversion validation (completeness check against Case Representation Model)
- Author-time vs. runtime generation (which fields are pre-authored vs. AI-generated at runtime)
- Clinical plausibility validation (biological consistency checks)

### Component 4 — Clinical Progression Engine

The logic governing how the patient's state changes over simulation time. Must define:
- Time advancement rules (when and how much simulated time passes per exchange)
- Natural disease progression (time-based deterioration independent of management decisions)
- Management response rules (how correct management improves or stabilizes state)
- Management consequence rules (how incorrect management produces deterioration at each severity tier)
- The cause-and-effect chain required by Constitution Laws 57–61

### Component 5 — Multiple Pathway Architecture

The mechanism by which the same underlying case supports different examination trajectories. Must define:
- Pathway branching triggers (which candidate decisions open which pathways)
- Pathway-specific information inventory (what information is available differs by pathway)
- Pathway-specific consequence parameters
- Pathway completion criteria (what constitutes a complete examination in each pathway)

### Component 6 — Simulation Engine / Examiner Interface

The contract between the Simulation Engine and the Examiner Decision Engine. Must define:
- What state fields the engine exposes to the examiner
- What state fields remain hidden (the hidden clinical truth not yet discoverable)
- How the examiner signals management decisions to the engine
- How the engine responds (state update + consequence calculation)
- The event notification model (engine → examiner: patient has deteriorated)

### Component 7 — Hidden Story Architecture

The specification for the underlying clinical narrative known to the simulator but not initially known to the candidate. Must define:
- How the hidden story is structured in the Case Representation
- What constitutes "discovery" (candidate has reached the hidden clinical truth through reasoning)
- How progressive discovery is tracked in state
- How the examiner's information release is governed by discovery state (Constitution Laws 60, 63)

---

## Part 5 — Revised Architecture Dependency Map

The strategic update requires inserting the Simulation Engine layer beneath the existing architecture stack. The revised dependency hierarchy:

```
ABOG Examiner Constitution v1.1                          [ROOT]
│
├── GOVERNANCE LAYER
│   ├── Implementation Roadmap v1 [UPDATE REQUIRED — new WP needed]
│   └── AI Board Examiner Table of Contents [UPDATE REQUIRED]
│
├── SIMULATION FOUNDATION LAYER  [GAP — artifacts not yet produced]
│   ├── Case_Simulation_Engine_Architecture_v1           [HIGHEST PRIORITY]
│   ├── Case_Representation_Model_v1                     [CSE dependency]
│   └── Question_Corpus_Architecture_v1                  [after CSE + EDA]
│
├── RUNTIME LAYER
│   ├── Runtime State Schema v1 [EXTENSION REQUIRED for patient state]
│   └── Examiner_Decision_Architecture_v1               [HIGH PRIORITY — after CSE]
│
├── EXAMINER BEHAVIOR LAYER [existing; correctly positioned]
│   ├── Decision Engine Specification v1
│   ├── System Prompt Specification v1
│   ├── Prompt Architecture v1
│   ├── Constitution v1.1 (behavioral law)
│   └── Action Library v1 [WP-02 deliverable]
│
├── ASSESSMENT & FEEDBACK LAYER [existing; correctly positioned]
│   ├── Candidate Assessment Architecture v1
│   └── Feedback Generation Architecture v1
│
└── EVALUATION & GOVERNANCE LAYER [existing; correctly positioned]
    ├── Realism Evaluation Rubric v1
    ├── Failure Mode Test Suite v1
    ├── Gold Standard Library v1
    ├── Evaluator Architecture v1
    └── Regression Testing Architecture v1
```

---

## Part 6 — Implications for the Implementation Roadmap

The existing Implementation Roadmap v1 was built around a prompt-first, static examiner model. The strategic update requires the following Roadmap-level changes. These are flagged for future revision of the Roadmap — not actioned here.

| Roadmap Element | Required Change |
|----------------|----------------|
| Phase 1 (Weeks 1–4): Examiner Core | Remains valid but is now Phase 2 — cannot build examiner before simulation engine exists |
| WP-04 (State Implementation) | Must be preceded by CSE Architecture; Runtime State Schema extension required |
| WP-10 (Case Library Phase 1) | Cases must be authored against the Case Representation Model, not the current CaseState schema |
| NEW WP: Case Simulation Engine Implementation | Required before WP-04 and WP-05 |
| NEW WP: Case Conversion Engine | Required for resident case list upload feature |
| PDF Corpus ingestion | Held pending CSE + EDA + QCA completion per project direction |

---

## Part 7 — Recommended Next Action

Per project direction, the highest-priority artifact is:

**`Case_Simulation_Engine_Architecture_v1`**

Before authoring this artifact, the following inputs should be confirmed:

| Input | Status | Notes |
|-------|--------|-------|
| Constitution v1.1 | Available | Governs what the examiner may and may not do with simulation output |
| Runtime State Schema v1 | Available | Defines current state objects; CSE Architecture will specify what extensions are needed |
| Decision Engine Specification v1 | Available | Defines how examiner consumes state; CSE Architecture must be compatible with this interface |
| Candidate Assessment Architecture v1 | Available | Defines what the assessment engine needs from simulation state |
| Strategic direction (this document) | Available | Consequence severity tiers, pathway multiplicity, hidden story, evidence-gathering examiner |

**The Case_Simulation_Engine_Architecture_v1 should be the next artifact produced.**

It will govern:
- How cases are represented internally
- How patient state is modeled and updated
- How consequences are calculated by severity tier
- How multiple examination pathways emerge from a single case
- How the hidden clinical story is structured and progressively revealed
- The interface contract between the Simulation Engine and the Examiner Decision Engine

When that architecture is complete, the following will become unblocked in sequence:
1. Runtime State Schema extension (patient state fields)
2. Examiner_Decision_Architecture_v1 (re-specifies examiner as state consumer)
3. Question_Corpus_Architecture_v1 (after both above)
4. PDF corpus ingestion

---

*Project Direction Acknowledgment v1.0*
*AI ABOG Oral Board Simulator*
*Date: 2026-06-20*
*All future recommendations will reflect the Case Simulation Engine as the architectural foundation.*
