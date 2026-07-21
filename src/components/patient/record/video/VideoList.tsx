interface VideoRecord {
  id: string
  type: 'MRI' | 'CT' | '소견서'
  title: string
  date: string
  hospital: string
  status: 'complete' | 'analyzing'
}

const VIDEO_RECORDS: VideoRecord[] = [
  { id: 'brain-mri-01', type: 'MRI', title: '뇌 MRI 영상', date: '2025.07.10', hospital: '서울내과의원', status: 'complete' },
  { id: 'spine-mri-01', type: 'MRI', title: '척추 MRI 영상', date: '2025.06.22', hospital: '건강드림내과', status: 'analyzing' },
  { id: 'chest-ct-01', type: 'CT', title: '흉부 CT 사진', date: '2025.05.14', hospital: '해맑은가정의학과', status: 'complete' },
  { id: 'note-01', type: '소견서', title: '내과 진료 소견서', date: '2025.04.02', hospital: '서울내과의원', status: 'complete' },
]

function StatusBadge({ status }: { status: VideoRecord['status'] }) {
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

function VideoList({ records = VIDEO_RECORDS }: { records?: VideoRecord[] }) {
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
              {r.type}
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoList
