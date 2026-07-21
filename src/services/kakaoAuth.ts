import { api, unwrapApiResponse } from '../api/client'
import type { ApiResponse } from '../api/client'

export { ApiError } from '../api/client'

async function unwrap<T>(res: Promise<ApiResponse<T>>): Promise<T> {
  return unwrapApiResponse(await res)
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
