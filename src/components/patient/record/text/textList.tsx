import { useNavigate } from 'react-router-dom'

interface TextRecord {
  id: string
  title: string
  date: string
  hospital: string
  status: 'complete' | 'analyzing'
}

const TEXT_RECORDS: TextRecord[] = [
  { id: 'checkup-01', title: '2025 상반기 건강검진결과지', date: '2025.07.15', hospital: '서울내과의원', status: 'complete' },
]

function StatusBadge({ status }: { status: TextRecord['status'] }) {
  const isComplete = status === 'complete'
  return (
    <span
      className={`inline-block rounded-xl px-2.5 py-0.5 text-[11px] font-bold ${
        isComplete ? 'bg-primary-bg text-primary-text' : 'bg-[#fdf3df] text-[#c98a1e]'
      }`}
    >
      {isComplete ? '분석 완료' : '분석 중'}
    </span>
  )
}

function TextList({ records = TEXT_RECORDS }: { records?: TextRecord[] }) {
  const navigate = useNavigate()

  return (
    <div>
      <p className="mb-3 px-0.5 text-[13px] font-bold text-ink-soft">등록된 자료 {records.length}건</p>
      <div className="flex flex-col gap-3">
        {records.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3.5 rounded-[22px] border border-black/[0.04] bg-white p-3.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)] transition-shadow duration-200 hover:shadow-[0_14px_28px_-16px_rgba(20,35,29,0.4)]"
          >
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[13px] text-center font-mono text-[10px] leading-tight font-semibold text-black/40"
              style={{
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)',
              }}
            >
              검진
              <br />
              결과지
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">{r.title}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {r.date} · {r.hospital}
              </p>
              <div className="mt-1.5">
                <StatusBadge status={r.status} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/record/analysis/${r.id}`)}
              className="shrink-0 cursor-pointer rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-primary-deep active:scale-[0.95]"
            >
              AI 분석
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TextList
