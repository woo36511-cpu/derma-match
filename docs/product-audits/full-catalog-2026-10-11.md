# 전체 제품 DB 검수 기록 (2026-10-11)

`src/data/products.js`의 43개 제품을 공식 제품 신원, 전성분 확보 여부, 함량 공개 여부, 브랜드 제공 인체시험 요약, 내부 추천용 `careProfile`, 기본 사용 안내로 분리해 재검수했다.

## 요약

- 전체 제품: 43개
- 신규 추천 가능 제품: 38개
- 신규 추천 제외 제품: 5개 (`26`, `32`, `33`, `36`, `48`)
- 공식 전성분 확보 제품: 37개
- 전성분 미확보 제품: 6개 (`8`, `20`, `26`, `27`, `36`, `48`)
- 완제품 인체시험을 브랜드 자료 수준에서 기록한 제품: 20개
- 독립 논문 검증까지 완료한 제품: 없음
- 가격과 구매 링크: 이번 검수 범위에서는 전 제품 미검증으로 표시

## 제품별 상태

| ID | 제품명 | 카테고리 | 등급 | 검수 상태 | 전성분 상태 | 추천 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 라운드랩 독도 토너 | toner | B | reviewed | domestic_official | 활성 |
| 2 | 토리든 다이브인 세럼 | serum | B | reviewed | global_official | 활성 |
| 3 | 피지오겔 DMT 데일리 모이스쳐 테라피 페이셜 크림 | cream | B | reviewed | domestic_official | 활성 |
| 4 | 세타필 젠틀 스킨 클렌저 | cleanser | C | reviewed | domestic_official | 활성 |
| 5 | 코스알엑스 BHA 블랙헤드 파워 리퀴드 | serum | C | reviewed | domestic_official | 활성 |
| 6 | 이니스프리 그린티 히알루론산 수분 세럼 | serum | B | reviewed | domestic_official | 활성 |
| 7 | 에스트라 아토베리어 365 크림 | cream | B | reviewed | domestic_official | 활성 |
| 8 | 닥터지 레드 블레미쉬 수딩 크림 | cream | B | limited | not_verified | 활성 |
| 9 | 아누아 어성초 77 히알루론산 수분 진정 토너 | toner | C | reviewed | domestic_official | 활성 |
| 10 | 셀퓨전씨 약산성 패리어 클렌징폼 | cleanser | C | reviewed | domestic_official | 활성 |
| 11 | 라로슈포제 에빠끌라 듀오+M 트러블 에센스 | cream | B | reviewed | domestic_official | 활성 |
| 12 | 일리윤 세라마이드 아토 로션 (3세대) | cream | C | reviewed | domestic_official | 활성 |
| 13 | 코스드바하 나이아신아마이드 10 세럼 | serum | C | reviewed | domestic_official | 활성 |
| 14 | 코스알엑스 나이아신아마이드 15 세럼 | serum | B | reviewed | domestic_official | 활성 |
| 15 | 라운드랩 자작나무 수분 토너 | toner | C | reviewed | domestic_official | 활성 |
| 18 | 토리든 다이브인 저분자 히알루론산 수딩 크림 | cream | B | reviewed | global_official | 활성 |
| 19 | 라운드랩 자작나무 수분 크림 | cream | B | reviewed | domestic_official | 활성 |
| 20 | 브링그린 티트리 시카 수딩 토너 | toner | C | limited | not_verified | 활성 |
| 21 | 스킨푸드 캐롯 카로틴 카밍 워터 패드 | toner | B | reviewed | domestic_official | 활성 |
| 22 | 넘버즈인 1번 진정 맑게담은 청초토너 | toner | C | reviewed | domestic_official | 활성 |
| 23 | 마녀공장 비피다 바이옴 콤플렉스 앰플 | serum | B | reviewed | domestic_official | 활성 |
| 24 | 라로슈포제 시카플라스트 밤 B5+ | cream | B | reviewed | domestic_official | 활성 |
| 25 | 스킨1004 마다가스카르 센텔라 앰플 | serum | B | reviewed | domestic_official | 활성 |
| 26 | 브링그린 티트리 시카 트러블 세럼 | serum | D | historical | not_verified | 비활성 |
| 27 | 닥터지 약산성 클렌징 젤 폼 | cleanser | C | limited | not_verified | 활성 |
| 28 | 라로슈포제 에빠끌라 퓨리파잉 포밍 젤+M | cleanser | C | reviewed | domestic_official | 활성 |
| 29 | 아누아 어성초 80 수분 진정 앰플 | serum | B | reviewed | us_official | 활성 |
| 30 | 메이크프렘 세이프 미 릴리프 모이스처 클렌징 오일 | cleansing_oil | C | reviewed | domestic_official | 활성 |
| 31 | 비오텀 클렌징 밀크 | cleansing_milk | C | reviewed | global_official | 활성 |
| 32 | 아벤느 익스트림 톨러런스 클렌징 로션 | cleansing_milk | C | historical | global_official | 비활성 |
| 33 | 에스트라 아토베리어 클렌저 | gel_cleanser | C | historical | domestic_official | 비활성 |
| 34 | 이즈앤트리 그린티 프레시 클렌저 | gel_cleanser | C | reviewed | global_official | 활성 |
| 35 | 수이사이 뷰티클리어 파우더 워시 N | enzyme_cleanser | C | reviewed | global_official | 활성 |
| 36 | 파파레서피 효소 파우더 클렌저 | enzyme_cleanser | D | historical | not_verified | 비활성 |
| 38 | 이즈앤트리 그린티 프레쉬 토너 | toner | C | reviewed | domestic_official | 활성 |
| 39 | 라운드랩 소나무 진정 시카 토너 | toner | C | reviewed | domestic_official | 활성 |
| 42 | 에스트라 테라크네365 수딩 액티브 모이스처라이저 | cream | B | reviewed | domestic_official | 활성 |
| 44 | 토리든 다이브인 저분자 히알루론산 토너 | toner | B | reviewed | global_official | 활성 |
| 45 | 에스트라 아토베리어365 하이드로 에센스 | serum | B | reviewed | domestic_official | 활성 |
| 47 | 웰라쥬 리얼 히알루로닉 블루 100 앰플 | serum | B | reviewed | domestic_official | 활성 |
| 48 | 에스트라 아토베리어365 세럼 | serum | D | historical | not_verified | 비활성 |
| 49 | 코스알엑스 AHA/BHA 클래리파잉 트리트먼트 토너 | toner | C | reviewed | domestic_official | 활성 |
| 50 | 바이위시트렌드 만델릭 애씨드 젠틀 엑스폴리에이팅 토너 | toner | B | reviewed | global_official | 활성 |

