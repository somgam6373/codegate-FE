import { useState } from 'react'

interface Hospital {
  name: string
  department: string
  distance: string
  rating: string
}

const HOSPITALS: Hospital[] = [
  { name: '서울내과의원', department: '내과', distance: '0.4km', rating: '4.8' },
  { name: '해맑은가정의학과', department: '가정의학과', distance: '0.9km', rating: '4.6' },
  { name: '건강드림내과', department: '내과', distance: '1.2km', rating: '4.9' },
]

const TIME_SLOTS = ['10:00', '10:30', '11:00']

function HospitalStripe() {
  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] text-center font-mono text-[10px] font-semibold text-black/40"
      style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)' }}
    >
      병원
    </span>
  )
}

function HospitalCard({
  hospital,
  expanded,
  onToggle,
}: {
  hospital: Hospital
  expanded: boolean
  onToggle: () => void
}) {
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1])

  return (
    <div
      className={`rounded-[22px] bg-white p-4 shadow-[0_8px_20px_-14px_rgba(20,35,29,0.3)] transition-all duration-200 ${
        expanded ? 'border-2 border-primary-deep shadow-[0_14px_30px_-18px_rgba(12,107,80,0.5)]' : 'border border-black/[0.04]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full cursor-pointer items-center gap-3.5 text-left active:scale-[0.99]"
      >
        <HospitalStripe />
        <div className="flex-1">
          <p className="text-base font-extrabold text-ink">{hospital.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {hospital.department} · {hospital.distance} · ★ {hospital.rating}
          </p>
        </div>
        <span
          className={`text-xl text-[#c3cec8] transition-transform duration-200 ${
            expanded ? 'rotate-90 text-primary-deep' : 'group-hover:translate-x-0.5'
          }`}
        >
          ›
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          expanded ? 'mt-3.5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`flex-1 cursor-pointer rounded-[11px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
                  slot === selectedSlot
                    ? 'bg-primary-deep text-white shadow-[0_8px_16px_-8px_rgba(12,107,80,0.55)]'
                    : 'bg-[#f0f5f2] text-ink-soft hover:bg-[#e6ede9]'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 w-full cursor-pointer rounded-[13px] bg-primary py-3.5 text-[15px] font-bold text-white shadow-[0_14px_28px_-14px_rgba(11,107,80,0.55)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-14px_rgba(11,107,80,0.6)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_8px_16px_-10px_rgba(11,107,80,0.4)]"
          >
            {selectedSlot} 예약 요청
          </button>
          <p className="mt-2 text-center text-[11px] text-ink-faint">병원 승인 후 확정됩니다</p>
        </div>
      </div>
    </div>
  )
}

function SearchResult({ hospitals = HOSPITALS }: { hospitals?: Hospital[] }) {
  const [expandedName, setExpandedName] = useState<string | null>(null)

  return (
    <div>
      <p className="mb-2.5 px-0.5 text-[13px] font-semibold text-ink-soft">검색 결과 {hospitals.length}곳</p>
      <div className="flex flex-col gap-3">
        {hospitals.map((hospital) => (
          <HospitalCard
            key={hospital.name}
            hospital={hospital}
            expanded={expandedName === hospital.name}
            onToggle={() => setExpandedName((prev) => (prev === hospital.name ? null : hospital.name))}
          />
        ))}
      </div>
    </div>
  )
}

export default SearchResult
