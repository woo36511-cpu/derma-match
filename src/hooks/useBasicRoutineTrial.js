import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "../services/supabaseClient";

const storageKey = owner => `dearsince:basic-routine-trial:v1:${owner}`;
const validTrial = value => Number.isFinite(value?.startedAt) && Number.isFinite(value?.level) &&
  value.ids && typeof value.ids === "object";
function load(owner) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(owner)));
    if (validTrial(value?.trial)) return value;
    if (validTrial(value)) return { trial: value, revision: null, pending: owner !== "guest" };
  } catch { /* The account can still load its server copy. */ }
  return { trial: null, revision: null, pending: false };
}

export function useBasicRoutineTrial(owner, userId) {
  const [state, setState] = useState(() => ({ owner, ...load(owner), status: userId ? "loading" : "local" }));
  const scope = useRef(null);

  function publish(current, patch) {
    Object.assign(current, patch);
    if (scope.current === current) setState({ ...current });
  }

  function persist(current, record) {
    localStorage.setItem(storageKey(current.owner), JSON.stringify(current.userId ? record : record.trial));
  }

  async function synchronize(current) {
    if (current.busy || !current.userId) return;
    current.busy = true;
    publish(current, { status: "loading", conflict: null });
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error("cloud unavailable");
      const table = () => client.from("basic_routine_trials");
      const { data: remote, error } = await table().select("revision,payload").eq("user_id", current.userId).maybeSingle();
      if (error) throw error;
      if (scope.current !== current) return;
      const actual = remote?.revision ?? null;
      if (current.pending && current.revision !== actual) {
        publish(current, { status: "conflict", conflict: remote });
        return;
      }
      let record = { trial: current.trial, revision: current.revision, pending: false };
      if (current.pending) {
        const revision = (actual ?? 0) + 1;
        const write = actual == null
          ? table().insert({ user_id: current.userId, revision, payload: current.trial })
          : table().update({ revision, payload: current.trial }).eq("user_id", current.userId).eq("revision", actual);
        const { data, error: writeError } = await write.select("revision").maybeSingle();
        if (writeError?.code === "23505" || (!writeError && !data)) {
          publish(current, { status: "error" });
          return;
        }
        if (writeError) throw writeError;
        record.revision = revision;
      } else if (remote && validTrial(remote.payload)) {
        record = { trial: remote.payload, revision: actual, pending: false };
      }
      if (scope.current !== current) return;
      if (record.trial) persist(current, record);
      publish(current, { ...record, status: "synced" });
    } catch {
      publish(current, { status: "error" });
    } finally {
      current.busy = false;
    }
  }

  useEffect(() => {
    const current = { owner, userId, ...load(owner), status: userId ? "loading" : "local" };
    scope.current = current;
    setState({ ...current });
    if (userId) synchronize(current);
    return () => { scope.current = null; };
    // Account identity is the lifetime of a synchronization scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, userId]);

  const current = state.owner === owner ? state : { trial: null, status: "loading" };
  function save(trial) {
    const target = scope.current;
    if (target?.owner !== owner || target.busy || target.status === "conflict") return false;
    const record = { trial, revision: target.revision, pending: Boolean(userId) };
    try { persist(target, record); } catch { return false; }
    publish(target, record);
    if (userId) synchronize(target);
    return true;
  }

  function useServer() {
    const target = scope.current;
    if (target?.owner !== owner || target.status !== "conflict") return;
    const remote = target.conflict;
    const record = { trial: remote?.payload ?? null, revision: remote?.revision ?? null, pending: false };
    try { persist(target, record); } catch { publish(target, { status: "error" }); return; }
    publish(target, { ...record, status: "synced", conflict: null });
  }

  function keepLocal() {
    const target = scope.current;
    if (target?.owner !== owner || target.status !== "conflict") return;
    const record = { trial: target.trial, revision: target.conflict?.revision ?? null, pending: true };
    try { persist(target, record); } catch { publish(target, { status: "error" }); return; }
    publish(target, record);
    synchronize(target);
  }

  return { trial: current.trial, status: current.status, save, useServer, keepLocal,
    guestTrial: userId && !current.trial && current.status === "synced" ? load("guest").trial : null,
    retry: () => { if (scope.current?.owner === owner) synchronize(scope.current); } };
}
