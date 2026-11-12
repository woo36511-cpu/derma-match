import { useEffect, useState } from "react";
import {
  buildProductFollowUp, buildProductObservation, getProductObservationOffers, getObservationStudy,
  isProductObservation, makeAnalysisConsent, observationId, updateObservationStudy,
} from "../utils/moisturizerObservation";

export function useMoisturizerObservation({ ownerId, savedSurvey, storedHistory, persistRecord, setStep }) {
  const [selection, setSelection] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { setSelection(null); setError(false); }, [ownerId]);
  const history = storedHistory.filter(isProductObservation).reverse();
  const candidates = getProductObservationOffers(savedSurvey);
  const offers = candidates.filter(item =>
    !history.some(record => record.id === observationId(savedSurvey.id, item.kind)));
  const offer = selection?.kind ? candidates.find(item => item.kind === selection.kind) : null;
  const recordId = selection?.recordId ?? (offer ? observationId(savedSurvey.id, offer.kind) : null);
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
    available: Boolean(savedSurvey || history.length), history, record, error, offer, offers, signedIn: Boolean(ownerId),
    start: kind => { if (offers.some(item => item.kind === kind)) open({ kind }); },
    resume: () => open(null),
    selectRecord: id => { if (history.some(item => item.id === id)) open({ recordId: id }); },
    showHistory: () => open(null),
    enroll: input => !record && offer && save(buildProductObservation({ ...input, survey: savedSurvey, kind: offer.kind, signedIn: Boolean(ownerId), now: now() })),
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
