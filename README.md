# DearSince / Derma-Match

피부 설문 → 최소 루틴 → 사용 후 재체크 → 8축 변화 기록을 연결하는 React 앱입니다.

Node 22 이상에서 실행합니다.

```bash
npm install
npm start
```

인증·DB·계정별 기록 동기화의 운영 연결은
[계정 저장 설정 안내](docs/account-storage-setup.md)를 확인하세요.
설정이 없는 환경은 기존 브라우저 기기 저장 모드로 동작합니다.

검증 명령:

```bash
CI=true npm test -- --watchAll=false --runInBand
npm run test:db
npx eslint src --max-warnings=0
npm run build
```
