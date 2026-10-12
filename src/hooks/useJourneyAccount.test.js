import { act, renderHook, waitFor } from "@testing-library/react";
import { useJourneyAccount } from "./useJourneyAccount";
import { accountStorageKey, readJourneyCache, writeJourneyCache, saveLocalRecord } from "../utils/journeyStorage";
import { JOURNEY_HISTORY_KEY } from "../data/storageKeys";

const record = (id) => ({ id, type: "initial_survey", savedAt: "2026-10-12T00:00:00Z", surveyAnswers: {} });
const user = (id) => ({ id, email: `${id}@example.test` });
const defer = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };

function mockClient(initialUser = null, rows = {}) {
  let sessionUser = initialUser;
  let callback;
  const client = {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: sessionUser ? { user: sessionUser } : null } })),
      onAuthStateChange: jest.fn((listener) => { callback = listener; return { data: { subscription: { unsubscribe: jest.fn() } } }; }),
      signOut: jest.fn(async () => { client.emit(null); return { error: null }; }),
    },
    from: jest.fn(() => {
      let owner;
      const query = {
        select: () => query, eq: (key, value) => { owner = value; return query; }, order: () => query,
        range: async (start, end) => ({ data: (rows[owner] || []).slice(start, end + 1), error: null }),
      };
      return query;
    }),
    rpc: jest.fn(async (name, args) => {
      if (args.p_owner_id !== sessionUser?.id) return { data: null, error: { code: "42501" } };
      const written = args.p_records.map((entry) => ({ record_id: entry.record_id, payload: entry.payload, revision: entry.expected_revision + 1 }));
      rows[args.p_owner_id] = written;
      return { data: written, error: null };
    }),
    emit: (next, event = next ? "SIGNED_IN" : "SIGNED_OUT") => {
      sessionUser = next; callback(event, next ? { user: next } : null);
    },
  };
  return client;
}

beforeEach(() => localStorage.clear());

test("no cloud config keeps guest storage usable", () => {
  const { result } = renderHook(() => useJourneyAccount(null));
  act(() => result.current.persistRecord(record("guest")));
  expect(result.current.journeyHistory).toEqual([record("guest")]);
  expect(result.current.account.enabled).toBe(false);
  expect(JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY))).toHaveLength(1);
});

test("sign-in loads account records, imports guests explicitly, and sign-out returns to guest records", async () => {
  localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify([record("guest")]));
  const client = mockClient(user("alice"), { alice: [{ record_id: "remote", revision: 1, payload: record("remote") }] });
  const { result } = renderHook(() => useJourneyAccount(client));
  await waitFor(() => expect(result.current.account.syncStatus).toBe("synced"));
  expect(result.current.journeyHistory.map((item) => item.id)).toEqual(["remote"]);
  expect(client.rpc).not.toHaveBeenCalled();
  act(() => result.current.account.importGuest());
  await act(async () => result.current.account.syncNow());
  expect(result.current.journeyHistory.map((item) => item.id)).toEqual(["guest", "remote"]);
  expect(client.rpc.mock.calls[0][1].p_owner_id).toBe("alice");
  await act(async () => result.current.account.signOut());
  expect(result.current.journeyHistory.map((item) => item.id)).toEqual(["guest"]);
  expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  act(() => client.emit(user("bob")));
  await waitFor(() => expect(result.current.account.syncStatus).toBe("synced"));
  expect(result.current.journeyHistory).toEqual([]);
  expect(readJourneyCache(localStorage, "alice").records).toHaveLength(2);
});

test("failed server uploads remain queued for retry", async () => {
  const client = mockClient(user("alice"));
  const { result } = renderHook(() => useJourneyAccount(client));
  await waitFor(() => expect(result.current.account.syncStatus).toBe("synced"));
  client.rpc.mockResolvedValueOnce({ error: { message: "offline" }, data: null });
  act(() => result.current.persistRecord(record("offline-record")));
  await act(async () => result.current.account.syncNow());
  expect(result.current.account.syncStatus).toBe("error");
  expect(readJourneyCache(localStorage, "alice").dirtyIds).toEqual(["offline-record"]);
  await act(async () => result.current.account.syncNow());
  expect(result.current.account.syncStatus).toBe("synced");
  expect(result.current.account.pendingCount).toBe(0);
});

