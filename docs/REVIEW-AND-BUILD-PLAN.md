# 계획서 검토 + 구현 계획

> as-of: 2026-07-09 | 검토 대상: `docs/PLAN.md` | 작성: Claude Code 세션
> 결론 먼저: **계획의 뼈대(킬 게이트 구조, 리버서블 투자, 데이터 중심 pSEO)는 그대로 간다.**
> 다만 착수 전에 고쳐야 할 사항이 6건 있고 (§1), 그중 2건(Places ToS, 스토리지 아키텍처)은
> Phase 1 코드를 쓰기 전에 결정해야 손이 두 번 안 간다.

---

## 1. 검토 — 착수 전 수정 사항

### 1-1. [차단급] Google Places 데이터의 캐싱·표시 제약 → 데이터 소싱 우선순위 뒤집기

계획서 1a는 Places API를 사실상 1차 소스로 놓고 있는데, Google Maps Platform 약관은
**Places 콘텐츠의 영구 저장·재표시를 금지**한다 (place ID와 좌표 등 일부 필드만 제한적
캐싱 허용, 나머지는 30일 한도). "Places 데이터를 긁어서 내 디렉토리에 올린다"는 그대로
하면 약관 위반이고, API 키 정지 리스크가 사이트 전체 리스크가 된다. 사진도 마찬가지로
저장 불가.

**수정안 — 소스 역할 재배치:**

| 소스 | 역할 (수정 후) |
|---|---|
| LA City 오픈데이터 (공공기록) | **1차 소스.** 상호·주소·NAICS·개업일 — 공공기록이라 저장·표시 자유 |
| Google Places API | **발견·대사(reconciliation)용.** 오픈데이터에 없는 현존 업체 탐지, 폐업 감지, 좌표 확인. 표시용 필드는 저장하지 않고 place_id만 보관 |
| 전화번호·영업시간 | 업체 자체 표기(간판·전단·Yelp 공개 페이지·자체 웹) + Phase 3 직접 수집. v0에서 비어 있어도 됨 — `unknown` 상태를 UI가 1급으로 다루면 오히려 "제보/청구(claim this listing)" 훅이 됨 |
| Street View | 정적 이미지 저장 역시 약관 제약 → **임베드(iframe/URL 파라미터) 방식**으로 표시하거나, Phase 3 방문 때 직접 촬영으로 대체 |
| TikTok/YouTube/Yelp | 계획대로 LLM 파싱 (인용·요약 수준, 원문 저장 X) |

이 수정의 부수 효과: **직접 수집 필드의 해자 논리(§3a)가 v0부터 적용된다.** 온라인에서
합법적으로 못 긁는 필드가 많을수록, 발품으로 채운 디렉토리의 복제 난이도가 올라간다.

### 1-2. [차단급] Supabase는 v0에 과함 → 콘텐츠는 리포 내 JSON, Supabase는 리드만

150~250행짜리 정적 데이터에 Supabase를 물리면: 마이그레이션 관리, 빌드 시 fetch,
환경변수, RLS — 전부 오버헤드고 SSG와도 안 맞는다. 분기 1회 갱신 데이터는 DB가 아니라
**버전 관리된 파일**이 정답이다 (diff로 변경 추적 = 공짜 감사로그).

**수정안:**
- `data/stores.json` (파이프라인 산출물, 리포에 커밋) → Next.js 빌드 타임에 읽어 SSG
- Supabase는 **리드폼 제출 저장 + (Phase 3) 유료 리스팅 관리**에만 사용 — 테이블 1~2개
- 계획서 §1b 스키마는 폐기가 아니라 JSON 스키마(zod)로 이전 (§4 참조)

### 1-3. Phase 0 킬 게이트 — 툴 현실성과 숫자 사전 확정

