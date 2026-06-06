export const CASES = [
  {
    id: 'D',
    topic: 'Hypertension In Pregnancy',
    difficulty: 'standard',
    totalPoints: 7,
    scoring: {
      pass:     { threshold: 5, percent: 71 },
      marginal: { threshold: 4, percent: 57 },
      fail:     { threshold: 3, percent: 43 },
    },
    questions: [
      {
        id: 1,
        points: 1,
        context: 'A 17 year old 1G/0P at 33 weeks EGA is seen as a work-in for worsening pedal edema. Her mother is "worried sick she\'s developing toxemia" since she had that with all of her three pregnancies. Her BP is 146/84 and she has 1+ proteinuria. She has good fetal movement and her fundal height measures 33cm.',
        question: 'How do you delineate gestational hypertension from preeclampsia?',
        idealAnswer:
          'Gestational HTN = HTN (SBP >140 or DBP >90 on 2 visits at least 4 hours apart) that develops after 20 weeks in a woman with a previously normal blood pressure. Preeclampsia = HTN after 20 weeks with proteinuria (>300 mg/24 hours, or >2+ dipstick, or protein/creatinine ratio >0.3 on spot urine).',
        teachingPoints: [
          'Gestational hypertension requires ≥2 BP readings ≥4 hours apart — a single elevated reading is not diagnostic.',
          'Preeclampsia can also be diagnosed without proteinuria if severe features are present: thrombocytopenia (<100,000/μL), renal insufficiency (Cr >1.1), impaired liver function (LFTs ≥2× normal), pulmonary edema, or new-onset headache unresponsive to medication.',
          'Preeclampsia superimposed on chronic hypertension carries higher risk than either alone and can present earlier than 20 weeks.',
          'Family history of preeclampsia (like this patient\'s mother) is a significant risk factor — low-dose aspirin prophylaxis is recommended for high-risk patients starting at 12–16 weeks.',
        ],
        acogReference: 'ACOG Practice Bulletin #222: Gestational Hypertension and Preeclampsia (2020)',
      },
      {
        id: 2,
        points: 1,
        context: 'You recommend that she decrease her activity and order some baseline labs.',
        question: 'What labs would you order?',
        idealAnswer:
          'CBC, liver function tests (LFTs), renal function tests (BUN, creatinine), uric acid, coagulation panel (PT, PTT, fibrinogen, fibrin split products), and 24-hour urine for total protein and creatinine clearance.',
        teachingPoints: [
          'A complete baseline lab panel establishes whether end-organ damage is present and provides a reference for trending organ function.',
          'Uric acid elevation (>5.5 mg/dL) correlates with severity and can precede overt preeclampsia, though it is not included in the diagnostic criteria.',
          'Spot urine protein/creatinine ratio ≥0.3 is equivalent to ≥300 mg on a 24-hour urine collection and can expedite diagnosis.',
          'Liver enzymes (AST/ALT) are hallmarks of HELLP syndrome; thrombocytopenia on CBC and LFT elevation together should raise immediate concern.',
        ],
        acogReference: 'ACOG Practice Bulletin #222: Gestational Hypertension and Preeclampsia (2020)',
      },
      {
        id: 3,
        points: 2,
        context:
          'You are now seeing her 1½ weeks later at 34 3/7 weeks. The patient has been on bed rest. Her BP is 170/110, her urine is 2+ on dipstick, and she complains of a severe headache unrelieved with Tylenol. Her labs show: Hb 10.5 / Hct 31 g/dL, Platelets 105,000, BUN 10 mg/dL, Creatinine 1.0 mg/dL, Urine protein/Cr 0.5. The 24-hour urine and CMP are pending.',
        question: 'How would you manage her?',
        idealAnswer:
          'She has worsened to severe preeclampsia (BP >160/110, severe headache, thrombocytopenia, possible hemodilution). Admit to hospital. Monitor weights, BP, I&Os, labs. Judicious fluid management. Check deep tendon reflexes. Proceed toward delivery. Start Magnesium sulfate (seizure prophylaxis). Administer antenatal corticosteroids (betamethasone) for lung maturity at 34 weeks. Administer antihypertensive agent PRN to keep SBP <160 and DBP <110.',
        teachingPoints: [
          'Severe features of preeclampsia include: SBP ≥160 or DBP ≥110, thrombocytopenia (<100K), renal insufficiency (Cr >1.1 or doubling), impaired liver function (LFTs ≥2× normal), pulmonary edema, new-onset headache unresponsive to medication, or visual symptoms.',
          'Magnesium sulfate is the drug of choice for seizure prophylaxis in severe preeclampsia — it is superior to phenytoin and diazepam for this indication.',
          'Antenatal corticosteroids (betamethasone 12 mg IM q24h × 2 doses) should be given when delivery is anticipated between 24 0/7 and 36 6/7 weeks — this patient at 34 weeks qualifies.',
          'BP goal with antihypertensives in acute severe hypertension: SBP 130–150 mmHg and DBP 80–100 mmHg. Treat acute severe hypertension (SBP ≥160 or DBP ≥110) within 30–60 minutes.',
          'Fluid restriction is important — pulmonary edema is a common cause of maternal morbidity in preeclampsia; restrict IVF to 80–125 mL/hour unless oliguria is present.',
        ],
        acogReference: 'ACOG Practice Bulletin #222 (2020); ACOG Committee Opinion #767: Emergent Therapy for Acute-Onset, Severe Hypertension (2019)',
      },
      {
        id: 4,
        points: 2,
        context:
          'You round on her that evening and note her BP is persistently >160/110 and her DTRs are 3–4+. Her headache has not improved in spite of Percocet. Additional labs show: SGOT 80 U/L (normal 3–40), SGPT 60 U/L (normal 12–32), 24-hour protein 5.6 g. Her urine output has been 180 cc on one void.',
        question: 'How would you manage her?',
        idealAnswer:
          'She absolutely needs to be delivered. If the cervix is unripe, start cervical ripening and/or Pitocin induction — it would be inappropriate to perform an immediate cesarean delivery. Start or continue Magnesium sulfate 4–6 g IV loading dose then 2 g/hour. Antihypertensive options: Nifedipine IR 10–20 mg PO q20 min PRN x3; or Labetalol 20 mg IV bolus then 40 mg q10 min PRN; or Hydralazine 5–10 mg IV q15–20 min PRN. Judicious fluid management with Foley catheter and strict I&Os.',
        teachingPoints: [
          'Delivery is the definitive treatment for severe preeclampsia at ≥34 weeks — there is no benefit to expectant management beyond 34 weeks gestation.',
          'Cesarean delivery is NOT required for severe preeclampsia — vaginal delivery is preferred if achievable; cesarean is reserved for standard obstetric indications.',
          'First-line antihypertensives for acute severe hypertension in pregnancy: IV labetalol, IV hydralazine, or oral nifedipine IR. Do not use sublingual nifedipine (risk of precipitous hypotension) or ACE inhibitors (teratogenic).',
          'Hyperreflexia (DTRs 3–4+) and persistent headache despite analgesia are ominous signs of impending eclampsia — reinforce magnesium dosing and ensure seizure precautions are in place.',
          'Magnesium toxicity signs: loss of patellar reflexes (first sign, at ~7 mEq/L), respiratory depression (at ~10 mEq/L), cardiac arrest (at ~15 mEq/L). Antidote: calcium gluconate 1 g IV.',
        ],
        acogReference: 'ACOG Practice Bulletin #222 (2020); ACOG Committee Opinion #767 (2019)',
      },
      {
        id: 5,
        points: 1,
        context:
          'You are just leaving the doctor\'s lounge when you hear an overhead page for "Respiratory Therapy STAT to L&D." You run up and upon arrival see the ED doctor is intubating your patient.',
        question: 'What is your differential diagnosis for her respiratory arrest?',
        idealAnswer:
          'Magnesium toxicity, post-eclamptic seizure, hypertensive stroke, amniotic fluid embolus (AFE), pulmonary embolus (PE), pulmonary edema.',
        teachingPoints: [
          'Magnesium toxicity is the most immediately reversible cause and must be considered first — check DTRs and respiratory rate, give calcium gluconate 1 g IV if suspected.',
          'AFE classically presents with sudden cardiovascular collapse, respiratory failure, and DIC — it is rare but catastrophic and often occurs during or just after delivery or with uterine manipulation.',
          'Hypertensive stroke (hemorrhagic or ischemic) is a leading cause of maternal mortality in preeclampsia/eclampsia — uncontrolled SBP ≥160 mmHg significantly raises stroke risk.',
          'Pulmonary edema in preeclampsia is often iatrogenic (excessive IV fluids) or from decreased oncotic pressure (low albumin) + increased capillary permeability.',
          'Eclamptic seizures are typically self-limited but cause hypoxia; treat with magnesium (4–6 g IV bolus) and ensure airway protection. Eclampsia can occur antepartum, intrapartum, or postpartum.',
        ],
        acogReference: 'ACOG Practice Bulletin #222 (2020); ACOG Practice Bulletin #211: Critical Care in Obstetrics (2019)',
      },
    ],
  },
]
