# AI ABOG Oral Board Simulator — Complete Artifact Inventory

**Date:** 2026-06-20
**Scope:** All artifacts currently present in Project Files
**Total Artifacts:** 21
**Methodology:** Architecture-first inventory; artifact status and classification determined from content inspection, Table of Contents, Implementation Roadmap v1, and Constitutional Consistency Audit v1.
**Authority:** This inventory does not modify, supersede, or rank artifacts — it describes them as they exist.

---

## Classification Definitions

| Category | Definition |
|----------|-----------|
| **Governance** | Defines behavioral law, quality standards, behavioral benchmarks, or project scope — artifacts that other artifacts must comply with |
| **Architecture** | Defines system structure, component behavior, data schemas, or decision logic — specifies what the system does and how |
| **Evaluation** | Defines how system quality is measured, tested, validated, or scored |
| **Implementation** | Prompt files, work package outputs, traceability records, or runtime layer files produced during implementation work packages |

| Status | Definition |
|--------|-----------|
| **Active Governing Artifact** | Currently authoritative; all implementation work must comply with this artifact |
| **Historical Reference** | Superseded by a later version; retained for lineage and diff purposes only |
| **Future Implementation Reference** | Governs a future work package; not yet operationalized but authoritative for that scope |

---

## Artifact Inventory

