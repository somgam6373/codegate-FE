import { api, unwrapApiResponse } from './client'
import type { ApiResponse } from './client'

export interface HospitalSearchSlot {
  slotId: number
  department: string
  date: string
  dayOfWeek: string
  startTime: string
  endTime: string
  timeZone: string
  reserved: boolean
  available: boolean
}

export interface HospitalSearchHospital {
  hospitalId: number
  hospitalName: string
  district: string
  location: string
  availableTime: string
  registeredDepartments: string[]
  availableDepartments: string[]
  availableSlotCount: number
  availableSlots: HospitalSearchSlot[]
}

export interface HospitalSearchResult {
  district: string
  selectedDepartment: string | null
  date: string | null
  timeRange: string | null
  timeZone: string
  allAvailableDepartments: string[]
  hospitalCount: number
  slotCount: number
  hospitals: HospitalSearchHospital[]
}

export interface SearchHospitalsParams {
  district: string
  department?: string
  date?: string
  fromTime?: string
  toTime?: string
}

export function searchHospitals(params: SearchHospitalsParams) {
  const query = new URLSearchParams()
  query.set('district', params.district)
  if (params.department) query.set('department', params.department)
  if (params.date) query.set('date', params.date)
  if (params.fromTime) query.set('fromTime', params.fromTime)
  if (params.toTime) query.set('toTime', params.toTime)

  return api<ApiResponse<HospitalSearchResult>>(`/api/v1/hospitals/search?${query.toString()}`).then(unwrapApiResponse)
}
