import { skinSurveyQuestions } from "../data/skinSurvey";
import { OBSERVATION_SURVEY_VERSION, getObservationQuestions, cleanObservationAnswers } from "../data/observationSurvey";
import { ADAPTIVE_SURVEY_VERSION, getAdaptiveObservationQuestions, cleanAdaptiveObservationAnswers } from "../data/adaptiveObservationSurvey";
import { analyzeSkinSurvey } from "./analyzeSkinSurvey";
import { analyzeObservationSurvey } from "./analyzeObservationSurvey";
import { analyzeAdaptiveSkinSurvey } from "./analyzeAdaptiveSkinSurvey";
export const isObservationVersion = version => [OBSERVATION_SURVEY_VERSION, ADAPTIVE_SURVEY_VERSION].includes(version);
export function questionsForSurveyVersion(version, answers) {
  return version === ADAPTIVE_SURVEY_VERSION ? getAdaptiveObservationQuestions(answers) : version === OBSERVATION_SURVEY_VERSION ? getObservationQuestions(answers) : skinSurveyQuestions;
}
export function analyzeSurveyVersion(version, answers) {
  return version === ADAPTIVE_SURVEY_VERSION ? analyzeAdaptiveSkinSurvey(answers) : version === OBSERVATION_SURVEY_VERSION ? analyzeObservationSurvey(answers) : analyzeSkinSurvey(answers, skinSurveyQuestions);
}
export function cleanVersionedSurveyAnswers(version, answers) {
  return version === ADAPTIVE_SURVEY_VERSION ? cleanAdaptiveObservationAnswers(answers) : cleanObservationAnswers(answers);
}
