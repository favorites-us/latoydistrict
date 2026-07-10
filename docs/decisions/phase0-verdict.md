# Phase 0 킬 게이트 — 판정 기록 (PROVISIONAL)

> 판정일: 2026-07-09 (갱신: 2026-07-09 deep-research 라운드)
> 판정: **조건부 통과 (정성 신호 통과 · 정량 미확정 · 소유자 오버라이드로 빌드 선행)**
> 상태: Brandon의 Keyword Planner 실측으로 게이트 최종 확정 필요
> 킬 기준(§1-3): 지명 키워드군 합산 월 검색량 하한 추정 **≥ 1,000/월**

## 판정 요약

정밀 검색량 실측은 이 환경에서 불가(Keyword Planner=광고계정 필요, Semrush/Ahrefs 무료
티어는 인터랙티브 전용·API 불가). 계획서 §1-3이 예견한 한계 그대로다. 소유자(Brandon)가
2026-07-09 "끝까지 구현 진행" 지시로 게이트를 오버라이드 → v0 빌드 선행, 검색량 확정은
Keyword Planner 1회 조회 + Phase 2 광고 노출수 실측으로 흡수한다.
**리스크 변화 없음: Phase 2 증거 타깃이 그대로 최종 킬 게이트.** 정성 근거는 통과 쪽으로 기움.

## 확보한 $0 신호 (누적)

| 신호 | 값 | 출처 |
|---|---|---|
| 인근 카테고리 수요 | "toy stores" 월 **17,704회** (구역 반경 15마일) | Yelp 자체 집계 (2026-05) |
| **SERP 공백** | "toy district los angeles" 상위: Wikipedia / Yelp 스텁 / DiscoverLA / apartments.com — **전용 디렉토리 여전히 0개** | 2026-07-09 검색 |
| 지명 고유성 | 위키·Grokipedia 등재, Yelp "LA Toy District" 단일 페이지 리뷰 39개 | 동상 |
| **자동완성 수렴** | 맨 단어 **"toy district"** → `los angeles·downtown la·hours·near me·wholesale los angeles·stores`. 미 전역 head term이 LA 지명 클러스터로 수렴 | Google suggest API 직접 조회 (재현 가능) |
| 인텐트 모디파이어 | 실제 자동완성으로 `hours·stores open·address·safe·directions·wholesale·parking·labubu` 확인 | 동상 |
| 주차 수요 프록시 | **SpotHero·ParkWhiz·ParkMe·SpotAngels·Spacer 5곳이 "Toy District parking" 전용 페이지 운영** + Yelp Q&A | deep-research 검증(3-0/2-1) |
| 시장 규모 | 12블록·ZIP 90013·완구/전자 ~500업체·~90% 도매 | Wikipedia 등 3-0 교차검증 |
| ES 지오 경고 | "juguetes por mayoreo" 자동완성이 CDMX·과달라하라·몬테레이·엘살바도르 지배, LA향은 얇음 | suggest API → §1-4 실증 |
| 계절성(방향성) | 풋트래픽·바이어 9~12월 피크, 소비자 완구 검색 11월 정점(소매 26.2%가 11~12월). 지명어 자체 Trends는 미측정 | deep-research 2-1 |
| 레퍼런스 동형 | "jewelry district los angeles" 자동완성 = `hours·stores·wholesale·parking·rolex` — 동일 지명+인텐트 구조(절대량 배수는 미측정) | suggest API |

해석: 지명 키워드군 **절대 볼륨은 미확정**이나 — ① 인접 카테고리 수요 큼(17.7K/mo)
② SERP 공백 유지(전용 디렉토리 0) ③ 맨 단어 "toy district"가 LA로 수렴하는 리치 자동완성
④ 서드파티 주차 랜딩 5곳(상업적 볼륨 프록시) — 이 4개가 겹쳐 **하한 1,000/월을 넘을
가능성에 기운다(중신뢰).** 계획서 §2의 4조건 판단을 뒤집을 증거는 없음.

## 남은 확정 작업 (Brandon) — 게이트 확정은 이 1개면 끝

- [ ] Google Ads 계정 개설 → Keyword Planner로 아래 3군 + 레퍼런스를 한 번에 조회, 월 검색량
      범위를 이 문서에 추가:
  - 지명군: `toy district`, `toy district los angeles`, `la toy district`, `toy district dtla`,
    `toy district hours`, `toy district parking`, `toy district wholesale`
  - 도매군: `wholesale toys los angeles`, `toy wholesale los angeles`
  - ES군(**LA 지오 한정**): `juguetes por mayoreo los angeles`, `juguetes al por mayor los angeles`
  - 레퍼런스: `jewelry district los angeles`, `la jewelry district` (배수 비교)
- [ ] (무료·즉시) Google Trends에서 위 지명어 상대 관심도·Q4 계절성 캡처 → 계절성 항목 확정
- [ ] latoydistrict.com 도메인 확보 (~$12)

**해석 규칙(사전 확정, goalpost 고정):**
- 지명군 합산 ≥ 1,000/월 → **통과** → v0는 이미 완료이므로 곧장 Phase 2($100 광고 테스트).
- 300~1,000/월 → **조건부**: ES 지오군 + 정보성 가이드 트래픽 보완 가능성을 Phase 2에서 실측.
- < 300/월 → **중단** (사이트는 이미 자산으로 남김).

## 이번 라운드 방법 기록

- deep-research 하네스: 5각 병렬 검색 → 소스 fetch → 3표 적대적 검증(101 에이전트, 22개
  검증 클레임). 정성 증거는 확보, **절대 검색량은 무료 툴의 인터랙티브 제약으로 미확보.**
- Google suggest API 직접 조회로 자동완성 수요 신호 보강(재현 가능한 $0 측정).
