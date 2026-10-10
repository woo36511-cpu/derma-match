export function formatSavedAt(savedAt) {
  if (!savedAt) return "최근 저장됨";

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(savedAt));
  } catch {
    return "최근 저장됨";
  }
}
