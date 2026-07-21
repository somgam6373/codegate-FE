import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { approveReservation, getHospitalReservations, rejectReservation, type HospitalReservation } from '../../api/hospital'
import { useToast } from '../../context/ToastContext'
import { HospitalHeader } from './HospitalLayout'
import { buildCalendarCells, weekdayLabels } from './hospitalData'

function ReservationsPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [monthOffset, setMonthOffset] = useState(0)
  const [resolvedIds, setResolvedIds] = useState<Record<number, true>>({})
  const [pending, setPending] = useState<HospitalReservation[]>([])
  const [monthReservations, setMonthReservations] = useState<HospitalReservation[]>([])

  const today = new Date()
  const visibleMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const monthLabel = `${year}년 ${month + 1}월`

  const badgeCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const r of monthReservations) {
      if (r.status !== 'REQUESTED' && r.status !== 'APPROVED') continue
      const day = Number(r.date.split('-')[2])
      counts[day] = (counts[day] ?? 0) + 1
    }
    return counts
  }, [monthReservations])
  const cells = useMemo(() => buildCalendarCells(year, month, badgeCounts), [year, month, badgeCounts])

  const visiblePending = pending.filter((r) => !resolvedIds[r.reservationId])
  const pendingCount = visiblePending.length

  function fetchPending() {
    getHospitalReservations({ status: 'REQUESTED' })
      .then((res) => setPending(res.content))
      .catch((err) => showToast(err instanceof Error ? err.message : '승인 대기 요청 조회에 실패했어요', 'error'))
  }

  function fetchMonth() {
    const pad = (n: number) => String(n).padStart(2, '0')
    const fromDate = `${year}-${pad(month + 1)}-01`
    const toDate = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`
    getHospitalReservations({ fromDate, toDate, size: 200 })
      .then((res) => setMonthReservations(res.content))
      .catch((err) => showToast(err instanceof Error ? err.message : '예약 캘린더 조회에 실패했어요', 'error'))
  }

  useEffect(fetchPending, [showToast])
  useEffect(fetchMonth, [year, month, showToast])

  function resolve(id: number) {
    setResolvedIds((prev) => ({ ...prev, [id]: true }))
  }

  function handleApprove(id: number) {
    approveReservation(id)
      .then(() => {
        resolve(id)
        fetchMonth()
      })
      .catch((err) => showToast(err instanceof Error ? err.message : '예약 승인에 실패했어요', 'error'))
  }

  function handleReject(id: number) {
    rejectReservation(id)
      .then(() => {
        resolve(id)
        fetchMonth()
      })
      .catch((err) => showToast(err instanceof Error ? err.message : '예약 거절에 실패했어요', 'error'))
  }

  function openPatient(patientId: number) {
    navigate(`/hospital/patients?pid=${patientId}`)
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
                <div key={res.reservationId} className="h-pending-item">
                  <div className="h-pending-row" onClick={() => openPatient(res.patientId)}>
                    <div className="h-pending-initial">{res.patientName.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="h-pending-name">{res.patientName}</div>
                      <div className="h-pending-dept">
                        {res.department} · {res.date} {res.startTime}
                      </div>
                    </div>
                  </div>
                  <div className="h-pending-actions">
                    <button
                      type="button"
                      className="h-btn h-btn-reject"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReject(res.reservationId)
                      }}
                    >
                      거절
                    </button>
                    <button
                      type="button"
                      className="h-btn h-btn-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApprove(res.reservationId)
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