- Keyword Planner는 광고비 지출 없는 계정엔 "1K~10K" 식 범위만 준다. Ahrefs/Semrush
  무료도 일 조회 수 제한. **Phase 0은 어차피 러프 컷이므로 범위 데이터로 충분하다** —
  단, "유의미"를 지금 숫자로 박아야 나중에 goalpost가 안 움직인다.
- **제안 킬 기준 (착수 전 Brandon 확정 필요):** 지명 키워드군("toy district" 계열)
  합산 월 검색량 하한 추정치 ≥ **1,000/월**. 미달이면 종료. (참고: gojewelrydistrict
  모델이 성립한 지명군 검색량과 비교해 보정 가능하면 더 좋음)
- 보조 신호 $0 소스: Google Trends(상대량·계절성 — Q4 스파이크 확인), 구글 자동완성,
  TikTok 해시태그 뷰수. Trends에서 Q4 스파이크가 보이면 §4 타이밍 논지도 같이 검증됨.

### 1-4. Phase 2 광고 설계의 함정 2개

- **Exact match + 저볼륨 = "Low search volume"으로 광고가 아예 안 나갈 수 있다.**
  지명군은 exact 유지하되, 서빙이 안 되면 구문일치(phrase)로 폴백하는 걸 사전 룰로
  명시. (폴백해도 검색어 리포트로 실제 쿼리 분리 집계 가능 — 노출수 지표는 살아있음)
- **ES 키워드군은 지오타겟팅 필수.** "juguetes por mayoreo"는 전국·중남미에서 검색됨.
  LA 광역(또는 캘리포니아 남부)으로 제한하지 않으면 노출수가 수요 지도가 아니라 노이즈.
- 계측: 광고 노출수/클릭은 Google Ads 쪽 지표라서 GA4가 강제는 아니지만, 통과 ⓑ
  (업체 페이지 2개+ 열람, 리드폼 3건+)를 재려면 이벤트 계측이 필요. **GA4 추천**
  (Google Ads 전환 연동이 공짜, Plausible은 $9/월 + 연동 수동). 광고 클릭엔
  `gclid` 자동 수집으로 키워드그룹별 행동 분리 가능.

### 1-5. 지도는 Google Maps 말고 MapLibre + OSM

디렉토리의 심장이 지도인데 Google Maps JS는 로드당 과금(무료 쿼터 초과 시). 방치
자산화 시나리오("유지비 ~$0")와 충돌한다. **MapLibre GL + OpenStreetMap 계열 타일
(Protomaps pmtiles 셀프호스팅)이면 지도 비용 영구 $0**, API 키도 불필요. 12블록
범위라 타일 파일도 몇 MB 수준.

### 1-6. `/es` 미러의 SEO 디테일

- LLM 번역 자체는 OK. 단 **번역 파일을 리포에 커밋**하고 (빌드마다 재번역 금지 —
  비용·비결정성), 사람이 훑을 수 있게 EN/ES를 나란히 둔 구조로.
- hreflang 상호 참조 + `x-default`는 EN. ES 페이지의 slug도 번역하지 말고 EN slug
  유지 (`/es/stores/{같은-slug}`) — 크로스링크·유지보수 단순화.

### 검토 소결

계획서가 이미 잘 잡은 것들 — 사전 확정 증거 타깃, "연장 금지", AI filler 금지,
unknown 필드 허용, 오프라인 수집을 해자로 보는 관점 — 은 손대지 않는다.
위 6건 반영해도 예산·일정 프레임($125, 8월 말 론칭)은 그대로 유효하다.

---

## 2. 확정 아키텍처

