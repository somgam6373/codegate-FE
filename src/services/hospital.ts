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