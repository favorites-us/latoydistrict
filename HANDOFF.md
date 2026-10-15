# LA Toy District 재시작 후 작업 인계

## 최신 작업 — 2026년 10월 15일

사용자의 사진·바이어 정보 검토 요청과 “진행해봐” 후속 요청에 따라 **가이드 정비와 구매 준비표를 구현하고 운영 배포했다.** 최신 배포는 `dpl_FbWM92oz5yt9ZEmVcossJcdFeDFe`이며 [영문 구매 체크리스트](https://toydistrictlosangeles.com/guide/buying-checklist), [스페인어](https://toydistrictlosangeles.com/es/guide/buying-checklist)가 추가됐다. 기존 가이드 5종을 양 언어로 정리하고, 공식 업체 4곳에 구매 질문과 카탈로그 안내를 추가했다. California Balloon House 반품 정책도 반영했다. 등록 업체 191개와 관련 없는 필드는 유지했고 온라인 안내는 11→16개다.

[구현 결과](docs/decisions/2026-10-15-buyer-information-implementation.md), [배포 기록](artifacts/buyer-information-implementation-20261015/deployment.json), [운영 HTML 검사](artifacts/buyer-information-implementation-20261015/production-checks.json)를 먼저 읽는다. 데이터 테스트 16개, 최종 빌드 593개 페이지, 로컬·운영 HTML 각 22개 검사가 통과했다. 현재 외관 사진으로 게시할 권리·촬영일·점포 일치를 모두 확인한 사진은 표본 4곳에서 0개이며, 사진을 복제하지 않고 공식 카탈로그로 연결했다. 전체 사진 커버리지나 실제 수요를 추정한 결과가 아니다.

실제 Claude CLI와 선행 검토 2차례, 구현 검토 1차례를 수행했다. Google 캡처 수집은 하지 않는다. 10월 15일 브라우저 재접근도 저장된 `localhost` 차단 설정으로 거절되어 화면·인쇄 미리보기는 미확인이다. 우회하지 않았다. GA 수신·문의 처리·GSC 접근 역시 미완료다. 10/15~11/11 관찰 창에는 이번 추가 변경이 포함되므로 배포별로 구분하고, 12/1 최종 판단 일정은 유지한다.

아래 10월 14일 배포·조사 내용은 이전 작업 이력이다. 최신 소스는 이번 배포의 48개 파일 해시 목록인 `artifacts/buyer-information-implementation-20261015/deployment-source-manifest.json`으로 대조한다. 배포는 `2a05e7e` 이후 작업 트리에서 먼저 수행했고 조사·구현·검증 기록을 같은 브랜치에 커밋한다. 최종 커밋·원격 동기화 상태는 `git log -1`과 `git status -sb`로 확인한다.

## 10월 14일 작업 이력

최초 작성: 2026년 10월 14일 14시 01분 PDT. 운영 배포·검증은 같은 날 14시 28분 PDT에 완료했고, 이후 사용자의 커밋·푸시 요청에 맞춰 저장소 상태 설명을 갱신했다.

GA 실측 분석, 온라인 정보 확보 실험, Claude 검토, 콘텐츠 보강과 **운영 배포를 완료했다.** 사용자가 “배포해”라고 명시적으로 요청해 기존 Vercel 프로젝트에 배포했고, [운영 사이트](https://toydistrictlosangeles.com)가 새 배포를 가리키는 것을 확인했다. 영문·스페인어 20개 페이지와 정적 자산 13개의 운영 HTTP 검증이 통과했다. **공식 사이트가 확인된 업체를 제한적으로 보강할 가치는 있지만, 전체 업체 조사나 광고 확대를 뒷받침할 근거는 부족하다.** 화면 시각 검증은 대화에서 후순위로 정리했으며, 운영 GA 이벤트 수신은 아직 확인하지 않았다. 배포 당시에는 미커밋 작업 트리를 사용했다. 이후 사용자의 커밋·푸시 요청에 따라 배포 소스와 조사·검증 기록을 이 문서와 함께 버전 관리한다. [배포 당시 기록](artifacts/online-pilot-20261014/deployment.json), [운영 검증](artifacts/online-pilot-20261014/deployment-production-checks.json)

**배포 전 이력 — 2026년 10월 14일 14시 18분 PDT:** 동일한 Chrome 도구로 동일한 `http://localhost:3017/stores/american-silk-inc-340` 접근을 시도했으나 사용자 권한 거부로 다시 차단됐다. 화면 검증은 시작하지 못했고, 설정 변경이나 우회는 하지 않았다. 이후 사용자가 설정 해제를 알리고 이 단계의 필요성을 물었으며, 정보 확보에는 필수 단계가 아니므로 후순위로 둘 수 있다고 설명한 뒤 배포 요청을 받았다. 권한 해제 자체는 도구로 재확인하지 않았다. [당시 권한 확인 기록](artifacts/online-pilot-20261014/validation-browser-resume.json)

## 재개 시 확인할 현재 상태

**2026-10-15 선행 검토 기록:** [사진·바이어 정보 판단 및 당시 초안](docs/decisions/2026-10-15-buyer-information-and-photos.md), [출처 기록](artifacts/buyer-information-review-20261015/evidence.json). 해당 문서의 미게시·미구현 표시는 초기 검토 단계의 상태다. 이후 사용자가 진행을 요청해 위 최신 작업의 구현·배포를 완료했다. 사진과 텍스트의 사용자 효과는 여전히 미검증이다.

1. 이 문서의 최신 작업과 [10월 15일 구현 결과](docs/decisions/2026-10-15-buyer-information-implementation.md)를 먼저 읽는다. 10월 14일 근거는 [파일럿 최종 결과](docs/decisions/2026-10-14-online-pilot-results.md)에 있다. 이미 수행한 GA 조사와 Claude 검토를 처음부터 반복하지 않는다.
2. 작업 디렉터리를 `/Users/hbrandon/DevProjects/ToyDistrict/latoydistrict`로 잡고 `git status --short`로 기존 변경을 확인한다. 기존 작업을 초기화하지 않는다.
3. 현재 운영 배포는 위 최신 작업의 `dpl_FbWM92oz5yt9ZEmVcossJcdFeDFe`다. `dpl_3eHS9fNG3CnAsjBYQM8NCY3jeerr`와 `online-pilot-20261014/deployment-source-manifest.json`의 45개 파일은 이전 배포다. 두 배포 모두 `web/` 작업 트리에서 배포했으므로 해당 날짜의 소스 해시 목록과 저장소를 대조한다.
4. 브라우저 화면 검증은 후순위 미완료 항목이다. 이 작업 때문에 정보 확보나 이미 완료한 배포를 차단 상태로 되돌리지 않는다. 추가 화면 검증을 진행할 때만 아래의 동일 localhost 주소와 승인된 도구를 사용한다.
5. 배포 후 관찰에서는 자연검색 유입·참여, 연락 클릭, 실제 문의를 구분한다. GA 수신 확인, 문의 처리 체계, GSC 접근은 별도 미완료다.
6. 추가 조사·확대는 아래의 제한적 진행 판단을 따른다. 변경·실패·새로운 우려가 없으면 기존 검사를 반복하지 않는다.

## 이전 브라우저 권한 장애와 추가 화면 검증 방법

마지막으로 요청한 URL:

`http://localhost:3017/stores/american-silk-inc-340`

Chrome 브라우저 도구는 이 주소를 열 때 **저장된 사용자 차단 설정** 때문에 거절했다. 사용자에게 설정 변경을 안내한 뒤, 사용자는 “니가 변경해도 돼”라고 명시적으로 허용했다. 하지만 ChatGPT 앱 자체를 선택하려는 UI 호출도 다음 사유로 거절됐다.

> Computer Use is not allowed to use the app 'com.openai.codex' for safety reasons.

따라서 **에이전트가 설정 화면을 열거나 권한을 바꾼 사실은 없다.** 권한 요청을 반복해서 받는 문제가 아니라, 저장된 도메인 차단과 앱 자체의 조작 제한이 남아 있는 상태다.

공식 문서에서 확인한 사용자의 설정 경로:

**ChatGPT 데스크톱 앱 → Settings → Computer Use → Chrome 옆 Manage → 차단 목록에서 `localhost` 제거**

차단 목록에서 도메인을 제거하면 브라우저가 다시 접근 허용을 요청할 수 있다. 접근 요청에는 해당 사이트를 허용하는 옵션이 있다. [공식 브라우저 확장 문서](https://learn.chatgpt.com/docs/chrome-extension#manage-allowed-and-blocked-websites)

이 경로는 공식 문서에서 확인했으며, 사용자의 실제 설정 화면을 직접 확인한 것은 아니다. 사용자가 변경을 마치기 전에는 차단이 해제됐다고 보고하지 않는다. 해당 차단을 다른 포트·호스트·브라우저·직접 CDP·설정 파일 수정으로 우회하지 않는다. UI 조작은 제공된 `mcp__cua_repl`만 사용한다. 별도의 AppleScript나 Playwright로 바꾸지 않는다.

이전 `iab` 접근은 브라우저를 사용할 수 없다는 오류가 났다. Chrome 프로필은 `Brandon`이었고 브라우저 ID는 당시 `1`이었다. 재시작 후 ID가 유지된다고 가정하지 않는다. ChatGPT 앱 표시 이름은 `ChatGPT`, 번들 ID는 `com.openai.codex`였다.

## 로컬 실행과 화면 검증 — 추가로 진행할 때

14시 18분 재개 시 TCP 3017 포트의 리스너가 없음을 확인했고 이번 배포 과정에서도 로컬 서버는 시작하지 않았다. 테스트와 빌드는 이미 통과했으므로, 코드가 바뀌지 않았고 빌드 결과가 남아 있다면 추가 시각 검증 시 미리보기 서버부터 실행한다.

```sh
cd /Users/hbrandon/DevProjects/ToyDistrict/latoydistrict
npm --prefix web run start -- --port 3017 --hostname 127.0.0.1
```

빌드 결과가 없다면 먼저 `npm run build`를 실행한다. 권한 해제 후 새 CUA 세션의 관련 진입 호출은 다음과 같다. 반환된 도구 지침과 UI 상태를 읽고 후속 조작을 결정한다.

```javascript
let tab = await cua.createBrowserTab(
  "chrome",
  "http://localhost:3017/stores/american-silk-inc-340",
  { sessionName: "🔎 Toy District 검증" }
);
```

검증할 대표 업체 slug:

- `american-silk-inc-340`: 확정 영업시간을 철회한 안내, 서로 다른 폐점 시간의 두 공식 출처, $3,000 조건의 적용 범위.
- `california-balloon-house-447`: 헬륨 주입 주문과 배송 안내, 출처 링크, 긴 문구의 줄바꿈.
- `casa-manga-218`: 연락·도매 신청 안내와 스페인어 표시.
- `bigmart-inc-230`: 디렉터리 전화번호의 사업주 미확인 표시와 Suite 31 주소.

영문 경로는 `/stores/<slug>`, 스페인어 경로는 `/es/stores/<slug>`다. 넓은 화면과 좁은 화면에서 표·연락 링크·출처·구매 안내가 잘리는지 확인한다. 목록 카드의 구매 방식 안내도 확인한다. 지원 여부가 확인되지 않은 브라우저 API를 추측해 호출하지 않는다. 전화 걸기, 이메일 발송, 문의 제출을 실제로 실행하는 검증은 하지 않는다.

## GA에서 확인한 사실

속성은 `latoydistrict`, ID `545044706`, 운영 도메인은 `https://toydistrictlosangeles.com`, GA 스트림은 `G-1D1HB0X4BH`다. 기존 인증을 활용한 GA API 읽기 조회로 데이터를 확보했다. GA 브라우저 화면을 열었다고 표현하지 않는다.

비교 기간은 2026년 8월 17일~9월 13일과 9월 14일~10월 11일의 각 28일이며 속성 시간대는 `America/Los_Angeles`다. 처리 지연을 고려해 10월 12일 이후를 제외했다.

| 지표 | 직전 28일 | 최근 28일 |
|---|---:|---:|
| 전체 세션 | 265 | 292 |
| 자연검색 세션 | 130 | 192 |
| 자연검색 사용자 | 104 | 145 |
| Google 자연검색 세션 | 98 | 160 |
| 자연검색 참여 세션 | 77 | 91 |
| 자연검색 업체 페이지 열람 사용자 | 49 | 76 |
| 자연검색 참여율 | 59.2% | 47.4% |

자연검색 세션은 47.7% 증가했다. 직전 주별 세션은 34·32·39·25, 최근은 45·49·50·48로, 최근 네 주 모두 이전보다 높은 수준이었다. 통계적 유의성이나 콘텐츠 변경의 인과효과를 검정한 결과는 아니다.

최근 두 비교 기간의 `lead_submit`과 `store_inquiry`는 각각 0건이다. DB·이메일을 조사하지 않았으므로 실제 외부 문의가 0건이라고 단정하지 않는다. 문의 이벤트는 현재 주요 이벤트 설정에도 포함되지 않는다. `store_view`에는 초기화 시점에 따른 누락 가능성이 있어 업체 열람은 페이지 경로 기준으로 분석했다.

현재 서비스 계정의 Search Console 접근 목록에는 운영 도메인이 없었다. GA 세션을 GSC 클릭으로 바꾸어 기존 재개 기준을 충족했다고 판단하지 않는다. 기존 12월 1일 최종 판단 일정은 유지한다.

상세 근거: [GA 분석](docs/decisions/2026-10-14-ga-review.md), [GA 집계](artifacts/ga-review-20261014/summary.json), [기존 판단 기준](docs/decisions/phase2-verdict.md).

## 온라인 조사와 콘텐츠 보강 결과

등록 기반 업체 후보 191개를 대상으로 GA 상위 5개, 기존 웹 채널 보유 10개, 잔여 모집단 175개에서 고정한 무작위 20개를 조사했다. 모집단을 현재 영업 중인 점포 명부로 간주하지 않는다. 공식 사이트 4곳과 제조사 등재 1곳은 앞선 조사에서 이미 발견했으므로 무작위 표본의 신규 확보 성과로 세지 않는다.

무작위 20개에서 새로 채택한 정보는 **공개 디렉터리 전화번호 4개, 공식 구매 조건 0개**였다. 새 전화번호는 V L Silk & Craft, L.T. Gifts / Beaula, Big Mart, LA Sky Trading이다. 모두 사업주에게 확인하지 않았고 그 상태를 화면에 표시한다. GA 수요 상위 5곳에서도 신규 핵심 운영·구매 정보는 확보하지 못했다.

후속 조사에서는 알려진 공식 사이트를 깊게 읽어 실용적인 안내를 더 확보했다.

- California Balloon House: 외부 구매 풍선의 헬륨 주입 가능, 방문 주문과 예약일 전액 결제, 일반적으로 25개 이상이면 최소 3일 전 예약, 마지막 주문 접수 시각, 배송 지역과 금요일 주문 처리 안내.
- American Silk: 홈페이지는 16시, 소개 페이지는 17시 폐점을 안내해 확정 시간 값을 철회했다. $3,000은 도매 계정 신청 페이지 조건으로만 표현한다. 한 개 구매에도 도매 가격을 제공한다는 다른 공식 안내를 함께 제시하며 보편적 MOQ로 해석하지 않는다.

현재 로컬 데이터는 9개 업체가 보강된 상태다. 전화 보유 업체 31→35개, 이메일 0→4개, 웹사이트 링크 9→10개, 구매·운영 안내 7→11개다. 링크 수에는 기존 미검증·접속 불가 링크도 포함된다. 확정 단일 영업시간은 American Silk의 충돌을 반영해 2→1개로 줄었다. 현장 확인일은 추가하지 않았다.

총 8시간은 실험 상한이었다. 조사 노동 시간을 따로 측정하지 않았으므로 시간당 생산성을 주장하지 않는다. 전체 크롤러 개발이나 191개 전수 조사는 현재 권고하지 않는다. 업체 연락이나 신청서 제출은 수행하지 않았다.

## 구현과 보존해야 할 데이터 규칙

중요 파일:

- `pipeline/data/enrichment-baseline.json`: 기존 191개 업체의 고정 기준 데이터.
- `pipeline/data/reviewed-stores.json`: 검토된 업체별 변경과 출처. 후속 수정의 원천 데이터.
- `pipeline/reviewed-data.mjs`, `pipeline/store-schema.mjs`, `pipeline/build-stores.mjs`: 기준 데이터와 검토 결과 병합, 출처·동일 업체 검증.
- `pipeline/07-contact.mjs`: 기준 데이터와 검토 결과에서 사이트 데이터를 재생성. 등록 업체 구성이 다르면 중단한다.
- `pipeline/06-free-enrich.mjs`, `pipeline/osm-match.mjs`: 후보 자료만 생성하며 사이트 데이터를 직접 덮어쓰지 않는다. 상호·주소·호수 모두 일치해야 한다.
- `web/data/stores.json`: 생성 결과. 이 파일만 수정하면 다음 재생성에서 사라질 수 있다.
- `web/components/pages/StorePage.tsx`, `web/components/StoreCard.tsx`, `web/components/StoreContactLink.tsx`, `web/lib/stores.ts`, `web/lib/jsonld.ts`, `web/lib/i18n.ts`, `web/app/globals.css`: 구매 안내, 출처, 연락 링크, 다국어 UI와 측정.
- [재수집 작업 지침](pipeline/CONTACT-RESEARCH-C.md): 다음 데이터 작업 전에 읽는다.

출처 규칙:

- Google Maps·Places·GBP 데이터를 가져오지 않는다.
- 디렉터리는 빈 전화번호만 채우며 기존 번호를 덮어쓰거나 출처 등급을 낮추지 않는다. 디렉터리 영업시간은 채택하지 않는다.
- 공식 운영·구매 정보는 업체별 검토 도메인과 일치해야 한다. `additional_sources`도 같은 출처 검증을 거친다.
- 상호·주소·호수·ZIP을 대조한다. Big Mart는 Suite 31, LA Sky는 Suite 38이다.
- `checked_at`은 원문을 확인한 날짜이며 원문 갱신일이나 사업주 확인일이 아니다. `verified_at`은 바꾸지 않았다.
- American Silk의 `hours`는 `null`이다. 불명확한 $3,000을 독립된 `minimum_order_value`로 복원하지 않는다.
- 새 디렉터리 번호는 출처 맥락이 없는 JSON-LD 전화 필드에 넣지 않는다.
- 기준 데이터의 null 좌표로 유효한 좌표를 덮어쓰지 않는다. 기존 연락처 충돌은 실패하도록 처리한다.

연락 링크의 이벤트는 `store_contact_click`이며 매개변수는 `store_slug`, `contact_method`다. 종류는 `phone`, `email`, `website`, `buying_source`다. 전화번호나 이메일 주소 자체를 이벤트에 넣지 않는다. 클릭을 문의 완료로 세지 않으며 GA 기본 외부 클릭과 단순 합산하지 않는다. 운영 GA에서 실제 수신되는지는 아직 확인하지 않았다.

## 완료한 검증과 Claude 검토

배포 전 검증 근거는 [후속 검증 기록](artifacts/online-pilot-20261014/validation-followup.json)이다. 초기 `validation.json`의 14개 테스트·7개 안내 수치보다 후속 기록이 최신이다. 운영 배포 후 최신 결과는 [운영 검증 기록](artifacts/online-pilot-20261014/deployment-production-checks.json)이다.

- 자동 테스트 16개 통과.
- Next 프로덕션 빌드 통과, 생성 페이지 591개.
- 후속 영문·스페인어 업체 페이지 18개의 정적 HTML 검사 통과. 초기에는 목록 2개를 포함한 20개 페이지도 검사했다.
- 데이터 재생성 결과가 바이트 단위로 동일함을 확인했다.
- 최신 `web/data/stores.json` SHA-256: `4725fbe05d2c394141f24b2f47863981fc29da1e886da084ac8d7238253c88f0`.
- Vercel 운영 빌드도 통과, 591개 페이지 생성. 운영 도메인의 영문·스페인어 상세 18개와 목록 2개, JS/CSS 자산 13개 확인 완료.
- 운영 HTML의 전체 구매 안내·출처·연락 링크·주소 호수, 8개 언어별 디렉터리 전화의 JSON-LD 미노출, GA ID와 연락 클릭 이벤트 코드 배포를 확인했다.
- 실제 브라우저 시각 검증과 운영 GA 이벤트 수신은 미완료다. HTTP 검증은 브라우저 JavaScript를 실행하거나 문의를 제출한 결과가 아니다.

필요한 변경 후 사용할 명령:

```sh
npm test
npm run reviewed-enrich
npm run build
```

변경·실패·새로운 우려가 없으면 이미 통과한 검사를 반복할 필요가 없다. 외부 데이터를 가져오는 전체 `npm run pipeline`을 단순 검증용으로 실행하지 않는다.

사용자가 요청한 Claude 검토는 실제 설치된 Claude CLI로 수행했다. 응답 메타데이터의 모델은 `claude-opus-5-5`였다. GA 분석, 온라인 조사 계획, 구현과 후속 정책 문구를 검토했고 관련 원문과 수정 판정을 저장했다. Claude가 원문 사이트를 독립 브라우징한 것은 아니며, 제공한 증거·코드를 검토했다. Claude의 일부 과도한 판단은 원문과 대조해 채택하지 않았다.

추가 검토가 필요한 경우 기존 실행 방식은 아래와 같다. 프롬프트는 표준 입력으로 전달하고 출력은 파일에 저장했다. 불필요한 재검토를 실행하지 않는다.

```sh
/Users/hbrandon/.local/bin/claude -p --safe-mode --strict-mcp-config --tools '' --permission-mode dontAsk --no-session-persistence --output-format json
```

Claude의 핵심 결론도 **공식 근거가 있는 업체의 제한적 보강은 진행, 대규모 확대는 보류**다. 제공된 로컬 구현에서 중대한 차단 사유가 없다는 판단과 브라우저 검증 완료는 다른 상태다.

## 근거 파일과 저장소 상태

주요 보고서와 원본:

- [GA 검토](docs/decisions/2026-10-14-ga-review.md), `artifacts/ga-review-20261014/`
- [온라인 확보 가능성 검토](docs/decisions/2026-10-14-online-enrichment-review.md), `artifacts/online-enrichment-20261014/`
- [파일럿 최종 결과](docs/decisions/2026-10-14-online-pilot-results.md), `artifacts/online-pilot-20261014/`
- [고정 표본](artifacts/online-pilot-20261014/manifest.json), [35개 조사 결과](artifacts/online-pilot-20261014/research-results.json), [후속 공식 근거](artifacts/online-pilot-20261014/followup-evidence.json)
- [Claude 후속 검토](artifacts/online-pilot-20261014/claude-policy-followup-review.txt), [반영 판정](artifacts/online-pilot-20261014/claude-policy-followup-disposition.json)

브랜치는 `claude/la-toy-district-plan-34d8tx`이며 원격은 `origin`의 같은 이름 브랜치다. 이번 보강 전 HEAD는 `c61d8e5` (`Add Google AdSense loader and ads.txt`)였다. 웹 변경은 미커밋 작업 트리에서 Vercel CLI로 먼저 운영 배포했고, 이후 사용자 요청으로 코드·파이프라인·조사 보고서·검증 근거를 함께 커밋한다. `deployment.json`의 `commit_created: false`, `git_push_performed: false`는 **배포 당시** 상태이며 이후 Git 상태를 뜻하지 않는다. 최신 커밋·동기화 상태는 `git log -1`, `git status -sb`로 확인한다. 기존 작업을 초기화하지 않으며 인증정보·토큰을 문서나 커밋에 추가하지 않는다.

추가 투자 판단에는 배포 후 28일간 보강 페이지의 유입·참여·연락 클릭과 실제 문의를 구분한 관찰이 필요하다. 10월 14일 운영 배포를 완료했으므로 완전한 날짜 기준의 권장 관찰 창은 10월 15일~11월 11일(포함, America/Los_Angeles)이다. 자동 일정은 만들지 않았고 12월 1일 최종 판단 일정은 유지한다. 문의 처리 체계, `store_view` 초기화, 주요 이벤트 지정, GSC 접근은 GA 보고서의 후속 과제로 남아 있으며 이번 보강으로 해결됐다고 표현하지 않는다.