test("a late response from a previous account cannot appear in the next account", async () => {
  const client = mockClient(user("alice"));
  const { result } = renderHook(() => useJourneyAccount(client));
  await waitFor(() => expect(result.current.account.syncStatus).toBe("synced"));
  const upload = defer();
  client.rpc.mockImplementationOnce(() => upload.promise);
  act(() => result.current.persistRecord(record("alice-private")));
  let pending;
  act(() => { pending = result.current.account.syncNow(); });
  await waitFor(() => expect(client.rpc).toHaveBeenCalled());
  act(() => client.emit(user("bob")));
  await waitFor(() => expect(result.current.ownerId).toBe("bob"));
  await act(async () => {
    upload.resolve({ data: [{ record_id: "alice-private", revision: 1, payload: record("alice-private") }] });
    await pending;
  });
  expect(result.current.journeyHistory).toEqual([]);
  expect(readJourneyCache(localStorage, "bob").records).toEqual([]);
  expect(readJourneyCache(localStorage, "alice").dirtyIds).toEqual(["alice-private"]);
});

test("a late initial session lookup cannot overwrite a newer auth event", async () => {
  const client = mockClient();
  const lookup = defer();
  client.auth.getSession.mockReturnValue(lookup.promise);
  const { result } = renderHook(() => useJourneyAccount(client));
  act(() => client.emit(user("alice")));
  await act(async () => lookup.resolve({ data: { session: null } }));
  expect(result.current.ownerId).toBe("alice");
});

test("conflicts keep local edits and backup both variants before an explicit choice", async () => {
  const local = record("same");
  const cache = { ...saveLocalRecord(readJourneyCache(localStorage, "alice"), local, true), revisions: { same: 1 } };
  writeJourneyCache(localStorage, "alice", cache);
  const cloud = { ...local, surveyAnswers: { changed: true } };
  const client = mockClient(user("alice"), { alice: [{ record_id: "same", revision: 2, payload: cloud }] });
  const { result } = renderHook(() => useJourneyAccount(client));
  await waitFor(() => expect(result.current.account.syncStatus).toBe("conflict"));
  expect(result.current.journeyHistory[0]).toEqual(local);
  expect(client.rpc).not.toHaveBeenCalled();
  act(() => result.current.account.resolveConflicts("cloud"));
  expect(result.current.journeyHistory[0]).toEqual(cloud);
  expect(JSON.parse(localStorage.getItem(`${accountStorageKey("alice")}:conflict_backup`)).records[0]).toEqual(local);
  expect(result.current.account.pendingCount).toBe(0);
});

test("local write failures do not appear as a saved record", () => {
  const { result } = renderHook(() => useJourneyAccount(null));
  const spy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  act(() => expect(() => result.current.persistRecord(record("unsaved"))).toThrow("quota"));
  expect(result.current.journeyHistory).toEqual([]);
  expect(result.current.account.error).toMatch(/저장하지 못/);
  spy.mockRestore();
});

test("pagination loads every record rather than silently truncating a longer journey", async () => {
  const rows = Array.from({ length: 105 }, (_, i) => ({ record_id: `record-${i}`, revision: 1, payload: record(`record-${i}`) }));
  const client = mockClient(user("alice"), { alice: rows });
  const { result } = renderHook(() => useJourneyAccount(client));
  await waitFor(() => expect(result.current.account.syncStatus).toBe("synced"));
  expect(result.current.journeyHistory).toHaveLength(105);
  expect(client.from).toHaveBeenCalledTimes(2);
});

test("an unreadable guest cache does not block loading a separate account", async () => {
  localStorage.setItem(JOURNEY_HISTORY_KEY, "invalid-json");
  const client = mockClient(user("alice"), { alice: [{ record_id: "remote", revision: 1, payload: record("remote") }] });
  const { result } = renderHook(() => useJourneyAccount(client));
  await waitFor(() => expect(result.current.account.syncStatus).toBe("synced"));
  expect(result.current.journeyHistory).toEqual([record("remote")]);
  expect(localStorage.getItem(JOURNEY_HISTORY_KEY)).toBe("invalid-json");
});

test("records cannot be saved into a guest or previous account while authentication is loading", () => {
  const client = mockClient();
  client.auth.getSession.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useJourneyAccount(client));
  act(() => expect(() => result.current.persistRecord(record("blocked"))).toThrow("account_changing"));
  expect(localStorage.getItem(JOURNEY_HISTORY_KEY)).toBeNull();
  expect(result.current.account.error).toMatch(/잠시 후/);
});