## 주요 보정

- 제품 신원이 바뀐 항목은 이름과 용량을 현행 공식 자료에 맞췄다: ID3, ID4, ID9, ID11, ID12, ID24, ID28, ID30, ID35, ID50.
- ID26, ID36, ID48은 현행 제품 또는 변형 제품 신원이 기존 DB와 맞지 않아 신규 추천에서 제외했다.
- ID32는 공식 단종 안내를 확인해 신규 추천에서 제외했다.
- ID33은 공식 신원과 전성분은 확인했지만 병원 유통 구매 경로 검수가 남아 비활성 상태를 유지했다.
- ID39와 ID50은 PHA/LHA/AHA 계열 leave-on 제품으로 기본 수분 루틴에서 제외되도록 감지 로직을 보강했다.
- `careProfile`은 전 제품에 명시했지만, 모두 추천 점수용 내부 보수 평가다. 브랜드 시험 수치나 임상 효능 등급으로 표시하지 않는다.

## 남은 작업

- 활성 제품 중 전성분 미확보: ID8, ID20, ID27.
- 글로벌/미국/일본 공식 처방만 확인된 제품은 국내 유통 처방 동일성 재확인이 필요하다.
- 구매 링크, 가격, 쿠팡 옵션 매칭은 이번 검수 범위 밖이라 전 제품 미검증 상태다.
- 브랜드 제공 시험은 제품 카드 점수와 분리되어 있으며, 질환 치료나 모든 사용자에게 같은 결과를 보장하는 근거로 쓰지 않는다.
