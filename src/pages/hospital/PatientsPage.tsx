import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HospitalHeader } from './HospitalLayout'
import { patients, type Patient } from './hospitalData'

type Filter = '전체' | '주의 필요' | '최근 방문'

function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('전체')
  const pid = searchParams.get('pid')

  const selected: Patient | undefined = useMemo(
    () => patients.find((p) => p.detail.pid === pid),
    [pid],
  )

  const filtered = useMemo(() => {
    if (filter === '주의 필요') return patients.filter((p) => p.status === '주의')
    if (filter === '최근 방문') return [...patients].sort((a, b) => (a.visit < b.visit ? 1 : -1))
    return patients
  }, [filter])

  function openPatient(p: Patient) {
    setSearchParams({ pid: p.detail.pid })
  }

  function backToList() {
    setSearchParams({})
  }

  if (selected) {
    const d = selected.detail
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
                  <span className="h-detail-label">담당 의사</span>
                  <span className="h-detail-value">{d.doctor}</span>
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
                <div className="h-detail-block-label">알레르기 정보</div>
                <span className="h-allergy-tag">{d.allergy}</span>
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
      <HospitalHeader title="환자 데이터" subtitle={`등록 환자 ${patients.length.toLocaleString()}명`} />
      <div className="h-content">
        <div className="h-card" style={{ overflow: 'hidden' }}>
          <div className="h-list-header">
            <span className="h-list-title">환자 목록</span>
            <span className="h-list-count">총 {patients.length.toLocaleString()}명</span>
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
            <span>나이·성별</span>
            <span>최근 방문</span>
            <span>주요 수치</span>
            <span>상태</span>
            <span />
          </div>
          {filtered.map((p) => (
            <button key={p.detail.pid} type="button" className="h-table-row" onClick={() => openPatient(p)}>
              <span className="h-table-name">{p.name}</span>
              <span className="h-table-sub">{p.ageShort}</span>
              <span className="h-table-sub">{p.visit}</span>
              <span className="h-table-metric">{p.metric}</span>
              <span>
                <span className={`h-status-badge${p.status === '정상' ? ' normal' : ' warn'}`}>{p.status}</span>
              </span>
              <span className="h-table-chevron">›</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default PatientsPage
