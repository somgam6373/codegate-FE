import { useEffect, useState } from 'react'
import { getHospitalReservations } from '../../api/hospital'
import type { HospitalReservation } from '../../api/hospital'
import { useToast } from '../../context/ToastContext'
import { HospitalHeader } from './HospitalLayout'

const CLOSED_STATUSES: HospitalReservation['status'][] = ['REJECTED', 'PATIENT_CANCELED', 'HOSPITAL_CANCELED']

function todayDateString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function DashboardPage() {
  const showToast = useToast()
  const [schedule, setSchedule] = useState<HospitalReservation[]>([])

  useEffect(() => {
    const date = todayDateString()
    getHospitalReservations({ fromDate: date, toDate: date })
      .then((page) => setSchedule([...page.content].sort((a, b) => a.startTime.localeCompare(b.startTime))))
      .catch((err) => showToast(err instanceof Error ? err.message : '오늘 진료 일정을 불러오지 못했어요', 'error'))
  }, [showToast])

  return (
    <>
      <HospitalHeader title="대시보드" subtitle="병원 운영 현황 요약" />
      <div className="h-content">
        <div className="h-stat-grid">
          <div className="h-card h-stat-card">
            <div className="h-stat-label">오늘 예약</div>
            <div className="h-stat-value">
              24<span className="h-stat-unit">건</span>
            </div>
          </div>
          <div className="h-card h-stat-card">
            <div className="h-stat-label">등록 환자</div>
            <div className="h-stat-value">
              1,284<span className="h-stat-unit">명</span>
            </div>
          </div>
          <div className="h-card h-stat-card pending">
            <div className="h-stat-label warn">승인 대기</div>
            <div className="h-stat-value">
              6<span className="h-stat-unit">건</span>
            </div>
          </div>
          <div className="h-card h-stat-card">
            <div className="h-stat-label">진료 완료</div>
            <div className="h-stat-value success">
              15<span className="h-stat-unit">건</span>
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
                points="30,140 118,110 206,120 294,70 382,90 470,45 545,60"
                fill="none"
                stroke="#12a67a"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon points="30,140 118,110 206,120 294,70 382,90 470,45 545,60 545,170 30,170" fill="#12a67a" opacity={0.08} />
              <circle cx="470" cy="45" r="5" fill="#12a67a" />
              <g fontSize={14} fill="#9aa8a0" fontFamily="'IBM Plex Sans KR'">
                <text x="24" y="192">월</text>
                <text x="112" y="192">화</text>
                <text x="200" y="192">수</text>
                <text x="288" y="192">목</text>
                <text x="376" y="192">금</text>
                <text x="464" y="192">토</text>
                <text x="540" y="192">일</text>
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
