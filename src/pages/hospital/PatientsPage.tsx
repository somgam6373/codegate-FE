import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HospitalHeader } from './HospitalLayout'
import {
  getHospitalReservations,
  getReservationMedicalFileContent,
  getReservationMedicalFileOcrResult,
  getReservationMedicalFiles,
  getReservationPatientInfo,
} from '../../api/hospital'
import type {
  HospitalMedicalFile,
  HospitalMedicalFileOcrResult,
  HospitalReservation,
  ReservationPatientInfo,
} from '../../api/hospital'
import { useToast } from '../../context/ToastContext'

type Filter = '전체' | '주의 필요' | '최근 방문'

interface PatientRow {
  reservationId: number
  patientId: number
  name: string
  department: string
  date: string
  startTime: string
  endTime: string
  symptom: string
  hospitalMemo: string | null
  patientPhone: string
  status: HospitalReservation['status']
  statusLabel: string
}

function toPatientRows(reservations: HospitalReservation[]): PatientRow[] {
  const latestByPatient = new Map<number, HospitalReservation>()
  for (const r of reservations) {
    const existing = latestByPatient.get(r.patientId)
    if (!existing || r.date > existing.date) latestByPatient.set(r.patientId, r)
  }
  return [...latestByPatient.values()].map((r) => ({
    reservationId: r.reservationId,
    patientId: r.patientId,
    name: r.patientName,
    department: r.department,
    date: r.date,
    startTime: r.startTime,
    endTime: r.endTime,
    symptom: r.symptom ?? '증상 정보 없음',
    hospitalMemo: r.hospitalMemo,
    patientPhone: r.patientPhone,
    status: r.status,
    statusLabel: r.statusLabel,
  }))
}

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const hadBirthdayThisYear =
    now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate())
  if (!hadBirthdayThisYear) age -= 1
  return age
}

const FILE_TYPE_LABEL: Record<HospitalMedicalFile['type'], string> = {
  CHECKUP_RESULT: '건강검진결과지',
  OPINION_LETTER: '소견서',
  CT: 'CT',
  MRI: 'MRI',
  XRAY: 'X-Ray',
}

