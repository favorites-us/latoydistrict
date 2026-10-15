# 점포 사진과 바이어 정보: 온라인 확보 가능성 검토

검토일: 2026-10-15 (America/Los_Angeles). 기준 커밋: `2a05e7ed1da90dd5b2f576d8a3cfaa918bb5bd2d`.

후속 상태: 이 검토 이후 사용자의 진행 요청으로 [구현과 운영 배포](2026-10-15-buyer-information-implementation.md)를 완료했다. 아래의 미게시·미구현 표시는 최초 검토 시점의 상태다.

사용자 요청은 점포 사진의 공식 확보 경로와 바이어에게 제공할 온라인 정보의 검토, 그리고 Claude와의 토론이다. 이번 작업은 조사·판단·콘텐츠 초안까지다. 사이트 코드·업체 데이터·운영 배포는 변경하지 않았다. 이미지 다운로드, 업체 연락, 유료 API 활성화도 하지 않았다.

## 판단

**사진은 권리를 확보한 경로로 수집할 수 있다. Street View를 캡처해 우리 서버의 점포 사진으로 저장하는 방식은 채택하지 않는다.** Google의 공개 정책이 그 방식을 제한하며, 일반적인 API 제공 사실만으로 이 상업용 디렉터리에 대한 사용 허가가 확인되지는 않는다. 모든 지도 링크나 모든 사진 사용이 불법이라는 뜻은 아니다.

온라인 정보 중에서는 **구매 조건, 공식 카탈로그, 방문 전 확인할 질문, 지역 공통 운반·서류 안내**를 제공할 근거가 있다. 이미 확인한 공식 업체 4곳의 정보를 같은 형식으로 묶고 필요한 항목만 더 조사하는 것이 현재 자료로 가능한 범위다. 사진의 방문 유도 효과나 텍스트 대비 효용은 아직 사용자에게 검증하지 않았다.

현 자료는 등록 기반 후보 191개, 보강 업체 9개, 기존 구매·서비스 안내 11개다. 현재 영업 중인 191개 점포를 확인한 명부가 아니다. 이번에 추가로 발견한 California Balloon House 반품 정책은 기존 11개에 포함되지 않은 **미게시 후보**다. 이전 성과를 신규 수집량으로 다시 세지 않는다. [기존 파일럿](2026-10-14-online-pilot-results.md)

## 사진 확보 경로

| 경로 | 가능한 활용 | 이번 판단과 남은 조건 |
|---|---|---|
| 우리가 촬영하거나 촬영을 의뢰한 원본 | 정확한 입구·간판·호수 안내 | 의뢰만으로 저작권이 자동 이전된다고 가정하지 않는다. 촬영 권한과 필요한 상업적 웹 사용 권리를 확보하고 촬영일·주소를 기록한다. 이번에는 촬영하지 않았다. |
| 권리자가 제공한 점포 사진 | 점포 상세의 대표 사진 | 사업주가 실제 저작권자이거나 사용권을 부여할 권한이 있는지 확인한다. 게시·리사이즈·필요한 편집 범위와 출처 조건을 기록한다. |
| 공식 사이트·갤러리 링크 | 바이어가 원본 사진과 상품을 확인 | 링크 제공은 파일을 복사해 게시하는 것과 다르다. 공식 사이트에 공개되어 있다는 이유만으로 다운로드·재게시 권한이 생기지 않는다. |
| Wikimedia Commons | 파일별 허용 범위에 맞는 지역·점포 사진 | 저작자·라이선스·촬영일·동일 점포 여부를 개별 확인한다. 실제 후보 1개는 찾았지만 현재 점포 사진으로 확인되지 않았다. |
| Mapillary | 조건이 맞으면 거리 사진 후보 | 도움말의 CC BY-SA 설명은 확인했다. 현지 커버리지, 개별 사진 날짜·라이선스 버전, API 및 전체 약관은 미확인이다. 즉시 사용 가능한 공급원으로 채택하지 않았다. |
| Google Maps/Street View 외부 링크 | 이용자가 원래 서비스에서 주변을 확인 | 기존 외부 링크 방식은 유지 가능한 선택지다. 사진을 우리 자산으로 수집한 것은 아니다. |
| Street View 화면 캡처·추출·재호스팅 | 우리 점포 이미지 DB | 공개 정책상 허용 경로로 볼 수 없어 제외한다. 출처 표시만 추가해 해결되는 문제가 아니다. |
| Google 지원 Embed/API | 제품 조건에 맞는 서비스 내 표시 | 파일 소유·보관 권한과 구별한다. 이 디렉터리의 계약·제품·지도 조합에 적용되는 조건을 먼저 해결해야 한다. |

사진의 피사체이거나 사진 파일을 보유한 사람과 저작권자는 다를 수 있다. 사업주 제공 자료도 권한을 확인해야 하는 이유다. [미국 저작권청 사진 안내](https://www.copyright.gov/engage/docs/photography.pdf)

Google Geo Guidelines는 Street View 스크린샷과 임베드 이미지 추출을 금지하고, 지원되는 표시 방식을 안내한다. 일반 지도 이미지의 허용 범위를 Street View로 확장하지 않는다. 저작권 침해 여부, 계약 위반 여부, 예외의 적용은 같은 질문이 아니므로 모든 사용을 일괄적으로 “불법”이라고 판정하지 않는다. [Google Geo Guidelines](https://about.google/brand-resource-center/products-and-services/geo-guidelines/)

Maps Platform 일반약관 3.2.3에는 추출·저장 제한, Google 제품을 재현하지 말라는 조항 아래의 디렉터리 사용 제한, 비Google 지도와 함께 쓰는 제한이 있다. 현재 사이트는 MapLibre/OSM 지도를 사용하므로 관련성이 높다. Places UI Kit에는 비Google 지도 관련 예외도 있어 모든 제품을 하나의 규칙으로 단정할 수 없다. 그 예외가 사진 재호스팅이나 모든 디렉터리 사용까지 허가하는 것은 아니다. 실제 적용 계약과 서비스별 조건을 확인하기 전에는 이 사이트의 Google 이미지 통합을 승인된 것으로 취급하지 않는다. [일반약관 §3.2.3](https://cloud.google.com/maps-platform/terms), [서비스별 약관](https://cloud.google.com/maps-platform/terms/maps-service-terms)

Maps Embed API는 현재 사용량 과금이 없고 API 키가 필요하다. 무료 여부와 허용 용도는 별개다. Street View panorama ID의 저장 예외도 이미지 파일의 영구 보관 허가가 아니다. [Embed 과금 안내](https://developers.google.com/maps/documentation/embed/usage-and-billing), [Street View 정책](https://developers.google.com/maps/documentation/streetview/policies)

실제로 찾은 Commons 후보는 David Hilowitz가 2011-01-07 촬영한 Toy District 사진이며 파일 설명에는 **CC BY 2.0**으로 표시되어 있다. 원본·저작자·라이선스·변경 여부를 표시하고 시각적 적합성을 확인하면 과거 지역 모습을 설명하는 후보가 될 수 있다. 촬영 후 약 15년이 지났으므로 현재 점포 외관이나 영업 증거로 쓰지 않는다. 이번에는 파일 설명만 확인했고 이미지를 내려받거나 시각 검수하지 않았다. [해당 파일](https://commons.wikimedia.org/wiki/File:In_LA%27s_%22Toy_District%22_(2011-01-07_13.49.17_by_David_Hilowitz).jpg), [Commons 재사용 안내](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia), [Mapillary 라이선스 도움말](https://help.mapillary.com/hc/en-us/articles/115001770409-CC-BY-SA-license-for-open-data)

사진마다 `store_id`, 정확한 주소·호수, 원본 URL, 저작자·허락 주체, 라이선스·사용 범위, `captured_at`, `checked_at`, 변경 내역, 동일 점포 판정을 분리한다. 촬영일을 모르면 모른다고 쓴다. 페이지 열람일을 촬영일이나 사업주 확인일로 대체하지 않는다. 외관 사진으로 영업 중·재고·안전·접근성·사업주 신원을 인증하지 않는다.

## 바이어에게 제공할 수 있는 정보

우선순위는 이번 근거로 판단한 실행 순서이며 수요나 전환 효과의 검증 결과가 아니다.

| 우선순위 | 바이어의 결정 | 제공할 정보·분석 | 범위와 유지 조건 |
|---|---|---|---|
| P0 | 기존 안내를 믿고 방문해도 되는가 | 기존 가이드의 출처 없는 수치·일반화 정리 | 출처를 확보하거나 중립 질문으로 전환한다. 공식 사이트의 오래된 공지도 현재 상태로 채택하지 않는다. |
| P1 | 어디에 어떤 방식으로 주문할까 | 업체별 구매 방식, 도매 신청·승인, MOQ·박스 수량, 마감, 배송·픽업, 반품·오배송 조건 | 실제로 문서화된 필드만 게시한다. 미확인은 허용·불가 어느 쪽으로도 추정하지 않는다. |
| P1 | 원하는 품목을 찾을 후보가 있는가 | 공식 카탈로그의 품목·브랜드별 링크 | 온라인 분류의 존재와 매장 재고·도매 가능·공인 대리점 자격은 별개다. 상품 이미지·설명을 복제하지 않는다. |
| P1 | 가기 전에 무엇을 확인해야 하는가 | 업체별 미확인 항목을 EN/ES 질문과 방문 워크시트로 변환 | 결제·예약·수량·서류 조건을 중립적으로 묻는다. 자동 문의 발송은 하지 않는다. |
| P1 | 준비한 차량과 서류로 구매할 수 있는가 | LADOT 운반·주차 안내, CDTFA 재판매 서류 안내 | 지역 공통 규칙과 특정 점포의 시설·승인 정책을 구분한다. 현장 표지·가격·업체 답변을 대신하지 않는다. |
| P2 | 정확한 입구를 찾을 수 있는가 | 권리가 확인된 외관 사진, 주소·호수, 촬영일, 공식 사진 링크 | 현재 점포와 대응되는 이미지가 필요하다. 전체 업체의 사진 커버리지는 아직 측정하지 않았다. |
| P2 | 여러 후보를 어떻게 방문·비교할까 | 후보 목록과 인쇄용 견적·방문 워크시트 | 다른 품목 업체를 한 가격순위로 비교하지 않는다. 동선 계산은 독립 출처 좌표와 보행 경로가 확보된 뒤 진행한다. |
| 후보 | 재판매할 제품의 리콜을 어디서 확인할까 | CPSC 공식 검색·바이어 안내 링크, 이후 제품 식별정보 기반 조회 검토 | 정확한 브랜드·모델·해당 로트 등 원문 대조가 필요하다. 검색 결과 없음은 안전·정품·법규 준수 인증이 아니다. |

### 실제 확보한 근거와 게시 보류 사례

**California Balloon House의 반품·오배송 조건은 새로 찾았다.** 공식 정책은 일반 판매에 대한 환불·교환·반품을 받지 않는다고 설명하고, 오배송은 배송 후 **“48 business hours”** 안에 연락하면 교체와 반송 라벨을 제공한다고 안내한다. 이 문구를 달력 기준 2일로 변환하지 않는다. 이는 업체가 게시한 정책의 요약이며 소비자의 법적 권리나 정책의 집행 가능성에 대한 판단은 아니다. [공식 반품 정책](https://caballoonhouse.com/policies/refund-policy)

해당 업체의 헬륨 주문 방법·서비스 마감·대량 주문 사전 예약은 10월 14일 이미 확보·배포했다. 새 반품 조건을 기존 안내와 묶으면 주문 전후에 필요한 정보가 이어진다. 예를 들어 행사 주문자는 수량과 행사 날짜를 정한 뒤 예약 시점, 수령 방식, 오배송 신고 기한을 함께 확인할 수 있다. 구매 성공이나 일정 준수를 보장하는 것은 아니다. [기존 검토 데이터](../../pipeline/data/reviewed-stores.json)

동일 업체 홈페이지에는 2026년 3월 배송 중단·재개 공지가 10월 열람 시에도 보였다. 지금 읽을 수 있다는 사실은 지금도 배송이 중단됐다는 근거가 아니다. [홈페이지](https://caballoonhouse.com/)

**Tom’s Model의 반품 조건은 보류했다.** 상품 페이지의 30일 반품·세계 배송 안내 주변에 Lorem ipsum와 일반 템플릿 안내가 있어 업체 전체의 확정 정책으로 채택하기 어렵다. 그 문구가 거짓이라고 판정한 것은 아니다. 반면 공식 메뉴의 Funko Pops·LEGO·Bandai 등은 카탈로그 탐색 링크를 만들 근거가 된다. [상품 페이지](https://toms-model.myshopify.com/products/pop-disney-vinyl-mulan-golden-mushu-cricket-toms-model-exclusive?variant=32244642250815), [공식 카탈로그](https://toms-model.myshopify.com/)

기존 공식 업체 4곳의 카드는 아래처럼 구성할 수 있다. 표의 기존 정보는 10월 14일 검토 결과이고, 10월 15일 새로 찾은 내용만 별도로 표시했다.

| 업체 | 문서화된 내용 | 바이어에게 남길 확인 질문 |
|---|---|---|
| American Silk | 온라인 소매·도매 신청 경로. 도매 신청의 $3,000 조건과 소개 페이지의 소량 도매 문구는 적용 범위가 불명확하다. 공식 페이지의 폐점 시간도 다르다. | 내 구매 방식에 어떤 최소 조건이 적용되는가? 방문일의 실제 폐점 시각은? |
| California Balloon House | 도·소매 방문·온라인 구매, 도매 계정 승인, 헬륨 주문·마감·배송 안내. **반품·오배송 조건은 이번 신규 후보.** | 주문 수량·날짜에 서비스 가능한가? 실제 픽업·주문 조건은? |
| Casa Manga | 도매 계정 신청 경로, 로그인 후 도매 가격, 스페인어 서비스 안내 | 승인 전 방문 구매가 가능한가? 내 품목·수량에 적용되는 단가·최소 수량은? |
| Tom’s Model | 소비자 온라인 판매와 소매업자 판매 안내. **카탈로그 분류 링크는 이번 추가 활용 후보.** | 필요한 제품·수량의 매장 재고와 도매 조건은? 확인된 반품 정책은? |

위 표의 근거와 범위는 [업체별 기존 검토 데이터](../../pipeline/data/reviewed-stores.json)에 있다. Casa Manga의 공개 소매 무료배송 기준을 도매 MOQ로 쓰거나 소매 가격으로 재판매 마진을 계산하지 않는다. [Casa Manga 공식 사이트](https://www.casamanga.com/)

LADOT의 색상별 연석 안내는 상업용 번호판 차량의 화물 하역과 일반 차량의 승객·수하물 하차를 구별한다. 이를 바이어 차량·운반 계획의 공통 안내로 정리할 수 있지만, 특정 점포에 합법적인 하역 공간이 있다고 추정하지 않는다. 미터 요금은 구역·시간 등에 따라 달라지므로 지역 전체의 고정 가격으로 안내하지 않는다. [LADOT 연석 안내](https://ladot.lacity.gov/residents/colored-curb-zones), [미터 FAQ](https://ladotparking.org/parking-meters/faq/)

CDTFA는 seller’s permit 사본이 resale certificate를 대신하지 않는다고 안내한다. 도매 계정 승인, 도매 가격 자격, 세무 서류를 서로 구분해 설명할 수 있다. 업체의 신청 양식에 적힌 요구와 세법상 충분 조건도 구별한다. [CDTFA 공식 안내](https://cdtfa.ca.gov/industry/new-permit-and-license-holders/managing-your-sales.htm)

CPSC는 공개 리콜 정보를 XML/JSON API로 제공하고 재판매자 안내도 운영한다. 이 항목은 Claude 2차 검토 이후 Codex가 추가 확인한 후보이며 공동 검토 완료 항목으로 세지 않는다. 초기에는 공식 검색·가이드 링크면 충분하다. 자동 조회는 실제 제품 식별 데이터와 갱신·매칭 검증이 확보된 뒤 검토한다. 현재 어느 점포의 제품도 리콜과 대조하지 않았다. [CPSC API](https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information), [판매자 안내](https://www.cpsc.gov/Business--Manufacturing/Online-Sellers-Safety-Guide)

### 바로 검토할 수 있는 EN/ES 초안

California Balloon House의 새 정책 후보:

- EN: The published policy states that sales are final, with no general returns, refunds or exchanges. For an incorrect delivered item, contact the business within its stated “48 business hours” for replacement and a return label. See the full policy for product-specific terms.
- ES: La política publicada indica que las ventas son finales y que, en general, no se aceptan devoluciones, reembolsos ni cambios. Si recibe un artículo incorrecto, contacte al negocio dentro del plazo que describe como “48 business hours” para solicitar el reemplazo y una etiqueta de devolución. Consulte las condiciones específicas en la política completa.

공식 페이지 열람일은 2026-10-15, 게시 상태는 **초안**이다. 업체 문구의 모호함을 번역으로 확정하지 않도록 시간 표현을 보존했다.

| 확인할 항목 | English | Español |
|---|---|---|
| 구매 방식 | Can I buy in person, and do I need an appointment or an approved account? | ¿Puedo comprar en persona? ¿Necesito cita o una cuenta aprobada? |
| 수량·단가 | What minimum quantity or order amount applies to these items? How many units are in a case? | ¿Qué cantidad o importe mínimo se aplica a estos artículos? ¿Cuántas unidades contiene una caja? |
| 결제·서류 | Which payment methods and documents do you require for this purchase? | ¿Qué métodos de pago y documentos requiere esta compra? |
| 수령·보관 | When can I collect the order? Can you hold it until that time? | ¿Cuándo puedo recoger el pedido? ¿Pueden guardarlo hasta entonces? |
| 문제 처리 | What are the return terms and the deadline for reporting incorrect or damaged items? | ¿Cuáles son las condiciones de devolución y el plazo para reportar artículos incorrectos o dañados? |
| 재주문 | How can I reorder the same item, and how should I confirm availability? | ¿Cómo puedo volver a pedir el mismo artículo y confirmar su disponibilidad? |

워크시트의 최소 열은 업체·품목/SKU·수량·박스당 수량·견적 단가·최소 주문·견적 유효일·수령 일정·반품 조건·추가 질문이다. 사용자가 받은 견적을 직접 적고, 필요할 때 상품대금·해당 세금·운송·주차비를 합산하도록 할 수 있다. 임의의 도매 가격이나 수익률을 채우지 않는다. 이 초안은 메시지 발송이나 제품 구현을 수행한 결과가 아니다.

## 기존 가이드에서 먼저 검토할 주장

[guides.ts](../../web/lib/content/guides.ts)의 영문·스페인어 안내에는 다음과 같은 근거 재검토 대상이 있다. 거짓이라고 확정한 목록이 아니라, 현재 검토한 자료로 뒷받침되지 않거나 최신성 재확인이 필요한 주장이다.

| 기존 주장 유형 | 처리 제안 |
|---|---|
| 약 90%가 도매, 현금 선호, 현금이면 유리한 견적 | 수치·일반화를 뒷받침할 출처가 없으면 삭제하고 업체별 구매·결제 질문으로 전환 |
| 상인들이 보통 물건을 보관해 주지 않음 | 업체별 보관·픽업 질문으로 전환 |
| 미터 약 $3/시간, 주차 $11–22/일, 예약이 거의 항상 저렴 | 가격·날짜·시설을 검증하거나 현재 공식 요금 확인 경로로 전환 |
| 평일 오전이면 직원 여유·재고 확보가 쉬움 | 지역 전체에 대한 운영·재고 추정을 제거 |
| Metro 역의 특정 주소와 고정 도보 시간 | 현재 공식 출입구·경로로 재검증. 이번에는 대체 주소·시간을 확정하지 않음 |
| 일정 수량부터 할인이 일반적, 특정 블록에 cash-and-carry 밀집 | 실제 업체 근거를 확보하지 못하면 보편적인 사실로 게시하지 않음 |

OSM으로 동선을 계산하는 후속 기능도 데이터 라이선스, 좌표의 출처와 정확도, 실제 보행 네트워크가 필요하다. 직선 거리만으로 도보 시간·안전·무장애 경로를 보증하지 않는다. [OSM 저작권 안내](https://www.openstreetmap.org/copyright)

## Claude와의 실제 토론 및 최종 판정

설치된 Claude CLI를 도구 사용 없이 두 번 실행했다. 두 결과 모두 성공했고 응답 메타데이터는 `claude-opus-5-5`를 표시한다. 1차는 접근법에 대한 반박, 2차는 원문 근거·신규 사례·오류 교정을 주고 재검토했다. Claude가 원문 사이트를 독립적으로 탐색한 것은 아니다.

| 쟁점 | 토론 후 판정 |
|---|---|
| 사진과 구매 정보 중 무엇이 우선인가 | 입구 식별과 구매 준비는 서로 다른 과제다. 어느 쪽의 사용자 효과가 더 큰지 근거가 없으므로 우월성을 주장하지 않는다. |
| 사진으로 실제 영업을 확인할 수 있는가 | Claude의 초기 표현을 정정했다. 촬영 당시 외관의 기록이지 현재 영업 확인은 아니다. |
| Google 사진은 전부 Google 소유이고 모든 사용이 불법인가 | 제3자 권리와 지원 표시 경로를 반영해 정정했다. 정책·약관·법적 판단을 구분한다. |
| 구매 체크리스트 수요를 GSC 검색어 비중으로 판정할 수 있는가 | 현재 접근 불가이고 기존 콘텐츠·검색어 비공개에 따른 편향도 있어 제안했던 5% 기준을 폐기했다. |
| 범용 업체 비교 엔진이 필요한가 | 현재는 공통 형식의 근거 카드와 방문·견적 워크시트가 적절하다. 다른 품목 공급처를 후보 목록으로 묶는 것은 가능하다. |
| 질문 자체가 미검증 주장을 반복할 수 있는가 | 수용했다. 현금 선호나 보관 불가를 전제로 묻지 않고 중립 질문으로 작성한다. |
| 페이지 미접속은 conflict, 검색 실패는 absent인가 | 그대로 채택하지 않았다. `unavailable`, `not_found_in_review`, 실제 `conflict`를 구별한다. 검토에서 못 찾았다는 이유로 서비스가 없다고 표시하지 않는다. |
| 이번 후보를 즉시 게시할 것인가 | Claude의 “게시” 권고는 콘텐츠 적합성 의견으로만 받아들였다. 현재 요청은 검토이므로 초안으로 보존했다. |
| 관찰 기간 중 변경해도 되는가 | 향후 배포 시 날짜·페이지를 기록한다. 기존 28일 관찰 창은 10/15–11/11이고 최종 판단일은 12/1이다. 무작위 실험이 아니므로 전후 차이를 인과효과로 해석하지 않는다. |

검토 원문: [1차](../../artifacts/buyer-information-review-20261015/claude-round1.txt), [2차](../../artifacts/buyer-information-review-20261015/claude-round2.txt), [반영 판정](../../artifacts/buyer-information-review-20261015/claude-disposition.json), [출처 기록](../../artifacts/buyer-information-review-20261015/evidence.json).

## 다음 실행 범위 제안

추가 작업을 진행한다면 아래 **3시간 상한의 제한된 데스크 점검**을 권한다. 이번 검토에서 이미 수행했다는 뜻이 아니다.

1. 45분: 기존 가이드 주장에 유지·질문 전환·삭제 판정을 붙이고 EN/ES 대응을 정리한다.
2. 75분: 기존 공식 업체 4곳의 근거를 재사용해 공통 카드와 미확인 질문을 작성한다. 새 탐색은 policy·FAQ·shipping·contact·about 등 지정 페이지에 제한한다. 새 반품 조건과 카탈로그 링크의 적용 범위를 검토한다.
3. 60분: 사전에 고정한 정확한 주소 4곳을 대상으로 공식 갤러리와 Commons의 사진 확보 가능성만 점검한다. 다운로드 허가·저작자·점포 일치·촬영일을 구별해 기록하고, 권리가 해결되지 않으면 링크 후보로 남긴다.

사실 수, 권리·점포·날짜가 확인된 사진 수, 유지·조사 시간은 따로 집계한다. 사진 권리가 있어도 오래되면 현재 입구 식별용으로 부적절할 수 있다. 표본 4곳의 결과를 191곳 전체의 확보율로 추정하지 않는다.

별도로 실제 바이어 3–5명에게 구매 카드·입구 사진 후보·워크시트를 주고 “방문 전에 무엇이 부족한가”를 묻는 정성 검토가 우선순위를 개선할 수 있다. 이번에는 참가자를 모집하거나 연락하지 않았다. 적은 표본으로 전환 효과나 시장 성공을 판정하지 않는다.

전체 업체 사진 수집, Street View OCR, 실시간 재고·협상 가격·수익률 추정, 영업·안전·접근성 인증은 이번 근거로 진행할 범위가 아니다. Google을 DB 입력원으로 쓰지 않는 기존 프로젝트 규칙도 유지한다.
