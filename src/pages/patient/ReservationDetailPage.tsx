import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cancelReservation, getPatientReservation } from '../../api/reservations'
import type { PatientReservation, ReservationStatus } from '../../api/reservations'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/patient/ui/Card'

const STATUS_STYLE: Record<ReservationStatus, string> = {
  REQUESTED: 'bg-[#fdf3df] text-[#c98a1e]',
  APPROVED: 'bg-primary-bg text-primary-text',
  REJECTED: 'bg-black/[0.05] text-ink-faint',
  PATIENT_CANCELED: 'bg-black/[0.05] text-ink-faint',
  HOSPITAL_CANCELED: 'bg-black/[0.05] text-ink-faint',
}

const CANCELABLE_STATUSES: ReservationStatus[] = ['REQUESTED', 'APPROVED']

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  )
}

function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showToast = useToast()
  const [reservation, setReservation] = useState<PatientReservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    if (!id) return
    getPatientReservation(Number(id))
      .then(setReservation)
      .catch((err) => showToast(err instanceof Error ? err.message : '예약 조회에 실패했어요', 'error'))
      .finally(() => setLoading(false))
  }, [id, showToast])

  async function handleCancel() {
    if (!reservation) return
    setCanceling(true)
    try {
      await cancelReservation(reservation.reservationId)
      showToast('예약이 취소되었습니다', 'success')
      setReservation(await getPatientReservation(reservation.reservationId))
    } catch (err) {
      showToast(err instanceof Error ? err.message : '예약 취소에 실패했어요', 'error')
    } finally {
      setCanceling(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-app-bg">
      <div className="flex items-center gap-3 px-5.5 pt-4 pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer text-2xl text-ink transition-transform duration-200 active:scale-90"
        >
          ‹
        </button>
        <h1 className="text-[19px] font-extrabold text-ink">예약 상세</h1>
      </div>

      <main className="flex-1 px-5.5 pt-2 pb-6">
        {loading ? (
          <p className="py-12 text-center text-sm text-ink-faint">불러오는 중이에요</p>
        ) : !reservation ? (
          <p className="py-12 text-center text-sm text-ink-faint">예약 정보를 찾을 수 없어요</p>
        ) : (
          <>
            <Card>
              <span
                className={`inline-block rounded-xl px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[reservation.status]}`}
              >
                {reservation.statusLabel}
              </span>
              <p className="mt-2.5 text-lg font-extrabold text-ink">{reservation.hospitalName}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{reservation.hospitalLocation}</p>
              <div className="mt-3.5 border-t border-black/[0.06] pt-1">
                <InfoRow label="진료과" value={reservation.department} />
                <InfoRow label="날짜" value={reservation.date} />
                <InfoRow label="시간" value={`${reservation.startTime} - ${reservation.endTime}`} />
                <InfoRow label="환자" value={reservation.patientName} />
                <InfoRow label="연락처" value={reservation.patientPhone} />
              </div>
            </Card>

            {reservation.symptom && (
              <Card className="mt-3">
                <p className="mb-1.5 text-[13px] font-bold text-ink">증상</p>
                <p className="text-sm leading-relaxed text-[#2b3a33]">{reservation.symptom}</p>
              </Card>
            )}

            {reservation.hospitalMemo && (
              <div className="mt-3 rounded-[22px] bg-primary-bg p-4.5">
                <p className="mb-1.5 text-[13px] font-bold text-primary-text">병원 안내</p>
                <p className="text-sm leading-relaxed text-[#2b3a33]">{reservation.hospitalMemo}</p>
              </div>
            )}

            {reservation.cancelReason && (
              <div className="mt-3 rounded-[22px] bg-[#fdf3df] p-4.5">
                <p className="mb-1.5 text-[13px] font-bold text-[#c98a1e]">
                  {reservation.status === 'REJECTED' ? '거절 사유' : '취소 사유'}
                </p>
                <p className="text-sm leading-relaxed text-[#2b3a33]">{reservation.cancelReason}</p>
              </div>
            )}

            {CANCELABLE_STATUSES.includes(reservation.status) && (
              <button
                type="button"
                disabled={canceling}
                onClick={handleCancel}
                className="mt-4 w-full cursor-pointer rounded-[13px] border border-black/[0.08] bg-white py-3.5 text-[15px] font-bold text-[#c0483f] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {canceling ? '취소하는 중...' : '예약 취소'}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ReservationDetailPage
