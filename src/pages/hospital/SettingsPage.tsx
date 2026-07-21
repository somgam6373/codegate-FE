import { useMemo, useState } from 'react'
import { HospitalHeader } from './HospitalLayout'
import {
  buildCalendarCells,
  defaultSubjects,
  defaultWeeklyHours,
  hospitalProfile,
  weekdayLabels,
  type ClinicSubject,
  type WeeklyHours,
} from './hospitalData'

function TimeModal({ day, onClose }: { day: number; onClose: () => void }) {
  const [available, setAvailable] = useState(true)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('18:00')

  return (
    <div className="h-modal-backdrop" onClick={onClose}>
      <div className="h-modal" onClick={(e) => e.stopPropagation()}>
        <div className="h-modal-header">
          <div className="h-modal-title">7월 {day}일 진료 시간</div>
          <button type="button" className="h-modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="h-modal-hint">해당 날짜의 진료 가능 여부와 시간을 설정합니다</div>
        <div className="h-modal-toggle-row">
          <span>진료 가능</span>
          <button
            type="button"
            className={`h-hours-toggle${available ? ' on' : ''}`}
            onClick={() => setAvailable((v) => !v)}
            aria-label="진료 가능 여부"
          >
            <span className="h-hours-toggle-knob" />
          </button>
        </div>
        <div className="h-modal-times">
          <div className="h-modal-time-field">
            <div className="h-field-label">시작 시간</div>
            <input
              className="h-field-input"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              disabled={!available}
            />
          </div>
          <div className="h-modal-time-field">
            <div className="h-field-label">종료 시간</div>
            <input
              className="h-field-input"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              disabled={!available}
            />
          </div>
        </div>
        <div className="h-modal-actions">
          <button type="button" className="h-btn h-btn-ghost" onClick={onClose}>
            취소
          </button>
          <button type="button" className="h-btn h-btn-primary" onClick={onClose}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  const cells = useMemo(() => buildCalendarCells(), [])
  const [modalDay, setModalDay] = useState<number | null>(null)

  const [name, setName] = useState(hospitalProfile.name)
  const [phone, setPhone] = useState(hospitalProfile.phone)
  const [address, setAddress] = useState(hospitalProfile.address)

  const [subjects, setSubjects] = useState<ClinicSubject[]>(defaultSubjects)
  const [addingSubject, setAddingSubject] = useState(false)
  const [newSubject, setNewSubject] = useState('')

  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours[]>(defaultWeeklyHours)

  function removeSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  function confirmAddSubject() {
    const trimmed = newSubject.trim()
    if (trimmed) {
      setSubjects((prev) => [...prev, { id: `sub-${Date.now()}`, name: trimmed }])
    }
    setNewSubject('')
    setAddingSubject(false)
  }

  function toggleDay(day: string) {
    setWeeklyHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, open: !h.open } : h)),
    )
  }

  function updateHour(day: string, field: 'start' | 'end', value: string) {
    setWeeklyHours((prev) => prev.map((h) => (h.day === day ? { ...h, [field]: value } : h)))
  }

  return (
    <>
      <HospitalHeader title="진료 설정" subtitle="진료과목·일정 관리" hideSearch />
      <div className="h-content">
        <div className="h-settings-grid">
          <div className="h-card h-settings-card">
            <div className="h-settings-title">병원 정보</div>
            <div className="h-settings-hint">공동인증으로 등록된 기관 정보</div>
            <div className="h-field-group">
              <div>
                <div className="h-field-label">기관명</div>
                <input className="h-field-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <div className="h-field-label">대표 전화번호</div>
                <input className="h-field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <div className="h-field-label">주소</div>
                <input className="h-field-input" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <div className="h-field-label">진료과목</div>
                <div className="h-tag-group">
                  {subjects.map((s) => (
                    <button key={s.id} type="button" className="h-tag" onClick={() => removeSubject(s.id)}>
                      {s.name} ✕
                    </button>
                  ))}
                  {addingSubject ? (
                    <form
                      className="h-tag-add-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        confirmAddSubject()
                      }}
                    >
                      <input
                        autoFocus
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onBlur={confirmAddSubject}
                        placeholder="과목명"
                      />
                    </form>
                  ) : (
                    <button type="button" className="h-tag-add" onClick={() => setAddingSubject(true)}>
                      + 추가
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-card h-settings-card">
            <div className="h-settings-title">기본 운영 시간</div>
            <div className="h-settings-hint">요일별 진료 가능 여부와 기본 시간을 설정합니다</div>
            <div className="h-hours-table">
              {weeklyHours.map((h) => (
                <div key={h.day} className="h-hours-row">
                  <span className="h-hours-day">{h.day}</span>
                  <button
                    type="button"
                    className={`h-hours-toggle${h.open ? ' on' : ''}`}
                    onClick={() => toggleDay(h.day)}
                    aria-label={`${h.day}요일 진료 여부`}
                  >
                    <span className="h-hours-toggle-knob" />
                  </button>
                  {h.open ? (
                    <>
                      <span className="h-hours-time">
                        <input
                          type="time"
                          value={h.start}
                          onChange={(e) => updateHour(h.day, 'start', e.target.value)}
                        />
                      </span>
                      <span className="h-hours-time">
                        <input type="time" value={h.end} onChange={(e) => updateHour(h.day, 'end', e.target.value)} />
                      </span>
                    </>
                  ) : (
                    <span className="h-hours-time" style={{ gridColumn: 'span 2' }}>
                      휴진
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-card h-settings-card" style={{ gridColumn: '1 / -1' }}>
            <div className="h-settings-title">진료 가능 일정</div>
            <div className="h-settings-hint">날짜를 클릭하면 상세 진료 시간을 조정할 수 있습니다</div>
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
                  onClick={() => cell.day != null && setModalDay(cell.day)}
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
        </div>
      </div>

      {modalDay != null && <TimeModal day={modalDay} onClose={() => setModalDay(null)} />}
    </>
  )
}

export default SettingsPage
