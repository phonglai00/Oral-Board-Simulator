# Assessment Planning Architecture v1
## AI ABOG Oral Board Simulator

**Document Status:** Governing Architecture — Frozen
**Classification:** Architecture Governance Artifact
**Version:** 1.1
**Date:** 2026-06-20
**Freeze Date:** 2026-06-20

**Authority Hierarchy:**
- Level 0: Observed ABOG Oral Board Examiner Behavior
- Level 1: ABOG Examiner Constitution v1.1 Consolidated
- Level 2: Educational Philosophy (ABOG Competency Framework)
- Level 3: This Document (System Architecture)

**Governing Documents:**
- ABOG Examiner Constitution v1.1 Consolidated (behavioral law — all sections)
- Case Simulation Engine Architecture v1 (downstream consumer of Encounter object)
- Runtime State Schema v1 (session state consumed by runtime engines)
- Candidate Assessment Architecture v1 (downstream consumer of Encounter object)
- Implementation Roadmap v1 (phasing and sequencing constraints)

**Downstream Dependents:**
- Case Simulation Engine (reads Encounter object at session start)
- Examiner Decision Engine Architecture (reads Encounter object for mode and intent)
- Candidate Assessment Engine (reads Encounter object for session configuration)
- Examiner Knowledge Corpus Architecture (query interface consumed by this engine)

**Terminology Note:** The term "Case Blueprint" used in prior architecture documents is renamed **Case Model** throughout this document. "Case Model" refers to the software artifact produced by the Case Conversion Engine representing a single clinical case. "ABOG Blueprint" refers exclusively to the real-world external ABOG document specifying examination coverage requirements. These two concepts must never be conflated.

---

## Section 1 — Clinical Reality Check

### How Real ABOG Oral Board Examiners Prepare

Before an ABOG oral board examiner enters the examination room, they perform a structured pre-examination review. This review is the clinical reality that this architecture is designed to translate into software. Understanding it precisely is prerequisite to understanding the architecture.

**Step 1 — Review of the Candidate's Submitted Case List**

The examiner receives the candidate's submitted case list before the examination. This list contains the candidate's personal clinical experience: obstetric cases with complications and treatments, gynecologic operative and non-operative cases, and office patients. The examiner reads this list not as passive background information but as a clinical document revealing the candidate's practice experience, their exposure to complexity, and the complications they have personally managed.

The examiner identifies cases of clinical interest: complex complications, high-acuity scenarios, and any documented clinical events that suggest important clinical decisions were made. The examiner also identifies gaps — specialty domains that appear underrepresented in the candidate's experience.

**Step 2 — Determination of Assessment Objectives**

Before selecting any case, the experienced examiner asks: "What do I need to know about this candidate before this examination is complete?" This is the most important cognitive act in the pre-examination workflow. The examiner is not asking "what can I ask about this case?" They are asking what clinical competence questions remain unanswered.

These objectives are grounded in the ABOG Blueprint — the external governing document specifying which clinical domains and competency areas must be covered across the full oral board examination. The examiner knows the Blueprint requirements and ensures the session will satisfy them.

**Step 3 — Identification of Competencies Requiring Evidence**

The examiner maps assessment objectives to specific clinical competencies: Does this candidate demonstrate sound clinical judgment? Can they prioritize competing concerns under pressure? Do they recognize safety threats without prompting? Can they make defensible decisions when information is incomplete? Do they know when to escalate? Can they adapt when a clinical situation changes?

These competency questions — drawn from the ABOG Blueprint and the professional standards of the specialty — determine what evidence the examiner must collect. The examiner enters the room with a clear picture of what they are trying to find out.

**Step 4 — Case Selection**

Only after assessment objectives are established does the experienced examiner select a case. The selection criterion is: which case from this candidate's submitted list provides the best opportunity to gather the evidence needed to answer the assessment questions?

This is the inversion that distinguishes experienced examiners from inexperienced ones. An inexperienced examiner picks an interesting case and asks questions about it. An experienced examiner identifies what they need to know and selects the case that gives them the best opportunity to find it out.

Case selection is also practical. The examiner considers: Does this case present naturally in a way that assesses the target competencies? Does it have complications that can be probed? Does it support hypothetical extensions if natural case flow does not generate the needed evidence?

**Step 5 — Assessment Intent**

Having selected a case, the examiner formulates a single guiding question: "What is the most important thing I need to determine about this candidate's competence?" This question governs the entire session. It determines which domains receive priority when time pressure forces choices. It determines when the examiner has gathered sufficient evidence. It is the examiner's private compass for the encounter.

**Step 6 — Recognition of Hypothetical Directions**

The experienced examiner does not script specific hypothetical scenarios before entering the room. Instead, they identify the clinical territory the case opens. For a laparoscopic hysterectomy case, the examiner knows the territory includes ureteral injury, hemorrhage management, conversion decisions, and postoperative complications. The examiner holds this territory in mind as potential directions, not as prepared scripts. Which direction the examination takes depends entirely on the candidate's performance and what evidence has and has not been gathered.

**Step 7 — Complication Review Recognition**

Occasionally — not routinely — the examiner notices an unusual or high-stakes complication in the candidate's submitted case list. A postoperative stroke. An intraoperative cardiac arrest. A case requiring return to the operating room. In these instances, the examiner may choose a different examination mode: asking the candidate to explain exactly what happened in their own case, probing their recall, their reasoning, and their clinical judgment within their personal experience. This mode is rare and is never the primary examination approach.

### How the Software Architecture Represents This Workflow

Each step of the real examiner's pre-examination preparation maps to a specific software responsibility:

| Real Examiner Behavior | Software Representation |
|------------------------|------------------------|
| Reviews submitted case list | Assessment Planning Engine reads Submitted Case List Index |
| Consults ABOG Blueprint requirements | Assessment Planning Engine reads ABOG Blueprint Requirements (external governing dependency) |
| Determines assessment objectives | Assessment Planning Engine produces Competency Targets |
| Identifies what evidence is needed | Assessment Planning Engine produces Evidence Goals |
| Selects the most appropriate case | Assessment Planning Engine performs case selection from Case Library |
| Formulates primary assessment question | Assessment Planning Engine produces Assessment Intent |
| Holds hypothetical territory in mind (not scripted) | Permitted Assessment Mechanisms field authorizes hypothetical branching; specific content remains at runtime |
| Recognizes Complication Review opportunity | Assessment Planning Engine detects eligible complications; sets Complication Review mode flag |
| Prepares to enter the room | Encounter Initialization subsystem produces the Encounter object |

The architecture faithfully reproduces the structure of this pre-examination workflow. The Assessment Planning Engine does what the examiner's mind does before entering the room. The Examiner Decision Engine does what the examiner's mind does during the encounter. These two cognitive acts are explicitly separated in both the real examination and in this architecture.

---

## Section 2 — Purpose

The Assessment Planning Engine governs the complete pre-session workflow of the AI ABOG Oral Board Simulator. It translates the candidate's submitted case list, the ABOG Blueprint coverage requirements, and the candidate's prior session history into a structured Assessment Plan that specifies what competency evidence must be collected, from which case, at what depth, and in what priority order. It then initializes a session Encounter from that plan. The Assessment Plan is the authoritative specification of examination intent for a session; it governs every downstream runtime engine without prescribing the content of any specific examiner exchange.

---

## Section 3 — Owns

The Assessment Planning Engine owns exclusively:

- Reading and interpreting the candidate's submitted case list for case selection and Complication Review eligibility
- Reading the ABOG Blueprint Requirements and determining which coverage obligations apply to this session
- Reading the candidate's prior session history to determine which competency domains have and have not been assessed
- Selecting which Case Model(s) from the Case Library to use for the session
- Determining the examination mode for the session (STANDARD, HYPOTHETICAL_BRANCH_FOCUS, COMPLICATION_REVIEW)
- Producing Competency Targets for the session
- Producing Evidence Goals per case per competency domain
- Producing the Assessment Intent including the primary assessment question and pass/fail priority domain
- Producing the Permitted Assessment Mechanisms specification
- Applying Level 1 Transforms (presentation variations) within authored biological plausibility parameters
- Validating Level 1 Transforms against blueprint biological constraints before plan emission
- Producing the complete, immutable Assessment Plan object
- Writing one session record to the Candidate Profile store after plan emission
- Initializing the Encounter object through the Encounter Initialization subsystem
- Defining which Case Model is active for each case position in the session

