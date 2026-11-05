# 아이디 계정·서버 저장

DearSince의 기본 가입·로그인은 아이디와 비밀번호만 받는다. 새 가입자는 이메일 주소를
제출하거나 인증 메일을 확인하지 않는다. 기존 이메일 계정은 별도 진입점에서 로그인한 뒤
아이디를 연결할 수 있고, 같은 Auth 사용자 ID와 Journey 기록을 유지한다.

## 사용자 흐름

- 비로그인 설문·추천·기기 저장은 계속 사용할 수 있다.
- 회원가입: 아이디(영문·숫자·밑줄 4~20자, 대소문자 무시)와 비밀번호(최소 8자).
- 가입 성공 시 즉시 로그인하고 128비트 무작위 복구 코드를 한 번 보여준다.
  사용자가 별도 보관을 확인할 때까지 계정 창을 닫거나 비밀번호 변경을 진행하지 않는다.
- 계정 복구: 아이디와 복구 코드를 검증해 세션을 발급하고, 코드를 즉시 새 코드로 교체한다.
  새 코드를 보관한 뒤 새 비밀번호를 설정한다. 이전 코드는 재사용할 수 없다.
- 로그인 중 현재 비밀번호를 확인하면 복구 코드를 재발급할 수 있다.
- 비밀번호와 복구 코드를 모두 잃으면 이메일 없이 계정 소유권을 증명할 수 없으므로
  계정을 복구할 수 없다. 아이디도 코드와 함께 보관하도록 안내한다.
- 기존 이메일 로그인·이메일 복구는 기존 사용자용 메뉴에만 남아 있다.
  이 경로의 메일은 기존 Supabase SMTP 제한을 받는다.

## 인증 구조

`supabase/functions/username-auth`는 가입/로그인/복구와 기존 계정 연결을 처리한다.
비밀번호 해시와 사용자 세션은 Supabase Auth가 관리한다. 별도 비밀번호 원문 테이블은 없다.

Supabase Auth의 내부 이메일 필드에는 새 계정마다 무작위 UUID와 예약된 `.invalid` 도메인을
조합한 비배달용 식별자를 쓴다. 이는 사용자가 제공한 이메일이 아니며 메일을 보내지 않는다.
Edge Function만 이 값을 사용하고, 사용자 화면에는 아이디를 표시한다.

아이디와 Auth UUID, 복구 코드의 SHA-256 해시는 비공개 `dearsince_private.username_accounts`에
보관한다. 무작위 복구 코드 원문은 응답에서 한 번 전달하고 DB·브라우저 저장소·로그·URL에
저장하지 않는다. 화면의 메모리에만 남으며 사용자가 보관 확인을 누르면 제거한다.

- 기존 UUID를 기준으로 Journey의 RLS를 적용한다. 아이디나 user_metadata로 권한을 판단하지 않는다.
- 비공개 등록부와 관련 RPC는 service_role만 접근할 수 있다. anon/authenticated에는 권한이 없다.
- 함수는 `verify_jwt = false`다. 공개 가입/로그인은 비밀번호로, 복구는 복구 코드로 검증하고,
  profile/기존 계정 연결/코드 재발급은 `Auth.getUser(token)`으로 호출자의 세션을 검증한다.
  계정 연결에서 사용자 ID를 요청 본문으로 받지 않는다.
- Edge의 기본 `SUPABASE_SECRET_KEYS`/`SUPABASE_PUBLISHABLE_KEYS`를 우선 사용하며,
  이전 키 환경변수는 호환용 대체다. 관리 키는 프론트엔드에 넣지 않는다.
- 요청 본문은 최대 4 KiB, CORS는 운영 도메인과 localhost:3000만 허용한다.
- DB 원자적 카운터로 전체/네트워크/아이디별 요청을 제한한다. IP 버킷에는 원 IP를 저장하지 않는다.
  전달 IP 헤더가 변조돼도 전체·아이디별 한도는 유지된다. CORS나 IP 헤더만으로 인증하지 않는다.
- 복구 코드는 원자적 비교·교체로 한 요청만 소비한다. 세션 발급 실패 시 현재 해시가
  그 요청의 교체본과 일치할 때만 이전 코드를 복원해 새 교체본을 덮어쓰지 않는다.
- 복구 시 다른 세션의 refresh token을 로그아웃한다. 이미 발급된 access JWT는
  Supabase의 통상 동작대로 만료 시점까지 유효할 수 있다.
- 가입 경쟁에서 실패하면 해당 요청이 방금 만든 사용자만 정리한다. 기존 계정은 삭제하지 않는다.

