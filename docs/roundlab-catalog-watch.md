# 라운드랩 공식몰 자동 확인 (시험 운영)

GitHub Actions의 **Round Lab catalog watch**가 매일 한국 시간 오전 3시 37분에
라운드랩 국내 공식몰 제품 목록을 확인한다. 실행 시간은 GitHub 상황에 따라 늦어질 수 있다.
Actions 화면에서 수동으로도 실행할 수 있다.

- 제품 목록을 스킨케어·세안·선케어 품목 중심으로 수집한다.
- 매 실행에서 가장 오래 확인하지 않은 제품부터 최대 12개 상세 페이지를 다시 읽는다.
- 공식 페이지의 명칭·용량이 일치하고 전성분 항목을 읽을 수 있을 때만 버전을 기록한다.
- 전성분 순서나 내용이 바뀌면 이전 버전을 남긴다. 이미지 또는 불명확한 자료는 검토 대상으로 남긴다.
- 실행 결과는 해당 Actions 실행의 `roundlab-catalog-snapshot`에서 확인한다. 이전 아티팩트가
  있으면 이어서 갱신한다. 전체 목록 수집에 실패한 날은 기존 기록을 덮어쓰지 않는다.

이 단계는 **공식 자료 수집·리뉴얼 감지** 시험 운영이다. 수집 상태는 검수나 추천 자격을
뜻하지 않으며, Supabase와 운영 카탈로그에는 아직 연결하지 않는다. 공개 함량, 이미지 OCR,
피부 적합도 검수를 다음 연결 단계에서 개별 근거와 구분해 다룬다.

로컬 실행 (작업 디렉터리는 저장소 루트):

```sh
node --test scripts/roundlab-catalog-watch.test.mjs
node scripts/watch-roundlab-catalog.mjs /tmp/roundlab-snapshot.json
node scripts/watch-roundlab-catalog.mjs /tmp/roundlab-next.json /tmp/roundlab-snapshot.json
```
