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