```
la-toy-district/
├── docs/                    # 계획·판정 기록 (킬 게이트 판정도 여기 커밋)
│   ├── PLAN.md
│   ├── REVIEW-AND-BUILD-PLAN.md   (본 문서)
│   └── decisions/           # phase0-verdict.md, phase2-verdict.md ...
├── pipeline/                # 데이터 수집 (Node/TS 스크립트, 수동 실행)
│   ├── 01-opendata.ts       # LA Open Data (Socrata) → raw/opendata.json
│   ├── 02-places.ts         # Places API 발견·대사 → raw/places.json (place_id 중심)
│   ├── 03-crossmatch.ts     # 이름/주소 퍼지 매칭 → 마스터 병합, 충돌은 review 큐로
│   ├── 04-enrich.ts         # TikTok/Yelp 언급 LLM 파싱 → 카테고리·도소매 추정
│   └── 05-build.ts          # 검증(zod) + slug 생성 → data/stores.json
├── data/
│   ├── stores.json          # 단일 진실 소스 (커밋됨)
│   ├── blocks.json          # 블록 경계·명칭 (winston/wall/5th ...)
│   └── i18n/es/*.json       # ES 번역 (커밋됨)
└── web/                     # Next.js 15 (App Router, output: static 지향)
    ├── app/
    │   ├── page.tsx                    # 홈 = 디렉토리 + MapLibre 지도
    │   ├── stores/[slug]/page.tsx      # generateStaticParams ← stores.json
    │   ├── guide/visiting/page.tsx
    │   ├── guide/wholesale-basics/page.tsx
    │   ├── guide/for-[buyer]/page.tsx  # party-planners | store-owners | resellers
    │   ├── es/[...mirror]              # EN 라우트 미러 (동일 컴포넌트 + ES 딕셔너리)
    │   ├── sitemap.ts / robots.ts
    │   └── og/[slug]/route.tsx         # @vercel/og 자동생성
    ├── components/          # StoreCard, Map, LeadForm, LangSwitch ...
    └── lib/                 # stores.ts (JSON 로더), jsonld.ts (LocalBusiness), i18n.ts
```

**스택 확정:** Next.js 15 + TypeScript / SSG / MapLibre GL + Protomaps / GA4 /
리드폼만 Supabase (Route Handler 경유) / Vercel 배포 / zod로 데이터 검증.
i18n 라이브러리 없이 수동 2로케일 (딕셔너리 JSON + hreflang) — 의존성 최소화.

## 3. 데이터 파이프라인 상세 (Phase 1a)

1. **LA Open Data** — data.lacity.org "Listing of Active Businesses" (Socrata API, $0).
   필터: ZIP 90013 + 거리명(Wall/Winston/3rd/4th/5th/Boyd/San Pedro/Los Angeles St
   해당 번지 범위) + NAICS 423920(완구 도매)·459120/451120(완구 소매)·기타 잡화 도매.
   NAICS만 믿지 말 것 — 등록 코드가 엉터리인 영세업체 많음 → 거리 필터를 주로,
   NAICS를 보조로.
2. **Places API** — Text/Nearby Search, field mask 최소화(무료 쿼터 내), place_id·
   좌표·존재 여부만 파이프라인에 저장. 예상 비용 $0~5 (신규 요금제 무료 쿼터 감안).
3. **크로스매칭** — 주소 정규화(usaddress 계열 또는 자체 규칙) 후 이름 유사도.
   자동 병합 임계 미달 건은 `review/` 폴더에 떨궈 수동 판정 (LLM 보조 가능).
   목표: 마스터 150~250건, 각 건에 `source[]`와 `confidence` 기록.
4. **재실행 가능성** — 모든 스크립트는 멱등, raw 응답 캐시 커밋 안 함(ToS), 산출물
   `stores.json`만 커밋. 분기 갱신 = 스크립트 재실행 + diff 리뷰.

## 4. 스키마 (§1b 수정판 — zod / stores.json)