---

## Section 4 — Does NOT Own

**Case Conversion Engine owns:**
- Transforming uploaded case lists into validated Case Models
- Schema validation of Case Models
- Clinical plausibility validation at case authoring time
- Human clinical review workflow

**Case Simulation Engine owns:**
- All patient physiological state
- Information inventory and discovery state
- Clinical progression and consequence calculation
- The Runtime Output Contract
- Every fact that is clinically true about the patient during a session

**Examiner Decision Engine owns:**
- Per-exchange action selection
- Probe question construction and delivery
- Hypothetical branch construction at runtime (using the Examiner Knowledge Corpus)
- Determining when a domain is sufficiently explored within a session
- Response generation in compliance with the Constitution
- Determining when case closure is appropriate

**Candidate Assessment Engine owns:**
- Evidence collection and classification during the session
- Critical action detection and tracking
- Competency domain scoring
- Pass/fail evidence accumulation
- The Feedback Input Package

**Feedback Engine owns:**
- All post-session educational content
- Learning plan generation
- Finding prioritization and educational interpretation

**Constitution owns:**
- All behavioral law governing examiner responses
- The complete prohibition set for all examiner actions
- Constitutional Gate enforcement

**Examiner Knowledge Corpus owns:**
- Clinical knowledge supporting examiner reasoning
- Competency probe strategies
- Management pathway knowledge
- Hypothetical scenario territory by clinical domain
- The query interface for runtime knowledge retrieval

**This engine does NOT own:**
- Probe question text of any kind
- Hypothetical scenario content of any kind
- Clinical narratives of any kind
- Patient state or physiological parameters
- Scoring logic or pass/fail determination
- Any runtime session state after the Encounter object is initialized
- Constitutional compliance enforcement

---

## Section 5 — External Dependencies

### 5.1 Hard Dependencies
The engine cannot operate if any of the following are unavailable.

| Dependency | Source | What Is Consumed | Failure Mode If Unavailable |
|-----------|--------|-----------------|----------------------------|
| ABOG Blueprint Requirements | External configuration (ABOG governing document interpreted as system configuration) | Coverage domains, minimum case requirements, mandatory competency areas | Engine cannot determine coverage obligations; session cannot be planned |
| Submitted Case List Index | Case Conversion Engine output | Specialty domain, diagnosis, complications, procedure, P/S designation, per-case | Engine cannot select cases grounded in candidate experience |
| Case Library | Case Conversion Engine output (active Case Models) | blueprintId, specialtyDomain, difficultyLevel, criticalActionMap summary, transformationAllowed parameters, complicationList, calibrationMetadata | Engine cannot select cases |
| Examination Objectives Configuration | System configuration | Session size parameters, mandatory domain coverage constraints | Engine cannot validate coverage completeness |

### 5.2 Soft Dependencies
The engine degrades gracefully if these are unavailable.

| Dependency | Source | What Is Consumed | Degraded Behavior If Unavailable |
|-----------|--------|-----------------|----------------------------------|
| Candidate Profile Store | Longitudinal session store | casesSeenPrior, competencyProfileByDomain, sessionCount | Engine operates in FIRST_SESSION mode; no deduplication; no gap targeting |
| Examiner Knowledge Corpus | Knowledge service (query interface) | Domain-to-case suitability assessments; Complication Review eligibility rankings | Engine selects cases using Case Model metadata only; no corpus-informed assessment strategy |
| Examination Mode Override | System or faculty input | Mode flag with parameters | Engine defaults to STANDARD mode |

### 5.3 External Governing Dependency — ABOG Blueprint

The ABOG Blueprint is a real-world external document published by ABOG specifying which clinical content domains, competency areas, and examination coverage requirements apply to the oral board examination. It is not a software component. It is the highest governing authority for coverage decisions.

The Assessment Planning Engine treats the ABOG Blueprint Requirements as an external read-only governing input. It does not modify Blueprint requirements. It does not interpret Blueprint requirements beyond what is specified in the ABOG Blueprint Requirements configuration. If Blueprint requirements change (e.g., ABOG updates coverage specifications), the configuration is updated externally and the engine reads the updated requirements.

Current ABOG Blueprint coverage domains (as implemented):

| Domain | Code |
|--------|------|
| Obstetrics | OB |
| Maternal-Fetal Medicine | MFM |
| Gynecologic Oncology | GYN_ONC |
| Reproductive Endocrinology and Infertility | REI |
| General Gynecology | GEN_GYN |
| Ambulatory Gynecology | AMB_GYN |
| Perioperative Management | PERIOP |
| Postoperative Management | POSTOP |

---

## Section 6 — Inputs

### Input 1 — ABOG Blueprint Requirements

**Type:** Structured configuration object
**Required:** Yes — hard dependency
**Contents:**

```
ABOGBlueprintRequirements {
  coverageVersion:          String    [which ABOG Blueprint version this reflects]
  requiredDomains:          Array[{
    domain:                 Enum      [OB | MFM | GYN_ONC | REI | GEN_GYN |
                                       AMB_GYN | PERIOP | POSTOP]
    minimumCasesPerSession: Integer   [0 = not required every session]
    mandatoryPerSession:    Boolean
  }]
  minimumCasesPerSession:   Integer
  maximumCasesPerSession:   Integer
  mandatoryCompetencyDomains: Array[Enum]  [Constitution Section 13 domains
                                             required in every session]
  safetyAssessmentRequired: Boolean   [always true per Constitution Law 34]
}
```

### Input 2 — Submitted Case List Index

**Type:** Structured index produced by Case Conversion Engine at upload time
**Required:** Yes — hard dependency
**Contents per case entry:**

```
SubmittedCaseEntry {
  submittedCaseId:          String
  candidateId:              String
  caseCategory:             Enum      [OBSTETRIC | GYNECOLOGIC | OFFICE]
  specialtyDomain:          Enum      [from ABOG Blueprint domain list]
  primaryDiagnosis:         String
  complications:            Array[String]
  proceduresPerformed:      Array[String]
  residentManaged:          Boolean   [true = P-coded; false = S-coded]
  gestationalAge:           String    [obstetric cases; null otherwise]
  hasComplicationEligibleForReview: Boolean
  complicationReviewCandidates: Array[{
    complicationId:         String
    complicationDescription:String
    clinicalSignificance:   Enum      [HIGH | MODERATE | LOW]
  }]
  linkedCaseModelId:        String | null  [if Case Conversion Engine produced
                                            a Case Model from this entry]
}
```

**What is not consumed:** Full Case Model patient state, information inventory, consequence parameters. The engine reads the index, not the clinical simulation content.

### Input 3 — Case Library

**Type:** Indexed collection of validated, clinically reviewed Case Models
**Required:** Yes — hard dependency
**Contents consumed per Case Model:**

```
CaseModelIndex {
  caseModelId:              String
  specialtyDomain:          Enum
  difficultyLevel:          Enum      [STANDARD | COMPLEX | ADVANCED]
  primaryClinicalDomain:    String
  competencyDomainsAssessable: Array[Enum]  [Constitution Section 13 domains
                                              this case is suited to assess]
  criticalActionSummary:    Array[{
    actionId:               String
    domain:                 Enum
    priority:               Enum      [MANDATORY | IMPORTANT | SUPPLEMENTARY]
  }]
  transformationAllowed:    TransformationParameters  [Level 1 parameters only]
  complicationList:         Array[String]
  calibrationMetadata:      CalibrationMetadata
  validationStatus:         Enum      [ACTIVE | PENDING_REVIEW | RETIRED]
  clinicallyValidatedBy:    String
  linkedSubmittedCaseId:    String | null  [if derived from a candidate's
                                            submitted case; null for
                                            library-authored cases]
}
```

**Constraint:** The engine must filter the Case Library to `validationStatus = ACTIVE` before any selection logic is applied. Cases with any other status are invisible to this engine.

### Input 4 — Candidate Profile

**Type:** Longitudinal candidate record
**Required:** Soft dependency (null profile = FIRST_SESSION mode)
**Contents consumed:**

