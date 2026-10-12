import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseClient, readCloudConfig } from "../services/supabaseClient";
import { fetchCloudRecords, saveCloudRecords, getCloudErrorMessage } from "../services/journeyCloud";
import {
  readJourneyCache, writeJourneyCache, saveLocalRecord, mergeCloudRecords,
  getPendingRecords, acknowledgeCloudWrites, resolveCloudConflicts,
  importGuestRecords, getSavedSurvey, accountStorageKey,
} from "../utils/journeyStorage";

const blank = () => ({ records: [], revisions: {}, dirtyIds: [], conflicts: [] });

export function useJourneyAccount(client = getSupabaseClient()) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(!!client);
  const [recovery, setRecovery] = useState(false);
  const [state, setState] = useState({ ownerId: null, cache: blank() });
  const [syncStatus, setSyncStatus] = useState("device");
  const [error, setError] = useState(readCloudConfig().error || "");
  const [guestCount, setGuestCount] = useState(0);
  const scope = useRef({ ownerId: null, epoch: 0, cache: blank(), readable: false });
  const busy = useRef(null);
  const ownerId = user?.id || null;

  const commit = useCallback((cache) => {
    const current = scope.current;
    if (!current.readable) throw new Error("local_cache_unavailable");
    try {
      writeJourneyCache(localStorage, current.ownerId, cache);
    } catch (saveError) {
      setError("이 기기에 기록을 저장하지 못했어요. 저장 공간과 브라우저 설정을 확인해주세요.");
      throw saveError;
    }
    current.cache = cache;
    setState({ ownerId: current.ownerId, cache });
  }, []);

  const syncNow = useCallback(async () => {
    const current = scope.current;
    const { epoch, ownerId: targetOwner } = current;
    if (!client || !targetOwner || !current.readable || busy.current === epoch) return;
    const active = () => scope.current.epoch === epoch;
    busy.current = epoch;
    setSyncStatus("syncing");
    setError("");
    try {
      const remote = await fetchCloudRecords(client, targetOwner);
      if (!active()) return;
      commit(mergeCloudRecords(scope.current.cache, remote));
      if (scope.current.cache.conflicts.length > 0) {
        setSyncStatus("conflict");
        return;
      }
      while (active()) {
        const sent = getPendingRecords(scope.current.cache).slice(0, 50);
        if (sent.length === 0) break;
        const received = await saveCloudRecords(client, targetOwner, sent);
        if (!active()) return;
        if (received.length !== sent.length || new Set(received.map((row) => row.record_id)).size !== sent.length ||
          received.some((row) => !Number.isInteger(row.revision) || row.revision < 1 || !sent.some((item) => item.record_id === row.record_id))) throw new Error("incomplete_sync_response");
        commit(acknowledgeCloudWrites(scope.current.cache, sent, received));
      }
      if (active()) setSyncStatus("synced");
    } catch (syncError) {
      if (!active()) return;
      if (syncError?.code === "40001") {
        try {
          const remote = await fetchCloudRecords(client, targetOwner);
          if (!active()) return;
          commit(mergeCloudRecords(scope.current.cache, remote));
        } catch { /* Keep local edits queued if conflict refresh is unavailable. */ }
      }
      if (active()) {
        setSyncStatus(scope.current.cache.conflicts.length > 0 ? "conflict" : "error");
        setError(getCloudErrorMessage(syncError));
      }
    } finally {
      if (busy.current === epoch) busy.current = null;
    }
  }, [client, commit]);

  useEffect(() => {
    if (!client) return;
    let mounted = true;
    let receivedEvent = false;
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      receivedEvent = true;
      setUser(session?.user || null);
      setAuthLoading(false);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      else if (event === "SIGNED_OUT" || event === "SIGNED_IN") setRecovery(false);
    });
    client.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      if (!mounted) return;
      if (!receivedEvent) setUser(sessionData?.session?.user || null);
      if (sessionError) setError("로그인 상태를 확인하지 못했어요.");
      setAuthLoading(false);
    }).catch(() => {
      if (mounted) { setAuthLoading(false); setError("로그인 상태를 확인하지 못했어요."); }
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, [client]);

  useEffect(() => {
    const epoch = scope.current.epoch + 1;
    const current = { ownerId, epoch, cache: blank(), readable: false };
    scope.current = current;
    busy.current = null;
    if (authLoading) {
      setState({ ownerId, cache: blank() });
      return;
    }
    try {
      current.cache = readJourneyCache(localStorage, ownerId);
      current.readable = true;
      setState({ ownerId, cache: current.cache });
      try { setGuestCount(readJourneyCache(localStorage).records.length); }
      catch { setGuestCount(0); }
      setError("");
      setSyncStatus(ownerId ? "loading" : "device");
      if (ownerId) syncNow();
    } catch {
      setState({ ownerId, cache: blank() });
      setSyncStatus("error");
      setError("이 기기의 기록을 읽지 못했어요. 브라우저 기록을 지우지 말고 확인해주세요.");
    }
    return () => { if (scope.current.epoch === epoch) scope.current.epoch += 1; };
  }, [ownerId, authLoading, syncNow]);

  useEffect(() => {
    if (!ownerId || !state.cache.dirtyIds.length || state.cache.conflicts.length || syncStatus === "error") return;
    const timer = setTimeout(syncNow, 500);
    return () => clearTimeout(timer);
  }, [ownerId, state, syncStatus, syncNow]);

  useEffect(() => {
    const online = () => syncNow();
    const storage = (event) => {
      if (ownerId && event.key === accountStorageKey(ownerId)) syncNow();
    };
    window.addEventListener("online", online);
    window.addEventListener("storage", storage);
    return () => { window.removeEventListener("online", online); window.removeEventListener("storage", storage); };
  }, [ownerId, syncNow]);

  const persistRecord = (record) => {
    if (scope.current.ownerId !== ownerId || authLoading) {
      setError("로그인 상태를 확인하고 있어요. 잠시 후 다시 저장해주세요.");
      throw new Error("account_changing");
    }
    commit(saveLocalRecord(scope.current.cache, record, !!ownerId));
    if (ownerId) setSyncStatus(scope.current.cache.conflicts.length ? "conflict" : "pending");
  };
  const authAction = async (action, ...values) => {
    if (!client) throw new Error("계정 저장은 아직 준비 중이에요.");
    const { data, error: authError } = await client.auth[action](...values);
    if (authError) throw new Error(action === "signInWithPassword" ? "이메일·비밀번호 또는 이메일 인증 상태를 확인해주세요." : "요청을 처리하지 못했어요. 입력 정보와 이메일을 확인해주세요.");
    return data;
  };
  const visible = state.ownerId === ownerId && !authLoading ? state.cache : blank();
  return {
    journeyHistory: visible.records,
    savedSurvey: getSavedSurvey(visible.records),
    persistRecord,
    ownerId,
    account: {
      enabled: !!client, user, authLoading, recovery, syncStatus, error,
      guestCount, pendingCount: visible.dirtyIds.length,
      conflicts: visible.conflicts.map((row) => ({ ...row, localPayload: visible.records.find((record) => record.id === row.record_id) })),
      syncNow,
      signIn: (email, password) => authAction("signInWithPassword", { email, password }),
      signUp: (email, password) => authAction("signUp", { email, password, options: { emailRedirectTo: `${window.location.origin}/` } }),
      resetPassword: (email) => authAction("resetPasswordForEmail", email, { redirectTo: `${window.location.origin}/` }),
      updatePassword: async (password) => { await authAction("updateUser", { password }); setRecovery(false); },
      signOut: async () => { await authAction("signOut", { scope: "local" }); setRecovery(false); },
      importGuest: () => {
        if (!ownerId || scope.current.ownerId !== ownerId) return;
        const records = readJourneyCache(localStorage).records;
        const cache = importGuestRecords(scope.current.cache, records);
        commit(cache);
        setSyncStatus(cache.dirtyIds.length ? "pending" : "synced");
      },
      resolveConflicts: (choice) => {
        if (!ownerId || scope.current.ownerId !== ownerId) return;
        // Preserve both variants for recovery before an explicit resolution.
        localStorage.setItem(`${accountStorageKey(ownerId)}:conflict_backup`, JSON.stringify(scope.current.cache));
        const cache = resolveCloudConflicts(scope.current.cache, choice);
        commit(cache);
        setError("");
        setSyncStatus(cache.dirtyIds.length ? "pending" : "synced");
      },
    },
  };
}
