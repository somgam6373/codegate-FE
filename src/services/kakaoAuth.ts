import { api } from '../api/client'

interface ApiResponse<T> {
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

async function unwrap<T>(res: Promise<ApiResponse<T>>): Promise<T> {
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

export interface LoginResult {
  accessToken: string
  tokenType: string
  role: string
  userId: number
}

export interface SignupPayload {
  code?: string
  redirectUri?: string
  signupToken?: string
  name: string
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  residentRegistrationNumber: string
}

export function getKakaoLoginUrl(redirectUri: string, state?: string): Promise<string> {
  const params = new URLSearchParams({ redirectUri, ...(state ? { state } : {}) })
  return unwrap<{ loginUrl: string }>(api(`/api/v1/auth/kakao/login-url?${params}`)).then(
    (data) => data.loginUrl,
  )
}

export function kakaoLogin(code: string, redirectUri: string): Promise<LoginResult> {
  return unwrap<LoginResult>(
    api('/api/v1/auth/patients/kakao/login', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri }),
    }),
  )
}

export function kakaoSignup(payload: SignupPayload): Promise<LoginResult> {
  return unwrap<LoginResult>(
    api('/api/v1/auth/patients/kakao/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )
}