```
CandidateProfile {
  candidateId:              String
  sessionCount:             Integer
  casesSeenPrior:           Array[String]   [caseModelIds used in prior sessions]
  competencyProfileByDomain:Array[{
    domain:                 Enum            [Constitution Section 13 domain]
    assessmentStatus:       Enum            [NOT_YET_ASSESSED | ASSESSED_ADEQUATE |
                                             GAP_IDENTIFIED | FIRST_SESSION]
    lastAssessedSession:    String | null   [sessionId]
  }]
}
```

**What is not consumed:** Raw session transcripts, individual probe history, examiner evaluation records, individual evidence objects, scoring details. The engine reads coverage summary only.

### Input 5 — Examination Objectives Configuration

**Type:** System configuration object
**Required:** Yes — hard dependency

```
ExaminationObjectivesConfig {
  sessionSizeMin:           Integer
  sessionSizeMax:           Integer
  mandatoryCompetencyDomains: Array[Enum]
  evidenceGatheringModeDefault: Enum  [STANDARD | TARGETED_GAP |
                                        PASS_FAIL_DETERMINATION]
  complicationReviewEnabled:  Boolean
  hypotheticalBranchingEnabled: Boolean
}
```

### Input 6 — Examination Mode Override

**Type:** Optional structured override
**Required:** No; absent = STANDARD mode

```
ExaminationModeOverride {
  mode:                     Enum    [STANDARD | HYPOTHETICAL_BRANCH_FOCUS |
                                     COMPLICATION_REVIEW]
  targetComplicationId:     String | null   [required if mode =
                                             COMPLICATION_REVIEW]
}
```

**Validation:** If mode = COMPLICATION_REVIEW, `targetComplicationId` must correspond to an entry in the candidate's `SubmittedCaseEntry.complicationReviewCandidates`. If it does not, the override is rejected and an error is raised (see Section 15 — Error Conditions).

---

## Section 7 — Outputs

The Assessment Planning Engine produces exactly two outputs:

**Output 1 — Assessment Plan** (primary output)
Complete specification of session intent. Schema defined in Section 9.
Consumed by: Encounter Initialization subsystem (immediately), Candidate Assessment Engine (reads Encounter which carries Assessment Plan reference), Examiner Decision Engine (reads Encounter which carries Assessment Plan reference).

**Output 2 — Session Record (Candidate Profile Write)**
After the Assessment Plan is emitted, the engine writes one record to the Candidate Profile store.

```
SessionRecord {
  sessionId:            String    [UUID generated at plan emission]
  planId:               String    [UUID of the Assessment Plan]
  candidateId:          String
  selectedCaseModelIds: Array[String]
  examinationMode:      Enum
  planGeneratedAt:      ISO 8601
}
```

This is the only write the engine performs. It occurs after plan emission, not during planning. The write is idempotent — if it fails and is retried, a duplicate session record is not created.

---

## Section 8 — Assessment Planning Lifecycle

The engine executes once per session, pre-session. Its lifecycle has six stages. These stages are sequential. No stage begins until the preceding stage is complete.

```
Stage 1: INPUT VALIDATION
        ↓
Stage 2: COVERAGE ANALYSIS
        ↓
Stage 3: CASE SELECTION
        ↓
Stage 4: ASSESSMENT PLAN CONSTRUCTION
        ↓
Stage 5: PLAN VALIDATION
        ↓
Stage 6: PLAN EMISSION → Encounter Initialization
```

### Stage 1 — Input Validation

Verify all hard dependencies are available and well-formed. Verify soft dependencies and determine operating mode (FIRST_SESSION if Candidate Profile is null). Validate Examination Mode Override if present. Reject invalid overrides before proceeding.

**Exit condition:** All hard dependencies validated. Operating mode determined. No unresolved input errors.

### Stage 2 — Coverage Analysis

Determine which ABOG Blueprint requirements apply to this session. Cross-reference against candidate's prior session competency profile (if available) to identify:
- Domains not yet assessed (priority targets)
- Domains assessed with gaps identified (secondary targets)
- Domains adequately assessed in prior sessions (coverage complete; may be covered again but not prioritized)

Determine the Evidence Gathering Mode:
- `STANDARD`: first session or no prior gap data
- `TARGETED_GAP`: prior session identified specific competency gaps
- `PASS_FAIL_DETERMINATION`: candidate is in a pass/fail borderline status requiring focused evidence collection

**Exit condition:** Coverage obligations mapped. Evidence Gathering Mode determined. Priority competency domains identified.

### Stage 3 — Case Selection

Select Case Models from the Case Library satisfying:

1. `validationStatus = ACTIVE`
2. Not in `candidateProfile.casesSeenPrior` (deduplication — exact case model not reused)
3. Specialty domain satisfies at least one ABOG Blueprint coverage requirement not yet met in this session's selection
4. Competency domains assessable by the case include at least one priority competency target from Stage 2
5. Case Model count satisfies `sessionSizeMin` and does not exceed `sessionSizeMax`

**Tie-breaking priority:**
1. Cases derived from candidate's submitted case list (`linkedSubmittedCaseId` not null) are preferred over library-authored cases, as they ground the examination in the candidate's personal clinical experience
2. Cases covering higher-priority competency targets are preferred
3. Cases covering multiple coverage obligations simultaneously are preferred over single-domain cases

**Complication Review detection (if enabled):**
Scan the Submitted Case List Index for entries where `hasComplicationEligibleForReview = true` and `complicationReviewCandidates` contains at least one entry with `clinicalSignificance = HIGH`. If such entries exist and no mode override has been specified, flag for Complication Review eligibility. Do not automatically invoke Complication Review — set eligibility flag for plan construction.

**Exit condition:** Complete set of Case Models selected. Each selection satisfies all constraints. Complication Review eligibility determined.

### Stage 4 — Assessment Plan Construction

Construct the complete Assessment Plan object (schema in Section 9):

1. Assign `planId` (UUID)
2. Set `examinationMode` (from override or default logic)
3. Construct `CaseSelections` for each selected Case Model
4. Apply Level 1 Transforms within `transformationAllowed` parameters
5. Construct `CompetencyTargets` from Stage 2 analysis
6. Construct `EvidenceGoals` per case per competency domain
7. Construct `AssessmentIntent` — formulate `primaryAssessmentQuestion`, `coverageRequirements`, and `passFailPriorityDomain`
8. Construct `PermittedAssessmentMechanisms`
9. If Complication Review mode: construct `ComplicationReviewSpec`

**Exit condition:** Complete Assessment Plan object constructed. All required fields populated.

### Stage 5 — Plan Validation

Validate the constructed plan before emission:

1. All Level 1 Transforms are within authored biological plausibility bounds
2. All selected Case Models have `validationStatus = ACTIVE`
3. All mandatory competency domains from ABOG Blueprint Requirements are addressed by at least one Evidence Goal
4. `passFailPriorityDomain` is assigned and is among the `mandatoryCompetencyDomains`
5. If mode = COMPLICATION_REVIEW: `ComplicationReviewSpec.targetComplicationId` is present in Submitted Case List Index
6. Session size satisfies `sessionSizeMin` ≤ selected cases ≤ `sessionSizeMax`

**Exit condition:** All validations pass. If any validation fails, raise a PLAN_VALIDATION_ERROR (see Section 15).

### Stage 6 — Plan Emission

1. Emit the Assessment Plan object
2. Pass Assessment Plan to Encounter Initialization subsystem
3. Write Session Record to Candidate Profile store
4. Engine lifecycle complete — no further processing

**The engine performs no operations after plan emission. It has no runtime role.**

---

## Section 9 — Assessment Plan Schema

The Assessment Plan is the engine's primary output and the authoritative specification of session intent. It is immutable after emission.

