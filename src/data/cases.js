export const CASES = [
  {
    id: 'D',
    topic: 'Hypertension In Pregnancy',
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
      },
      {
        id: 2,
        points: 1,
        context: 'You recommend that she decrease her activity and order some baseline labs.',
        question: 'What labs would you order?',
        idealAnswer:
          'CBC, liver function tests (LFTs), renal function tests (BUN, creatinine), uric acid, coagulation panel (PT, PTT, fibrinogen, fibrin split products), and 24-hour urine for total protein and creatinine clearance.',
      },
      {
        id: 3,
        points: 2,
        context:
          'You are now seeing her 1½ weeks later at 34 3/7 weeks. The patient has been on bed rest. Her BP is 170/110, her urine is 2+ on dipstick, and she complains of a severe headache unrelieved with Tylenol. Her labs show: Hb 10.5 / Hct 31 g/dL, Platelets 105,000, BUN 10 mg/dL, Creatinine 1.0 mg/dL, Urine protein/Cr 0.5. The 24-hour urine and CMP are pending.',
        question: 'How would you manage her?',
        idealAnswer:
          'She has worsened to severe preeclampsia (BP >160/110, severe headache, thrombocytopenia, possible hemodilution). Admit to hospital. Monitor weights, BP, I&Os, labs. Judicious fluid management. Check deep tendon reflexes. Proceed toward delivery. Start Magnesium sulfate (seizure prophylaxis). Administer antenatal corticosteroids (betamethasone) for lung maturity at 34 weeks. Administer antihypertensive agent PRN to keep SBP <160 and DBP <110.',
      },
      {
        id: 4,
        points: 2,
        context:
          'You round on her that evening and note her BP is persistently >160/110 and her DTRs are 3–4+. Her headache has not improved in spite of Percocet. Additional labs show: SGOT 80 U/L (normal 3–40), SGPT 60 U/L (normal 12–32), 24-hour protein 5.6 g. Her urine output has been 180 cc on one void.',
        question: 'How would you manage her?',
        idealAnswer:
          'She absolutely needs to be delivered. If the cervix is unripe, start cervical ripening and/or Pitocin induction — it would be inappropriate to perform an immediate cesarean delivery. Start or continue Magnesium sulfate 4–6 g IV loading dose then 2 g/hour. Antihypertensive options: Nifedipine IR 10–20 mg PO q20 min PRN x3; or Labetalol 20 mg IV bolus then 40 mg q10 min PRN; or Hydralazine 5–10 mg IV q15–20 min PRN. Judicious fluid management with Foley catheter and strict I&Os.',
      },
      {
        id: 5,
        points: 1,
        context:
          'You are just leaving the doctor\'s lounge when you hear an overhead page for "Respiratory Therapy STAT to L&D." You run up and upon arrival see the ED doctor is intubating your patient.',
        question: 'What is your differential diagnosis for her respiratory arrest?',
        idealAnswer:
          'Magnesium toxicity, post-eclamptic seizure, hypertensive stroke, amniotic fluid embolus (AFE), pulmonary embolus (PE), pulmonary edema.',
      },
    ],
  },
]
