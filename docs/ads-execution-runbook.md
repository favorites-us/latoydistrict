# Google Ads 실행 런북 (소액 $42 / 14일)

> 설계·소재는 `docs/ads-campaign-plan.md`. 이 문서는 **UI 클릭 순서**다. 값은 전부 복붙용.
> 목표: 유입 확인. 최적화가 아니라 **그룹별 노출수(수요) + 클릭 + GA4 행동** 측정.

## 0. 준비
- Google Ads 계정 생성 + **결제 수단 등록**.
- 계정 최초 진입 시 "스마트 캠페인" 강요를 피해 **전문가 모드(Expert Mode)** 로 전환.
- 자동 태그(auto-tagging, gclid)는 기본 ON — 그대로 둔다 (GA4 연결에 필요).

## 1. GA4 ↔ Google Ads 연결 (전환 측정)
1. Google Ads → **Tools → Data manager → Google Analytics (GA4)** → 속성 `LA Toy District` 연결(gclid 가져오기 허용).
2. GA4 쪽 → **관리 → 주요 이벤트(Key events)** 에서 `lead_submit`, `store_inquiry` 를 **주요 이벤트로 표시**.
3. Google Ads → **Goals → Conversions → Import → GA4** → 위 두 이벤트를 전환으로 가져오기.
   - (14일 테스트라 전환이 적어도 OK. 없으면 노출/클릭/GA4로 판단.)

## 2. 캠페인 생성
- **New campaign → "Create a campaign without a goal's guidance"** (전환 데이터 없으니 목표 강제 X).
- Campaign type: **Search**. "Websites(디스플레이 파트너)" 체크 **해제**.
- Bidding: **Maximize clicks**. (옵션) 최대 CPC 상한 **$1** 설정해 과지출 방지.
- Locations: **Los Angeles-Long Beach-Anaheim CA** (또는 LA 카운티). 옵션에서
  **"Presence: 타겟 지역에 있거나 정기적으로 있는 사용자"** 선택 (관심 기반 X).
- Languages: **English + Spanish**.
- Budget: **$3/day**.
- 캠페인 네거티브 키워드 추가: `apartments, rent, rental, lofts, housing, jobs, hiring, careers, for rent`

## 3. 광고그룹 · 키워드 (정확일치)

### AG1 — 지명 · 최종 URL `https://toydistrictlosangeles.com/guide/visiting`
```
[toy district]
[toy district la]
[toy district los angeles]
[la toy district]
[toy district parking]
[toy district hours]
[toy district dtla]
```

### AG2 — 도매 · 최종 URL `https://toydistrictlosangeles.com/`
```
[wholesale toys los angeles]
[wholesale toys downtown la]
[wholesale toy district]
[buy toys wholesale la]
[toy wholesalers los angeles]
```
> ES(AG3)는 소액에선 보류 — Search Console 노출수로 대체 관찰.

## 4. 광고 소재 (RSA)
`docs/ads-campaign-plan.md`「광고 소재」의 AG1·AG2 헤드라인/설명을 **핀 없이 전부** 등록
(Google이 조합 최적화). 표시 경로(path): AG1 `visiting`, AG2 `wholesale`.

## 5. 런치 후 운영
- **Day 3**: "Low search volume"로 서빙 안 되는 정확일치 키워드 → **구문일치(phrase)** 로 전환.
- **매일**: Search terms 리포트 확인 → 무관한 쿼리는 네거티브 추가.
- **그룹별 노출수**를 분리해서 본다 (= 지명 vs 도매 수요 지도).

## 6. 판정 (Day 14)
`docs/ads-campaign-plan.md`「판정 절차」대로 `docs/decisions/phase2-verdict.md`에 기록.
- 그룹별 노출수(월환산) + GA4 업체열람률 + 리드/문의 발생.
- 명확한 무신호 → 중단(사이트 자산화). 신호 → Phase 3.
