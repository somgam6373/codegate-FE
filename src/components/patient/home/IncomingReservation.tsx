interface IncomingReservationProps {
  dDay?: string
  hospital?: string
  department?: string
  date?: string
  time?: string
}

function IncomingReservation({
  dDay = 'D-2',
  hospital = '서울내과의원',
  department = '내과',
  date = '7월 23일 (수)',
  time = '오전 10:30',
}: IncomingReservationProps) {
  return (
    <div
      className="rounded-[22px] p-5 text-white shadow-[0_14px_30px_-12px_rgba(11,107,80,0.6)]"
      style={{ background: 'linear-gradient(150deg, var(--color-primary), var(--color-primary-deep))' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#bfe6d6]">다가오는 예약</span>
        <span className="rounded-full bg-white/[0.16] px-2.5 py-1 text-xs font-semibold text-white">{dDay}</span>
      </div>
      <p className="mt-3 text-xl font-bold">
        {hospital} · {department}
      </p>
      <p className="mt-0.5 text-sm text-[#d5efe4]">
        {date} {time}
      </p>
      <div className="my-4 h-px bg-white/[0.16]" />
      <div className="flex gap-2.5">
        <button
          type="button"
          className="flex-1 cursor-pointer rounded-xl bg-white/[0.14] py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/[0.22] active:scale-[0.97]"
        >
          길찾기
        </button>
        <button
          type="button"
          className="flex-1 cursor-pointer rounded-xl bg-white py-2.5 text-sm font-semibold text-primary-text transition-all duration-200 hover:bg-white/90 active:scale-[0.97]"
        >
          상세 보기
        </button>
      </div>
    </div>
  )
}

export default IncomingReservation
