import { act, renderHook } from "@testing-library/react";
import { useSymptomCheck } from "./useSymptomCheck";
import { symptomQuestions } from "../data/symptomQuestions";

test("urgent instructions are shown even when device persistence fails and cannot continue to a product flow", () => {
  const setStep = jest.fn();
  const persistRecord = jest.fn(() => { throw new Error("quota"); });
  const { result } = renderHook(() => useSymptomCheck({ ownerId: null, storedHistory: [], persistRecord, setStep }));
  act(() => result.current.begin("quickRecommend"));
  act(() => result.current.answer(symptomQuestions.find(q => q.id === "concern"), "sudden"));
  expect(result.current.assessment.urgency).toBe("urgent");
  expect(result.current.assessment.nextAction).toContain("119");
  expect(result.current.saved).toBe(false);
  expect(setStep).toHaveBeenLastCalledWith("symptomResult");
  const calls = setStep.mock.calls.length;
  act(() => result.current.continueFlow());
  expect(setStep).toHaveBeenCalledTimes(calls);
  expect(persistRecord.mock.calls[0][0]).toMatchObject({ type: "feedback", source: "symptom_check", assessmentOnly: true });
  expect(persistRecord.mock.calls[0][0]).not.toHaveProperty("routine");
});

test("account change clears in-memory answers and results; historical checks do not enable current recommendations", () => {
  const setStep = jest.fn();
  const old = { id: "check", source: "symptom_check", assessmentOnly: true, symptomAssessment: { complete: true, blockRoutine: false } };
  const { result, rerender } = renderHook(({ ownerId, storedHistory }) => useSymptomCheck({ ownerId, storedHistory, persistRecord: jest.fn(), setStep }), { initialProps: { ownerId: "a", storedHistory: [old] } });
  act(() => result.current.openLatest());
  expect(result.current.historical).toBe(true);
  const calls = setStep.mock.calls.length;
  act(() => result.current.continueFlow());
  expect(setStep).toHaveBeenCalledTimes(calls);
  rerender({ ownerId: "b", storedHistory: [] });
  expect(result.current.assessment).toBeNull();
  expect(result.current.answers).toEqual({});
  expect(result.current.latestRecord).toBeNull();
});
