import { useEffect, useState } from "react";
import { cleanSymptomAnswers, getVisibleSymptomQuestions, isImmediateStopAnswer } from "../data/symptomQuestions";
import { hydrationQuestion, needsHydrationQuestion } from "../utils/firstVisitCare";
import { assessSymptoms } from "../utils/symptomAssessment";
import { createJourneyRecordId } from "../utils/journeyStorage";

export const isSymptomCheckRecord = record => record?.source === "symptom_check" && record?.assessmentOnly === true;

function questionsFor(answers, guided) {
  const questions = getVisibleSymptomQuestions(answers, { guided });
  if (guided && needsHydrationQuestion(assessSymptoms(answers, { guided }))) return [...questions, hydrationQuestion];
  return questions;
}

export function useSymptomCheck({ ownerId, storedHistory, persistRecord, setStep }) {
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [nextStep, setNextStep] = useState(null);
  const [priorTrial, setPriorTrial] = useState(null);
  const [record, setRecord] = useState(null);
  const [saved, setSaved] = useState(false);
  const [historical, setHistorical] = useState(false);
  const latestRecord = [...storedHistory].reverse().find(isSymptomCheckRecord) || null;
  const guided = nextStep === "guidedCare";
  const questions = questionsFor(answers, guided);

  useEffect(() => {
    setAnswers({}); setIndex(0); setAssessment(null); setRecord(null);
    setNextStep(null); setPriorTrial(null); setSaved(false); setHistorical(false);
  }, [ownerId]);

  const begin = (target = "survey", trial = null) => {
    setAnswers(trial ? { concern: trial.concern } : {}); setIndex(trial ? 1 : 0); setAssessment(null); setRecord(null);
    setPriorTrial(trial);
    setNextStep(target); setSaved(false); setHistorical(false);
    setStep("symptomCheck");
  };
  const save = value => {
    try { persistRecord(value); setSaved(true); }
    catch { setSaved(false); }
  };
  const finish = values => {
    const result = assessSymptoms(values, { guided });
    if (needsHydrationQuestion(result)) {
      if (!hydrationQuestion.options.some(option => option.value === values.afternoonSkin)) return;
      result.answers = { ...result.answers, afternoonSkin: values.afternoonSkin };
    }
    if (!result.complete) return;
    if (priorTrial) result.priorTrial = priorTrial;
    const data = {
      id: createJourneyRecordId("symptom"), type: "feedback", source: "symptom_check",
      assessmentOnly: true, journeySchemaVersion: 3,
      symptomAssessment: result, savedAt: new Date().toISOString(),
    };
    // Show urgent instructions even if device/server persistence fails.
    setAssessment(result); setRecord(data); setHistorical(false); save(data); setStep("symptomResult");
  };
  const answer = (question, value) => {
    const draft = { ...answers, [question.id]: value };
    const next = cleanSymptomAnswers(draft, { guided });
    if (guided && hydrationQuestion.options.some(option => option.value === draft.afternoonSkin) &&
      needsHydrationQuestion(assessSymptoms(next, { guided }))) {
      next.afternoonSkin = draft.afternoonSkin;
    }
    setAnswers(next);
    setIndex(Math.min(index, questionsFor(next, guided).length - 1));
    if (isImmediateStopAnswer(question.id, next[question.id])) finish(next);
  };

  return {
    answers, questions, index, assessment, saved, historical, latestRecord,
    begin, answer,
    editGuidedAnswer: (id) => {
      if (!assessment?.guidedCare) return;
      const values = assessment.answers;
      const position = questionsFor(values, true).findIndex(question => question.id === id);
      if (position === -1) return;
      setAnswers(values); setIndex(position); setAssessment(null); setRecord(null);
      setNextStep("guidedCare"); setPriorTrial(assessment.priorTrial ?? null); setSaved(false); setHistorical(false);
      setStep("symptomCheck");
    },
    clearAssessment: () => setAssessment(null),
    previous: () => index > 0 ? setIndex(index - 1) : setStep("start"),
    next: () => {
      if (!answers[questions[index]?.id]) return;
      if (index === questions.length - 1) finish(answers);
      else setIndex(index + 1);
    },
    continueFlow: () => {
      if (assessment?.complete && !assessment.blockRoutine && !historical && nextStep && !guided) setStep(nextStep);
    },
    retrySave: () => { if (record && !historical) save(record); },
    openLatest: () => {
      if (!latestRecord) return;
      setAssessment(latestRecord.symptomAssessment); setRecord(latestRecord);
      setHistorical(true); setSaved(true); setNextStep(null); setStep("symptomResult");
    },
  };
}
