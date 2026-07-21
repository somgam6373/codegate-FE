import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HospitalHeader } from './HospitalLayout'
import { getHospitalReservations, getReservationPatientInfo } from '../../api/hospital'
import type { HospitalReservation, ReservationPatientInfo } from '../../api/hospital'
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

function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('전체')
  const showToast = useToast()

  const [reservations, setReservations] = useState<HospitalReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<ReservationPatientInfo | null>(null)

  const pid = searchParams.get('pid')

  useEffect(() => {
    getHospitalReservations({ size: 200 })
      .then((page) => setReservations(page.content))
      .catch((err) => showToast(err instanceof Error ? err.message : '환자 목록 조회에 실패했어요', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  const rows = useMemo(() => toPatientRows(reservations), [reservations])

  const selected = useMemo(() => rows.find((r) => String(r.patientId) === pid), [rows, pid])

  useEffect(() => {
    if (!selected) {
      setDetail(null)
      return
    }
    getReservationPatientInfo(selected.reservationId)
      .then(setDetail)
      .catch((err) => showToast(err instanceof Error ? err.message : '환자 상세 조회에 실패했어요', 'error'))
  }, [selected, showToast])

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
              <div style={{ fontSize: 20, fontWeight: 800, color: '#14231d' }}>등록 의료 영상</div>
              <div className="h-image-hint">진단서 · CT · MRI 영상을 확인할 수 있습니다. 이미지를 클릭하면 확대됩니다.</div>
              <div className="h-stripe h-image-main">
                진단서 영상
                <span className="h-image-tag">진단서</span>
                <span className="h-image-zoom-hint">⊕ 클릭하여 확대</span>
              </div>
              <div className="h-image-thumbs">
                <div className="h-stripe h-image-thumb active" style={{ backgroundColor: '#0e2540' }}>
                  진단서
                </div>
                <div className="h-stripe h-image-thumb" style={{ backgroundColor: '#232a55' }}>
                  CT
                </div>
                <div className="h-stripe h-image-thumb" style={{ backgroundColor: '#331f4a' }}>
                  MRI
                </div>
              </div>
              <div className="h-sub-card h-detail-section" style={{ marginTop: 4 }}>
                <div className="h-memo-title">
                  <span className="h-memo-dot" />
                  <span>판독 메모</span>
                </div>
                <div className="h-memo-text">{d.memo}</div>
              </div>
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

export default PatientsPage