```
AssessmentPlan {

  // Identity
  planId:                   UUID              [generated at plan emission]
  candidateId:              String
  sessionId:                UUID              [generated at plan emission]
  sessionSequenceNumber:    Integer           [1 for first session; increments]
  planGeneratedAt:          ISO 8601
  planVersion:              String            [schema version, e.g., "1.0"]
  abogBlueprintVersion:     String            [which Blueprint version governed
                                               this plan's coverage decisions]

  // Mode
  examinationMode:          Enum              [STANDARD |
                                               HYPOTHETICAL_BRANCH_FOCUS |
                                               COMPLICATION_REVIEW]
  evidenceGatheringMode:    Enum              [STANDARD | TARGETED_GAP |
                                               PASS_FAIL_DETERMINATION]

  // Case Selections
  caseSelections:           Array[CaseSelection]    [ordered; position = sequence]

  // Competency Coverage
  competencyTargets:        Array[CompetencyTarget]

  // Evidence Requirements
  evidenceGoals:            Array[EvidenceGoal]

  // Session Intent
  assessmentIntent:         AssessmentIntent

  // Permitted Mechanisms
  permittedMechanisms:      PermittedAssessmentMechanisms

  // Complication Review (null unless mode = COMPLICATION_REVIEW)
  complicationReviewSpec:   ComplicationReviewSpec | null

}
```

---

## Section 10 — Competency Targets

### Schema

```
CompetencyTarget {
  domain:                   Enum    [CLINICAL_JUDGMENT |
                                     PRIORITIZATION |
                                     SAFETY_AWARENESS |
                                     DECISION_MAKING_UNDER_UNCERTAINTY |
                                     ORGANIZATION |
                                     RECOGNITION_OF_LIMITATIONS |
                                     CLINICAL_ADAPTABILITY]
  priority:                 Enum    [PRIMARY | SECONDARY | COVERAGE_REQUIRED]
  priorSessionStatus:       Enum    [FIRST_SESSION | NOT_YET_ASSESSED |
                                     ASSESSED_ADEQUATE | GAP_IDENTIFIED]
  evidenceThreshold:        Enum    [SINGLE_DEMONSTRATION |
                                     MULTIPLE_DEMONSTRATIONS |
                                     DEMONSTRATED_UNDER_PRESSURE]
  targetedInCases:          Array[String]  [caseModelIds where this domain
                                            is expected to be assessed]
}
```

### Field Definitions

**domain:** One of the seven competency domains defined in Constitution v1.1 Section 13. These domains and only these domains may appear. No domain outside this enumeration may be introduced.

**priority:**
- `PRIMARY`: this domain is the most important assessment target for this session; evidence must be collected before closure
- `SECONDARY`: this domain should be assessed if case flow permits; not a closure blocker
- `COVERAGE_REQUIRED`: ABOG Blueprint requires coverage; minimum assessment required; depth is secondary

**priorSessionStatus:** Informs but does not override the examiner's per-session behavior. The Examiner Decision Engine reads this field as context, not as instruction.

**evidenceThreshold:** Specifies how much evidence satisfies this target.
- `SINGLE_DEMONSTRATION`: one clear demonstration of the competency is sufficient
- `MULTIPLE_DEMONSTRATIONS`: the competency should be assessed in more than one context within the session
- `DEMONSTRATED_UNDER_PRESSURE`: the candidate must demonstrate the competency after being probed or challenged, not just upon initial response. Applies when `priorSessionStatus = GAP_IDENTIFIED`.

### Constraints

- Every session must include SAFETY_AWARENESS as a CompetencyTarget with priority = PRIMARY. This is non-negotiable per Constitution Law 34.
- Every session must include CLINICAL_JUDGMENT as a CompetencyTarget. Per Constitution Section 13, clinical judgment is the central competency of oral board assessment.
- The full set of CompetencyTargets for a session must collectively address all `mandatoryCompetencyDomains` from the ABOG Blueprint Requirements.

---

## Section 11 — Evidence Goals

### Schema

```
EvidenceGoal {
  goalId:                   UUID
  caseRef:                  String        [caseModelId this goal applies to]
  competencyDomain:         Enum          [from CompetencyTarget.domain]
  sufficientEvidence:       String        [what observable candidate behavior
                                           satisfies this goal — expressed at
                                           evidence-quality level, never at
                                           content level]
  minimumDepth:             Enum          [STATED | REASONED |
                                           DEFENDED_UNDER_CHALLENGE]
  safetyEvidenceRequired:   Boolean
  closureCondition:         String        [what the examiner observes that
                                           means this goal is met — expressed
                                           at evidence-quality level]
  gapSignal:                String        [what the examiner observes that
                                           means this goal has not been met]
  priority:                 Enum          [LOAD_BEARING | STANDARD | SUPPLEMENTARY]
}
```

### Field Definitions

**sufficientEvidence:** Must be expressed at the evidence-quality level, never at the content level.

- ✅ Correct: "Candidate demonstrates recognition of a safety-critical finding and articulates an appropriate escalation response with reasoning"
- ❌ Incorrect: "Candidate mentions magnesium sulfate and blood pressure management"

The first formulation evaluates competency. The second evaluates content recall. This distinction is foundational to the examination philosophy and must be preserved in every Evidence Goal.

**minimumDepth:**
- `STATED`: candidate has named the clinical action or decision; acceptable for SUPPLEMENTARY goals
- `REASONED`: candidate has explained the reasoning behind the action or decision; required for PRIMARY competency domains
- `DEFENDED_UNDER_CHALLENGE`: candidate has maintained and defended their reasoning after examiner probing; required when `evidenceThreshold = DEMONSTRATED_UNDER_PRESSURE`

**closureCondition and gapSignal:** Both must be expressed at the evidence-quality level. They tell the Examiner Decision Engine when to stop probing and when to continue — without specifying what to say.

- ✅ Correct closureCondition: "Candidate has articulated reasoned clinical judgment for the primary management decision and defended it under at least one probe"
- ❌ Incorrect closureCondition: "Candidate mentions magnesium and blood pressure medication"

**priority:**
- `LOAD_BEARING`: evidence from this goal is directly required for the session's pass/fail determination; the session cannot close without it
- `STANDARD`: evidence should be collected; closure is permissible if time pressure forces prioritization
- `SUPPLEMENTARY`: evidence enriches assessment; may be omitted under time pressure

---

## Section 12 — Assessment Intent

Assessment Intent captures the examination's purpose at two distinct levels that a real ABOG examiner holds simultaneously before entering the room. These levels are architecturally separated because they serve different consumers: strategic intent governs the session's ultimate competency question; operational intent governs how this specific session is designed to gather evidence sufficient to answer that question. Neither level specifies probe content or scenario construction — those remain owned by the Examiner Decision Engine.

### Schema

```
AssessmentIntent {

  // Strategic Intent
  // What competency is the session ultimately attempting to estimate?
  strategicIntent: {
    primaryAssessmentQuestion:  String    [the single most important competency
                                           question this session must answer —
                                           framed in terms of clinical judgment,
                                           not clinical content]
    passFailPriorityDomain:     Enum      [which Constitution Section 13 domain
                                           is load-bearing for the pass/fail
                                           determination in this session; never
                                           skipped under time pressure]
    primaryObjectiveSatisfiedWhen: String [the condition — expressed at evidence-
                                           quality level — under which the
                                           examiner can reasonably conclude that
                                           the primary assessment question has
                                           received sufficient examination;
                                           does NOT define pass/fail; defines
                                           assessment completeness]
  }

  // Operational Intent
  // How is this session designed to gather sufficient evidence to answer
  // the strategic question?
  operationalIntent: {
    evidenceStrategy:           String    [description of how this session's
                                           case selection, examination mode,
                                           and evidence goals are designed to
                                           generate the evidence needed to
                                           answer the primary assessment
                                           question — expressed at intent level,
                                           never at probe or scenario level]
    coverageRequirements:       Array[{
      domain:                   Enum      [ABOG Blueprint specialty domain]
      minimumCoverage:          Enum      [MINIMAL | STANDARD | THOROUGH]
    }]
    prioritySequence:           String    [if evidence gathering mode is
                                           TARGETED_GAP or PASS_FAIL_
                                           DETERMINATION: description of which
                                           competency domains take priority
                                           when time pressure forces choices]
  }

  // Audit
  sessionRationale:             String    [human-readable explanation of why
                                           this case selection and these
                                           objectives serve the assessment
                                           intent — for audit and human review
                                           purposes; not consumed by runtime
                                           engines]
}
```

### Field Definitions

#### Strategic Intent Fields

**strategicIntent.primaryAssessmentQuestion:** A single sentence formulating the most important competency question the session must answer. This is the examiner's compass for the session. It governs which Evidence Goals are load-bearing and which are supplementary.