## 배포

현재 프로젝트는 서울 `dearsince-seoul` (`rtbbugpndlvxhnbewxhh`)이다.

1. `supabase/migrations/20261105052119_journey_records.sql`과
   `supabase/migrations/20261105145141_username_accounts.sql`을 순서대로 적용한다.
   현재 프로젝트에는 이미 적용했으므로 반복 실행하지 않는다.
2. 저장소의 `username-auth/index.ts`와 상대 의존성 `handler.mjs`를 배포한다.
   npm 의존성은 `@supabase/supabase-js@2.117.3`으로 고정한다.
3. Vercel Production의 공개 변수는 다음 두 개를 유지한다. Preview에는 운영 DB를 연결하지 않는다.

```text
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

4. 프론트엔드를 재배포한다. 새 아이디 가입에는 SMTP나 이메일 인증 설정 변경이 필요 없다.
   기존 이메일 계정을 위해 Confirm email은 계속 활성화한다.
5. 기존 이메일 복구용 Site URL은 `https://dearsince.vercel.app`, Redirect URLs는
   `https://dearsince.vercel.app/`, `http://localhost:3000/`이다. 서버 비밀번호 최소 길이는 8자다.

로컬 개발은 `.env.example`을 `.env.local`로 복사해 공개 값만 설정하고 Node 22 이상에서
`npm install`, `npm start`로 실행한다. `.env` 파일과 Supabase CLI `.temp`는 Git에서 제외한다.
관리 키, 비밀번호, 복구 코드, 토큰을 코드나 React 환경변수에 넣지 않는다.

## 기록 저장

설문·제품 사용·생활습관·동일 8축 변화·실사용 신뢰도 payload를 계정 UUID별 JSONB로 저장한다.
기기별 로컬 큐, revision 충돌 비교, 재전송, 명시적 기기 기록 가져오기는 유지한다.
비로그인 기록을 자동으로 계정에 병합하거나 다른 계정으로 옮기지 않는다.
실사용 기반 제품점수 자동보정은 아직 활성화하지 않는다.

## 검증

2026-11-05 운영 API의 임시 두 계정으로 이메일 없는 가입, 중복 거부, 대소문자 무시 로그인,
네이티브 세션 설치, Journey 저장, 새 세션 복원, 다른 계정 읽기/소유자 위조 차단,
복구 코드 1회 사용, 비밀번호 변경, 이전 비밀번호 거부, 코드 재발급과 이전 코드 거부를
확인했다. 임시 계정·기록은 정리했고 기존 이메일 계정은 보존됐다.

Performance Advisor는 지적 사항이 없다. Security Advisor의 비공개 테이블 `RLS Enabled No Policy`
정보 알림은 의도한 서비스 전용 구조다. 일반 역할의 스키마·테이블·RPC 권한은 모두 차단했고,
service_role만 RLS를 우회해 접근한다. 기존의 유출 비밀번호 보호 비활성 경고도 남아 있으며,
이 기능은 현재 요금제에서 사용할 수 없다. 이 작업에서 유료 요금제로 변경하지 않았다.
[해당 기능 안내](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

```text
CI=true npm test -- --watchAll=false --runInBand
npm run test:auth
npm run test:db
npx eslint src --max-warnings 0
npm run build
```

- React: 아이디 입력·이메일 미수집·복구 코드 보관 확인·기존 이메일 경로·네이티브 세션 설치,
  계정 변경 시 코드/기록 분리, 복구 후 비밀번호 변경을 검사한다.
- Edge handler: 이메일 없는 가입/로그인/복구, 중복/경쟁 정리, 실패 보상, 토큰 소유권,
  코드 교체, 제한/오리진/입력 검증을 검사한다. 요청/응답의 원문 비밀은 로깅하지 않는다.
- PGlite: 실제 SQL로 기존 Journey RLS/충돌과 새 등록부 권한, 중복 아이디,
  복구 코드 1회 사용/경쟁 조건부 복원, 요청 한도·만료를 검사한다.
- 운영 API에서는 별도 임시 계정으로 가입→세션 설치→기록 저장→새 세션 복원,
  다른 계정 읽기/소유자 위조 거부, 복구→새 비밀번호→기존 비밀번호 거부,
  코드 재발급과 이전 코드 거부까지 확인한다. 검증용 사용자와 기록은 관리자 권한으로 정리한다.

## 공식 자료

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Edge Function 환경변수](https://supabase.com/docs/guides/functions/secrets)
- [Auth 에러 코드](https://supabase.com/docs/guides/auth/debugging/error-codes)
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