| # | Exact Filename | Category | One-Sentence Purpose | Primary Dependencies | Status |
|---|---------------|----------|---------------------|---------------------|--------|
| 1 | `ABOG_Examiner_Constitution_v1_1_Consolidated.md` | Governance | Defines the complete behavioral law of the AI examiner across 70 laws and 16 sections, serving as the single authoritative source of all permitted and prohibited examiner behaviors. | None — this is the root authority | **Active Governing Artifact** |
| 2 | `ABOG_Examiner_Constitution_v1.docx` | Governance | Contains the v1.1 addendum text (Sections 15 and 16 only — Case Evolution Philosophy and Information Management Laws 57–70) that was subsequently consolidated into the v1.1 Consolidated document. | ABOG_Examiner_Constitution_v1_1_Consolidated.md (consolidates this) | **Historical Reference** |
| 3 | `AI_board_examiner_Table_of_Contents.docx` | Governance | Establishes the project artifact hierarchy, identifies the four highest-priority domain knowledge documents, and categorizes all artifacts by subsystem. | None | **Active Governing Artifact** |
| 4 | `Examiner_Realism_Evaluation_Rubric_v1.docx` | Evaluation | Defines the 12-domain scoring rubric (Domains 1–12, weighted 5–15%) used to measure examiner behavioral fidelity against real ABOG oral board examiner standards. | Constitution v1.1 | **Active Governing Artifact** |
| 5 | `Examiner_Failure_Mode_Test_Suite_v1.docx` | Evaluation | Catalogs all 70 identified examiner failure modes with constitutional law mappings, tier classifications (Tier 1–3), and behavioral descriptions used to stress-test examiner compliance. | Constitution v1.1; Examiner Realism Evaluation Rubric v1 | **Active Governing Artifact** |
| 6 | `Gold_Standard_Examiner_Library_v1.docx` | Evaluation | Provides the canonical behavioral benchmarks for the AI examiner — 8 recurring principles, 10 high-fidelity behaviors, 10 simulation failure behaviors, and 20 gold standard exchange examples with constitutional mappings. | Constitution v1.1; Examiner Realism Evaluation Rubric v1 | **Active Governing Artifact** |
| 7 | `Examiner_Evaluator_Architecture_v1.docx` | Evaluation | Specifies the multi-layer system that evaluates AI examiner quality across 12 rubric domains, including automated scoring, calibration analysis, constitutional gate verification, and human expert review protocols. | Constitution v1.1; Examiner Realism Evaluation Rubric v1; Failure Mode Test Suite v1; Gold Standard Library v1; Decision Engine Specification v1; Runtime State Schema v1 | **Active Governing Artifact** |
| 8 | `Regression_Testing_Architecture_v1.docx` | Evaluation | Defines the 7-layer regression testing system, formal test case schema, Tier 1/2/3 test suites, baseline management, release decision framework, and longitudinal drift detection for governing all changes to the AI examiner system. | All 9 prior governing architecture documents; Constitution v1.1 | **Active Governing Artifact** |
| 9 | `Examiner_Prompt_Architecture_v1.docx` | Architecture | Defines the 10-layer prompt architecture for the AI examiner system, specifying the purpose, inputs, outputs, content, dependencies, and failure risks of each layer from Constitutional Layer (Layer 1) through Runtime Action Layer (Layer 10). | Constitution v1.1; Decision Engine Specification v1; Runtime State Schema v1; System Prompt Specification v1 | **Active Governing Artifact** |
| 10 | `Examiner_Runtime_State_Schema_v1.docx` | Architecture | Defines the complete runtime state object model for the AI examiner, including all state objects (CaseState, CandidateState, ProbeState, InformationState, EvolutionState, ConversationState, ExaminationState, ConstitutionalState) with field-level constitutional tags. | Constitution v1.1; Decision Engine Specification v1 | **Active Governing Artifact** |
| 11 | `Examiner_Decision_Engine_Specification_v1.docx` | Architecture | Specifies the complete 12-step Core Decision Loop, Action Library (10 actions), Probe Selection Engine, Information Release Engine, Evolution Engine, Case Closure Engine, and Constitutional Gate (6 screens) that govern all examiner decision-making at runtime. | Constitution v1.1; Runtime State Schema v1; Gold Standard Library v1; Failure Mode Test Suite v1 | **Active Governing Artifact** |
| 12 | `Examiner_System_Prompt_Specification_v1.docx` | Architecture | Specifies the content, purpose, inputs, outputs, and failure risks of each of the 10 system prompt layers, defining the interface between the governing architecture documents and the prompt implementation, including the constitutional law enforcement table and output contract. | Constitution v1.1; Prompt Architecture v1; Decision Engine Specification v1; Runtime State Schema v1; Gold Standard Library v1 | **Active Governing Artifact** |
| 13 | `Examiner_Prompt_Architecture_v1.docx` | Architecture | *(See row 9 — same artifact; listed once)* | — | — |
| 14 | `Candidate_Assessment.docx` | Architecture | Defines the candidate evidence collection pipeline, critical action tracking schema, competency assessment framework, unsafe action detection system, and scoring architecture that measures candidate performance during the oral board simulation. | Constitution v1.1 (esp. Section 13); Examiner Realism Evaluation Rubric v1; Runtime State Schema v1 | **Active Governing Artifact** |
| 15 | `The_Feedback_Generation_Architecture_v1.docx` | Architecture | Provides a summary reference to the completed 15-section Feedback Generation Architecture, covering the 8-layer feedback pipeline, 5-tier finding prioritization, 7 coaching strategies, narrative framework, learning plan architecture, and QA standards for post-examination candidate feedback. | Constitution v1.1; Candidate Assessment Architecture v1; Examiner Evaluator Architecture v1 | **Active Governing Artifact** *(note: substantive content is a summary form — full architecture was produced conversationally; see Constitutional Consistency Audit Finding CONFLICT-03)* |
| 16 | `Implementation_Roadmap_v1.docx` | Governance | Defines the 14-work-package implementation plan, implementation philosophy (no invention of behavior), system breakdown into 6 subsystems, and acceptance criteria for each work package governing all implementation activity. | All 12 governing architecture documents | **Active Governing Artifact** |
| 17 | `layer_01_constitutional.md` | Implementation | WP-01 prompt layer implementing the absolute prohibition list, fourth wall rule, forbidden behavior categories, mandatory response overrides, and gold standard behavioral anchors for the examiner system prompt Constitutional Layer. | Constitution v1.1; System Prompt Specification v1 §2; Prompt Architecture v1 Layer 1; Decision Engine Spec v1 §10; Gold Standard Library v1 | **Active Governing Artifact** *(WP-01 deliverable; governs WP-05 prompt assembly)* |
| 18 | `layer_02_identity.md` | Implementation | WP-01 prompt layer implementing the examiner identity declaration, communication style requirements, ABOG authenticity standards, calibration consistency rules, and language register constraints for the examiner system prompt Identity Layer. | Constitution v1.1 Law 50; System Prompt Specification v1 §2; Examiner Realism Evaluation Rubric v1 Domain 11; Gold Standard Library v1 Part 1 | **Active Governing Artifact** *(WP-01 deliverable; governs WP-05 prompt assembly)* |
| 19 | `layer_09_output_constraints.md` | Implementation | WP-01 prompt layer implementing action-type-specific response length maximums, all six Constitutional Gate screens (Neutrality, Hinting, Rescue, Teaching, Authenticity, Length), prohibited output patterns with examples, and the ABOG authenticity pre-delivery test. | Constitution v1.1; Decision Engine Specification v1 §10; System Prompt Specification v1 §7; Prompt Architecture v1 Layer 9 | **Active Governing Artifact** *(WP-01 deliverable; governs WP-05 prompt assembly)* |
| 20 | `WP01_Requirements_Traceability_Matrix.md` | Implementation | Traces all WP-01 implementation requirements to their governing artifact sources across Layer 1, Layer 2, and Layer 9, with verifiability indicators and failure mode prevention coverage for Tier 1 failure modes. | System Prompt Specification v1; Constitution v1.1; Prompt Architecture v1; Realism Rubric v1; Gold Standard Library v1; Implementation Roadmap v1 | **Active Governing Artifact** *(WP-01 process record; referenced by all future WP RTMs)* |
| 21 | `WP01_Coverage_Report.md` | Implementation | Documents WP-01 completion status, governing artifact coverage achieved across all source documents, failure mode prevention matrix, constitutional law enforcement summary, and acceptance criteria status. | All WP-01 governing sources; WP01_Requirements_Traceability_Matrix.md | **Active Governing Artifact** *(WP-01 process record; establishes WP-02 baseline)* |
| 22 | `WP01_Remaining_Specification_Risks.md` | Implementation | Catalogs 7 specification gaps and implementation risks identified during WP-01 with severity classifications (Critical/High/Medium), source types (SG/ID/IR/EB), and recommended resolution work packages. | WP01_Coverage_Report.md; WP01_Requirements_Traceability_Matrix.md; all WP-01 governing sources | **Active Governing Artifact** *(WP-01 risk register; must be reviewed by all future WPs)* |

