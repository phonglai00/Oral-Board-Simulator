# Grader v2 Validation Summary — Phase 7

**Run:** 2026-06-10T07:29:04.442Z
**Dataset:** v1.0.0
**Grader spec:** v1.0.0 (frozen 2026-06-06)
**Scoring model:** claude-haiku-4-5-20251001
**Score tolerance:** ±1 per dimension
**Probability tolerance:** ±15%

---

## Overall Result

| Metric | Value |
|--------|-------|
| Archetypes tested | 35 |
| Passed | 13 |
| Failed | 22 |
| Pass rate | 37% |
| Verdict | **FAIL** — grader calibration is outside acceptable range; prompt revision required. |

---

## Per-Question Summary

| Question | Topic | Passed | Pass Rate |
|----------|-------|--------|-----------|
| Q1 | NST Interpretation | 3 / 7 | 43% |
| Q2 | Term Nonreactive NST Management | 2 / 7 | 29% |
| Q3 | Acute Fetal Bradycardia After Epidural | 4 / 7 | 57% |
| Q4 | Severe Preeclampsia Management | 2 / 7 | 29% |
| Q5 | Uterotonic Selection — Postpartum Hemorrhage | 2 / 7 | 29% |

---

## Dimension Accuracy

| Dimension | Passed | Pass Rate |
|-----------|--------|-----------|
| Safety         | 31 / 35 |    89% |
| Diagnostic     | 25 / 35 |    71% |
| Management     | 29 / 35 |    83% |
| Focus          | 32 / 35 |    91% |
| Terminology    | 29 / 35 |    83% |
| Communication  | 33 / 35 |    94% |
| Recovery       | 30 / 35 |    86% |

---

## Flag Detection Accuracy

| Flag | Passed | Pass Rate |
|------|--------|-----------|
| isDangerous | 26 / 35 | 74% |
| isCurveball | 29 / 35 | 83% |

---

## Per-Archetype Results

| Question | Arch | Label              | Dims | Prob       | Dangerous  | Curveball  | ABOG           | Pass |
|----------|------|--------------------|------|------------|------------|------------|----------------|------|
| Q1 | A | Pass-Strong        | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q1 | B | Pass-Adequate      | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q1 | C | Borderline-High    | FAIL | PASS       | PASS       | PASS       | PASS           | ✗ |
| Q1 | D | Borderline-Low     | FAIL | 59≠80      | PASS       | PASS       | PASS           | ✗ |
| Q1 | E | Fail-Incomplete    | FAIL | 41≠73      | PASS       | PASS       | Fail≠Pass      | ✗ |
| Q1 | F | Fail-Dangerous     | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q1 | G | Fail-Curveball     | FAIL | 38≠59      | got true   | got false  | PASS           | ✗ |
| Q2 | A | Pass-Strong        | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q2 | B | Pass-Adequate      | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q2 | C | Borderline-High    | FAIL | 45≠74      | PASS       | got true   | Fail≠Pass      | ✗ |
| Q2 | D | Borderline-Low     | PASS | PASS       | got true   | PASS       | PASS           | ✗ |
| Q2 | E | Fail-Incomplete    | FAIL | PASS       | got true   | PASS       | PASS           | ✗ |
| Q2 | F | Fail-Dangerous     | FAIL | PASS       | PASS       | PASS       | PASS           | ✗ |
| Q2 | G | Fail-Curveball     | PASS | PASS       | got true   | got false  | PASS           | ✗ |
| Q3 | A | Pass-Strong        | FAIL | 45≠100     | got true   | PASS       | Fail≠Pass      | ✗ |
| Q3 | B | Pass-Adequate      | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q3 | C | Borderline-High    | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q3 | D | Borderline-Low     | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q3 | E | Fail-Incomplete    | FAIL | PASS       | PASS       | PASS       | PASS           | ✗ |
| Q3 | F | Fail-Dangerous     | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q3 | G | Fail-Curveball     | PASS | 23≠41      | got true   | got false  | PASS           | ✗ |
| Q4 | A | Pass-Strong        | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q4 | B | Pass-Adequate      | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q4 | C | Borderline-High    | FAIL | PASS       | PASS       | PASS       | PASS           | ✗ |
| Q4 | D | Borderline-Low     | FAIL | PASS       | got true   | PASS       | PASS           | ✗ |
| Q4 | E | Fail-Incomplete    | FAIL | 44≠27      | got true   | PASS       | PASS           | ✗ |
| Q4 | F | Fail-Dangerous     | FAIL | 42≠26      | PASS       | PASS       | PASS           | ✗ |
| Q4 | G | Fail-Curveball     | FAIL | PASS       | got true   | got false  | PASS           | ✗ |
| Q5 | A | Pass-Strong        | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q5 | B | Pass-Adequate      | PASS | PASS       | PASS       | PASS       | PASS           | ✓ |
| Q5 | C | Borderline-High    | FAIL | 87≠64      | PASS       | PASS       | PASS           | ✗ |
| Q5 | D | Borderline-Low     | FAIL | 82≠53      | PASS       | PASS       | Pass≠Fail      | ✗ |
| Q5 | E | Fail-Incomplete    | FAIL | 63≠43      | PASS       | PASS       | PASS           | ✗ |
| Q5 | F | Fail-Dangerous     | FAIL | PASS       | PASS       | PASS       | PASS           | ✗ |
| Q5 | G | Fail-Curveball     | FAIL | PASS       | PASS       | got false  | PASS           | ✗ |

---

*Generated by ValidationHarness_v1.js*
*Phase 7 Validation Infrastructure — Evaluation Dataset v1.0.0*
