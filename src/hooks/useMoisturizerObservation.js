import { useEffect, useState } from "react";
import {
  buildMoisturizerFollowUp, buildMoisturizerObservation, getMoisturizerOffer,
  isMoisturizerObservation, makeAnalysisConsent, observationId,
} from "../utils/moisturizerObservation";

export function useMoisturizerObservation({ ownerId, storedHistory, persistRecord, setStep }) {
  const [survey, setSurvey] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { setSurvey(null); setError(false); }, [ownerId]);
  const latest = storedHistory.filter(isMoisturizerObservation).at(-1) ?? null;
  const record = survey ? storedHistory.find(item => item.id === observationId(survey.id) && isMoisturizerObservation(item)) ?? null : latest;
  const now = () => new Date().toISOString();
  const save = item => {
    if (!item) return false;
    try {
      persistRecord(item); setError(false); return true;
    } catch {
      setError(true); return false;
    }
  };
  const open = source => {
    setSurvey(source); setError(false); setStep("moisturizerObservation");
  };
  return {
    latest, record, error, offer: getMoisturizerOffer(survey), signedIn: Boolean(ownerId),
    start: source => { if (getMoisturizerOffer(source)) open(source); },
    resume: () => { if (latest) open(null); },
    enroll: input => !record && save(buildMoisturizerObservation({ ...input, survey, signedIn: Boolean(ownerId), now: now() })),
    followUp: input => save(buildMoisturizerFollowUp(record, input, now())),
    setAnalysisConsent: enabled => record && (!enabled || ownerId) && save({
      ...record, moisturizerObservation: {
        ...record.moisturizerObservation, analysisConsent: makeAnalysisConsent(enabled, Boolean(ownerId), now()),
      },
    }),
  };
}
