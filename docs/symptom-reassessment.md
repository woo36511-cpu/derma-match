# Symptom reassessment and practical self-care

DearSince helps people choose everyday skin care and check whether their skin feels better afterward. The questionnaire starts with the user’s skin concern, and ordinary results lead with cleansing, moisturization and one manageable change. Safety guidance appears where relevant. It does **not** diagnose acne, bacterial folliculitis, Malassezia folliculitis, immune deficiency or gut dysbiosis. No diagnostic probabilities, clinical accuracy claims or automatic medication sequences are produced. Rule version: `skin-care-v3`; clinical validation: not performed.

## User flow

- Both beginner and quick recommendation paths first ask what is bothering the user about their skin. Breathing, swallowing and eye-related questions are limited to the sudden swelling or hives branch. Breakout questions cover the changes users can observe on their skin and the products they apply there. Existing Journey check-ins start a fresh check.
- A permanent “증상 변화·악화 재설문” entry is available on the start, feedback and result screens. Users do not need to wait two weeks after worsening.
- Questions cover onset, location, appearance, itch, pain and changes in topical products. Uniformity is asked only for itchy bumps and hair-follicle alignment only for pustules or mixed lesions. The survey does not collect general illness, immune history, oral medication types, digestion or supplement use. “Unknown” is an explicit answer.
- Current breathing/swallowing difficulty or tongue/throat swelling stops the questionnaire immediately with emergency guidance. Rapidly spreading redness, sudden severe pain or eye-related warning answers still hold new product recommendations and stop the flow. Missing/unknown safety information, significant irritation, worsening, persistent folliculitis-like patterns and overlapping possibilities hold new product recommendations.
- The result shows actionable skin care and optional observations from the answers. Internal pattern candidates are used for safety decisions and stored history; the UI does not present a list of suspected diseases. Neither improvement nor treatment failure establishes a pathogen.
- Deep lesions, severe pain/scarring and damaged/oozing skin continue to hold new products. Appropriate diagnosis starts with clinical assessment; microscopy, culture or biopsy is selected when necessary, rather than presented as a universal first test.
- Two-week checks assess tolerability, worsening, adherence and changes in discomfort. They are not a two-week deadline for acne efficacy or a prompt to switch to antifungals/antibiotics. NICE describes noticeable benefit after 6–8 weeks and first-line review at 12 weeks. Red flags and worsening take priority over those intervals.

## Cosmetics and medicines

The existing routine builder is filtered through a safety policy. Held recommendations also have an empty product map before being saved, so the UI is not the only protection. Clinical-priority issue guides suppress routine cards and the two-week trial CTA. Feedback that reports increasing lesions or significant irritation independently holds new products, even if an earlier check was reassuring. A saved survey requires a fresh symptom check before showing a current recommendation again.

Legacy rules that surfaced benzoyl peroxide or salicylic acid and dose schedules from pus/recurrence alone now direct users to pharmacist assessment instead. This release does not introduce new drug candidates, replacement sequences or prescriptions. A future drug catalogue needs current Korean authorization checks, individual eligibility, professional review and validation before activation.

## Visual support

`LesionComparison` contains original SVG **schematics**, labelled as drawings rather than clinical photographs. The diagrams explain the answer vocabulary and cannot identify a disease, pathogen or treatment. Skin appearance varies with skin tone, lighting and disease stage. Links open the original AAD/DermNet/Mayo educational resources; their clinical photographs are not copied, hotlinked or generated. No user photograph is collected or uploaded.

## Practical self-care and gut–skin context

- Simple dryness can be supported with gentle cleansing and previously tolerated moisturization. Barrier support does not replace treatment of infection or inflammatory disease. Stinging, occlusion-related bumps and worsening are reassessed rather than answered by adding more layers.
- Food and sleep notes appear only in an expandable reference. The skin check does not require lifestyle or supplement answers. The plan asks for one manageable skin-care change.
- Earlier records retain their original answers. New checks record changes in cosmetics and may note that a prescribed product is already applied to the same area, without asking for its drug class. Concurrent prescribed products or documented supplement changes prevent attributing a change to one cosmetic.

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
