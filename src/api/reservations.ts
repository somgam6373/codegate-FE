import { api, unwrapApiResponse } from './client'
import type { ApiResponse } from './client'

export interface CreateReservationRequest {
  slotId: number
  patientName: string
  patientPhone: string
  symptom?: string
}

export interface Reservation {
  id: number
  slotId: number
  patientName: string
  patientPhone: string
  symptom: string | null
  status: string
}

export function createReservation(body: CreateReservationRequest) {
  return api<ApiResponse<Reservation>>('/api/v1/patient/reservations', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(unwrapApiResponse)
}

export function cancelReservation(reservationId: number) {
  return api<ApiResponse<Reservation>>(`/api/v1/patient/reservations/${reservationId}/cancel`, {
    method: 'POST',
  }).then(unwrapApiResponse)
}

export type ReservationStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PATIENT_CANCELED' | 'HOSPITAL_CANCELED'

export interface PatientReservation {
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

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface GetPatientReservationsParams {
  status?: ReservationStatus
  page?: number
  size?: number
}

export function getPatientReservations(params: GetPatientReservationsParams = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page != null) query.set('page', String(params.page))
  if (params.size != null) query.set('size', String(params.size))

  const qs = query.toString()
  return api<ApiResponse<PageResponse<PatientReservation>>>(`/api/v1/patient/reservations${qs ? `?${qs}` : ''}`).then(
    unwrapApiResponse,
  )
}

export function getPatientReservation(reservationId: number) {
  return api<ApiResponse<PatientReservation>>(`/api/v1/patient/reservations/${reservationId}`).then(unwrapApiResponse)
}
