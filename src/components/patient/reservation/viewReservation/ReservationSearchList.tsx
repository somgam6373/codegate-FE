import { useNavigate } from 'react-router-dom'
import type { PatientReservation, ReservationStatus } from '../../../../api/reservations'
import ListRow from '../../ui/ListRow'

const STATUS_STYLE: Record<ReservationStatus, string> = {
  REQUESTED: 'bg-[#fdf3df] text-[#c98a1e]',
  APPROVED: 'bg-primary-bg text-primary-text',
  REJECTED: 'bg-black/[0.05] text-ink-faint',
  PATIENT_CANCELED: 'bg-black/[0.05] text-ink-faint',
  HOSPITAL_CANCELED: 'bg-black/[0.05] text-ink-faint',
}

function StatusBadge({ status, statusLabel }: { status: ReservationStatus; statusLabel: string }) {
  return (
    <span className={`inline-block rounded-xl px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[status]}`}>
      {statusLabel}
    </span>
  )
}

function ReservationSearchList({ reservations }: { reservations: PatientReservation[] }) {
  const navigate = useNavigate()

  if (reservations.length === 0) {
    return <p className="py-12 text-center text-sm text-ink-faint">예약 내역이 없어요</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {reservations.map((r) => (
        <ListRow
          key={r.reservationId}
          onClick={() => navigate(`/reservation/${r.reservationId}`)}
          title={`${r.hospitalName} · ${r.department}`}
          subtitle={`${r.date} ${r.startTime}`}
          badge={<StatusBadge status={r.status} statusLabel={r.statusLabel} />}
        />
      ))}
    </div>
  )
}

export default ReservationSearchList