```
Store {
  id, slug, name, name_es?
  address { line1, zip, lat, lng }        // 오픈데이터+Places 대사 결과
  block: "winston" | "wall" | "5th" | ...
  category: string[]                      // plush|figures|party|seasonal|general|electronics
  wholesale_retail: "wholesale"|"retail"|"both"|"unknown"
  naics?: string                          // 오픈데이터 원본
  place_id?: string                       // Google 대사용 (표시 안 함)
  phone?, hours?, wechat?, languages?, payment?   // v0 대부분 null — Phase 3에서 채움
  moq?: string, resale_cert_required?: boolean    // Phase 3
  mentions?: { source: "tiktok"|"yelp"|"youtube", url, note }[]  // 인용 수준
  sources: ("opendata"|"places"|"social"|"visit")[]
  confidence: "high"|"medium"|"low"
  verified_at?: string                    // 오프라인 검증일
  status: "open"|"unverified"|"closed"
}
```

원안 대비 변경: `photos[]` 제거(ToS — Street View는 임베드, 자체 사진은 Phase 3),
`place_id`·`confidence`·`status`·`mentions` 추가, DB가 아니라 파일이므로 id는 slug 기반.

## 5. 작업 순서 — 세션 단위 체크리스트

### Session A — Phase 0 (다음 세션, ~반나절)
- [ ] 킬 기준 숫자 확정 (§1-3 제안: 지명군 ≥1,000/월 — **Brandon 승인 필요**)
- [ ] Google Trends + 자동완성 + (가능하면) Keyword Planner 범위 조회 → 계절성 포함 기록
- [ ] `docs/decisions/phase0-verdict.md` 커밋 — 숫자·출처·판정 (통과/중단)
- [ ] 🙋 **Brandon**: latoydistrict.com 가용성 확인·구매, Google Ads 계정 개설(Phase 2 대비 — 개설만)

### Session B — Phase 1a 파이프라인 (통과 시, 1~2일)
- [ ] `pipeline/01~03` 작성·실행 → 마스터 리스트 생성, 건수·커버리지 보고
- [ ] `pipeline/04~05` → 카테고리 추정 + `data/stores.json` v1 커밋
- [ ] 🙋 **Brandon**: Google Cloud 프로젝트 + Places API 키 발급 (환경변수로 전달)

### Session C — Phase 1b/c 사이트 (3~5일)
- [ ] Next.js 스캐폴드 + stores.json 로더 + 홈(디렉토리+지도)
- [ ] `/stores/[slug]` ×N + JSON-LD + OG 이미지 + sitemap
- [ ] 가이드 3종 작성 (visiting은 실데이터 리서치 기반 — filler 금지 원칙 준수)
- [ ] ES 번역 생성·커밋 + `/es` 미러 + hreflang
- [ ] 리드폼 (Supabase 테이블 1개 + Route Handler + 이메일 알림)
- [ ] 🙋 **Brandon**: Vercel 프로젝트 연결 + 도메인 연결 + Supabase 프로젝트 생성

### Session D — Phase 2 셋업 (론칭 직후, 1일)
- [ ] GA4 이벤트 계측 (업체 페이지 열람, 리드폼 제출, 가이드 체류)
- [ ] 광고 캠페인 설계서 커밋: 3그룹 키워드 리스트, exact→phrase 폴백 룰, ES 지오타겟, 네거티브 키워드
- [ ] 🙋 **Brandon**: 캠페인 개설·$100 집행 (계정 소유자 작업)
- [ ] 14일 후: `docs/decisions/phase2-verdict.md` — 사전 확정 기준표 그대로 판정

### Brandon 수동 작업 총목록 (Claude가 못 하는 것)
도메인 구매 / Google Cloud·Ads·GA4·Supabase·Vercel 계정 및 키 발급 / 광고비 집행 /
(Phase 3) 오프라인 방문·긱워커 섭외.

## 6. 이 커밋에 포함된 것 / 다음 착수 명령

- 포함: `docs/PLAN.md` (원본 보존), 본 문서.
- **다음 세션 착수 명령: "Session A 실행"** — 단, §1-3 킬 기준 숫자와 §1-1/1-2
  아키텍처 변경(오픈데이터 1차 소스화, JSON 스토리지)에 대한 Brandon 승인이 선행 조건.
  이의 없으면 그대로 진행.
