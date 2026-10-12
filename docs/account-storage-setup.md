# 계정·서버 저장 연결

이 문서는 2026-10-12 구현한 Supabase 연결 코드의 설정 안내다. 코드와 마이그레이션은
준비되어 있지만 실제 Supabase 프로젝트·인증 이메일·Vercel 환경변수 설정이 없으면
운영 사이트는 계속 기기 저장 모드로 동작한다. 실제 계정/서버 검증을 마치기 전에는
서버 저장 완료로 운영 안내하지 않는다.

## 구현된 동작

- 이메일·비밀번호 로그인, 회원가입 후 이메일 인증, 비밀번호 재설정, 현재 기기 로그아웃.
- 기존 브라우저 기록과 계정별 기록을 별도 키로 저장. 로그인 전 기록은 명시적인
  가져오기 버튼으로 복사하며 계정 기록을 덮어쓰거나 원본을 삭제하지 않는다.
- 기록을 먼저 계정별 로컬 큐에 저장한 뒤 서버와 동기화. 실패한 기록은 재로그인,
  온라인 전환 또는 다시 확인 버튼으로 재시도할 수 있다.
- 서버의 기록을 페이지 단위로 모두 읽고 개별 기록 ID로 합친다. 새 기록 ID는 UUID를
  우선 사용해 여러 기기에서 생성한 기록의 충돌 가능성을 줄인다.
- 각 기록의 서버 revision으로 오래된 기기의 수정본을 자동 덮어쓰기 하지 않는다.
  충돌 시 두 기록의 8축과 루틴 단계·기록일을 비교하고 사용자가 선택한다.
  선택 전 마지막 충돌의 양쪽 데이터를 계정별 `:conflict_backup` 키에 보관한다.
- 업로드 중 추가 편집은 다음 큐에 남는다. 계정 변경 후 이전 계정의 응답이 새 화면에
  섞이지 않는다. RPC는 요청한 계정과 서버에서 인증된 계정의 일치도 검사한다.
- 사용자 소유 기록만 읽고 쓸 수 있도록 RLS를 적용한다. 공개 사용자 데이터 테이블이나
  서비스 키를 사용하는 프론트엔드 요청은 없다.
- 설문/실사용/생활습관/8축 변화/신뢰도 등 Journey payload 전체를 JSONB로 저장한다.
  실사용 기반 추천 자동보정은 아직 적용하지 않는다.

## 운영 연결 순서

1. Supabase 프로젝트를 만든다. 기존 프로젝트가 있으면 해당 프로젝트를 사용한다.
2. SQL Editor에서 `supabase/migrations/202610120001_journey_records.sql`을 한 번 실행한다.
   프로젝트의 `auth.users`를 사용하며 `public.journey_records`와 동기화 RPC를 만든다.
   이미 적용한 마이그레이션을 SQL Editor에서 반복 실행하지 않는다.
3. Supabase Auth에서 Email 로그인과 이메일 인증을 켠다. 사이트 코드의 회원가입·
   비밀번호 변경 입력은 최소 8자를 요구한다. Auth 설정의 비밀번호 기준도 맞춘다.
4. URL Configuration의 Site URL을 `https://dearsince.vercel.app`로 설정한다.
   Redirect URLs에 `https://dearsince.vercel.app/`와 개발용 `http://localhost:3000/`를
   추가한다. Preview에서 실제 인증을 검사하려면 그 Preview URL도 개별 등록한다.
5. 공개 사용자에게 회원가입 인증·비밀번호 재설정 메일을 보내려면 custom SMTP를
   연결한다. Supabase 기본 SMTP는 프로젝트 팀 주소로 보내는 개발용 제한이 있어
   일반 방문자의 인증 이메일 발송을 운영 검증으로 간주할 수 없다.
6. 프로젝트 URL과 `sb_publishable_`로 시작하는 공개 키를 Vercel의 Production 환경변수에
   아래 이름으로 등록하고 재배포한다. Preview는 별도 테스트 프로젝트를 사용하는 것이 좋다.

```text
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

로컬 개발은 `.env.example`을 `.env.local`로 복사해 같은 두 공개 값을 넣는다.
Node 22 이상에서 `npm install`, `npm start`로 실행한다. Supabase 관리 토큰,
DB 비밀번호, `sb_secret_`/service-role 키, SMTP 비밀번호는 이 파일이나 React
환경변수에 넣지 않는다. prebuild/prestart가 불완전한 설정이나 공개 키가 아닌 값을
차단하며 값 자체는 로그에 출력하지 않는다.

## 실제 운영 확인

서로 다른 두 계정과 두 브라우저에서 확인한다.

1. 회원가입 인증 이메일 확인 → 로그인 → 설문/피드백 저장 → 서버 저장 완료 표시.
2. 같은 계정으로 다른 브라우저 로그인 → 기록 복원 및 기존 8축 비교 표시.
3. 다른 계정 로그인 → 앞 계정 기록이 보이지 않는지 확인.
4. 로그인 전 기기 기록 가져오기 → 중복 없이 보존되는지 확인.
5. 오프라인에서 새 기록 저장 → 서버 저장 대기 → 온라인 후 저장 완료.
6. 두 브라우저에서 같은 기록을 다르게 수정 → 충돌 안내 및 명시적인 선택.
7. 로그아웃 후 계정 기록 숨김·기기 기록 복원, 재로그인 후 미전송 큐 유지.
8. 비밀번호 재설정 이메일 링크 → 새 비밀번호 저장 → 새 비밀번호 로그인.

## 개발 검증과 한계

`npm test -- --watchAll=false --runInBand`는 인증 API 모형으로 UI·계정 전환·
지연 응답·충돌·재시도·게스트 가져오기와 기존 추천 흐름을 검사한다.
`npm run test:db`는 PGlite PostgreSQL에서 실제 SQL을 실행해 RLS, 소유 계정 검사,
revision, 재시도 멱등성, 충돌 배치의 전체 롤백, payload 제약, 비로그인 거부를
검사한다. 이는 설정된 운영 Supabase의 인증 이메일·네트워크·DB 검증을 대신하지 않는다.

저장은 현재 계정 또는 로그인 전 기기 범위로 나뉜다. 직접 수정 가능한 브라우저
데이터이므로 향후 추천 점수 자동보정 전에 서버에서 데이터 신뢰도와 입력값을 다시
검증해야 한다. 브라우저 캐시를 삭제하면 아직 서버로 보내지 못한 기록은 사라진다.

## 공식 자료

- [Supabase JavaScript Auth](https://supabase.com/docs/reference/javascript/auth)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database functions](https://supabase.com/docs/guides/database/functions)
- [공개 API 키와 비밀 키](https://supabase.com/docs/guides/getting-started/api-keys)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
