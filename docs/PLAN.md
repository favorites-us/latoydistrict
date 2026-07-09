# LA Toy District 디렉토리 — 실행 계획서

> as-of: 2026-07-09 | 상태: 계획 확정, Phase 0 착수 전
> 소유: Brandon | 스택: Next.js / TypeScript / Supabase / Vercel / Claude Code

---

## 1. 배경 & 논지 (3줄)

- 레퍼런스 모델: gojewelrydistrict.com — "이름 있는 오프라인 클러스터 × 공급자 웹 부재 × 방문 전 리서치 수요"를 디렉토리로 독점하고 리스팅비/리드젠으로 화폐화.
- LA Toy District가 검증된 유일한 복제 후보: 4조건 모두 통과 (아래 §2).
- 핵심 원칙: 온라인 수집만으로 v0 론칭 → 유료 검색광고로 수요 실측 → 통과 시에만 오프라인 발품 투자 (리버서블).

## 2. 후보 검증 근거 (2026-07-09 조사 완료)

| 조건 | Toy District 상태 |
|---|---|
| ① 검색되는 고유 지명 | ✅ 12블록 (3rd~5th St / LA St~San Pedro St, DTLA), 위키 등재, ~500~1,000개 업체, 연 $1B+ 매출, 90%가 도매가 판매 |
| ② 공급자 웹 부재 | ✅ 영세 도매상 (Wix 수준), **BID(상인회) 2009년 해체 → 공식 디렉토리 없음** |
| ③ 방문 전 리서치 수요 | ✅ Yelp에 "주소가 어디냐" 질문 무응답 방치. TikTok에 도매 워크스루 콘텐츠 활발 (Labubu·헬로키티 리셀러 웨이브). 스페인어 콘텐츠 다수 |
| ④ 기존 화폐화 부재 | ✅ SERP(검색 결과 페이지) = Wikipedia + Yelp 스텁 + DiscoverLA 스텁 + TikTok. 전용 사이트 0개 |

- 바이어 페르소나: 달러스토어/디스카운트 소매 점주, 파티플래너(quinceañera 등 히스패닉 시장), TikTok Shop/스왑밋 리셀러, 이벤트 업체.
- **EN/ES 이중언어 필수** (한국어 아님). LLM 번역으로 해결.
- 알려진 리스크: Skid Row 인접 (→ 방문 가이드가 오히려 킬러 콘텐츠), 저단가 카테고리 (리드 단가 검증 필요), 상인 다수 중국계·히스패닉 (심층 수집 시 언어).

## 3. 실행 순서 (전체)

```
Phase 0: 검색량 킬 게이트 (3일, $0~15)
  └─ 통과 시 ↓
Phase 1: 온라인 수집 + v0 빌드 (1~2주, ~$10 API)
  └─ 론칭 ↓
Phase 2: 유료 검색광고 수요 실측 (2주, $100)
  └─ 통과 시 ↓
Phase 3: 오프라인 심층 수집 + 수익화 (증액 투자)
```

**총 리스크 자본: ~$125 (Phase 0~2). Phase 2 미달 시 사이트 방치 자산화하고 종료. 연장 금지.**

---

## Phase 0 — 킬 게이트 (3일)

- [ ] 키워드 검색량 확인 (Keyword Planner / Ahrefs 무료):
  - "toy district", "toy district la", "toy district los angeles"
  - "toy district parking", "toy district hours"
  - "wholesale toys downtown la", "wholesale toys los angeles"
  - "juguetes por mayoreo los angeles", "juguetes al por mayor dtla"
- [ ] 도메인 확보: latoydistrict.com 계열 가용성 확인·구매 (~$12)
- **킬 조건: 지명 키워드군 합산 월 검색량이 유의미하지 않으면 중단.** (Phase 2 광고 노출수로 재실측하므로 여기선 러프 컷만)

## Phase 1 — 온라인 수집 + v0 빌드