const FILE_STATUS_LABEL: Record<HospitalMedicalFile['status'], string> = {
  UPLOADED: '업로드 완료',
  OCR_PENDING: 'OCR 대기',
  OCR_PROCESSING: 'OCR 처리 중',
  OCR_COMPLETED: 'OCR 완료',
  OCR_FAILED: 'OCR 실패',
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function resolvePreviewKind(file: HospitalMedicalFile | null): 'image' | 'pdf' | 'video' | 'unsupported' {
  if (!file) return 'unsupported'
  const contentType = (file.contentType ?? '').toLowerCase()
  const fileName = file.originalFileName.toLowerCase()

  if (contentType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) return 'image'
  if (contentType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf'
  if (contentType.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(fileName)) return 'video'
  return 'unsupported'
}

function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('전체')
  const showToast = useToast()

  const [reservations, setReservations] = useState<HospitalReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<ReservationPatientInfo | null>(null)
  const [medicalFiles, setMedicalFiles] = useState<HospitalMedicalFile[]>([])
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<HospitalMedicalFileOcrResult | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)

  const pid = searchParams.get('pid')

  useEffect(() => {
    getHospitalReservations({ size: 200 })
      .then((page) => setReservations(page.content))
      .catch((err) => showToast(err instanceof Error ? err.message : '환자 목록 조회에 실패했어요', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  const rows = useMemo(() => toPatientRows(reservations), [reservations])

  const selected = useMemo(() => rows.find((r) => String(r.patientId) === pid), [rows, pid])

  const selectedMedicalFile = useMemo(
    () => medicalFiles.find((file) => file.id === selectedFileId) ?? medicalFiles[0] ?? null,
    [medicalFiles, selectedFileId],
  )

  useEffect(() => {
    if (!selected) {
      setDetail(null)
      setMedicalFiles([])
      setSelectedFileId(null)
      setOcrResult(null)
      return
    }
    getReservationPatientInfo(selected.reservationId)
      .then(setDetail)
      .catch((err) => showToast(err instanceof Error ? err.message : '환자 상세 조회에 실패했어요', 'error'))
  }, [selected, showToast])

  useEffect(() => {
    if (!selected) return

    setMedicalFiles([])
    setSelectedFileId(null)
    setOcrResult(null)
    getReservationMedicalFiles(selected.reservationId)
      .then((files) => {
        setMedicalFiles(files)
        setSelectedFileId(files[0]?.id ?? null)
      })
      .catch((err) => showToast(err instanceof Error ? err.message : '의료파일 목록 조회에 실패했어요', 'error'))
  }, [selected, showToast])

  useEffect(() => {
    if (!selected || !selectedMedicalFile) {
      setPreviewUrl(null)
      return
    }

    let cancelled = false
    let objectUrl: string | null = null

    setPreviewLoading(true)
    setPreviewUrl(null)
    getReservationMedicalFileContent(selected.reservationId, selectedMedicalFile.id)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      })
      .catch((err) => {
        if (!cancelled) showToast(err instanceof Error ? err.message : '파일을 불러오지 못했어요', 'error')
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [selected, selectedMedicalFile, showToast])

  useEffect(() => {
    if (!selected || !selectedMedicalFile || selectedMedicalFile.type !== 'CHECKUP_RESULT') {
      setOcrResult(null)
      return
    }

    setOcrLoading(true)
    setOcrResult(null)
    getReservationMedicalFileOcrResult(selected.reservationId, selectedMedicalFile.id)
      .then(setOcrResult)
      .catch(() => setOcrResult(null))
      .finally(() => setOcrLoading(false))
  }, [selected, selectedMedicalFile])

  const filtered = useMemo(() => {
    if (filter === '주의 필요') return rows.filter((r) => r.status === 'REQUESTED')
    if (filter === '최근 방문') return [...rows].sort((a, b) => (a.date < b.date ? 1 : -1))
    return rows
  }, [filter, rows])

  function openPatient(r: PatientRow) {
    setSearchParams({ pid: String(r.patientId) })
  }

  function backToList() {
    setSearchParams({})
  }

  if (selected) {
    if (!detail) {
      return (
        <>
          <HospitalHeader title="환자 데이터" subtitle={`${selected.name}님 상세 정보`} />
          <div className="h-content">
            <button type="button" className="h-back-link" onClick={backToList}>
              <span style={{ fontSize: 22 }}>‹</span>환자 목록으로
            </button>
            <p style={{ padding: '64px 0', textAlign: 'center', color: '#7c8c83' }}>불러오는 중이에요</p>
          </div>
        </>
      )
    }
    const d = {
      pid: `P-${detail.patientId}`,
      name: detail.patientName,
      age: `${calcAge(detail.birthDate)}세 · ${detail.gender === 'MALE' ? '남' : '여'}`,
      ageOnly: `${calcAge(detail.birthDate)}세`,
      sex: detail.gender === 'MALE' ? '남' : '여',
      birth: detail.birthDate,
      phone: selected.patientPhone,
      department: selected.department,
      date: selected.date,
      time: `${selected.startTime} - ${selected.endTime}`,
      symptom: selected.symptom,
      history: detail.diseases.length ? detail.diseases.join(', ') : '특이사항 없음',
      medications: detail.medications.length ? detail.medications.join(', ') : '없음',
      memo: selected.hospitalMemo ?? '메모 없음',
      status: selected.statusLabel,
    }
    return (
      <>
        <HospitalHeader title="환자 데이터" subtitle={`${d.name}님 상세 정보`} />
        <div className="h-content">
          <button type="button" className="h-back-link" onClick={backToList}>
            <span style={{ fontSize: 22 }}>‹</span>환자 목록으로
          </button>
          <div className="h-detail-grid">
            <div className="h-detail-col">
              <div className="h-detail-header">
                <div style={{ flex: 1 }}>
                  <div className="h-detail-name">{d.name}</div>
                  <div className="h-detail-meta">
                    {d.pid} · {d.age}
                  </div>
                </div>
                <span className="h-detail-status">{d.status}</span>
              </div>

              <div className="h-sub-card h-detail-section">
                <div className="h-detail-section-title">기본 정보</div>
                <div className="h-detail-field">
                  <span className="h-detail-label">환자 ID</span>
                  <span className="h-detail-value">{d.pid}</span>
                </div>
                <div className="h-detail-field">
                  <span className="h-detail-label">나이</span>
                  <span className="h-detail-value">{d.ageOnly}</span>
                </div>
                <div className="h-detail-field">
                  <span className="h-detail-label">성별</span>
                  <span className="h-detail-value">{d.sex}</span>
                </div>
                <div className="h-detail-field">
                  <span className="h-detail-label">생년월일</span>
                  <span className="h-detail-value">{d.birth}</span>
                </div>
                <div className="h-detail-field">
                  <span className="h-detail-label">연락처</span>
                  <span className="h-detail-value">{d.phone}</span>
                </div>
              </div>

              <div className="h-sub-card h-detail-section">
                <div className="h-detail-section-title">예약 정보</div>
                <div className="h-detail-field">
                  <span className="h-detail-label">진료과</span>
                  <span className="h-detail-value">{d.department}</span>
                </div>
                <div className="h-detail-field">
                  <span className="h-detail-label">예약 날짜</span>
                  <span className="h-detail-value">{d.date}</span>
                </div>
                <div className="h-detail-field">
                  <span className="h-detail-label">예약 시간</span>
                  <span className="h-detail-value">{d.time}</span>
                </div>
              </div>

              <div className="h-sub-card h-detail-section">
                <div className="h-detail-section-title">진료 정보</div>
                <div className="h-detail-block-label">방문 사유 / 증상</div>
                <div className="h-detail-block-value">{d.symptom}</div>
                <div className="h-detail-block-label">과거 진료 이력</div>
                <div className="h-detail-block-value">{d.history}</div>
                <div className="h-detail-block-label">복용 약물</div>
                <span className="h-allergy-tag">{d.medications}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#14231d' }}>등록 의료 자료</div>
              <div className="h-image-hint">
                예약 환자가 업로드한 CT · MRI · X-Ray · 건강검진결과지를 확인합니다.
              </div>

              <MedicalFilePreview
                file={selectedMedicalFile}
                previewUrl={previewUrl}
                loading={previewLoading}
                onOpenOriginal={() => {
                  if (previewUrl) window.open(previewUrl, '_blank', 'noopener,noreferrer')
                }}
              />

              <div className="h-image-thumbs h-file-list">
                {medicalFiles.length === 0 ? (
                  <div className="h-file-empty">등록된 의료파일이 없습니다.</div>
                ) : (
                  medicalFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className={`h-file-thumb${selectedMedicalFile?.id === file.id ? ' active' : ''}`}
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <span className="h-file-thumb-type">{FILE_TYPE_LABEL[file.type]}</span>
                      <span className="h-file-thumb-name">{file.originalFileName}</span>
                    </button>
                  ))
                )}
              </div>

              {selectedMedicalFile && (
                <div className="h-sub-card h-detail-section" style={{ marginTop: 4 }}>
                  <div className="h-memo-title">
                    <span className="h-memo-dot" />
                    <span>파일 정보</span>
                  </div>
                  <div className="h-detail-field">
                    <span className="h-detail-label">구분</span>
                    <span className="h-detail-value">{FILE_TYPE_LABEL[selectedMedicalFile.type]}</span>
                  </div>
                  <div className="h-detail-field">
                    <span className="h-detail-label">상태</span>
                    <span className="h-detail-value">{FILE_STATUS_LABEL[selectedMedicalFile.status]}</span>
                  </div>
                  <div className="h-detail-field">
                    <span className="h-detail-label">파일명</span>
                    <span className="h-detail-value">{selectedMedicalFile.originalFileName}</span>
                  </div>
                  <div className="h-detail-field">
                    <span className="h-detail-label">크기</span>
                    <span className="h-detail-value">{formatFileSize(selectedMedicalFile.fileSize)}</span>
                  </div>
                </div>
              )}

              {selectedMedicalFile?.type === 'CHECKUP_RESULT' && (
                <OcrResultPanel loading={ocrLoading} result={ocrResult} />
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <HospitalHeader title="환자 데이터" subtitle={`등록 환자 ${rows.length.toLocaleString()}명`} />
      <div className="h-content">
        <div className="h-card" style={{ overflow: 'hidden' }}>
          <div className="h-list-header">
            <span className="h-list-title">환자 목록</span>
            <span className="h-list-count">총 {rows.length.toLocaleString()}명</span>
            <div className="h-filter-group">
              {(['전체', '주의 필요', '최근 방문'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`h-filter-chip${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-table-head">
            <span>환자</span>
            <span>진료과</span>
            <span>최근 방문</span>
            <span>증상</span>
            <span>상태</span>
            <span />
          </div>
          {loading ? (
            <p style={{ padding: '64px 0', textAlign: 'center', color: '#7c8c83' }}>불러오는 중이에요</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: '64px 0', textAlign: 'center', color: '#7c8c83' }}>등록된 환자가 없어요</p>
          ) : (
            filtered.map((r) => (
              <button key={r.reservationId} type="button" className="h-table-row" onClick={() => openPatient(r)}>
                <span className="h-table-name">{r.name}</span>
                <span className="h-table-sub">{r.department}</span>
                <span className="h-table-sub">{r.date}</span>
                <span className="h-table-metric">{r.symptom}</span>
                <span>
                  <span className={`h-status-badge${r.status === 'REQUESTED' ? ' warn' : ' normal'}`}>{r.statusLabel}</span>
                </span>
                <span className="h-table-chevron">›</span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function MedicalFilePreview({
  file,
  previewUrl,
  loading,
  onOpenOriginal,
}: {
  file: HospitalMedicalFile | null
  previewUrl: string | null
  loading: boolean
  onOpenOriginal: () => void
}) {
  const previewKind = resolvePreviewKind(file)

  if (!file) {
    return (
      <div className="h-file-preview-placeholder">
        <span>의료파일 없음</span>
        <p>환자가 업로드한 영상, 사진, 결과지가 이 영역에 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="h-file-preview">
      <div className="h-file-preview-head">
        <span className="h-image-tag">{FILE_TYPE_LABEL[file.type]}</span>
        <button type="button" className="h-file-open-btn" onClick={onOpenOriginal} disabled={!previewUrl || loading}>
          원본 열기
        </button>
      </div>

      {loading ? (
        <div className="h-file-preview-placeholder">
          <span>파일을 불러오는 중입니다.</span>
        </div>
      ) : previewUrl && previewKind === 'image' ? (
        <img src={previewUrl} alt={file.originalFileName} className="h-file-preview-media" />
      ) : previewUrl && previewKind === 'pdf' ? (
        <iframe src={previewUrl} title={file.originalFileName} className="h-file-preview-frame" />
      ) : previewUrl && previewKind === 'video' ? (
        <video src={previewUrl} controls className="h-file-preview-media" />
      ) : (
        <div className="h-file-preview-placeholder">
          <span>{file.originalFileName}</span>
          <p>브라우저 미리보기를 지원하지 않는 파일 형식입니다. 원본 열기를 사용하세요.</p>
        </div>
      )}
    </div>
  )
}

function OcrResultPanel({ loading, result }: { loading: boolean; result: HospitalMedicalFileOcrResult | null }) {
  if (loading) {
    return (
      <div className="h-sub-card h-detail-section">
        <div className="h-detail-section-title">건강검진결과지 OCR</div>
        <p className="h-ocr-empty">OCR 결과를 불러오는 중입니다.</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-sub-card h-detail-section">
        <div className="h-detail-section-title">건강검진결과지 OCR</div>
        <p className="h-ocr-empty">조회 가능한 OCR 결과가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="h-sub-card h-detail-section">
      <div className="h-detail-section-title">건강검진결과지 OCR</div>
      <div className="h-ocr-score-grid">
        <OcrScore label="혈압" value={result.bloodPressureScorePercent} />
        <OcrScore label="혈당" value={result.bloodSugarScorePercent} />
        <OcrScore label="감마GTP" value={result.gammaGtpScorePercent} />
      </div>
      <div className="h-detail-block-label">요약</div>
      <div className="h-detail-block-value">{result.summary ?? '요약 정보 없음'}</div>
      <div className="h-detail-block-label">권장 음식</div>
      <div className="h-memo-text">{result.recommendedFood ?? '정보 없음'}</div>
      <div className="h-detail-block-label" style={{ marginTop: 14 }}>
        권장 운동
      </div>
      <div className="h-memo-text">{result.recommendedExercise ?? '정보 없음'}</div>
      {result.errorMessage && <p className="h-ocr-error">{result.errorMessage}</p>}
    </div>
  )
}

function OcrScore({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="h-ocr-score">
      <span>{label}</span>
      <strong>{value == null ? '-' : `${value}%`}</strong>
    </div>
  )
}

export default PatientsPage
