interface Reservation {
  hospital: string
  department: string
  date: string
  time: string
  status: 'confirmed' | 'pending'
}

const RESERVATIONS: Reservation[] = [
  { hospital: '서울내과의원', department: '내과', date: '7월 23일 (수)', time: '오전 10:30', status: 'pending' },
  { hospital: '건강드림내과', department: '내과', date: '6월 22일 (일)', time: '오후 2:00', status: 'confirmed' },
]

function StatusBadge({ status }: { status: Reservation['status'] }) {
  const isConfirmed = status === 'confirmed'
  return (
    <span
      className={`inline-block rounded-xl px-2.5 py-1 text-[11px] font-bold ${
        isConfirmed ? 'bg-primary-bg text-primary-text' : 'bg-[#fdf3df] text-[#c98a1e]'
      }`}
    >
      {isConfirmed ? '예약 확정' : '승인 대기'}
    </span>
  )
}

function ReservationSearchList({ reservations = RESERVATIONS }: { reservations?: Reservation[] }) {
  if (reservations.length === 0) {
    return <p className="py-12 text-center text-sm text-ink-faint">예약 내역이 없어요</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {reservations.map((r) => (
        <div
          key={`${r.hospital}-${r.date}`}
          className="flex items-center gap-3.5 rounded-[22px] border border-black/[0.04] bg-white p-4 shadow-[0_8px_20px_-14px_rgba(20,35,29,0.3)] transition-shadow duration-200"
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] text-center font-mono text-[10px] font-semibold text-black/40"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)' }}
          >
            병원
          </span>
          <div className="flex-1">
            <p className="text-base font-extrabold text-ink">
              {r.hospital} · {r.department}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {r.date} {r.time}
            </p>
            <div className="mt-1.5">
              <StatusBadge status={r.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReservationSearchList
