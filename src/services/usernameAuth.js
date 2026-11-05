import { getAuthErrorMessage } from "./authErrors";

export async function usernameAuth(client, action, values = {}) {
  let response;
  try {
    response = await client.functions.invoke("username-auth", { body: { action, ...values } });
  } catch {
    throw new Error("아이디 인증 서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요.");
  }
  if (response.error) {
    let code;
    try { code = (await response.error.context?.json())?.code; } catch { /* Never expose raw responses. */ }
    throw new Error(getAuthErrorMessage({ code, status: response.error.context?.status }, action));
  }
  if (!response.data || typeof response.data !== "object") throw new Error("아이디 인증 응답을 확인하지 못했어요.");
  return response.data;
}
