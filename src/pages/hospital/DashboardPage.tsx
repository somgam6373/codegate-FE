import { useEffect, useMemo, useState } from 'react'
import { getHospitalReservations } from '../../api/hospital'
import { useToast } from '../../context/ToastContext'
import { HospitalHeader } from './HospitalLayout'
import { MON_FIRST_DAYS, daysSinceMonday, todayDateString, useHospitalTodayStats } from './hospitalData'

const CLOSED_STATUSES = ['REJECTED', 'PATIENT_CANCELED', 'HOSPITAL_CANCELED']

const CHART_X = [30, 118, 206, 294, 382, 470, 545]

function weekdayIndexOf(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return daysSinceMonday(new Date(y, m - 1, d))
}

function startOfWeek(date: Date): Date {
  const monday = new Date(date)
  monday.setDate(date.getDate() - daysSinceMonday(date))
  return monday
}

function DashboardPage() {
  const showToast = useToast()
  const stats = useHospitalTodayStats((msg) => showToast(msg, 'error'))
  const [weeklyCounts, setWeeklyCounts] = useState<number[]>(Array(7).fill(0))

  const schedule = useMemo(
    () => [...stats.todayReservations].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [stats.todayReservations],
  )

  useEffect(() => {
    const monday = startOfWeek(new Date())
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    getHospitalReservations({ fromDate: todayDateString(monday), toDate: todayDateString(sunday), size: 200 })
      .then((page) => {
        const counts = Array(7).fill(0)
        for (const r of page.content) counts[weekdayIndexOf(r.date)]++
        setWeeklyCounts(counts)
      })
      .catch((err) => showToast(err instanceof Error ? err.message : '주간 예약 추이를 불러오지 못했어요', 'error'))
  }, [showToast])

  const maxCount = Math.max(...weeklyCounts, 1)
  const chartPoints = CHART_X.map((x, i) => `${x},${170 - (weeklyCounts[i] / maxCount) * 130}`)
  const linePoints = chartPoints.join(' ')
  const areaPoints = `${linePoints} ${CHART_X[6]},170 ${CHART_X[0]},170`
  const [todayX, todayY] = chartPoints[daysSinceMonday(new Date())].split(',').map(Number)

  return (
    <>
      <HospitalHeader title="대시보드" subtitle="병원 운영 현황 요약" />
      <div className="h-content">
        <div className="h-stat-grid">
          <div className="h-card h-stat-card">
            <div className="h-stat-label">오늘 예약</div>
            <div className="h-stat-value">
              {schedule.length}
              <span className="h-stat-unit">건</span>
            </div>
          </div>
          <div className="h-card h-stat-card">
            <div className="h-stat-label">등록 환자</div>
            <div className="h-stat-value">
              {stats.patientCount.toLocaleString()}
              <span className="h-stat-unit">명</span>
            </div>
          </div>
          <div className="h-card h-stat-card pending">
            <div className="h-stat-label warn">승인 대기</div>
            <div className="h-stat-value">
              {stats.pendingCount}
              <span className="h-stat-unit">건</span>
            </div>
          </div>
          <div className="h-card h-stat-card">
            <div className="h-stat-label">진료 완료</div>
            <div className="h-stat-value success">
              {stats.completedCount}
              <span className="h-stat-unit">건</span>
            </div>
          </div>
        </div>

        <div className="h-dash-grid">
          <div className="h-card h-panel">
            <div className="h-panel-title">주간 예약 추이</div>
            <svg viewBox="0 0 560 200" style={{ width: '100%', height: 210 }}>
              <line x1="0" y1="20" x2="560" y2="20" stroke="#eef2ef" />
              <line x1="0" y1="70" x2="560" y2="70" stroke="#eef2ef" />
              <line x1="0" y1="120" x2="560" y2="120" stroke="#eef2ef" />
              <line x1="0" y1="170" x2="560" y2="170" stroke="#e2e9e5" />
              <polyline
                points={linePoints}
                fill="none"
                stroke="#12a67a"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon points={areaPoints} fill="#12a67a" opacity={0.08} />
              <circle cx={todayX} cy={todayY} r={5} fill="#12a67a" />
              <g fontSize={14} fill="#9aa8a0" fontFamily="'IBM Plex Sans KR'">
                {MON_FIRST_DAYS.map((label, i) => (
                  <text key={label} x={CHART_X[i] - 6} y="192">
                    {label}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          <div className="h-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="h-panel-header">오늘 진료 일정</div>
            <div className="h-timeline">
              {schedule.length === 0 && (
                <p style={{ padding: '16px 20px', color: 'var(--h-text-sub)', fontSize: 15 }}>
                  오늘 예약된 진료가 없어요
                </p>
              )}
              {schedule.map((item) => {
                const isDone = CLOSED_STATUSES.includes(item.status)
                return (
                  <div key={item.reservationId} className={`h-timeline-row${isDone ? ' done' : ''}`}>
                    <div className="h-timeline-time">{item.startTime}</div>
                    <div className="h-timeline-line">
                      <span className="h-timeline-dot" />
                      <div className="h-timeline-name">{item.patientName}</div>
                      <div className={`h-timeline-state${isDone ? ' done' : ''}`}>{item.statusLabel}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
