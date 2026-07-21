import { api, unwrapApiResponse } from './client'
import type { ApiResponse } from './client'
import type { LoginResult } from '../services/kakaoAuth'

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
  return api<ApiResponse<LoginResult>>('/api/v1/auth/hospitals/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(unwrapApiResponse)
}

export function hospitalLogin(payload: HospitalLoginPayload): Promise<LoginResult> {
  return api<ApiResponse<LoginResult>>('/api/v1/auth/hospitals/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(unwrapApiResponse)
}
