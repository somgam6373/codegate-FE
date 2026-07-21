import { useEffect, useMemo, useState } from 'react'
import { createHospitalSlot, getHospitalMe, updateHospitalMe } from '../../api/hospital'
import { useToast } from '../../context/ToastContext'
import { HospitalHeader } from './HospitalLayout'
import { buildCalendarCells, weekdayLabels, type ClinicSubject, type WeeklyHours } from './hospitalData'

const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일']

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// 09:00~18:00 같은 운영 시간 범위를 슬롯 등록에 필요한 정시 startTime 목록으로 쪼갠다
function hoursBetween(start: string, end: string): string[] {
  const startHour = Number(start.split(':')[0])
  const endHour = Number(end.split(':')[0])
  const hours: string[] = []
  for (let h = startHour; h < endHour; h++) hours.push(`${String(h).padStart(2, '0')}:00`)
  return hours
}

// 요일 토글은 반복 설정이 아니라 "이번 주" 실제 날짜에 슬롯을 등록하는 용도라 이번 주 월~금 기준으로 계산한다
function getDateForWeekdayThisWeek(day: string): string {
  const idx = DAY_ORDER.indexOf(day)
  const today = new Date()
  const daysSinceMonday = today.getDay() === 0 ? 6 : today.getDay() - 1
  const target = new Date(today)
  target.setDate(today.getDate() - daysSinceMonday + idx)
  return formatDate(target.getFullYear(), target.getMonth(), target.getDate())
}

async function registerSlotsForAllSubjects(subjects: ClinicSubject[], date: string, start: string, end: string) {
  const hours = hoursBetween(start, end)
  await Promise.all(
    subjects.flatMap((s) => hours.map((startTime) => createHospitalSlot({ department: s.name, date, startTime }))),
  )
}

function parseSubjects(raw: string): ClinicSubject[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name, i) => ({ id: `sub-${i}`, name }))
}

// "월-금 09:00-18:00" 같은 자유 텍스트를 요일별 운영 시간 표로 변환한다
function parseAvailableTime(raw: string): WeeklyHours[] {
  const timeMatch = raw.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
  const [start, end] = timeMatch ? [timeMatch[1], timeMatch[2]] : ['09:00', '18:00']
  const dayPart = (timeMatch ? raw.slice(0, timeMatch.index) : raw).trim()

  const openDays = new Set<string>()
  if (dayPart.includes('-')) {
    const [from, to] = dayPart.split('-').map((s) => s.trim())
    const fromIdx = DAY_ORDER.indexOf(from)
    const toIdx = DAY_ORDER.indexOf(to)
    if (fromIdx !== -1 && toIdx !== -1) {
      for (let i = fromIdx; i <= toIdx; i++) openDays.add(DAY_ORDER[i])
    }
  } else {
    dayPart.split(/[,\s]+/).forEach((d) => {
      if (DAY_ORDER.includes(d)) openDays.add(d)
    })
  }

  return DAY_ORDER.map((day) => ({
    day,
    open: openDays.has(day),
    start: openDays.has(day) ? start : '-',
    end: openDays.has(day) ? end : '-',
  }))
}

function formatAvailableTime(hours: WeeklyHours[]): string {
  const open = hours.filter((h) => h.open)
  if (open.length === 0) return ''

  const openDayIdx = open.map((h) => DAY_ORDER.indexOf(h.day)).sort((a, b) => a - b)
  const isContiguous = openDayIdx.every((idx, i) => idx === openDayIdx[0] + i)
  const dayLabel =
    isContiguous && openDayIdx.length > 1
      ? `${DAY_ORDER[openDayIdx[0]]}-${DAY_ORDER[openDayIdx[openDayIdx.length - 1]]}`
      : open.map((h) => h.day).join(',')

  return `${dayLabel} ${open[0].start}-${open[0].end}`
}

function TimeModal({
  year,
  month,
  day,
  subjects,
  onClose,
}: {
  year: number
  month: number
  day: number
  subjects: ClinicSubject[]
  onClose: () => void
}) {
  const showToast = useToast()
  const [available, setAvailable] = useState(true)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('18:00')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!available) {
      onClose()
      return
    }
    setSaving(true)
    try {
      await registerSlotsForAllSubjects(subjects, formatDate(year, month, day), start, end)
      showToast('진료 가능 시간이 등록되었어요', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '슬롯 등록에 실패했어요', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-modal-backdrop" onClick={onClose}>
      <div className="h-modal" onClick={(e) => e.stopPropagation()}>
        <div className="h-modal-header">
          <div className="h-modal-title">{month + 1}월 {day}일 진료 시간</div>
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
              step={3600}
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
              step={3600}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              disabled={!available}
            />
          </div>
        </div>
        <div className="h-modal-actions">
          <button type="button" className="h-btn h-btn-ghost" onClick={onClose} disabled={saving}>
            취소
          </button>
          <button type="button" className="h-btn h-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '등록 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  const showToast = useToast()
  const today = useMemo(() => new Date(), [])
  const cells = useMemo(() => buildCalendarCells(today.getFullYear(), today.getMonth()), [today])
  const [modalDay, setModalDay] = useState<number | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [subjects, setSubjects] = useState<ClinicSubject[]>([])
  const [addingSubject, setAddingSubject] = useState(false)
  const [newSubject, setNewSubject] = useState('')

  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getHospitalMe()
      .then((me) => {
        setName(me.hospitalName)
        setAddress(me.hospitalLocation)
        setSubjects(parseSubjects(me.medicalSubjects))
        setWeeklyHours(parseAvailableTime(me.availableTime))
      })
      .catch((err) => showToast(err instanceof Error ? err.message : '병원 정보 조회에 실패했어요', 'error'))
  }, [showToast])

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

  async function toggleDay(day: string) {
    let updated: WeeklyHours | undefined
    setWeeklyHours((prev) =>
      prev.map((h) => {
        if (h.day !== day) return h
        const open = !h.open
        updated = {
          day,
          open,
          start: open && h.start === '-' ? '09:00' : h.start,
          end: open && h.end === '-' ? '18:00' : h.end,
        }
        return updated
      }),
    )

    if (!updated?.open || DAY_ORDER.indexOf(day) >= 5) return
    try {
      const date = getDateForWeekdayThisWeek(day)
      await registerSlotsForAllSubjects(subjects, date, updated.start, updated.end)
      showToast(`이번 주 ${day}요일 진료 시간이 등록되었어요`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '슬롯 등록에 실패했어요', 'error')
    }
  }

  function updateHour(day: string, field: 'start' | 'end', value: string) {
    setWeeklyHours((prev) => prev.map((h) => (h.day === day ? { ...h, [field]: value } : h)))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateHospitalMe({
        hospitalName: name,
        hospitalLocation: address,
        availableTime: formatAvailableTime(weeklyHours),
        medicalSubjects: subjects.map((s) => s.name).join(', '),
      })
      showToast('병원 정보가 저장되었어요', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '병원 정보 저장에 실패했어요', 'error')
    } finally {
      setSaving(false)
    }
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
                <input
                  className="h-field-input"
                  placeholder="전화번호를 입력하세요"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" className="h-btn h-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {modalDay != null && (
        <TimeModal
          year={today.getFullYear()}
          month={today.getMonth()}
          day={modalDay}
          subjects={subjects}
          onClose={() => setModalDay(null)}
        />
      )}
    </>
  )
}

export default SettingsPage
