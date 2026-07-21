# 카카오 로그인 API 연동 설계

## 배경

백엔드에 일반 사용자(patient)용 카카오 OAuth API가 이미 구현되어 있음:

- `GET /api/v1/auth/kakao/login-url?redirectUri=...&state=...` — 카카오 로그인 URL 발급
- `POST /api/v1/auth/patients/kakao/signup` — 인가 코드 + 개인정보로 회원가입, JWT 발급
- `POST /api/v1/auth/patients/kakao/login` — 인가 코드로 로그인, JWT 발급. 미가입 시 `{success:false, error:{code:"PATIENT_SIGNUP_REQUIRED"}}` 반환

모든 응답은 `{success, data, error}` 형태로 래핑됨.

현재 프론트엔드(`src/pages/patient/HospitalLoginPage.tsx`, `RegisterPage.tsx`, `InformationPage.tsx`)는 이 API들과 연동되어 있지 않고, "카카오로 시작하기" 버튼은 그냥 `/register`로 이동만 하는 목업 상태. 인증 상태 관리(`src/context`), 토스트 등 공용 UI(`src/components`)도 아직 없음.

## 범위

- 일반 사용자(patient) 카카오 로그인/회원가입 연동만 다룸. 병원(hospital) 로그인은 범위 밖.
- 건강정보(`InformationPage`)는 대응하는 백엔드 API가 없으므로 기존처럼 로컬 상태만 유지, 이번 작업에서 건드리지 않음.

## 아키텍처

### 신규 파일

- **`src/services/kakaoAuth.ts`**
  - `getKakaoLoginUrl(redirectUri: string, state?: string): Promise<string>`
  - `kakaoLogin(code: string, redirectUri: string): Promise<LoginResult>`
  - `kakaoSignup(payload: SignupPayload): Promise<LoginResult>`
  - `src/api/client.ts`의 `api()`를 사용하되, `{success, data, error}` 응답을 unwrap하는 헬퍼를 이 파일에 둠. `success: false`면 `ApiError(code, message)`를 throw.
- **`src/context/AuthContext.tsx`**
  - `{ token, role, userId, login(result), logout() }` 제공
  - `login()` 호출 시 `localStorage`에 저장, 앱 로드시 `localStorage`에서 복원
- **`src/routes/ProtectedRoute.tsx`**
  - `AuthContext`에 토큰이 없으면 `/login`으로 리다이렉트
  - 적용 라우트: `/home`, `/reservation`, `/record`, `/record/analysis/:id`, `/profile`
- **`src/pages/patient/KakaoCallbackPage.tsx`** (라우트: `/oauth/kakao/callback`)
  - 쿼리스트링의 `code`로 `kakaoLogin` 호출, 결과에 따라 분기 (아래 데이터 흐름 참고)
- **`src/components/common/Toast.tsx`**
  - 화면 하단 토스트 UI. `error` / `success` 타입, 3초 후 자동 소멸
- **`src/context/ToastContext.tsx`**
  - `useToast()` 훅으로 `showToast(message: string, type: 'error' | 'success')` 노출
  - 한 번에 하나만 표시 (큐 불필요)

### 수정 파일

- **`src/main.tsx`**: `AuthProvider`, `ToastProvider`로 `<App />` 감싸기
- **`src/App.tsx`**: `/oauth/kakao/callback` 라우트 추가, 인증 필요 라우트를 `ProtectedRoute`로 감싸기
- **`src/pages/patient/HospitalLoginPage.tsx`**: "카카오로 시작하기" 클릭 시 `getKakaoLoginUrl(`${origin}/oauth/kakao/callback`)` 호출 후 `location.href = loginUrl`로 리다이렉트. 실패 시 토스트.
- **`src/pages/patient/RegisterPage.tsx`**:
  - 주민등록번호 입력 필드 추가 (기존 이름/성별/생년월일/지역 폼에 하나 추가)
  - `location.state`에 `code`/`redirectUri`가 없으면 `/login`으로 리다이렉트 (직접 접근 방지)
  - "다음" 클릭 시 `kakaoSignup({code, redirectUri, name, gender, birthDate, residentRegistrationNumber})` 호출 → 성공 시 `auth.login(result)` 후 `/register/health`로 이동, 실패 시 토스트

## 데이터 흐름

1. `LoginPage` → `GET login-url?redirectUri={origin}/oauth/kakao/callback` → 받은 `loginUrl`로 리다이렉트
2. 카카오 인증 후 `/oauth/kakao/callback?code=...`로 리다이렉트됨
3. `KakaoCallbackPage` → `POST patients/kakao/login {code, redirectUri}`
   - 성공 → `auth.login(result)` → `/home`으로 이동
   - `error.code === 'PATIENT_SIGNUP_REQUIRED'` → `/register`로 이동, `{code, redirectUri}`를 `navigate`의 `state`로 전달
   - 그 외 에러 → 토스트로 에러 메시지 표시 후 `/login`으로 이동
4. `RegisterPage` "다음" → `POST patients/kakao/signup {code, redirectUri, name, gender, birthDate, residentRegistrationNumber}`
   - 성공 → `auth.login(result)` → `/register/health`
   - 실패 → 토스트로 에러 표시, 페이지 유지
5. `InformationPage` "완료" → 기존 그대로 `/home` (API 연동 없음, 변경 없음)

## 보안

- 주민등록번호는 HTTPS 전송 구간 암호화에 의존 (배포 환경이 HTTPS라는 전제). 클라이언트 측 추가 암호화는 하지 않음 — 백엔드 API가 평문 필드를 받아 저장 시 자체 암호화하는 구조이므로, 클라이언트에서 암호화하면 백엔드가 복호화할 방법이 없어 API 계약과 맞지 않음.
- JWT는 `localStorage`에 저장 (XSS 방어는 이번 스코프 밖, 기존 프로젝트에 CSP 등 별도 대책 없음 — 필요 시 별도 논의).

## 에러 처리

- API 응답의 `error.code`/`error.message`를 `ApiError`로 throw, 호출부에서 `catch`하여 `showToast(error.message, 'error')`
- `RegisterPage` 직접 접근(카카오 인가 코드 없이)은 `/login`으로 리다이렉트하여 방지

## 테스트

- 프로젝트에 테스트 러너(vitest/jest 등)가 설치되어 있지 않음. 이 작업만을 위해 테스트 프레임워크를 새로 추가하지 않음.
- `kakaoAuth.ts`의 unwrap 로직은 분기 2개(성공/실패)뿐인 단순 함수로 유지해 리뷰로 충분히 검증 가능하게 함.
