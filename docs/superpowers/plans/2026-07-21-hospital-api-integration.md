# 병원 API 4종 연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 병원 회원가입/로그인/내 병원 정보 조회·수정 API 4개(`POST /api/v1/auth/hospitals/signup`, `POST /api/v1/auth/hospitals/login`, `GET /api/v1/hospital/me`, `PUT /api/v1/hospital/me`)를 기존 프론트엔드와 호환되게 연동한다.

**Architecture:** patient 쪽에서 이미 검증된 `AuthContext` + `{success,data,error}` unwrap 패턴을 그대로 재사용해 병원용 서비스 레이어(`hospitalAuth.ts`, `hospital.ts`)를 만들고, 현재 라우터에 전혀 연결되어 있지 않던 병원 페이지들을 `App.tsx`에 새로 연결한다. 병원 로그인 페이지는 기존 가짜 카카오 버튼을 실제 loginId/password 폼으로 교체하고, 없던 회원가입 페이지를 신설한다.

**Tech Stack:** React 19, react-router-dom 7, TypeScript, Vite. 테스트 러너 없음(프로젝트에 vitest/jest 미설치) — 검증은 `npx tsc --noEmit`(타입 체크)과 `npm run dev`를 통한 수동 브라우저 확인으로 대체한다.

## Global Constraints

- 기존 코드는 동작을 바꾸지 않는다. 이번 작업에 필요한 최소 파일만 수정한다 (patient 쪽 파일은 절대 건드리지 않음).
- `src/pages/auth/authStore.ts`, `src/pages/auth/ProtectedRoute.tsx`는 삭제하지 않고 그대로 둔다(사용자 확인 완료, 더 이상 참조되지 않게 됨).
- 모든 API 응답은 `{success, data, error}` 래핑 형식 (`src/api/client.ts`의 `api()`가 그대로 파싱해서 반환).
- JWT는 `AuthContext`를 통해 `localStorage`에 저장 (patient와 동일 정책, 새 저장 방식 도입 금지).
- CSS는 기존 클래스를 수정하지 않고 `auth.css`에 새 클래스만 추가한다.

---

### Task 1: 공용 응답 unwrap 헬퍼

**Files:**
- Create: `src/api/response.ts`

**Interfaces:**
- Consumes: `src/api/client.ts`의 `api<T>()` (기존, 변경 없음)
- Produces: `ApiError` 클래스(`code: string`, `message: string`, `details?: Record<string, unknown>`), `ApiResponse<T>` 타입, `unwrap<T>(res: Promise<ApiResponse<T>>): Promise<T>` — Task 2, 3에서 사용

- [ ] **Step 1: 파일 작성**

```ts
// src/api/response.ts
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string; details?: Record<string, unknown> } | null
}

export class ApiError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.details = details
  }
}

export async function unwrap<T>(res: Promise<ApiResponse<T>>): Promise<T> {
  const body = await res
  if (!body.success || body.data === null) {
    throw new ApiError(
      body.error?.code ?? 'API_ERROR',
      body.error?.message ?? '요청 처리에 실패했습니다.',
      body.error?.details,
    )
  }
  return body.data
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (기존 에러가 있었다면 그 개수에서 늘어나지 않아야 함)

- [ ] **Step 3: Commit**

```bash
git add src/api/response.ts
git commit -m "feat: add shared api response unwrap helper"
```

---

### Task 2: 병원 인증 서비스 (signup/login)

**Files:**
- Create: `src/services/hospitalAuth.ts`

**Interfaces:**
- Consumes: `api()` (`src/api/client.ts`), `unwrap`/`ApiError` (`src/api/response.ts`, Task 1), `LoginResult` 타입(`src/services/kakaoAuth.ts`, 기존 — `{ accessToken: string; tokenType: string; role: string; userId: number }`)
- Produces: `hospitalSignup(payload: HospitalSignupPayload): Promise<LoginResult>`, `hospitalLogin(payload: HospitalLoginPayload): Promise<LoginResult>` — Task 6, 8에서 사용

- [ ] **Step 1: 파일 작성**

```ts
// src/services/hospitalAuth.ts
import { api } from '../api/client'
import { unwrap } from '../api/response'
import type { LoginResult } from './kakaoAuth'

