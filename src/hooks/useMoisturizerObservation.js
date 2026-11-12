import { useEffect, useState } from "react";
import {
  buildProductFollowUp, buildProductObservation, getProductObservationOffers, getObservationStudy,
  isProductObservation, makeAnalysisConsent, observationId, updateObservationStudy,
} from "../utils/moisturizerObservation";

export function useMoisturizerObservation({ ownerId, storedHistory, persistRecord, setStep }) {
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { setSelection(null); setError(false); }, [ownerId]);
  const history = storedHistory.filter(isProductObservation).reverse();
  const offer = getProductObservationOffers(selection?.survey).find(item => item.kind === selection.kind);
  const recordId = selection?.recordId ?? (offer ? observationId(selection.survey.id, offer.kind) : null);
  const record = history.find(item => item.id === recordId) ?? null;
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
    setSelection(source); setError(false); setStep("moisturizerObservation");
  };
  return {
    latest: history[0] ?? null, history, record, error, offer, signedIn: Boolean(ownerId),
    start: (survey, kind) => { if (getProductObservationOffers(survey).some(item => item.kind === kind)) open({ survey, kind }); },
    resume: () => { if (history.length) open(history.length === 1 ? { recordId: history[0].id } : null); },
    selectRecord: id => { if (history.some(item => item.id === id)) open({ recordId: id }); },
    showHistory: () => open(null),
    enroll: input => !record && offer && save(buildProductObservation({ ...input, survey: selection.survey, kind: offer.kind, signedIn: Boolean(ownerId), now: now() })),
    followUp: input => save(buildProductFollowUp(record, input, now())),
    setAnalysisConsent: enabled => {
      if (!record || (enabled && !ownerId)) return false;
      const study = getObservationStudy(record);
      const timestamp = now();
      return save(updateObservationStudy(record, {
        ...study, analysisConsent: makeAnalysisConsent(enabled, Boolean(ownerId), timestamp, study.protocol),
      }, timestamp));
    },
  };
}
