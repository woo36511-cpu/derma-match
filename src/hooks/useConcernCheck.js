import { useEffect, useMemo, useRef, useState } from "react";
import { buildConcernTrackingRecord, getConcernTracking } from "../utils/concernTracking";
import { createJourneyRecordId } from "../utils/journeyStorage";

export const isConcernCheckRecord = record => record?.source === "concern_check" && record?.assessmentOnly === true;

export function useConcernCheck({ ownerId, savedSurvey, storedHistory, persistRecord, setStep, setViewJourneyId, beginSymptomCheck }) {
  const [sourceId, setSourceId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(false);
  const recordId = useRef(null);
  const source = storedHistory.find(record => record.id === sourceId) ?? (savedSurvey?.id === sourceId ? savedSurvey : null);

  useEffect(() => {
    setSourceId(null); setAnswers({}); setSaved(null); setError(false); recordId.current = null;
  }, [ownerId]);

  const tracking = useMemo(() => source ? getConcernTracking([
    source, ...storedHistory.filter(record => record.concernTracking?.sourceRecordId === source.id),
  ], saved?.id ?? recordId.current) : null, [source, storedHistory, saved]);
  const canStart = Boolean(savedSurvey && getConcernTracking([savedSurvey]));
  const draft = buildConcernTrackingRecord(tracking, answers);

  function start() {
    if (!canStart) return;
    setSourceId(savedSurvey.id); setAnswers({}); setSaved(null); setError(false);
    recordId.current = null;
    setStep("concernCheck");
  }

  function save() {
    if (!source || !draft || saved) return;
    if (!recordId.current) recordId.current = createJourneyRecordId("concern");
    const record = {
      id: recordId.current, type: "feedback", source: "concern_check", assessmentOnly: true,
      journeySchemaVersion: 3, journeyId: source.journeyId || source.id,
      concernTracking: draft, savedAt: new Date().toISOString(),
    };
    try {
      persistRecord(record);
      setSaved(record); setError(false);
    } catch {
      setError(true);
    }
  }

  return {
    canStart, start, tracking, answers, saved, error, canSave: Boolean(draft), save,
    answer: (id, value) => setAnswers(previous => ({ ...previous, [id]: value })),
    startSymptoms: () => beginSymptomCheck("concernCheck"),
    resume: () => setStep("concernCheck"),
    openHistory: () => {
      if (!source) return;
      setViewJourneyId(source.journeyId || source.id);
      setStep("journey");
    },
  };
}
