import { api, unwrapApiResponse } from './client'
import type { ApiResponse } from './client'

export interface PatientMe {
  name: string | null
  gender: 'MALE' | 'FEMALE' | null
  birthDate: string | null
  medications: string[]
  diseases: string[]
}

export interface UpdatePatientMeRequest {
  name?: string
  gender?: 'MALE' | 'FEMALE'
  birthDate?: string
  medications?: string[]
  diseases?: string[]
}

export function getPatientMe() {
  return api<ApiResponse<PatientMe>>('/api/v1/patients/me').then(unwrapApiResponse)
}

export function updatePatientMe(body: UpdatePatientMeRequest) {
  return api<ApiResponse<PatientMe>>('/api/v1/patients/me', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(unwrapApiResponse)
}
