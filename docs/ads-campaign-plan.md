# Phase 2 — Google Ads 캠페인 설계서 ($100 / 14일)

> 목적: 트래픽이 아니라 ①키워드그룹별 노출수(=수요 지도) ②전환 행동(업체 열람·리드폼) 실측.
> 증거 타깃은 `docs/PLAN.md` Phase 2 표 그대로 — **집행 후 변경 금지.**

## 캠페인 구조

캠페인 1개 / 광고그룹 3개 (그룹별 노출수를 분리 집계하는 것이 핵심):

### AG1 — EN 지명군 (exact)
```
[toy district]
[toy district la]
[toy district los angeles]
[la toy district]
[toy district parking]
[toy district hours]
[toy district dtla]
```
### AG2 — EN 도매 인텐트군 (exact)
```
[wholesale toys los angeles]
[wholesale toys downtown la]
[wholesale toy district]
[buy toys wholesale la]
[toy wholesalers los angeles]
```
### AG3 — ES 군 (exact) — **지오타겟 필수**
```
[juguetes por mayoreo los angeles]
[juguetes al por mayor los angeles]
[juguetes por mayoreo dtla]
[donde comprar juguetes por mayoreo en los angeles]
```

## 설정 룰

- 매칭: **정확일치로 시작.** 3일 내 "Low search volume"으로 서빙 안 되는 키워드는
  구문일치로 폴백 (사전 룰 — 검색어 리포트로 실쿼리 분리 집계 유지)
- 지오타겟: 전 그룹 LA 광역(Los Angeles-Long Beach-Anaheim). AG3는 특히 필수
  (ES 키워드는 전국·중남미 검색 유입 시 노출수가 수요 지도가 아님)
- 네거티브: `apartments, rent, rental, lofts, housing` (SERP에 apartments.com이
  뜨는 지명 — 주거 인텐트 오염 차단), `jobs, hiring`
- 랜딩: AG1 → `/` 및 `/guide/visiting`, AG2 → `/` (디렉토리 앵커), AG3 → `/es`
- 언어 설정: AG3는 광고문안 ES, 캠페인 언어 EN+ES (크롬 언어 기준이므로 둘 다)
- 입찰: 클릭수 최대화, 일예산 $7 (14일 ≈ $100)

## 소액 버전 ($40–50) — 1차 실집행

원안($100)은 그대로 유효하나, 1차 유입 확인용으로는 **$3/일 × 14일 ≈ $42**로 축소.
예산이 작을수록 그룹을 잘게 쪼개면 그룹별 노출수가 읽기 어려워지므로 **집중**한다:

- **AG1(EN 지명군)에 예산 비중 최우선** — 여기가 핵심 수요 신호. 일예산의 ~60%.
- **AG2(도매 인텐트) 유지** — ~40%. 인접·상업 인텐트 확인.
- **AG3(ES) 는 이번엔 보류하거나 $10 슬라이스만** — 지오타겟 필수라 세팅 비용 대비
  소액에선 신호가 얇다. 자동완성상 LA향 ES는 이미 얇다고 확인됨(§Phase0). Search
  Console 노출수로 대체 관찰 가능.
- 나머지 룰(정확→구문 폴백, 네거티브, 랜딩, 지오타겟)은 원안 그대로.
- 판정 기준은 **비율/방향성**으로 읽는다(절대 클릭수는 적으므로): 그룹별 상대 노출수,
  방문자당 업체 페이지 열람률, 리드/문의 발생 여부. 명확한 0이면 중단 신호.

## 계측 (이미 사이트에 구현됨)

| 항목 | 구현 |
|---|---|
| GA4 | `NEXT_PUBLIC_GA_ID` 환경변수 설정 시 자동 활성 (web/app/layout.tsx) |
| 업체 페이지 열람 | `store_view` 이벤트 (slug 파라미터 포함) |
| 리드폼 제출 | `lead_submit` 이벤트 (buyer_type 파라미터) → Google Ads 전환 가져오기 |
| **업체별 문의** | `store_inquiry` 이벤트 (store_slug 파라미터) — 업체 상세 폼 |
| 리드 저장 | Supabase `leads` 테이블 (store_slug/store_name 포함, supabase/schema.sql) |
| Search Console | 무료 수요 프록시 — 타겟 키워드 **노출수** 관찰(광고 없이도 신호) |

## 판정 절차 (D+14)

1. 그룹별 노출수 → 월환산 → PLAN.md 통과 ⓐ 판정
2. GA4: 방문자 중 업체 페이지 2개+ 열람 비율, 리드폼 제출 건수 → 통과 ⓑ 판정
3. `docs/decisions/phase2-verdict.md`에 수치·판정 커밋. ⓐⓑ 중 하나 명확 통과 →
   Phase 3 증액. 둘 다 미달 → 종료 (사이트 방치 자산화, **연장 금지**)
