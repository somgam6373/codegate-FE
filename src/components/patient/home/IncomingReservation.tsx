import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPatientReservations } from '../../../api/reservations'
import type { PatientReservation } from '../../../api/reservations'

function toDday(dateStr: string) {
  const target = new Date(dateStr)
  const today = new Date()
  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'D-DAY'
  return diff > 0 ? `D-${diff}` : `D+${-diff}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`
}

function IncomingReservation() {
  const navigate = useNavigate()
  const [reservation, setReservation] = useState<PatientReservation | null>(null)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    getPatientReservations().then((result) => {
      const upcoming = result.content
        .filter((r) => r.status === 'APPROVED' && new Date(r.date) >= today)
        .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)))
      setReservation(upcoming[0] ?? null)
    })
  }, [])

  if (!reservation) {
    return (
      <button
        type="button"
        onClick={() => navigate('/reservation')}
        className="w-full cursor-pointer rounded-[22px] border border-black/[0.04] bg-white p-5 text-left shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)] transition-all duration-200 active:scale-[0.98]"
      >
        <span className="text-sm font-bold text-ink">다가오는 예약이 없어요</span>
        <p className="mt-0.5 text-xs text-ink-muted">지금 병원을 예약해 보세요</p>
      </button>
    )
  }

  return (
    <div
      className="rounded-[22px] p-5 text-white shadow-[0_14px_30px_-12px_rgba(11,107,80,0.6)]"
      style={{ background: 'linear-gradient(150deg, var(--color-primary), var(--color-primary-deep))' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#bfe6d6]">다가오는 예약</span>
        <span className="rounded-full bg-white/[0.16] px-2.5 py-1 text-xs font-semibold text-white">
          {toDday(reservation.date)}
        </span>
      </div>
      <p className="mt-3 text-xl font-bold">
        {reservation.hospitalName} · {reservation.department}
      </p>
      <p className="mt-0.5 text-sm text-[#d5efe4]">
        {formatDate(reservation.date)} {formatTime(reservation.startTime)}
      </p>
      <div className="my-4 h-px bg-white/[0.16]" />
      <button
        type="button"
        onClick={() => navigate(`/reservation/${reservation.reservationId}`)}
        className="w-full cursor-pointer rounded-xl bg-white py-2.5 text-sm font-semibold text-primary-text transition-all duration-200 hover:bg-white/90 active:scale-[0.97]"
      >
        상세 보기
      </button>
    </div>
  )
}

export default IncomingReservation
