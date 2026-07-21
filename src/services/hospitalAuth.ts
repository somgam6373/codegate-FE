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