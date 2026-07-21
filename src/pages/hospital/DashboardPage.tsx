import { HospitalHeader } from './HospitalLayout'
import { todaySchedule } from './hospitalData'

function DashboardPage() {
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
              {todaySchedule.map((item) => {
                const isActive = item.state === '진료 중'
                const isDone = item.state === '완료'
                return (
                  <div key={item.time} className={`h-timeline-row${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
                    <div className="h-timeline-time">{item.time}</div>
                    <div className="h-timeline-line">
                      <span className="h-timeline-dot" />
                      {isActive ? (
                        <div className="h-timeline-active-card">
                          <div className="h-timeline-name">
                            {item.name} · {item.age}
                          </div>
                          <div className="h-timeline-active-note">
                            진료 중{item.note ? ` · ${item.note}` : ''}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-timeline-name">
                            {item.name} · {item.age}
                          </div>
                          <div className={`h-timeline-state${isDone ? ' done' : ''}`}>{item.state}</div>
                        </>
                      )}
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