---

> **Note on row 13:** `Examiner_Prompt_Architecture_v1.docx` appears once in the filesystem and is listed as row 9. Row 13 is a duplicate entry correction — the inventory contains 21 unique files.

---

## Summary by Category

| Category | Count | Artifacts |
|----------|-------|-----------|
| **Governance** | 4 | Constitution v1.1 Consolidated, Constitution v1.docx (historical), Table of Contents, Implementation Roadmap v1 |
| **Architecture** | 7 | Prompt Architecture v1, Runtime State Schema v1, Decision Engine Specification v1, System Prompt Specification v1, Candidate Assessment v1, Feedback Generation Architecture v1, *(Candidate Assessment is dual-category: Evaluation + Architecture)* |
| **Evaluation** | 5 | Realism Evaluation Rubric v1, Failure Mode Test Suite v1, Gold Standard Library v1, Evaluator Architecture v1, Regression Testing Architecture v1 |
| **Implementation** | 6 | layer_01_constitutional.md, layer_02_identity.md, layer_09_output_constraints.md, WP01_Requirements_Traceability_Matrix.md, WP01_Coverage_Report.md, WP01_Remaining_Specification_Risks.md |

## Summary by Status

| Status | Count | Notes |
|--------|-------|-------|
| **Active Governing Artifact** | 20 | All artifacts except the historical Constitution v1.docx addendum |
| **Historical Reference** | 1 | ABOG_Examiner_Constitution_v1.docx — v1.1 addendum content now consolidated into v1.1 Consolidated |
| **Future Implementation Reference** | 0 | All active artifacts apply to at least one in-progress or completed work package; future-scoped artifacts are contained within active documents (e.g., Implementation Roadmap WP-03 through WP-14 describe future work) |

## Dependency Hierarchy (Root-to-Leaf)

```
ABOG_Examiner_Constitution_v1_1_Consolidated.md  [ROOT]
│
├── Examiner_Realism_Evaluation_Rubric_v1.docx
│   ├── Examiner_Failure_Mode_Test_Suite_v1.docx
│   │   └── Examiner_Evaluator_Architecture_v1.docx
│   └── Gold_Standard_Examiner_Library_v1.docx
│       └── Examiner_Evaluator_Architecture_v1.docx
│
├── Examiner_Runtime_State_Schema_v1.docx
│   └── Examiner_Decision_Engine_Specification_v1.docx
│       ├── Examiner_System_Prompt_Specification_v1.docx
│       │   └── Examiner_Prompt_Architecture_v1.docx
│       │       ├── layer_01_constitutional.md         [WP-01]
│       │       ├── layer_02_identity.md               [WP-01]
│       │       └── layer_09_output_constraints.md     [WP-01]
│       └── Regression_Testing_Architecture_v1.docx
│
├── Candidate_Assessment.docx
│   └── The_Feedback_Generation_Architecture_v1.docx
│
└── Implementation_Roadmap_v1.docx
    ├── WP01_Requirements_Traceability_Matrix.md   [WP-01]
    ├── WP01_Coverage_Report.md                    [WP-01]
    └── WP01_Remaining_Specification_Risks.md      [WP-01]

AI_board_examiner_Table_of_Contents.docx [META — governs artifact hierarchy]
ABOG_Examiner_Constitution_v1.docx      [HISTORICAL — consolidated into root]
```

## Specification Gaps Carried Forward (From Constitutional Consistency Audit v1 and WP-01 Risk Register)

The following are known gaps in the artifact set that are flagged but not yet addressed by any current artifact:

| Gap ID | Nature | Relevant Artifacts | Resolution Scope |
|--------|--------|-------------------|-----------------|
| MISSING-01 | No Case Development Specification or case admission checklist artifact | Implementation Roadmap WP-10 | WP-10 |
| MISSING-03 | No Law 49 enforcement gate (biological plausibility of generated clinical values) | Decision Engine Spec v1; Candidate Assessment v1 | WP-07 |
| MISSING-04 | No state field for Law 56 one-rephrase-per-question tracking | Runtime State Schema v1 | WP-04 |
| MISSING-05 | System Prompt Spec v1 enforcement table does not enumerate Laws 57–70 individually | System Prompt Specification v1 | WP-03 or WP-04 |
| WP01-RISK-02 | Static prompt assembler interface contract not specified | Implementation Roadmap WP-01/WP-04 | WP-04 pre-work |
| WP01-RISK-04 | layer_09_output_constraints.md references ACTION_01–ACTION_10 labels not yet defined | layer_09_output_constraints.md | Resolved by WP-02 |

---

*Artifact Inventory v1.0 — AI ABOG Oral Board Simulator*
*Produced: 2026-06-20*
*Total project files inventoried: 21*
*Next update trigger: Any new artifact added to Project Files, or any artifact superseded by a new version*
