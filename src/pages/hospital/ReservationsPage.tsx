import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HospitalHeader } from './HospitalLayout'
import { buildCalendarCells, pendingReservations, weekdayLabels } from './hospitalData'

function ReservationsPage() {
  const navigate = useNavigate()
  const [monthOffset, setMonthOffset] = useState(0)
  const [resolvedIds, setResolvedIds] = useState<Record<string, true>>({})
  const cells = useMemo(() => buildCalendarCells(), [])

  const monthLabel = monthOffset === 0 ? '2026년 7월' : monthOffset > 0 ? '2026년 8월' : '2026년 6월'
  const visiblePending = pendingReservations.filter((r) => !resolvedIds[r.id])
  const pendingCount = visiblePending.length

  function resolve(id: string) {
    setResolvedIds((prev) => ({ ...prev, [id]: true }))
  }

  function openPatient(pid: string) {
    navigate(`/hospital/patients?pid=${encodeURIComponent(pid)}`)
  }

  return (
    <>
      <HospitalHeader title="예약 관리" subtitle="2026년 7월 21일 화요일" />
      <div className="h-content">
        <div className="h-stat-grid">
          <div className="h-card h-stat-card">
            <div className="h-stat-label">오늘 예약</div>
            <div className="h-stat-value">
              24<span className="h-stat-unit">건</span>
            </div>
          </div>
          <div className="h-card h-stat-card pending">
            <div className="h-stat-label warn">승인 대기</div>
            <div className="h-stat-value">
              {pendingCount}
              <span className="h-stat-unit">건</span>
            </div>
          </div>
          <div className="h-card h-stat-card">
            <div className="h-stat-label">진료 완료</div>
            <div className="h-stat-value success">
              15<span className="h-stat-unit">건</span>
            </div>
          </div>
          <div className="h-card h-stat-card">
            <div className="h-stat-label">취소·거절</div>
            <div className="h-stat-value">
              3<span className="h-stat-unit">건</span>
            </div>
          </div>
        </div>

        <div className="h-res-grid">
          <div className="h-card h-panel">
            <div className="h-cal-header">
              <button type="button" className="h-cal-arrow" onClick={() => setMonthOffset((m) => m - 1)} aria-label="이전 달">
                ‹
              </button>
              <div className="h-cal-title">{monthLabel}</div>
              <button type="button" className="h-cal-arrow" onClick={() => setMonthOffset((m) => m + 1)} aria-label="다음 달">
                ›
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', background: '#eef2ef', borderRadius: 11, padding: 4 }}>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    background: '#fff',
                    color: '#14231d',
                    padding: '7px 18px',
                    borderRadius: 8,
                    boxShadow: '0 1px 2px rgba(0,0,0,.06)',
                  }}
                >
                  월
                </span>
                <span style={{ fontSize: 17, fontWeight: 600, color: '#7c8c83', padding: '7px 18px' }}>주</span>
              </div>
            </div>
            <div className="h-cal-weekday-row">
              {weekdayLabels.map((label, i) => (
                <span key={label} className={`h-cal-weekday${i === 0 ? ' sun' : ''}${i === 6 ? ' sat' : ''}`}>
                  {label}
                </span>
              ))}
            </div>
            <div className="h-cal-grid">
              {cells.map((cell, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={cell.day == null}
                  className={`h-cal-cell${cell.isToday ? ' today' : ''}`}
                >
                  {cell.day != null && (
                    <>
                      <span className="h-cal-num">{cell.day}</span>
                      {cell.hasBadge && <span className="h-cal-badge">{cell.badgeCount}</span>}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="h-panel-header">
              <span>승인 대기 요청</span>
              <span className="h-pending-badge">{pendingCount}건 대기</span>
            </div>
            <div className="h-pending-list">
              {visiblePending.map((res) => (
                <div key={res.id} className="h-pending-item">
                  <div className="h-pending-row" onClick={() => openPatient(res.detail.pid)}>
                    <div className="h-pending-initial">{res.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="h-pending-name">
                        {res.name} <span className="h-pending-meta">{res.meta}</span>
                      </div>
                      <div className="h-pending-dept">
                        {res.dept} · {res.slot}
                      </div>
                    </div>
                  </div>
                  <div className="h-pending-actions">
                    <button
                      type="button"
                      className="h-btn h-btn-reject"
                      onClick={(e) => {
                        e.stopPropagation()
                        resolve(res.id)
                      }}
                    >
                      거절
                    </button>
                    <button
                      type="button"
                      className="h-btn h-btn-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        resolve(res.id)
                      }}
                    >
                      승인
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReservationsPage
