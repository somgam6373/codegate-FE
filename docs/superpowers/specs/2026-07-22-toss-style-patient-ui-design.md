# 환자 앱 토스 스타일 UI 리디자인 설계

## 배경

환자용 앱(홈·예약·기록·AI리포트·프로필·로그인)의 UI가 "AI가 짜 넣은 티가 난다"는 반복적인 피드백을 받아왔음. 과거 두 차례 홈 화면 리디자인 시도가 모두 롤백됨:

1. 그림자 + hover/active 트랜지션만 추가 → "단조롭고 심심하다, 너무 미니멀하다"
2. 아이콘 칩(원형 배경) + 카드 우상단 배어나오는 장식 아이콘 + featured 그라데이션 카드 + grain 텍스처 → "이것도 AI 티 난다" → 즉시 1차 상태로 롤백

이번엔 구체적인 레퍼런스로 **토스(Toss) 앱 스타일**이 지정됨. 토스는 그림자/장식보다 **압도적인 여백, 역할이 분명한 큰 타이포, 단일 포인트 컬러, 일관된 카드 시스템**으로 위계를 만드는 스타일 — 과거 거부된 "장식 추가" 방향과는 다른 축이라 이번 시도의 근거가 됨.

코드베이스를 훑어보면 카드 스타일 문자열이 8곳 이상에서 사실상 동일하게 복붙되어 있음 (예: `rounded-[22px] border border-black/[0.04] bg-white p-4.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]` — `HomePage`, `ReservationDetailPage`, `ProfilePage`, `AiReportPage`, `SelectHospital`, `SearchResult`, `ReservationSearchList`, `VideoList`, `TextList` 등). 버튼(`bg-primary ... active:scale-[0.98]`)도 마찬가지. 이 중복을 공용 컴포넌트로 모으는 것이 이번 리디자인의 실행 축.

## 범위

- **환자 앱 전체**: `src/pages/patient/*`, `src/components/patient/*` (병원 관리자 웹 `src/pages/hospital/*`, 병원 로그인 `src/pages/auth/*`은 범위 밖)
- 시각적 스타일 통일(토큰 + 공용 컴포넌트 적용)과 그에 따른 리팩터링만 다룸. 새로운 기능/API 연동은 포함하지 않음.
- `ProfilePage.tsx`의 `fetch`/`alert` 직접 호출은 다른 페이지들이 이미 쓰는 `api client`/`useToast` 패턴으로 맞추는 것까지만 포함 (이미 존재하는 패턴 재사용이라 범위 내). 그 외 로직 변경 없음.

## 확정된 방향

- **포인트 컬러**: 기존 초록(`--color-primary` 계열) 유지, 변경 없음.
- **그림자**: 완전히 없애는 flat 방향이 아니라, 기존 약한 그림자 톤(`shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]` 계열)을 카드 전반에 **일관되게** 유지. 대신 위계는 그림자가 아니라 타이포 크기/굵기와 섹션 간 여백으로 만듦.
- **폰트**: `Pretendard` 추가 (기존 디자인 레퍼런스 목업에도 지정되어 있던 폰트). 시스템 폰트는 fallback으로 유지.
- **상태 배지**(`STATUS_STYLE` 류의 색깔 텍스트/배지)는 장식이 아니라 기능이므로 유지. 토스도 상태 표시에 색 텍스트/배지를 실제로 씀.

## 아키텍처

### 신규 파일

- **`src/index.css`** 수정 (신규 아님, 토큰만 추가): `@fontsource/pretendard` import, `--font-sans`를 `'Pretendard', system-ui, ...`로 교체.
- **`package.json`**: `@fontsource/pretendard` 의존성 추가.
- **`src/components/patient/ui/Card.tsx`**
  - `<Card>`: 흰 배경, `rounded-[22px]`, 고정 패딩(`p-5`)과 통일된 그림자. `padding` prop으로 필요시 축소(`sm`) 가능.
  - `<Card as="button">`: 클릭 가능한 카드 (지금 각 파일이 `<button>`/`<div>`를 따로 만드는 것 통합). `onClick`, `className`(추가 스타일용) prop 지원.
- **`src/components/patient/ui/Button.tsx`**
  - `<PrimaryButton>`: `bg-primary` 채움 버튼, `active:scale-[0.98]`, `disabled` 상태 포함.
  - `<GhostButton>`: 테두리/연한 배경 보조 버튼 (지금 `bg-primary-bg text-primary-text` 류).
- **`src/components/patient/ui/ListRow.tsx`**
  - 제목 + 보조 텍스트(+ 상태 배지 slot) + 우측 화살표(`›`)로 구성된 리스트 행. `onClick` 있으면 버튼으로 렌더.
- **`src/components/patient/ui/SectionTitle.tsx`**
  - "다가오는 예약", "최근 건강 분석" 같은 섹션 라벨용 소제목 (`text-[15px] font-extrabold text-ink`, 표준 margin).

### 수정 파일 (스타일 교체 + 위 컴포넌트로 치환)

**홈**
- `src/pages/patient/HomePage.tsx` — 헤더 타이포 확대, 섹션 간격 24px로 통일
- `src/components/patient/home/IncomingReservation.tsx`
- `src/components/patient/home/HomeButton1.tsx`, `HomeButton2.tsx` — `Card as="button"` + 아이콘 칩 유지(기존에 이미 있던 것, 새로 추가하는 장식 아님)
- `src/components/patient/home/SummarizeAI.tsx`

**예약**
- `src/pages/patient/ReservationPage.tsx`
- `src/components/patient/reservation/makeReservation/SelectHospital.tsx`
- `src/components/patient/reservation/makeReservation/SearchResult.tsx` — `HospitalCard`를 `Card`+`ListRow` 조합으로
- `src/components/patient/reservation/viewReservation/ReservationSearchList.tsx` — `ListRow`로 교체
- `src/pages/patient/ReservationDetailPage.tsx`

**기록**
- `src/pages/patient/RecordPage.tsx`
- `src/components/patient/record/video/VideoUpload.tsx`, `VideoList.tsx` — 리스트 행을 `ListRow`로
- `src/components/patient/record/text/textUpload.tsx`, `textList.tsx` — 리스트 행을 `ListRow`로
- `src/components/patient/record/RecordMediaSheet.tsx` — 버튼/타이포만 교체, `Placeholder`(파일 미리보기 실패 시 대체 화면)는 기능이므로 유지

**AI 리포트 / 프로필 / 로그인 흐름**
- `src/pages/patient/AiReportPage.tsx`
- `src/pages/patient/ProfilePage.tsx` — 카드/버튼 교체 + `fetch`/`alert`를 기존 API client/`useToast` 패턴으로 정리
- `src/pages/patient/LoginPage.tsx`
- `src/pages/patient/RegisterPage.tsx`
- `src/pages/patient/InformationPage.tsx`

**공통**
- `src/components/patient/public/NavBar.tsx` — 폰트만 영향받음, 구조 변경 없음
- `src/components/patient/public/BottomSheet.tsx` — 폰트/타이포만

## 타이포 스케일 (일관 적용)

| 역할 | 스타일 |
|---|---|
| 화면 타이틀 | 22px / extrabold |
| 히어로 숫자·핵심 값 | 26~30px / extrabold |
| 카드 제목 | 15~16px / bold |
| 본문/보조 텍스트 | 13~14px / `text-ink-soft` 또는 `text-ink-muted` |

간격: 카드 내부 패딩 20px(`p-5`) 고정, 섹션 간 간격 24px(`mt-6`)로 통일.

## 카피 톤

문어체("~합니다", "~됩니다")를 구어체("~해요", "~보세요")로 다듬음. 이미 대부분 이 톤을 쓰고 있어 변경 범위는 작음 — `ProfilePage.tsx`의 `alert()` 메시지, `RecordMediaSheet.tsx` 일부 문구 등 남은 문어체만 대상.

## 테스트

시각적 리팩터링이라 자동 테스트 대상은 아님. 각 페이지 교체 후 `npx tsc --noEmit`으로 타입 확인, 개발 서버로 홈·예약(하기/조회)·기록(영상/사진)·AI리포트·프로필·로그인 화면을 직접 확인.
