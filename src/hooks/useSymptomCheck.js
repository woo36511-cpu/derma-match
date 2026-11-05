import { useEffect, useState } from "react";
import { cleanSymptomAnswers, getVisibleSymptomQuestions } from "../data/symptomQuestions";
import { assessSymptoms } from "../utils/symptomAssessment";
import { createJourneyRecordId } from "../utils/journeyStorage";

export const isSymptomCheckRecord = record => record?.source === "symptom_check" && record?.assessmentOnly === true;

export function useSymptomCheck({ ownerId, storedHistory, persistRecord, setStep }) {
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [nextStep, setNextStep] = useState(null);
  const [record, setRecord] = useState(null);
  const [saved, setSaved] = useState(false);
  const [historical, setHistorical] = useState(false);
  const latestRecord = [...storedHistory].reverse().find(isSymptomCheckRecord) || null;
  const questions = getVisibleSymptomQuestions(answers);

  useEffect(() => {
    setAnswers({}); setIndex(0); setAssessment(null); setRecord(null);
    setNextStep(null); setSaved(false); setHistorical(false);
  }, [ownerId]);

  const begin = (target = "survey") => {
    setAnswers({}); setIndex(0); setAssessment(null); setRecord(null);
    setNextStep(target); setSaved(false); setHistorical(false);
    setStep("symptomCheck");
  };
  const save = value => {
    try { persistRecord(value); setSaved(true); }
    catch { setSaved(false); }
  };
  const finish = values => {
    const result = assessSymptoms(values);
    if (!result.complete) return;
    const data = {
      id: createJourneyRecordId("symptom"), type: "feedback", source: "symptom_check",
      assessmentOnly: true, journeySchemaVersion: 3,
      symptomAssessment: result, savedAt: new Date().toISOString(),
    };
    // Show urgent instructions even if device/server persistence fails.
    setAssessment(result); setRecord(data); setHistorical(false); save(data); setStep("symptomResult");
  };
  const answer = (question, value) => {
    const next = cleanSymptomAnswers({ ...answers, [question.id]: value });
    setAnswers(next);
    setIndex(Math.min(index, getVisibleSymptomQuestions(next).length - 1));
    if (value === "yes" && question.id === "breathing") finish(next);
    if (question.id === "infectionWarning" && ["spreading_fever", "eye", "rapid"].includes(value)) finish(next);
  };

  return {
    answers, questions, index, assessment, saved, historical, latestRecord,
    begin, answer,
    clearAssessment: () => setAssessment(null),
    previous: () => index > 0 ? setIndex(index - 1) : setStep("start"),
    next: () => {
      if (!answers[questions[index]?.id]) return;
      if (index === questions.length - 1) finish(answers);
      else setIndex(index + 1);
    },
    continueFlow: () => {
      if (assessment?.complete && !assessment.blockRoutine && !historical && nextStep) setStep(nextStep);
    },
    retrySave: () => { if (record && !historical) save(record); },
    openLatest: () => {
      if (!latestRecord) return;
      setAssessment(latestRecord.symptomAssessment); setRecord(latestRecord);
      setHistorical(true); setSaved(true); setNextStep(null); setStep("symptomResult");
    },
  };
}