export type { LoginResult }

export interface HospitalSignupPayload {
  loginId: string
  password: string
  hospitalName: string
  hospitalLocation: string
  availableTime: string
  medicalSubjects: string
}

export interface HospitalLoginPayload {
  loginId: string
  password: string
}

export function hospitalSignup(payload: HospitalSignupPayload): Promise<LoginResult> {
  return unwrap<LoginResult>(
    api('/api/v1/auth/hospitals/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )
}

export function hospitalLogin(payload: HospitalLoginPayload): Promise<LoginResult> {
  return unwrap<LoginResult>(
    api('/api/v1/auth/hospitals/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/services/hospitalAuth.ts
git commit -m "feat: add hospital signup/login API service"
```

---

### Task 3: 병원 정보 서비스 (GET/PUT /hospital/me)

**Files:**
- Create: `src/services/hospital.ts`

**Interfaces:**
- Consumes: `api()` (`src/api/client.ts`), `unwrap` (`src/api/response.ts`, Task 1)
- Produces: `HospitalInfo` 타입(`{ hospitalId: number; hospitalName: string; hospitalLocation: string; availableTime: string; medicalSubjects: string }`), `HospitalUpdatePayload` 타입(`Omit<HospitalInfo, 'hospitalId'>`), `getMyHospital(token: string): Promise<HospitalInfo>`, `updateMyHospital(token: string, payload: HospitalUpdatePayload): Promise<HospitalInfo>` — Task 11에서 사용

- [ ] **Step 1: 파일 작성**

```ts
// src/services/hospital.ts
import { api } from '../api/client'
import { unwrap } from '../api/response'

export interface HospitalInfo {
  hospitalId: number
  hospitalName: string
  hospitalLocation: string
  availableTime: string
  medicalSubjects: string
}

export type HospitalUpdatePayload = Omit<HospitalInfo, 'hospitalId'>

export function getMyHospital(token: string): Promise<HospitalInfo> {
  return unwrap<HospitalInfo>(
    api('/api/v1/hospital/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  )
}

export function updateMyHospital(token: string, payload: HospitalUpdatePayload): Promise<HospitalInfo> {
  return unwrap<HospitalInfo>(
    api('/api/v1/hospital/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  )
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/services/hospital.ts
git commit -m "feat: add hospital info GET/PUT API service"
```

---

### Task 4: 병원 전용 ProtectedRoute

**Files:**
- Create: `src/pages/hospital/HospitalProtectedRoute.tsx`

**Interfaces:**
- Consumes: `useAuth()` (`src/context/AuthContext.tsx`, 기존 — `{ token: string | null; role: string | null }`)
- Produces: `HospitalProtectedRoute` 컴포넌트(default export, props 없음) — Task 9에서 라우트 가드로 사용

- [ ] **Step 1: 파일 작성**

```tsx
// src/pages/hospital/HospitalProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function HospitalProtectedRoute() {
  const { token, role } = useAuth()
  if (!token || role !== 'HOSPITAL') {
    return <Navigate to="/hospital/login" replace />
  }
  return <Outlet />
}

export default HospitalProtectedRoute
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/pages/hospital/HospitalProtectedRoute.tsx
git commit -m "feat: add hospital-only protected route guard"
```

---

### Task 5: 인증 폼 공용 CSS 추가

**Files:**
- Modify: `src/pages/auth/auth.css` (파일 끝에 추가, 기존 규칙은 변경하지 않음)

**Interfaces:**
- Produces: `.auth-form`, `.auth-field-label`, `.auth-field-input`, `.auth-submit-btn`, `.auth-error`, `.auth-link-row`, `.auth-link`, `.auth-choice-btn`, `.auth-choice-btn.primary` 클래스 — Task 6, 7, 8에서 사용

- [ ] **Step 1: 파일 끝에 추가**

```css
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  margin-top: 8px;
}

.auth-field-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #14231d;
  margin-bottom: 6px;
}

.auth-field-input {
  width: 100%;
  background: #f0f5f2;
  border: 1px solid rgba(20, 35, 29, 0.1);
  border-radius: 11px;
  padding: 12px 14px;
  font-size: 15px;
  font-family: inherit;
  color: #14231d;
  box-sizing: border-box;
}

.auth-field-input:focus {
  outline: 2px solid #0c6b50;
  outline-offset: 1px;
}

.auth-submit-btn {
  width: 100%;
  background: #0c6b50;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  padding: 14px 0;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  margin-top: 4px;
}

.auth-submit-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.auth-error {
  color: #c0392b;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
}

.auth-link-row {
  margin-top: 20px;
  font-size: 14px;
  color: #7c8c83;
  text-align: center;
}

.auth-link {
  color: #0c6b50;
  font-weight: 700;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
}

.auth-choice-btn {
  width: 100%;
  display: block;
  background: #f0f5f2;
  color: #14231d;
  font-size: 16px;
  font-weight: 700;
  padding: 16px 0;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  margin-top: 12px;
  text-align: center;
}

.auth-choice-btn.primary {
  background: #0c6b50;
  color: #fff;
}
```

- [ ] **Step 2: 기존 페이지 육안 확인**

Run: `npm run dev` 실행 후 `/login`(patient) 접속, 기존 카카오 버튼 화면이 그대로인지 확인 (새 클래스는 아직 아무 페이지도 안 쓰므로 영향 없어야 함)
Expected: 기존 화면과 동일

- [ ] **Step 3: Commit**

```bash
git add src/pages/auth/auth.css
git commit -m "style: add form styles for hospital auth pages"
```

---

### Task 6: 병원 로그인 페이지를 실제 API로 교체

**Files:**
- Modify: `src/pages/auth/HospitalLoginPage.tsx` (전체 교체)

**Interfaces:**
- Consumes: `hospitalLogin` (Task 2), `ApiError` (Task 1), `useAuth()` (기존)
- Produces: `/hospital/login` 라우트에서 쓰일 로그인 폼 컴포넌트 (Task 9에서 라우트 연결)

- [ ] **Step 1: 파일 전체 교체**

```tsx
// src/pages/auth/HospitalLoginPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hospitalLogin } from '../../services/hospitalAuth'
import { ApiError } from '../../api/response'
import './auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setError(null)
    setLoading(true)
    try {
      const result = await hospitalLogin({ loginId, password })
      auth.login(result)
      navigate('/hospital/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">
          <svg width="26" height="26" viewBox="0 0 22 22" fill="#fff">
            <rect x="9" y="3" width="4" height="16" rx="1" />
            <rect x="3" y="9" width="16" height="4" rx="1" />
          </svg>
        </div>
        <div className="auth-title">메디링크</div>
        <div className="auth-subtitle">병원 관리자 시스템</div>
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleLogin()
          }}
        >
          <div>
            <label className="auth-field-label" htmlFor="loginId">
              아이디
            </label>
            <input
              id="loginId"
              className="auth-field-input"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              className="auth-field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-link-row">
          계정이 없으신가요? <Link className="auth-link" to="/hospital/join">회원가입</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/pages/auth/HospitalLoginPage.tsx
git commit -m "feat: wire hospital login page to real login API"
```

---

### Task 7: 회원가입 선택 페이지

**Files:**
- Create: `src/pages/hospital/JoinChoicePage.tsx`

**Interfaces:**
- Consumes: `auth.css`의 `.auth-*` 클래스 (Task 5)
- Produces: `/hospital/join` 라우트에서 쓰일 컴포넌트 (Task 9)

- [ ] **Step 1: 파일 작성**

```tsx
// src/pages/hospital/JoinChoicePage.tsx
import { Link, useNavigate } from 'react-router-dom'
import '../auth/auth.css'

function JoinChoicePage() {
  const navigate = useNavigate()

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">
          <svg width="26" height="26" viewBox="0 0 22 22" fill="#fff">
            <rect x="9" y="3" width="4" height="16" rx="1" />
            <rect x="3" y="9" width="16" height="4" rx="1" />
          </svg>
        </div>
        <div className="auth-title">메디링크</div>
        <div className="auth-subtitle">회원가입 유형을 선택해 주세요</div>
        <button type="button" className="auth-choice-btn primary" onClick={() => navigate('/hospital/signup')}>
          병원 관계자 회원가입
        </button>
        <button type="button" className="auth-choice-btn" onClick={() => navigate('/login')}>
          일반 사용자 회원가입
        </button>
        <div className="auth-link-row">
          이미 계정이 있으신가요? <Link className="auth-link" to="/hospital/login">로그인</Link>
        </div>
      </div>
    </div>
  )
}

export default JoinChoicePage
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/pages/hospital/JoinChoicePage.tsx
git commit -m "feat: add hospital vs patient signup choice page"
```

---

### Task 8: 병원 회원가입 페이지

**Files:**
- Create: `src/pages/hospital/SignupPage.tsx`

**Interfaces:**
- Consumes: `hospitalSignup` (Task 2), `ApiError` (Task 1), `useAuth()` (기존), `.auth-*` 클래스 (Task 5)
- Produces: `/hospital/signup` 라우트에서 쓰일 컴포넌트 (Task 9)

- [ ] **Step 1: 파일 작성**

```tsx
// src/pages/hospital/SignupPage.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hospitalSignup } from '../../services/hospitalAuth'
import { ApiError } from '../../api/response'
import '../auth/auth.css'

function SignupPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [hospitalLocation, setHospitalLocation] = useState('')
  const [availableTime, setAvailableTime] = useState('')
  const [medicalSubjects, setMedicalSubjects] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup() {
    setError(null)
    setLoading(true)
    try {
      const result = await hospitalSignup({
        loginId,
        password,
        hospitalName,
        hospitalLocation,
        availableTime,
        medicalSubjects,
      })
      auth.login(result)
      navigate('/hospital/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">
          <svg width="26" height="26" viewBox="0 0 22 22" fill="#fff">
            <rect x="9" y="3" width="4" height="16" rx="1" />
            <rect x="3" y="9" width="16" height="4" rx="1" />
          </svg>
        </div>
        <div className="auth-title">병원 회원가입</div>
        <div className="auth-subtitle">병원 관계자 전용 가입</div>
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleSignup()
          }}
        >
          <div>
            <label className="auth-field-label" htmlFor="loginId">
              아이디
            </label>
            <input
              id="loginId"
              className="auth-field-input"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              className="auth-field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="hospitalName">
              병원명
            </label>
            <input
              id="hospitalName"
              className="auth-field-input"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="hospitalLocation">
              병원 위치
            </label>
            <input
              id="hospitalLocation"
              className="auth-field-input"
              value={hospitalLocation}
              onChange={(e) => setHospitalLocation(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="availableTime">
              진료 가능 시간
            </label>
            <input
              id="availableTime"
              className="auth-field-input"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              placeholder="예: 월-금 09:00-18:00"
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="medicalSubjects">
              진료 항목
            </label>
            <input
              id="medicalSubjects"
              className="auth-field-input"
              value={medicalSubjects}
              onChange={(e) => setMedicalSubjects(e.target.value)}
              placeholder="예: 내과, 영상의학과, 종합검진"
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-link-row">
          이미 계정이 있으신가요? <Link className="auth-link" to="/hospital/login">로그인</Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/pages/hospital/SignupPage.tsx
git commit -m "feat: add hospital signup page wired to signup API"
```

---

### Task 9: App.tsx에 병원 라우트 연결

**Files:**
- Modify: `src/App.tsx` (전체 교체)

**Interfaces:**
- Consumes: `HospitalLoginPage`(Task 6), `JoinChoicePage`(Task 7), `SignupPage`(Task 8), `HospitalProtectedRoute`(Task 4), 기존 `HospitalLayout`/`DashboardPage`/`ReservationsPage`/`PatientsPage`/`SettingsPage`(변경 없음)

- [ ] **Step 1: 파일 전체 교체**

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/patient/LoginPage'
import RegisterPage from './pages/patient/RegisterPage'
import InformationPage from './pages/patient/InformationPage'
import KakaoCallbackPage from './pages/patient/KakaoCallbackPage'
import HomePage from './pages/patient/HomePage'
import ReservationPage from './pages/patient/ReservationPage'
import RecordPage from './pages/patient/RecordPage'
import AiReportPage from './pages/patient/AiReportPage'
import ProfilePage from './pages/patient/ProfilePage'
import ProtectedRoute from './routes/ProtectedRoute'
import HospitalLoginPage from './pages/auth/LoginPage'
import HospitalJoinChoicePage from './pages/hospital/JoinChoicePage'
import HospitalSignupPage from './pages/hospital/SignupPage'
import HospitalProtectedRoute from './pages/hospital/HospitalProtectedRoute'
import HospitalLayout from './pages/hospital/HospitalLayout'
import DashboardPage from './pages/hospital/DashboardPage'
import ReservationsPage from './pages/hospital/ReservationsPage'
import PatientsPage from './pages/hospital/PatientsPage'
import SettingsPage from './pages/hospital/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/kakao/callback" element={<KakaoCallbackPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/health" element={<InformationPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/record/analysis/:id" element={<AiReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/hospital/login" element={<HospitalLoginPage />} />
      <Route path="/hospital/join" element={<HospitalJoinChoicePage />} />
      <Route path="/hospital/signup" element={<HospitalSignupPage />} />
      <Route element={<HospitalProtectedRoute />}>
        <Route element={<HospitalLayout />}>
          <Route path="/hospital/dashboard" element={<DashboardPage />} />
          <Route path="/hospital/reservations" element={<ReservationsPage />} />
          <Route path="/hospital/patients" element={<PatientsPage />} />
          <Route path="/hospital/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
```

- [ ] **Step 2: 타입 체크 + patient 라우트 회귀 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

Run: `npm run dev` 후 `/login`, `/home`(로그인 없이 접근 시 `/login`으로 리다이렉트) 등 기존 patient 라우트가 이전과 동일하게 동작하는지 확인
Expected: 기존과 동일

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire hospital routes into App router"
```

---

### Task 10: HospitalLayout 로그아웃을 실제 토큰 삭제로 교체

**Files:**
- Modify: `src/pages/hospital/HospitalLayout.tsx:1-4,88-94`

**Interfaces:**
- Consumes: `useAuth()` (기존, `logout(): void`)

- [ ] **Step 1: import 교체**

`src/pages/hospital/HospitalLayout.tsx` 2번째 줄을 변경:

```tsx
// 변경 전
import { logout } from '../auth/authStore'
// 변경 후
import { useAuth } from '../../context/AuthContext'
```

- [ ] **Step 2: handleLogout 교체**

```tsx
// 변경 전
function HospitalLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

// 변경 후
function HospitalLayout() {
  const navigate = useNavigate()
  const auth = useAuth()

  function handleLogout() {
    auth.logout()
    navigate('/hospital/login', { replace: true })
  }
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (`authStore` import 제거로 인한 미사용 경고 없어야 함)

- [ ] **Step 4: Commit**

```bash
git add src/pages/hospital/HospitalLayout.tsx
git commit -m "fix: hospital logout clears real auth token instead of mock flag"
```

---

### Task 11: SettingsPage 병원 정보 카드를 GET/PUT에 연결

**Files:**
- Modify: `src/pages/hospital/SettingsPage.tsx`

**Interfaces:**
- Consumes: `getMyHospital`, `updateMyHospital`, `HospitalUpdatePayload` (Task 3), `ApiError` (Task 1), `useAuth()`(기존), `useToast()`(기존, `src/context/ToastContext.tsx`)

- [ ] **Step 1: import 구역 교체**

```tsx
// 변경 전 (파일 최상단)
import { useMemo, useState } from 'react'
import { HospitalHeader } from './HospitalLayout'
import {
  buildCalendarCells,
  defaultSubjects,
  defaultWeeklyHours,
  hospitalProfile,
  weekdayLabels,
  type ClinicSubject,
  type WeeklyHours,
} from './hospitalData'

// 변경 후
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getMyHospital, updateMyHospital } from '../../services/hospital'
import { ApiError } from '../../api/response'
import { HospitalHeader } from './HospitalLayout'
import {
  buildCalendarCells,
  defaultSubjects,
  defaultWeeklyHours,
  weekdayLabels,
  type ClinicSubject,
  type WeeklyHours,
} from './hospitalData'
```

- [ ] **Step 2: 상태 선언부 교체**

```tsx
// 변경 전
function SettingsPage() {
  const cells = useMemo(() => buildCalendarCells(), [])
  const [modalDay, setModalDay] = useState<number | null>(null)

  const [name, setName] = useState(hospitalProfile.name)
  const [phone, setPhone] = useState(hospitalProfile.phone)
  const [address, setAddress] = useState(hospitalProfile.address)

  const [subjects, setSubjects] = useState<ClinicSubject[]>(defaultSubjects)

// 변경 후
function SettingsPage() {
  const cells = useMemo(() => buildCalendarCells(), [])
  const [modalDay, setModalDay] = useState<number | null>(null)
  const { token } = useAuth()
  const showToast = useToast()

  const [hospitalName, setHospitalName] = useState('')
  const [hospitalLocation, setHospitalLocation] = useState('')
  const [availableTime, setAvailableTime] = useState('')
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [savingInfo, setSavingInfo] = useState(false)

  const [subjects, setSubjects] = useState<ClinicSubject[]>(defaultSubjects)
```

- [ ] **Step 3: 데이터 로드 useEffect와 저장 함수 추가**

`removeSubject`/`confirmAddSubject`/`toggleDay`/`updateHour` 함수 선언부 바로 앞에 추가:

```tsx
  useEffect(() => {
    if (!token) return
    getMyHospital(token)
      .then((info) => {
        setHospitalName(info.hospitalName)
        setHospitalLocation(info.hospitalLocation)
        setAvailableTime(info.availableTime)
        setSubjects(
          info.medicalSubjects
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((subjectName, i) => ({ id: `sub-${i}`, name: subjectName })),
        )
      })
      .catch((err) => {
        showToast(err instanceof ApiError ? err.message : '병원 정보를 불러오지 못했습니다.', 'error')
      })
      .finally(() => setLoadingInfo(false))
  }, [token, showToast])

  async function saveHospitalInfo() {
    if (!token) return
    setSavingInfo(true)
    try {
      const info = await updateMyHospital(token, {
        hospitalName,
        hospitalLocation,
        availableTime,
        medicalSubjects: subjects.map((s) => s.name).join(', '),
      })
      setHospitalName(info.hospitalName)
      setHospitalLocation(info.hospitalLocation)
      setAvailableTime(info.availableTime)
      showToast('병원 정보를 저장했습니다.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : '병원 정보를 저장하지 못했습니다.', 'error')
    } finally {
      setSavingInfo(false)
    }
  }
```

- [ ] **Step 4: "병원 정보" 카드 JSX 교체**

```tsx
// 변경 전
          <div className="h-card h-settings-card">
            <div className="h-settings-title">병원 정보</div>
            <div className="h-settings-hint">공동인증으로 등록된 기관 정보</div>
            <div className="h-field-group">
              <div>
                <div className="h-field-label">기관명</div>
                <input className="h-field-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <div className="h-field-label">대표 전화번호</div>
                <input className="h-field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <div className="h-field-label">주소</div>
                <input className="h-field-input" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <div className="h-field-label">진료과목</div>
                <div className="h-tag-group">
                  {subjects.map((s) => (
                    <button key={s.id} type="button" className="h-tag" onClick={() => removeSubject(s.id)}>
                      {s.name} ✕
                    </button>
                  ))}
                  {addingSubject ? (
                    <form
                      className="h-tag-add-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        confirmAddSubject()
                      }}
                    >
                      <input
                        autoFocus
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onBlur={confirmAddSubject}
                        placeholder="과목명"
                      />
                    </form>
                  ) : (
                    <button type="button" className="h-tag-add" onClick={() => setAddingSubject(true)}>
                      + 추가
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

// 변경 후
          <div className="h-card h-settings-card">
            <div className="h-settings-title">병원 정보</div>
            <div className="h-settings-hint">병원 계정에 등록된 정보</div>
            <div className="h-field-group">
              <div>
                <div className="h-field-label">병원명</div>
                <input
                  className="h-field-input"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  disabled={loadingInfo}
                />
              </div>
              <div>
                <div className="h-field-label">병원 위치</div>
                <input
                  className="h-field-input"
                  value={hospitalLocation}
                  onChange={(e) => setHospitalLocation(e.target.value)}
                  disabled={loadingInfo}
                />
              </div>
              <div>
                <div className="h-field-label">진료 가능 시간</div>
                <input
                  className="h-field-input"
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                  disabled={loadingInfo}
                  placeholder="예: 월-금 09:00-18:00"
                />
              </div>
              <div>
                <div className="h-field-label">진료과목</div>
                <div className="h-tag-group">
                  {subjects.map((s) => (
                    <button key={s.id} type="button" className="h-tag" onClick={() => removeSubject(s.id)}>
                      {s.name} ✕
                    </button>
                  ))}
                  {addingSubject ? (
                    <form
                      className="h-tag-add-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        confirmAddSubject()
                      }}
                    >
                      <input
                        autoFocus
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onBlur={confirmAddSubject}
                        placeholder="과목명"
                      />
                    </form>
                  ) : (
                    <button type="button" className="h-tag-add" onClick={() => setAddingSubject(true)}>
                      + 추가
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="h-btn h-btn-primary"
                onClick={saveHospitalInfo}
                disabled={loadingInfo || savingInfo}
              >
                {savingInfo ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
```

- [ ] **Step 5: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (미사용 `hospitalProfile`/`name`/`phone`/`address` import·변수 없어야 함)

- [ ] **Step 6: Commit**

```bash
git add src/pages/hospital/SettingsPage.tsx
git commit -m "feat: wire hospital settings info card to GET/PUT hospital/me"
```

---

### Task 12: 전체 빌드 검증 및 수동 브라우저 확인

**Files:** 없음 (검증 전용 태스크)

- [ ] **Step 1: 전체 빌드**

Run: `npm run build`
Expected: 에러 없이 빌드 성공

- [ ] **Step 2: lint**

Run: `npm run lint`
Expected: 새로 추가/수정한 파일에서 새 오류 없음

- [ ] **Step 3: 개발 서버로 수동 확인**

Run: `npm run dev`

브라우저에서 아래 항목을 순서대로 확인 (백엔드 서버가 `VITE_API_BASE_URL`에 떠 있어야 실제 API 응답 확인 가능. 백엔드가 없다면 네트워크 탭에서 요청 URL/메서드/바디가 API 명세와 일치하는지만 확인):

1. `/hospital/login` 접속 → 로그인 폼이 보이는지, "회원가입" 링크가 `/hospital/join`으로 가는지
2. `/hospital/join` → "병원 관계자 회원가입" 클릭 시 `/hospital/signup`, "일반 사용자 회원가입" 클릭 시 `/login`(patient)으로 이동하는지
3. `/hospital/signup`에서 폼 제출 시 `POST /api/v1/auth/hospitals/signup` 요청이 명세와 동일한 바디로 나가는지 (Network 탭)
4. `/hospital/dashboard`를 로그아웃 상태에서 직접 접속 시 `/hospital/login`으로 리다이렉트되는지 (`HospitalProtectedRoute` 동작 확인)
5. `/hospital/login`에서 로그인 성공 시 `/hospital/dashboard`로 이동하고, 사이드바 로그아웃 버튼 클릭 시 `/hospital/login`으로 돌아가는지
6. `/hospital/settings` 접속 시 `GET /api/v1/hospital/me` 요청이 나가는지, "저장" 클릭 시 `PUT /api/v1/hospital/me` 요청이 명세와 동일한 바디로 나가는지

Expected: 위 6개 항목 모두 통과

- [ ] **Step 4: 최종 커밋 (변경 사항이 남아있는 경우에만)**

```bash
git status
```

Expected: 커밋할 변경 사항 없음 (모든 Task에서 이미 커밋 완료)