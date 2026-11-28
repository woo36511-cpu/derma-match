import { act, renderHook, waitFor } from "@testing-library/react";
import { getSupabaseClient } from "../services/supabaseClient";
import { useBasicRoutineTrial } from "./useBasicRoutineTrial";

jest.mock("../services/supabaseClient");

const trial = { startedAt: 1_790_000_000_000, level: 5, ids: { cream: 18 } };

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test("loads a server trial on a new device and updates with the downloaded revision", async () => {
  const read = jest.fn().mockResolvedValue({ data: { revision: 4, payload: trial }, error: null });
  const write = jest.fn().mockResolvedValue({ data: { revision: 5 }, error: null });
  const byRevision = jest.fn(() => ({ select: () => ({ maybeSingle: write }) }));
  const update = jest.fn(() => ({ eq: () => ({ eq: byRevision }) }));
  getSupabaseClient.mockReturnValue({ from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: read }) }), update,
  }) });
  const { result } = renderHook(() => useBasicRoutineTrial("account:one", "one"));
  await waitFor(() => expect(result.current.status).toBe("synced"));
  expect(result.current.trial).toEqual(trial);
  const next = { ...trial, level: 6 };
  act(() => { result.current.save(next); });
  await waitFor(() => expect(result.current.status).toBe("synced"));
  expect(update).toHaveBeenCalledWith({ revision: 5, payload: next });
  expect(byRevision).toHaveBeenCalledWith("revision", 4);
});

test("preserves an offline edit when another device saved a newer version", async () => {
  localStorage.setItem("dearsince:basic-routine-trial:v1:account:one",
    JSON.stringify({ trial, revision: 2, pending: true }));
  const newer = { ...trial, level: 7 };
  const update = jest.fn();
  getSupabaseClient.mockReturnValue({ from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { revision: 3, payload: newer } }) }) }), update,
  }) });
  const { result } = renderHook(() => useBasicRoutineTrial("account:one", "one"));
  await waitFor(() => expect(result.current.status).toBe("conflict"));
  expect(result.current.trial).toEqual(trial);
  expect(update).not.toHaveBeenCalled();
  act(() => { result.current.useServer(); });
  expect(result.current.trial).toEqual(newer);
});
