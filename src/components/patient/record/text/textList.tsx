import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MedicalFile, MedicalFileStatus } from '../../../../api/medicalFiles'
import RecordMediaSheet from '../RecordMediaSheet'

interface TextListProps {
  records: MedicalFile[]
  loading?: boolean
}

type StatusTone = 'complete' | 'analyzing' | 'failed' | 'uploaded'

function statusMeta(status: MedicalFileStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'OCR_COMPLETED':
      return { label: '분석 완료', tone: 'complete' }
    case 'OCR_PENDING':
    case 'OCR_PROCESSING':
      return { label: '분석 중', tone: 'analyzing' }
    case 'OCR_FAILED':
      return { label: '분석 실패', tone: 'failed' }
    case 'UPLOADED':
    default:
      return { label: '업로드 완료', tone: 'uploaded' }
  }
}

function StatusBadge({ status }: { status: MedicalFileStatus }) {
  const meta = statusMeta(status)
  const className =
    meta.tone === 'complete'
      ? 'bg-primary-bg text-primary-text'
      : meta.tone === 'failed'
        ? 'bg-red-50 text-red-500'
        : meta.tone === 'uploaded'
          ? 'bg-[#eef2ef] text-ink-soft'
          : 'bg-[#fdf3df] text-[#c98a1e]'

  return <span className={`inline-block rounded-xl px-2.5 py-0.5 text-[11px] font-bold ${className}`}>{meta.label}</span>
}

function TextList({ records, loading = false }: TextListProps) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<MedicalFile | null>(null)

  return (
    <div>
      <p className="mb-3 px-0.5 text-[13px] font-bold text-ink-soft">등록된 자료 {records.length}건</p>
      {loading ? (
        <p className="rounded-[18px] bg-white p-5 text-center text-sm font-semibold text-ink-muted">자료를 불러오는 중입니다.</p>
      ) : records.length === 0 ? (
        <p className="rounded-[18px] bg-white p-5 text-center text-sm font-semibold text-ink-muted">아직 등록된 건강검진결과지가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3.5 rounded-[22px] border border-black/[0.04] bg-white p-3.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)] transition-shadow duration-200 hover:shadow-[0_14px_28px_-16px_rgba(20,35,29,0.4)]"
            >
              <button
                type="button"
                onClick={() => setSelected(r)}
                className="flex flex-1 cursor-pointer items-center gap-3.5 text-left"
              >
                <div className="flex-1">
                  <p className="text-base font-extrabold text-ink">{displayName(r.originalFileName)}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{recordMeta(r)}</p>
                  <div className="mt-1.5">
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              </button>
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
      )}

      {selected && (
        <RecordMediaSheet
          open
          onClose={() => setSelected(null)}
          medicalFileId={selected.id}
          title={displayName(selected.originalFileName)}
          fileName={selected.originalFileName}
          typeLabel="검진 결과지"
          meta={recordMeta(selected)}
          contentType={selected.contentType}
          statusLabel={statusMeta(selected.status).label}
          statusTone={statusMeta(selected.status).tone}
        />
      )}
    </div>
  )
}

function displayName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '')
}

function recordMeta(record: MedicalFile) {
  return `${formatDate(record.createdAt)} · ${formatFileSize(record.fileSize)}`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${bytes}B`
}

export default TextList
