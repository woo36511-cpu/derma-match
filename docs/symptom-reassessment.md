# Symptom reassessment and practical self-care

This release adds a conservative symptom triage questionnaire, evidence explanations and low-burden self-care to DearSince. It does **not** diagnose acne, bacterial folliculitis, Malassezia folliculitis, immune deficiency or gut dysbiosis. No diagnostic probabilities, clinical accuracy claims or automatic medication sequences are produced. Rule version: `symptom-triage-v1`; clinical validation: not performed.

## User flow

- Both beginner and quick recommendation paths first ask about current warning signs, symptom change and skin condition. Existing Journey check-ins also start a fresh check.
- A permanent “증상 변화·악화 재설문” entry is available on the start, feedback and result screens. Users do not need to wait two weeks after worsening.
- Questions branch on the presence of an eruption, shaving and current treatment. They cover comedones, uniformity, itch, follicle-centred lesions, distribution, shaving/ingrown hairs, sweat, recent antibiotics/steroids, pain/scarring, duration, treatment and actual adherence. “Unknown” is an explicit answer.
- Current breathing/swallowing difficulty or tongue/throat swelling stops the questionnaire immediately with emergency guidance. Rapid spread/pain, systemic infection signs and eye-related symptoms stop with urgent evaluation guidance. Missing/unknown safety information, significant irritation, worsening, persistent folliculitis-like patterns and overlapping possibilities hold new product recommendations.
- Pattern explanations show the supporting answers and the remaining uncertainty. The list is not ordered by likelihood and multiple possibilities can coexist. Neither improvement nor treatment failure establishes a pathogen.
- Deep lesions, severe pain/scarring, damaged/oozing skin and infection-vulnerable users are routed to clinical review. Appropriate diagnosis starts with clinical assessment; microscopy, culture or biopsy is selected when necessary, rather than presented as a universal first test.
- Two-week checks assess tolerability, worsening, adherence and changes in discomfort. They are not a two-week deadline for acne efficacy or a prompt to switch to antifungals/antibiotics. NICE describes noticeable benefit after 6–8 weeks and first-line review at 12 weeks. Red flags and worsening take priority over those intervals.

## Cosmetics and medicines

The existing routine builder is filtered through a safety policy. Held recommendations also have an empty product map before being saved, so the UI is not the only protection. Clinical-priority issue guides suppress routine cards and the two-week trial CTA. Feedback that reports increasing lesions or significant irritation independently holds new products, even if an earlier check was reassuring. A saved survey requires a fresh symptom check before showing a current recommendation again.

Legacy rules that surfaced benzoyl peroxide or salicylic acid and dose schedules from pus/recurrence alone now direct users to pharmacist assessment instead. This release does not introduce new drug candidates, replacement sequences or prescriptions. A future drug catalogue needs current Korean authorization checks, individual eligibility, professional review and validation before activation.

## Visual support

`LesionComparison` contains original SVG **schematics**, labelled as drawings rather than clinical photographs. The diagrams explain the answer vocabulary and cannot identify a disease, pathogen or treatment. Skin appearance varies with skin tone, lighting and disease stage. Links open the original AAD/DermNet/Mayo educational resources; their clinical photographs are not copied, hotlinked or generated. No user photograph is collected or uploaded.

## Practical self-care and gut–skin context

- Simple dryness can be supported with gentle cleansing and previously tolerated moisturization. Barrier support does not replace treatment of infection or inflammatory disease. Stinging, occlusion-related bumps and worsening are reassessed rather than answered by adding more layers.
- Users record gut discomfort (or decline), vegetable/fruit habits, probiotic use/change and one manageable habit to try. The same questions on return allow the observations to be updated.
- Gut–skin research and trials of particular probiotic formulations are acknowledged. A 12-week trial of a specific probiotic plus *Arthrospira* formulation does not establish a class effect for all probiotics or efficacy against folliculitis. Selecting a probiotic should consider strain, purpose-specific human evidence, storage, guaranteed viability and safety. New supplements or concurrent medicines reduce product-attribution confidence; the automatic product score correction remains disabled.
- Prepared/frozen/freeze-dried vegetables are described as practical ways to supplement a balanced diet. Actual vegetable amount, portion, salt and sugar matter; a powder/small portion is not assumed equivalent to a serving of vegetables. No product or purchase is required and no skin cure or generic “immune boosting” claim is made.

## Storage and compatibility

Completed checks are stored through the existing account-scoped Journey cache/sync with `type: "feedback"`, `source: "symptom_check"`, `assessmentOnly: true`, answers, rule version, candidate reasons and urgency. They have **no** invented skin axes, routine, treatment outcome, product usage or attribution. No database/RLS change is needed: this is an additive JSON payload in the existing permitted record type.

`useSkinCoach` excludes assessment-only records from Journey rounds, baseline selection, feedback counts and product outcomes. Initial/feedback records also retain the contemporaneous assessment snapshot. Historical checks are explicitly marked and cannot resume a product flow as a new check. Account changes clear the in-memory draft/result. Urgent guidance remains visible if saving fails, and the UI offers a retry without duplicating the record ID. Server sync status continues to be shown by the account panel.

## Sources and validation boundaries

Reviewed 2026-11-06 (Asia/Seoul):

- AAD, acne-like folliculitis: https://www.aad.org/public/diseases/a-z/folliculitis/
- DermNet, Malassezia: https://dermnetnz.org/topics/malassezia-folliculitis
- Mayo Clinic, warning signs/types: https://www.mayoclinic.org/diseases-conditions/folliculitis/symptoms-causes/syc-20361634
- Mayo Clinic, assessment and selective testing: https://www.mayoclinic.org/diseases-conditions/folliculitis/diagnosis-treatment/drc-20361662
- NICE NG198, skin care/diet/treatment review: https://www.nice.org.uk/guidance/ng198/chapter/Recommendations
- AAD, gentle skin care: https://www.aad.org/public/diseases/acne/skin-care/tips/
- NIH NCCIH, probiotics: https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety
- NIH ODS, strain-specific evidence/selection: https://ods.od.nih.gov/factsheets/Probiotics-HealthProfessional/
- Specific formulation RCT: https://pubmed.ncbi.nlm.nih.gov/38751177/
- WHO, balanced diet and food choices: https://www.who.int/en/news-room/fact-sheets/detail/healthy-diet

Automated tests verify decision precedence, missing-data handling, overlapping patterns, no medication switching, persistence failure, account separation, conditional answer cleanup, returning users, independent symptom records and existing Journey regressions. They do not demonstrate sensitivity, specificity, disease detection or clinical effectiveness. A dermatologist/pharmacist review and prospective validation remain necessary before adding diagnostic or medication-selection claims.
