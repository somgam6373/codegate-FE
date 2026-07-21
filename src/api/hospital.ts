import { api, unwrapApiResponse } from './client'
import type { ApiResponse } from './client'

export interface HospitalSlot {
  id: number
  date: string
  startTime: string
  endTime: string
  department: string
  capacity: number
  reservedCount: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface GetHospitalSlotsParams {
  date?: string
  department?: string
  page?: number
  size?: number
}

export function getHospitalSlots(params: GetHospitalSlotsParams = {}) {
  const query = new URLSearchParams()
  if (params.date) query.set('date', params.date)
  if (params.department) query.set('department', params.department)
  if (params.page != null) query.set('page', String(params.page))
  if (params.size != null) query.set('size', String(params.size))

  const qs = query.toString()
  return api<ApiResponse<PageResponse<HospitalSlot>>>(`/api/v1/hospital/slots${qs ? `?${qs}` : ''}`).then(unwrapApiResponse)
}

export type ReservationStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PATIENT_CANCELED' | 'HOSPITAL_CANCELED'

export interface HospitalReservation {
  reservationId: number
  status: ReservationStatus
  statusLabel: string
  slotId: number
  hospitalId: number
  hospitalName: string
  hospitalLocation: string
  department: string
  date: string
  startTime: string
  endTime: string
  patientId: number
  patientName: string
  patientPhone: string
  symptom: string | null
  timeZone: string
  requestedAt: string
  approvedAt: string | null
  rejectedAt: string | null
  canceledAt: string | null
  statusChangedAt: string
  hospitalMemo: string | null
  cancelReason: string | null
}

export interface GetHospitalReservationsParams {
  status?: ReservationStatus
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}

export function getHospitalReservations(params: GetHospitalReservationsParams = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.fromDate) query.set('fromDate', params.fromDate)
  if (params.toDate) query.set('toDate', params.toDate)
  if (params.page != null) query.set('page', String(params.page))
  if (params.size != null) query.set('size', String(params.size))

  const qs = query.toString()
  return api<ApiResponse<PageResponse<HospitalReservation>>>(
    `/api/v1/hospital/reservations${qs ? `?${qs}` : ''}`,
  ).then(unwrapApiResponse)
}