Examples of correctly formed primary assessment questions:
- "Does this candidate recognize obstetric emergencies with appropriate urgency and respond without prompting?"
- "Can this candidate make defensible management decisions when clinical information is incomplete?"
- "Does this candidate know when to escalate beyond their own clinical capacity?"

The primary assessment question must be framed in terms of competency, not content. It asks about the candidate's clinical judgment, not about what they know.

**strategicIntent.passFailPriorityDomain:** The single Constitution Section 13 domain that is most load-bearing for a competency determination in this session. When time pressure forces the Examiner Decision Engine to choose between domains, this domain is never skipped. It must be among the `mandatoryCompetencyDomains` from the ABOG Blueprint Requirements.

**strategicIntent.primaryObjectiveSatisfiedWhen:** The condition under which the examiner can reasonably conclude the primary assessment question has received sufficient examination. This field is expressed at the evidence-quality level, consistent with I-05. It is not a pass/fail threshold — that determination belongs to the Candidate Assessment Engine. It is the session-level analog of the Evidence Goal `closureCondition`: while individual closureConditions tell the Examiner Decision Engine when a specific domain is done, `primaryObjectiveSatisfiedWhen` tells it when the session's primary purpose has been served.

- ✅ Correct: "The candidate has demonstrated or failed to demonstrate safety recognition in at least one high-acuity clinical scenario under direct probing, providing sufficient evidence for competency determination in this domain"
- ❌ Incorrect: "The candidate has correctly managed the hemorrhage scenario" — this specifies content and implies a correctness criterion, which is pass/fail, not assessment completeness

#### Operational Intent Fields

**operationalIntent.evidenceStrategy:** A description — at the intent level, never at the probe or scenario level — of how this session's case selection, examination mode, and evidence goals are designed to generate the evidence needed to answer the primary assessment question. This field communicates to the Examiner Decision Engine the reasoning behind the session's structure, enabling it to prioritize adaptively when the session does not unfold as planned.

- ✅ Correct: "This session uses an obstetric emergency case to create natural opportunities for safety recognition assessment, supplemented by hypothetical branching authorization to probe adaptive reasoning if natural case flow does not generate adequate safety evidence"
- ❌ Incorrect: "The examiner will first ask about the diagnosis, then about management, then introduce a complication" — this specifies probe sequence, which is owned by the Examiner Decision Engine

**operationalIntent.coverageRequirements:** The ABOG Blueprint specialty domains that must receive at least the specified minimum coverage in this session.

**operationalIntent.prioritySequence:** Present when `evidenceGatheringMode` is `TARGETED_GAP` or `PASS_FAIL_DETERMINATION`. Describes which competency domains take priority when time pressure forces choices between domains. This does not prescribe probe order — it specifies priority for the Examiner Decision Engine's own time management decisions.

#### Audit Field

**sessionRationale:** Human-readable explanation for audit purposes. Not consumed by any runtime engine. Required for evaluation and quality review.

---

## Section 13 — Permitted Assessment Mechanisms

### Schema

```
PermittedAssessmentMechanisms {
  standardSimulation:         Boolean         [always true]
  level1Transforms:           Array[Level1Transform]
  hypotheticalBranchingAuthorized: Boolean
  complicationReviewIncluded: Boolean
  evidenceGatheringMode:      Enum            [STANDARD | TARGETED_GAP |
                                               PASS_FAIL_DETERMINATION]
}

Level1Transform {
  caseRef:                    String          [caseModelId this applies to]
  field:                      String          [which Case Model field is varied]
  originalValue:              String          [blueprint default value]
  transformedValue:           String          [value for this session]
  biologicallyPermitted:      Boolean         [must be true before emission]
  withinAuthoredRange:        Boolean         [must be true; verifies transform
                                               is within transformationAllowed
                                               parameters of the Case Model]
}
```

### Field Definitions

**standardSimulation:** Always true. Every session includes standard simulation as its primary mode. This field exists for schema completeness and downstream parsing clarity.

**level1Transforms:** The only pre-specified content elements in the Assessment Plan. Level 1 Transforms are presentation variations — age, parity, laboratory values, imaging findings — that are applied at Encounter Initialization. They do not alter the primary diagnosis, the hidden story, or the critical action map of the Case Model. Both `biologicallyPermitted` and `withinAuthoredRange` must be true for a transform to be included. Transforms failing either check are excluded and the Case Model's default values are used.

**hypotheticalBranchingAuthorized:** When true, the Examiner Decision Engine is authorized to introduce Level 2 hypothetical branches during the session. The Assessment Plan does not specify what those hypotheticals will be — that is determined at runtime by the Examiner Decision Engine in consultation with the Examiner Knowledge Corpus. When false, the examiner must not introduce hypotheticals not present in the Case Model's authored pathways.

**complicationReviewIncluded:** When true, the session includes a Complication Review segment. The `ComplicationReviewSpec` field in the Assessment Plan is non-null and governs that segment.

**evidenceGatheringMode:** Communicates the overall strategic posture of this session to the Examiner Decision Engine.
- `STANDARD`: balanced coverage; no special prioritization beyond CompetencyTarget priorities
- `TARGETED_GAP`: prior session data identified specific competency gaps; the Examiner Decision Engine should prioritize evidence collection in those domains
- `PASS_FAIL_DETERMINATION`: the candidate is in a borderline status; the session should prioritize evidence most directly relevant to a competency determination; supplementary evidence goals may be deferred

---

## Section 14 — Case Selection Object

### Schema

```
CaseSelection {
  sequencePosition:           Integer         [1, 2, 3... — examination order]
  caseModelId:                String
  submittedCaseRef:           String | null   [which Submitted Case Entry this
                                               maps to; null if library-authored]
  residentManaged:            Boolean         [true if P-coded in submitted list]
  primaryAssessmentDomains:   Array[Enum>]    [Constitution Section 13 domains
                                               this case is expected to assess]
  mandatoryCriticalActions:   Array[String]   [actionIds from Case Model that
                                               must be assessed in this case]
  appliedLevel1Transforms:    Array[Level1Transform]
  linkedEvidenceGoals:        Array[UUID>]    [goalIds from evidenceGoals that
                                               apply to this case]
}
```

---

## Section 15 — Complication Review Specification

### When Complication Review Is Appropriate

Complication Review is appropriate when:
1. The candidate's Submitted Case List contains a complication with `clinicalSignificance = HIGH`
2. The complication is one the candidate was personally involved in managing (`residentManaged = true` on the parent SubmittedCaseEntry)
3. The session is configured to permit Complication Review (`complicationReviewEnabled = true`)
4. Either a mode override has specified COMPLICATION_REVIEW or the engine's eligibility logic has flagged the complication for inclusion

Complication Review is never the default. It is always a deliberate examination mode decision.

### Schema

```
ComplicationReviewSpec {
  targetComplicationId:       String          [from SubmittedCaseEntry.
                                               complicationReviewCandidates]
  complicationDescription:    String          [verbatim from submitted case]
  submittedCaseContext:       String          [parent case summary]
  residentManaged:            Boolean         [must be true]
  assessmentFocus:            Array[Enum]     [Constitution Section 13 domains
                                               this review is expected to assess]
  sessionPosition:            Integer         [which position in the session
                                               this segment occupies; typically
                                               last]
}
```

### Complication Review Mode — Pipeline Behavior

In Complication Review mode, the examination pipeline is different from Standard Simulation:

| Pipeline Element | Standard Simulation | Complication Review |
|-----------------|--------------------|--------------------|
| Case Simulation Engine role | Primary — owns patient state | Minimal — no patient physiological simulation; candidate's real case is the ground truth |
| Information Management | Governed by Case Model inventory | Candidate provides information from memory; examiner does not control information release |
| Evidence collection | Managed through simulation state | Managed through candidate narrative |
| Examiner Knowledge Corpus | Queried for probe strategy | Queried for complication-specific probe strategy |

The Encounter object carries the `COMPLICATION_REVIEW` mode flag. The Examiner Decision Engine reads this flag and adapts its behavior accordingly. The Case Simulation Engine is notified of the mode but does not drive this segment.

---

## Section 16 — Encounter Initialization Subsystem

### Purpose

