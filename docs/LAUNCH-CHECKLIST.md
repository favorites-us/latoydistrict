# 런치 체크리스트 (1차: 유입 확인)

> 목표는 완성이 아니라 **유입 측정**. 무료로 시작 → 도메인 + 소액 광고로 신호 확인.
> Claude가 코드는 다 준비했고, 아래는 **Brandon 계정 작업**(결제·키 발급)이다.

## 0. 도메인 — ✅ 완료

- **`toydistrictlosangeles.com`** 구매 완료 (Cloudflare Registrar, 2026-07-10 등록,
  2027-07-10 만료, 네임서버 = Cloudflare).
- ✅ 코드 반영 완료: `NEXT_PUBLIC_SITE_URL` 기본값·footer·OG·메일·README 전부 새 도메인.
- 아직 A 레코드 없음(어디에도 미연결) → 아래 1번에서 Vercel에 연결.

## 1. Vercel 배포 + Cloudflare DNS 연결 (무료)

- [ ] github에 이 리포 push (아직 origin 미푸시 상태면 먼저).
- [ ] Vercel New Project → 이 리포 import.
- [ ] **Root Directory = `web`** 로 설정 (Next.js 앱이 web/ 하위). 나머지 자동 감지.
- [ ] Deploy → `xxx.vercel.app` 로 우선 동작 확인.
- [ ] 커스텀 도메인 연결: Vercel → Settings → Domains → `toydistrictlosangeles.com` 추가.
      Vercel이 준 값을 **Cloudflare 대시보드 → DNS**에 입력:
  - `A` `@` → `76.76.21.21` (Vercel 안내값 우선)
  - `CNAME` `www` → `cname.vercel-dns.com`
  - Cloudflare 프록시(주황 구름)는 **DNS only(회색)** 로 두면 충돌이 적다. SSL은 Vercel이 발급.
- [ ] (선택) 이메일 수신: Cloudflare → **Email Routing**(무료)에서 `hello@toydistrictlosangeles.com`
      → 실제 받는 주소로 포워딩. 안 하면 폼 폴백 메일이 도착하지 않는다.

## 2. 환경변수 (Vercel → Settings → Environment Variables)

`web/.env.example` 참고. 전부 선택이지만 아래 순서로 채우면 계측이 완성된다.

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://<구매한 도메인>` (sitemap·canonical·OG 정확도)
- [ ] `NEXT_PUBLIC_GA_ID` = GA4 측정 ID (아래 3번에서 발급) → 재배포
- [ ] (리드 저장 원하면) `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (아래 4번)

## 3. Google Analytics 4 + Search Console (무료·필수)

- [ ] GA4 속성 생성 → 측정 ID(`G-XXXX`)를 위 `NEXT_PUBLIC_GA_ID`에 넣기.
- [ ] **Google Search Console에 도메인 등록** + `sitemap.xml` 제출
      (사이트가 이미 `/sitemap.xml` 제공). ← **광고 없이도 노출수로 수요를 읽는 핵심 무료 신호.**
- 계측되는 이벤트: `store_view`(업체 열람), `lead_submit`, `store_inquiry`(업체별 문의).

## 4. Supabase (리드/문의 저장 — 선택, 무료 티어)

- [ ] Supabase 프로젝트 생성.
- [ ] SQL editor에서 `supabase/schema.sql` 실행 (leads 테이블, store_slug/store_name 포함).
- [ ] Project URL + service_role 키를 위 환경변수에 설정.
- 미설정 시: 폼이 저장 대신 `hello@toydistrictlosangeles.com` 메일 폴백을 안내(사이트는 정상 동작).
  → 그 메일 주소를 실제 받는 주소로 바꾸려면 코드의 `hello@toydistrictlosangeles.com` 교체 필요(🤖 요청 시 Claude가).

## 5. 소액 광고 (~$40–50) — `docs/ads-campaign-plan.md`「소액 버전」

- [ ] Google Ads 캠페인 1개 / 광고그룹: AG1(지명) 우선 + AG2(도매). ES(AG3)는 보류.
- [ ] 일예산 $3, 정확일치 시작, 네거티브·지오타겟·랜딩 URL은 문서대로.
- [ ] GA4 전환 가져오기 연결(`lead_submit`, `store_inquiry`).
- [ ] 14일 후 `docs/decisions/phase2-verdict.md`에 수치·판정 기록.

## 판정 (D+14)

- Search Console 노출수 + 광고 그룹별 노출수 → 수요 유무.
- GA4: 방문자당 업체 페이지 열람률, 리드/문의 발생.
- 명확한 무신호 → 중단(사이트는 자산으로 남김). 신호 → Phase 3 검토.