### 1a. 데이터 수집 (방문 0회, ~80% 커버)

| 소스 | 필드 | 방법/비용 |
|---|---|---|
| Google Places API | 상호·주소·좌표·전화·영업시간·평점·사진 | 90013 좌표 반경 + 텍스트 검색, 200곳 기준 <$10 |
| LA City 오픈데이터 (Office of Finance 사업자 등록) | 해당 블록 등록 사업자 전수 + NAICS 코드 | $0 — 간판 없는 도매상까지 포착 |
| Google Street View | 스토어프론트 사진 (초기 등재용) | $0 |
| TikTok/YouTube/Yelp | 개별 업체 언급, MOQ 단서 ("minimum 6 pieces" 류) | LLM 파싱, $0 |
| ImportYeti (선하증권) | 실수입 도매상 식별 (중국 공급처·물량) — 도매/소매 구분 프록시 | $0 |

- [ ] Places API + 오픈데이터 크로스매칭 → 업체 마스터 리스트 (목표 150~250개)
- [ ] 수집 파이프라인은 스크립트화 (재실행 가능하게 — 분기 1회 갱신용)

### 1b. 데이터 스키마 (Supabase)

```
stores:
  id, name, name_es, slug
  address, lat, lng, block (winston/wall/5th 등)
  category[] (봉제/피규어/파티용품/시즌상품/잡화/전자)
  wholesale_retail (wholesale|retail|both|unknown)
  moq (text, nullable)            -- Phase 3에서 채움
  resale_cert_required (bool, nullable) -- Phase 3
  hours, phone, wechat (nullable), languages[]
  payment[] (cash/card/unknown)
  photos[], source[] (places|opendata|streetview|tiktok|visit)
  verified_at (date, nullable)    -- 오프라인 검증 일자
```

### 1c. 사이트 구조 (프로그래매틱 SEO)

| 페이지 | 타깃 쿼리 | 비고 |
|---|---|---|
| `/` 홈 = 디렉토리 + 지도 | "la toy district" | 지도 필수 (Yelp 무응답 1위 질문이 "주소가 어디냐") |
| `/stores/{slug}` ×200 | "{상호} toy district" 롱테일 | Places 데이터 + Street View 사진 |
| `/guide/visiting` | "toy district parking", "toy district hours", "is toy district safe" | 주차·안전·시간대·현금 — 리서치만으로 작성 가능, **킬러 콘텐츠** |
| `/guide/wholesale-basics` | "do i need permit to buy wholesale", resale cert 설명 | CA resale certificate 일반 가이드 |
| `/guide/for-{buyer}` ×3 | 파티플래너 / 달러스토어 점주 / TikTok 리셀러 | 바이어 유형별 진입 가이드 |
| `/es/*` 전체 미러 | "juguetes por mayoreo dtla" | LLM 번역, hreflang |

- 기술: Next.js SSG, sitemap, LocalBusiness 스키마 마크업(JSON-LD), OG 이미지 자동생성
- 금지: AI스러운 filler 텍스트 대량생성 — 페이지당 실데이터(필드) 중심, 프로즈는 최소

## Phase 2 — 유료 광고 수요 실측 (2주, $100)

**목적 재정의: 트래픽 "보기"가 아니라 ①검색량 실측 ②전환 행동 검증.** 광고 유입량 자체는 돈 넣은 만큼 나오므로 지표가 아님.

- 채널: Google Search 광고만. **정확일치(exact match)** 키워드. TikTok/디스플레이 금지 (인텐트 없는 트래픽 = 노이즈)
- 키워드 그룹: EN 지명군 / EN 도매 인텐트군 / ES 군 — 3그룹 분리 (그룹별 노출수가 곧 수요 지도)
- 계측: GA4 or Plausible + 이벤트 (업체 페이지 열람, 리드폼 제출, 가이드 체류)
- 리드폼: "Get Quotes — 원하는 품목/수량 남기면 매칭" (v0는 수동 매칭이어도 됨)