Encounter Initialization is a subsystem of the Assessment Planning Engine. It is not a separate engine. It owns no independent decision loop, no unique mutable state beyond what it initializes, and no unique lifecycle independent of the Assessment Planning Engine. It executes immediately after the Assessment Plan is emitted and its output — the Encounter object — is the final deliverable of the pre-session workflow.

### Responsibilities

Encounter Initialization owns:
- Retrieving the full Case Model(s) specified in the Assessment Plan's CaseSelections
- Applying Level 1 Transforms from the Assessment Plan to Case Model default values
- Setting the examination mode flag in the Encounter object
- Initializing the Encounter object from the Assessment Plan
- Loading the first case position into the active case slot
- Passing the Encounter object to the Case Simulation Engine for session start

Encounter Initialization does NOT own:
- Patient physiological state initialization (Case Simulation Engine)
- Information inventory initialization (Case Simulation Engine)
- Runtime State Schema object initialization (Runtime State manager)
- Any decision about session content beyond what the Assessment Plan specifies

### Initialization Sequence

```
Step 1: Receive Assessment Plan from Assessment Planning Engine

Step 2: Retrieve Case Model(s)
        — Fetch full Case Model for each caseModelId in caseSelections
        — Verify validationStatus = ACTIVE for each (secondary check)

Step 3: Apply Level 1 Transforms
        — For each Level1Transform in permittedMechanisms.level1Transforms:
          — Apply transformedValue to specified field of specified Case Model
          — Record transform as applied in EncounterTransformLog

Step 4: Construct Encounter Object
        — Populate all Encounter fields from Assessment Plan and Case Models
        — Set examinationMode from Assessment Plan
        — Set activeCase to caseSelections[0] (first in sequence)
        — Set encounterStatus = INITIALIZED

Step 5: Validate Encounter Object
        — All required fields present
        — examinationMode is a valid enumeration value
        — activeCase references a valid, active Case Model
        — If mode = COMPLICATION_REVIEW: complicationReviewSpec is non-null

Step 6: Emit Encounter Object
        — Pass to Case Simulation Engine
        — Encounter Initialization lifecycle complete
```

---

## Section 17 — Encounter Object Schema

The Encounter object is the **Authoritative Session Context** for every runtime engine. It is the single source of truth for session intent, examination mode, case configuration, competency targets, and evidence requirements. All runtime engines consume the Encounter — none may reconstruct or infer session intent from any other source. An engine that derives session behavior from sources other than the Encounter and the Constitution is in violation of I-13 (Assessment Intent Authority).

The Encounter is created by Encounter Initialization, persists for the full session, and is consumed by the Case Simulation Engine, the Examiner Decision Engine, and the Candidate Assessment Engine. It is immutable after initialization except for `encounterStatus`, `activeCase`, and `sessionCompletionRecord` fields, which are updated by authorized runtime engines.

```
Encounter {

  // Identity
  encounterId:              UUID              [unique session identifier]
  sessionId:                UUID              [matches AssessmentPlan.sessionId]
  planId:                   UUID              [reference to governing Assessment Plan]
  candidateId:              String
  sessionSequenceNumber:    Integer
  encounterInitializedAt:   ISO 8601

  // Governing References (read-only links — not content copies)
  assessmentPlanRef:        UUID              [planId — full plan retrievable]
  abogBlueprintVersion:     String
  constitutionVersion:      String            [governs all examiner behavior
                                               during this session]

  // Mode Configuration
  examinationMode:          Enum              [STANDARD |
                                               HYPOTHETICAL_BRANCH_FOCUS |
                                               COMPLICATION_REVIEW]
  evidenceGatheringMode:    Enum              [STANDARD | TARGETED_GAP |
                                               PASS_FAIL_DETERMINATION]
  hypotheticalBranchingAuthorized: Boolean
  complicationReviewSpec:   ComplicationReviewSpec | null

  // Case Configuration
  caseSequence:             Array[CaseSelection]   [ordered; full session plan]
  activeCase:               CaseSelection          [current case; updated at
                                                    case transitions by
                                                    Examiner Decision Engine]

  // Assessment Configuration (read-only to runtime engines)
  competencyTargets:        Array[CompetencyTarget]
  evidenceGoals:            Array[EvidenceGoal]
  assessmentIntent:         AssessmentIntent      [strategic and operational
                                                   intent; the Authoritative
                                                   Session Context for all
                                                   runtime engine reasoning
                                                   about session purpose]
  passFailPriorityDomain:   Enum                  [promoted to top-level for
                                                   direct access; mirrors
                                                   assessmentIntent.strategic
                                                   Intent.passFailPriorityDomain]

  // Applied Transforms (audit record)
  transformLog:             Array[{
    caseRef:                String
    field:                  String
    originalValue:          String
    appliedValue:           String
    appliedAt:              ISO 8601
  }]

  // Lifecycle
  encounterStatus:          Enum              [INITIALIZED | ACTIVE |
                                               CASE_TRANSITION | COMPLETE |
                                               SUSPENDED | ABORTED]
                                              [updated by Examiner Decision
                                               Engine during session]

  // Completion Record (populated at session end)
  sessionCompletionRecord:  SessionCompletionRecord | null

}
```

### Encounter Object Mutability Rules

| Field | Mutable During Session | Authorized Mutator |
|-------|----------------------|-------------------|
| `encounterStatus` | Yes | Examiner Decision Engine |
| `activeCase` | Yes — at case transitions only | Examiner Decision Engine |
| `sessionCompletionRecord` | Yes — populated at session end | Candidate Assessment Engine |
| All other fields | No — immutable after initialization | None |

### Session Completion Record

```
SessionCompletionRecord {
  completedAt:              ISO 8601
  casesCompleted:           Integer
  evidenceGoalsAddressed:   Array[UUID]   [goalIds from evidenceGoals]
  evidenceGoalsNotAddressed:Array[UUID]
  passFailPriorityAssessed: Boolean
  sessionTerminationReason: Enum          [NORMAL_COMPLETION | TIME_LIMIT |
                                           CANDIDATE_WITHDRAWAL | SYSTEM_ERROR]
}
```

---

## Section 18 — Examination Modes

### Mode 1 — STANDARD

**Clinical Reality:** The examiner presents cases drawn from or grounded in the candidate's submitted case list and uses standard simulation with natural case evolution to gather evidence.

**Pipeline Behavior:**
- All cases in `caseSequence` run through the full Case Simulation Engine pipeline
- Information release governed by Case Model information inventory
- Clinical evolution governed by Case Model consequence parameters
- Hypothetical branching is not authorized unless `hypotheticalBranchingAuthorized = true`

**When Selected:** Default mode. Used when no prior session data indicates gaps, when this is the candidate's first session, or when balanced coverage across all competency domains is the primary objective.

---

### Mode 2 — HYPOTHETICAL_BRANCH_FOCUS

**Clinical Reality:** The examiner uses the candidate's case as a foundation and introduces hypothetical scenarios to probe competencies the natural case flow may not adequately assess. "Suppose during the operation you noticed gross hematuria..." The hypothetical is not scripted — it is formulated at runtime based on what competency evidence is still needed.

**Pipeline Behavior:**
- Cases run through the full Case Simulation Engine pipeline
- `hypotheticalBranchingAuthorized = true`
- The Examiner Decision Engine is authorized to introduce hypothetical branches at runtime when Evidence Goals remain unmet by natural case flow
- Hypothetical branches are constructed by the Examiner Decision Engine using the Examiner Knowledge Corpus
- The Assessment Plan does not specify hypothetical content — it specifies Evidence Goals and authorizes the mechanism

**When Selected:** When the candidate's submitted case list or available library cases do not provide sufficient natural opportunity to assess all priority competency domains; when Evidence Gathering Mode is TARGETED_GAP or PASS_FAIL_DETERMINATION; when the Examiner Knowledge Corpus is available to support runtime branch construction.

---

### Mode 3 — COMPLICATION_REVIEW

**Clinical Reality:** The examiner notices a significant complication in the candidate's submitted case list and asks the candidate to explain what happened in their own case. This is a structured recall and reasoning probe based on the candidate's personal clinical experience. It is rare — typically one occurrence per full examination, never more than two.

