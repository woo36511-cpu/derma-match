const messages = {
  invalid_credentials: "이메일과 비밀번호가 일치하지 않아요. 가입한 이메일을 확인하고, 기억나지 않으면 ‘비밀번호 재설정’을 이용해주세요.",
  email_not_confirmed: "이메일 인증이 아직 완료되지 않았어요. 가입할 때 받은 인증 메일의 링크를 확인해주세요.",
  email_address_not_authorized: "현재 인증 메일을 이 주소로 보낼 수 없어요. 운영자의 이메일 발송 설정이 필요해요.",
  over_email_send_rate_limit: "인증 메일 발송 한도에 도달했어요. 잠시 후 다시 요청해주세요.",
  over_request_rate_limit: "요청이 너무 많아요. 잠시 기다린 뒤 다시 시도해주세요.",
  weak_password: "비밀번호는 8자 이상으로 설정하고 비밀번호 기준을 확인해주세요.",
  same_password: "이전과 다른 새 비밀번호를 입력해주세요.",
  signup_disabled: "현재 회원가입이 중단되어 있어요. 잠시 후 다시 확인해주세요.",
  user_banned: "이 계정은 현재 로그인이 제한되어 있어요. 운영자에게 문의해주세요.",
  otp_expired: "인증 링크가 만료됐거나 이미 사용됐어요. 새 인증 메일을 요청해주세요.",
  session_expired: "인증 시간이 만료됐어요. 다시 로그인하거나 새 비밀번호 재설정 메일을 요청해주세요.",
  session_not_found: "인증 시간이 만료됐어요. 다시 로그인하거나 새 비밀번호 재설정 메일을 요청해주세요.",
};

// Only known, non-sensitive guidance reaches the UI. Never display raw server errors.
export function getAuthErrorMessage(error, action) {
  if (Object.prototype.hasOwnProperty.call(messages, error?.code)) return messages[error.code];
  if (error?.status === 429) return messages.over_request_rate_limit;
  if (error?.name === "AuthRetryableFetchError" || error?.status === 0) {
    return "인증 서버에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요.";
  }
  if (error?.status >= 500) return "인증 서버가 일시적으로 요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.";
  if (action === "resetPasswordForEmail") return "비밀번호 재설정 메일을 요청하지 못했어요. 잠시 후 다시 시도해주세요.";
  return "인증 요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.";
}