### 증거 타깃 (시작 전 확정 — 변경 금지)

| 항목 | 기준 |
|---|---|
| 예산/기한 | $100 / 14일 |
| 예상 물량 | CPC $0.5~2 가정 시 클릭 50~150 — 방향 신호용, 통계 확신 아님 |
| 통과 ⓐ | 대상 키워드군 광고 노출수 합계가 월환산 유의미 수준 (Phase 0 추정치와 교차검증) |
| 통과 ⓑ | 방문자 30%+ 업체 페이지 2개 이상 열람 **or** 리드폼 제출 3건+ |
| 판정 | ⓐⓑ 중 하나라도 명확 통과 → Phase 3 증액. 둘 다 미달 → 종료 (사이트는 방치 자산, 유지비 ~$0) |

## Phase 3 — 오프라인 심층 수집 + 수익화 (통과 시에만)

### 3a. 심층 필드 수집 (MOQ·resale cert·결제·WeChat)

이 필드들이 온라인에 없다는 사실이 이 사이트의 유일한 해자 — 스크래핑 가능했다면 누구든 복제함.

| 옵션 | 비용 | 비고 |
|---|---|---|
| A. 직접 방문 | $30/회 | 토요일 반나절, 트래픽 상위 30~50개 업체부터 (전수 X) |
| B. 긱워커 (TaskRabbit/Craigslist) | $100~200 | 구조화 입력 폼 지참, 스페인어 가능자 우선 |
| C. 전화 | $0 | 보조용 (응답률·언어 장벽) |

### 3b. 수익화 (쥬얼리 모델 순서)

1. 무료 등재 → 트래픽 증명 후 **유료 강화 리스팅** $20~50/월 (상단 노출·사진·인벤토리 하이라이트) — 본체
2. Get Quotes 리드젠 (바이어 → 복수 상인 매칭) — B2B 리드
3. 디스플레이 광고 — 보조 (저단가 트래픽, 기대 낮게)

- 수익 게이트: 유료 리스팅 문의 5건 or 월 리드 30건 (론칭 후 90일 내) → 지속 투자 판단

## 4. 타이밍

- **Q4 홀리데이가 피크 시즌 → 8월 말 v0 론칭이 데드라인.** 역산: Phase 0 = 7월 중순, Phase 1 = 7월 말, Phase 2 = 8월 중, Phase 3 착수 = 8월 말~9월.

## 5. 선제 공개 약점

- SEO 랭킹 자체는 Phase 2로도 미검증 (시간이 유일 변수). 경쟁 SERP가 스텁뿐이라 구조적으론 유리하나 보장 아님.
- Brandon 한국 소싱 moat 미활성 — 이 프로젝트는 "제네릭 SEO 자산" 사이드벳. 해자는 오프라인 수집 노동 + 선점뿐.
- 저단가 카테고리 → 리드/리스팅 단가가 쥬얼리 대비 낮을 수 있음 (Phase 3에서 실측).
- 상인 참여 거부 가능성 → 공개 정보만으로도 디렉토리 성립 (Places/오픈데이터 기반).

## 6. WIP 상태

- 이 프로젝트가 실행되는 동안 K-pop 공동구매(기존 #1)는 **대기열**. 동시 진행 금지.
- Phase 2 미달 종료 시 → K-pop 공구 substrate 지목 작업으로 복귀.

## 7. 다음 세션 착수 명령 (그대로 실행)

1. Phase 0 키워드 리스트 검색량 조회 → 킬 게이트 판정
2. 통과 시: Places API 수집 스크립트 작성 (90013 반경, toy/wholesale 카테고리) + LA 오픈데이터 사업자 등록 덤프 크로스매칭
3. Supabase 스키마 생성 (§1b) → Next.js 프로젝트 스캐폴드 (§1c 라우트 구조)
