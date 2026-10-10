# DearSince code structure

`src/App.js` selects the current screen and passes it explicit state and callbacks.
The screen markup and recommendation behavior were extracted from the original
App rather than redesigned.

| Location | Responsibility |
| --- | --- |
| `src/screens/` | Start, quick recommendation, survey, concern selection and detail, survey result, starter routine, feedback, recheck, result, and Journey screens |
| `src/components/` | Shared buttons, titles, layout, product cards, guides, and result overview |
| `src/hooks/useSkinCoach.js` | State, navigation, derived results, and survey answer handlers |
| `src/hooks/useJourneyActions.js` | Initial and quick Journey saves, feedback saves, and reopening saved results |
| `src/data/skinIssueQuestions.js` | Concern choices, follow-up questions, and conditional question visibility |
| `src/data/feedbackQuestions.js` | Feedback questions and options |
| `src/data/storageKeys.js` | Existing browser storage keys |
| `src/utils/skinIssues/` | One analysis module per skin concern |
| `src/utils/routineRecommendation.js` | Routine construction and category selection |
| `src/utils/recommendationScoring.js` | Ranking, care-need matching, and level filtering |
| `src/utils/productCatalog.js` | Product lookup, category labels, availability, and context gates |
| `src/utils/productCareProfile.js` | Product care-support profiles |
| `src/utils/productUsagePlan.js` | Usage and evidence snapshots saved with a Journey |
| `src/utils/recommendationExplanation.js` | Recommendation reasons, user tags, and usage amounts |
| `src/utils/feedbackAnalysis.js` | Level changes, feedback quality, confounders, and condition comparison |
| `src/utils/journeySummary.js` | Journey grouping, history comparison, and round summaries |

Screens import presentation helpers and receive callbacks; they do not write
Journey records directly. `useSkinCoach` connects the recommendation utilities
and `useJourneyActions`, while `App` remains the screen router.

The `dearsince_saved_survey_result` and `dearsince_skin_journey_history` keys,
schema version 2 records, and legacy Journey grouping remain compatible. Records
without `journeyId` are grouped from an initial survey up to the next initial
survey, as before.

The older `getRecommendedProducts.js` and `scoring.js` utilities remain separate
from the active recommendation engine. Merging engines, changing seasonal
inputs, product evidence, and server storage are separate behavior changes.

## Validation

```sh
npm ci
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

`App.test.js` exercises both starting paths, all six concern branches, saved
results, product usage feedback, repeat rounds, and browser back navigation.
`utils/skinCoach.test.js` checks hydration limits, ingredient gates, starter
routines across all ten levels, usage snapshots, feedback confidence, and new
and legacy Journey grouping.