**Pipeline Behavior:**
- The Case Simulation Engine plays a minimal role; no patient physiological simulation is active for the Complication Review segment
- The candidate provides information from memory; the examiner cannot control information release
- The Examiner Decision Engine conducts structured recall probing using `ComplicationReviewSpec` as context
- Evidence is collected from candidate narrative by the Candidate Assessment Engine
- The Complication Review segment is positioned last in the case sequence (`sessionPosition` in `ComplicationReviewSpec`)

**When Selected:** When the Submitted Case List contains a complication with `clinicalSignificance = HIGH` from a resident-managed case (`residentManaged = true`); when the complication creates an assessment opportunity not available through standard simulation; never as the primary examination mode for the session.

---

## Section 19 — Ownership Boundaries

### Boundary 1 — Assessment Planning Engine / Case Simulation Engine

The Assessment Planning Engine specifies *which* Case Model to use and *which* Level 1 Transforms to apply. The Case Simulation Engine owns everything about how that case runs at runtime: patient state, information release, evolution, consequences. The Assessment Planning Engine has no runtime role.

**Violation indicator:** If the Assessment Planning Engine were to specify clinical findings, vital signs, or information inventory content, this boundary would be violated.

### Boundary 2 — Assessment Planning Engine / Examiner Decision Engine

The Assessment Planning Engine specifies *what* evidence is needed (Evidence Goals, Competency Targets, Assessment Intent). The Examiner Decision Engine determines *how* to collect that evidence per exchange (probe selection, action selection, hypothetical branch construction). The Assessment Planning Engine specifies intent. The Examiner Decision Engine executes reasoning.

**Violation indicator:** If the Assessment Planning Engine were to specify probe questions or hypothetical scenario text, this boundary would be violated.

### Boundary 3 — Assessment Planning Engine / Examiner Knowledge Corpus

The Assessment Planning Engine queries the Corpus during Stage 3 (Case Selection) to assess which Case Models are best suited to assess priority competency domains. The Examiner Decision Engine queries the Corpus at runtime to construct hypothetical branches. The Assessment Planning Engine's corpus interaction is limited to case suitability assessment — it does not request or receive probe strategies, scenario content, or hypothetical branches.

**Violation indicator:** If the Assessment Planning Engine were to receive hypothetical branch content from the Corpus, this boundary would be violated.

### Boundary 4 — Assessment Planning Engine / Candidate Assessment Engine

The Assessment Planning Engine reads the Candidate Profile (prior session summary) as input. The Candidate Assessment Engine writes to the Candidate Profile (current session evidence and scores) as output. These two engines never exchange data directly during a session. The Assessment Planning Engine's read of prior session data is a pre-session, read-only operation.

**Violation indicator:** If the Assessment Planning Engine were to receive real-time candidate performance data during session planning, this boundary would be violated.

---

## Section 20 — Runtime Interfaces

### 20.1 Interface: Assessment Planning Engine → Encounter Initialization Subsystem

**Direction:** Assessment Planning Engine produces Assessment Plan → Encounter Initialization receives it
**Protocol:** Direct internal call (subsystem boundary, not a network interface)
**Data transferred:** Complete Assessment Plan object (immutable)
**Timing:** Synchronous — Encounter Initialization begins immediately upon plan emission
**Error handling:** If Encounter Initialization fails (see Section 21), it returns an error to the Assessment Planning Engine for logging; the session does not begin

### 20.2 Interface: Encounter Initialization → Case Simulation Engine

**Direction:** Encounter Initialization emits Encounter object → Case Simulation Engine receives it
**Protocol:** Session initialization call
**Data transferred:** Complete Encounter object
**Timing:** Synchronous — Case Simulation Engine initializes from Encounter before first exchange
**Error handling:** If Case Simulation Engine initialization fails, ENCOUNTER_INITIALIZATION_FAILED error is raised

### 20.3 Interface: Encounter Object → Examiner Decision Engine (Runtime Read)

**Direction:** Examiner Decision Engine reads Encounter object per exchange
**Access type:** Read-only
**Fields read:** `examinationMode`, `evidenceGatheringMode`, `hypotheticalBranchingAuthorized`, `competencyTargets`, `evidenceGoals`, `assessmentIntent`, `passFailPriorityDomain`, `activeCase`, `complicationReviewSpec`
**Fields never read by Examiner Decision Engine:** Transform log, encounter identity fields, completion record
**Timing:** Per-exchange read; Encounter object is available in session state throughout the session

### 20.4 Interface: Encounter Object → Candidate Assessment Engine (Runtime Read)

**Direction:** Candidate Assessment Engine reads Encounter object for session context
**Access type:** Read-only
**Fields read:** `competencyTargets`, `evidenceGoals`, `caseSequence`, `assessmentIntent`, `examinationMode`, `sessionId`, `planId`
**Timing:** Read at session start and at case transitions

### 20.5 Interface: Assessment Planning Engine → Candidate Profile Store (Write)

**Direction:** Assessment Planning Engine writes one Session Record post-emission
**Access type:** Write-once (idempotent)
**Data written:** Session Record (defined in Section 7)
**Timing:** After plan emission; before Encounter Initialization begins
**Error handling:** Non-blocking write failure is logged; session proceeds without retrying the write immediately (write is reconciled at session completion)

---

## Section 21 — Error Conditions

| Error Code | Trigger | Behavior |
|-----------|---------|---------|
| `PLAN_VALIDATION_ERROR` | Stage 5 plan validation fails | Session does not begin; error logged with specific validation failure detail; human review required |
| `NO_ELIGIBLE_CASES` | Case selection finds zero cases satisfying all constraints | Session does not begin; error logged; constraint relaxation may be attempted (deduplication constraint removed first; ABOG Blueprint coverage constraint removed last) |
| `INVALID_MODE_OVERRIDE` | COMPLICATION_REVIEW override references a targetComplicationId not in the candidate's Submitted Case List | Override rejected; engine defaults to STANDARD mode; warning logged |
| `TRANSFORM_INVALID` | A Level 1 Transform fails `biologicallyPermitted` or `withinAuthoredRange` check | Transform is excluded; Case Model default value is used; warning logged; plan emission continues |
| `ENCOUNTER_INITIALIZATION_FAILED` | Encounter Initialization subsystem fails (Case Model retrieval failure; Encounter object construction error) | Session does not begin; full error logged; human review required |
| `CANDIDATE_PROFILE_WRITE_FAILED` | Post-emission write to Candidate Profile store fails | Logged as non-blocking; session proceeds; write reconciled at session end |
| `HARD_DEPENDENCY_UNAVAILABLE` | Any hard dependency (ABOG Blueprint Requirements, Submitted Case List Index, Case Library, Examination Objectives) is unavailable | Session does not begin; error raised immediately; no planning proceeds |

---

## Section 22 — Architectural Invariants

The following properties must hold at every point in the Assessment Planning Engine's lifecycle and in every session it initializes. Violation of any invariant represents an architectural failure.

| Invariant | Rule |
|-----------|------|
| **I-01 Plan Immutability** | The Assessment Plan is immutable after emission. No runtime process may modify any field of an emitted Assessment Plan. |
| **I-02 Case Model Validation** | The engine may not select or operate on a Case Model with `validationStatus ≠ ACTIVE`. |
| **I-03 Blueprint Compliance** | Every emitted Assessment Plan must address all `mandatoryCompetencyDomains` from the ABOG Blueprint Requirements through at least one `LOAD_BEARING` Evidence Goal. |
| **I-04 Safety Target Mandatory** | Every session must include SAFETY_AWARENESS as a CompetencyTarget with priority = PRIMARY. |
| **I-05 Evidence-Quality Expression** | All `sufficientEvidence`, `closureCondition`, and `gapSignal` fields in Evidence Goals must be expressed at the evidence-quality level. Content-level expressions violate the competency-not-recall examination philosophy. |
| **I-06 No Content Specification** | The Assessment Plan must not contain probe questions, hypothetical scenario text, clinical narratives, or patient state values of any kind. |
| **I-07 Transform Boundary** | Level 1 Transforms may only be applied within the `transformationAllowed` parameters of the Case Model. Both `biologicallyPermitted` and `withinAuthoredRange` must be true. |
| **I-08 Encounter Immutability** | The Encounter object is immutable after initialization except for `encounterStatus`, `activeCase`, and `sessionCompletionRecord`, which are updated only by their authorized mutators. |
| **I-09 Mode Integrity** | The `examinationMode` field in the Encounter object must remain unchanged from its initialized value throughout the session. Runtime engines may not change the examination mode after initialization. |
| **I-10 No Runtime Role** | The Assessment Planning Engine performs no operations after plan emission. It has no callbacks, no observers, and no participation in the runtime session. |
| **I-11 Complication Review Constraint** | Complication Review must always occupy the final position in the case sequence. It is never the opening or intermediate segment. |
| **I-12 Pass/Fail Priority Assignment** | Every Assessment Plan must assign a `passFailPriorityDomain`. No session may be planned without specifying which competency domain is load-bearing for the pass/fail determination. |
| **I-13 Assessment Intent Authority** | No runtime engine may introduce assessment objectives, competency targets, or evidence requirements not specified in the emitted Assessment Plan. Runtime engines consume Assessment Intent — they do not extend, override, or supplement it. Any session behavior not derivable from the Assessment Plan and the Constitution is a violation of this invariant. |

