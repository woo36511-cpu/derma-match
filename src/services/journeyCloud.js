export async function fetchCloudRecords(client, userId) {
  const rows = [];
  const size = 100;
  for (let offset = 0; ; offset += size) {
    const { data, error } = await client.from("journey_records")
      .select("record_id,revision,payload")
      .eq("user_id", userId)
      .order("record_id")
      .range(offset, offset + size - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < size) return rows;
  }
}

export async function saveCloudRecords(client, userId, records) {
  if (records.length === 0) return [];
  const { data, error } = await client.rpc("sync_journey_records", { p_owner_id: userId, p_records: records });
  if (error) throw error;
  return data || [];
}

export function getCloudErrorMessage(error) {
  if (error?.code === "40001" || error?.message === "journey_record_conflict") return "다른 기기에서 같은 기록이 바뀌었어요. 사용할 기록을 선택해주세요.";
  if (error?.status === 401 || error?.code === "PGRST301") return "로그인을 다시 확인해주세요. 이 기기에 기록은 남아 있어요.";
  return "서버에 연결하지 못했어요. 기록은 이 기기에 보관하고 다시 시도할 수 있어요.";
}
