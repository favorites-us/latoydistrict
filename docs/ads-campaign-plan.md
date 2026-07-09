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

## 계측 (이미 사이트에 구현됨)

| 항목 | 구현 |
|---|---|
| GA4 | `NEXT_PUBLIC_GA_ID` 환경변수 설정 시 자동 활성 (web/app/layout.tsx) |
| 업체 페이지 열람 | `store_view` 이벤트 (slug 파라미터 포함) |
| 리드폼 제출 | `lead_submit` 이벤트 (buyer_type 파라미터) → Google Ads 전환 가져오기 |
| 리드 저장 | Supabase `leads` 테이블 (supabase/schema.sql) |

## 판정 절차 (D+14)

1. 그룹별 노출수 → 월환산 → PLAN.md 통과 ⓐ 판정
2. GA4: 방문자 중 업체 페이지 2개+ 열람 비율, 리드폼 제출 건수 → 통과 ⓑ 판정
3. `docs/decisions/phase2-verdict.md`에 수치·판정 커밋. ⓐⓑ 중 하나 명확 통과 →
   Phase 3 증액. 둘 다 미달 → 종료 (사이트 방치 자산화, **연장 금지**)