---

## Section 23 — Future Compatibility

The Assessment Planning Architecture is designed to remain stable under the following future capabilities. Implementation of these capabilities requires no structural changes to this document.

**Thousands of Cases:** The Case Library grows. The engine's case selection logic operates on indexed Case Model metadata, not on full Case Model content. Selection logic scales with the index, not with the full library. No architectural change required.

**AI-Generated Case Models:** Generated cases enter the Case Library through the Case Conversion Engine and pass the same validation requirements as authored cases (`validationStatus = ACTIVE`, `clinicallyValidatedBy` populated). The Assessment Planning Engine is indifferent to how a Case Model was produced. No architectural change required.

**Multiple Examiner Personalities:** Examiner personality is a configuration of the Examiner Decision Engine, not of the Assessment Plan. The Encounter object could carry an `examinerPersonalityId` field as a future extension without modifying the Assessment Plan schema. The Assessment Planning Engine does not own personality selection.

**Adaptive Examinations:** The Candidate Profile (Input 4) is already designed to carry competency gap data from prior sessions. The `evidenceGatheringMode = TARGETED_GAP` mechanism is already in the schema. Adaptive selection — choosing cases that specifically target prior gaps — is a refinement of existing case selection logic, not a new capability. No structural change required.

**Resident Recall Intelligence:** The engine already reads `casesSeenPrior` from the Candidate Profile for deduplication. Expanding this to more sophisticated recall tracking (e.g., which specific competency domains were inadequately assessed in which cases) requires extending the Candidate Profile schema, not the Assessment Planning Architecture.

**Dynamic Case Generation:** If the Case Conversion Engine gains the ability to generate Case Models at session-request time (rather than only at upload time), those cases enter the Case Library and are available to this engine without any structural change. The engine's relationship to the Case Library is independent of how cases entered the library.

**Examiner Knowledge Corpus Integration:** The engine already has a soft dependency on the Corpus (Input 5, Section 5.2). When the Corpus is fully implemented, corpus query results replace the degraded-mode behavior described in Section 5.2. The interface point is already defined. No structural change required.

---

## Section 24 — Governing Principles Applied

This document was produced under the eight permanent Architecture Governance Principles. The following table records how each principle was applied.

| Principle | Application in This Document |
|-----------|----------------------------|
| 1 — Observed examiner behavior is highest authority | Section 1 (Clinical Reality Check) establishes the observed workflow as the foundation for every architectural decision |
| 2 — Architecture translates behavior to software | Section 1 concludes with an explicit translation table mapping each real examiner behavior to its software representation |
| 3 — Realism over elegance | Evidence Goals require evidence-quality expressions rather than content-level specifications, preserving examination realism at the cost of implementation simplicity |
| 4 — Engine introduction threshold | Encounter Initialization is documented as a subsystem, not a separate engine, per ownership-boundary analysis |
| 5 — Architectural stability | No existing governing architecture decisions were modified; this document formalizes and extends the approved architecture |
| 6 — Artifact evaluation standard | Every section was evaluated against: faithful to real ABOG examiner behavior? ownership boundaries preserved? architectural stability maintained? |
| 7 — Structure vs. improvisation | The Assessment Plan specifies structure (intent, evidence goals, mechanisms). The Examiner Decision Engine provides improvisation (specific probes, hypothetical branches). This separation is explicitly maintained throughout |
| 8 — Product specialization and engine generality | ABOG-specific content (competency domains, ABOG Blueprint, examination philosophy) lives in the knowledge layer. The Assessment Planning Engine solves a general pre-session planning problem governed by ABOG-specific knowledge inputs |

---

*Assessment Planning Architecture v1*
*AI ABOG Oral Board Simulator*
*Version 1.1 — Architecture Acceptance Revision — 2026-06-20*
*24 Sections | Clinical Reality Check | Complete Assessment Plan Schema | Strategic/Operational Assessment Intent | Encounter Object as Authoritative Session Context | Three Examination Modes | 13 Architectural Invariants including I-13 Assessment Intent Authority | Future Compatibility Analysis*
*Governing Documents: Constitution v1.1 | Case Simulation Engine Architecture v1 | Runtime State Schema v1*
*Downstream Dependents: Case Simulation Engine | Examiner Decision Engine Architecture v1 | Examiner Knowledge Corpus Architecture v1 | Candidate Assessment Engine*

---

## Architecture Freeze Record

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHITECTURE FREEZE RECORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Artifact Name:        Assessment_Planning_Architecture_v1.md
Version:              1.1
Status:               FROZEN — Canonical Governing Artifact
Freeze Date:          2026-06-20
Project:              AI ABOG Oral Board Simulator

─────────────────────────────────────────────────────────────
GOVERNING DOCUMENTS
─────────────────────────────────────────────────────────────
  • ABOG Examiner Constitution v1.1 Consolidated
  • Case Simulation Engine Architecture v1
  • Runtime State Schema v1
  • Candidate Assessment Architecture v1
  • Implementation Roadmap v1
  • Architecture Governance Principles (8 permanent)

─────────────────────────────────────────────────────────────
UPSTREAM DEPENDENCIES
─────────────────────────────────────────────────────────────
  Hard:
  • ABOG Blueprint Requirements (external configuration)
  • Submitted Case List Index (Case Conversion Engine)
  • Case Library of active Case Models
  • Examination Objectives Configuration

  Soft:
  • Candidate Profile Store
  • Examiner Knowledge Corpus
  • Examination Mode Override

─────────────────────────────────────────────────────────────
DOWNSTREAM DEPENDENTS
─────────────────────────────────────────────────────────────
  • Case Simulation Engine (Encounter object consumer)
  • Examiner Decision Engine (Encounter object consumer)
  • Candidate Assessment Engine (Encounter object consumer)
  • Examiner Decision Engine Architecture v1 (pending)
  • Examiner Knowledge Corpus Architecture v1 (pending)
  • Case Blueprint Schema Update (pending)

─────────────────────────────────────────────────────────────
REASON FOR FREEZE
─────────────────────────────────────────────────────────────
  Completed: Initial production under Architecture Governance
  Completed: Architecture Acceptance Review (no contradictions)
  Completed: Architecture Acceptance Revision (4 recommendations,
             all incorporated)
  Completed: Repository Transition pre-freeze checklist
             (18 checks, all passed)

─────────────────────────────────────────────────────────────
AMENDMENT POLICY
─────────────────────────────────────────────────────────────
  Amendments permitted only when one of the following
  conditions is met:

  A — Observed Examiner Behavior Correction
      New ABOG diplomate evidence demonstrates inaccuracy
      in the architectural representation of real examiner
      behavior.

  B — Architectural Contradiction
      A genuine contradiction discovered between this
      document and another canonical governing artifact.
      Must be formally reported before any amendment.

  C — Downstream Implementation Requirement
      A downstream architecture artifact identifies an
      interface gap that cannot be resolved without
      amending this document.

  Amendment Process:
  1. Document triggering condition
  2. Review against 8 Architecture Governance Principles
  3. Review against 13 Architectural Invariants
  4. Architecture owner approval
  5. Version increment: minor = v1.x; structural = v2.0
  6. Update this Freeze Record
  7. Review all downstream dependents for impact

  Structural amendments (ownership boundaries, new engines,
  Assessment Plan schema changes) require v2.0 versioning
  and full downstream dependent re-review.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF FREEZE RECORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
