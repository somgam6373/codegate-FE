import { useEffect, useState } from 'react'
import { getDepartments, getDistricts } from '../../../../api/meta'
import type { MetaItem } from '../../../../api/meta'
import type { SearchHospitalsParams } from '../../../../api/hospitals'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function nextDates(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    const value = d.toISOString().slice(0, 10)
    const label = `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAY_LABELS[d.getDay()]})`
    return { label, value }
  })
}

const DATES = nextDates(4)
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)

function SelectHospital({ onFilterChange }: { onFilterChange: (params: SearchHospitalsParams) => void }) {
  const [departments, setDepartments] = useState<MetaItem[]>([])
  const [districts, setDistricts] = useState<MetaItem[]>([])
  const [department, setDepartment] = useState('')
  const [date, setDate] = useState(DATES[1].value)
  const [district, setDistrict] = useState('')
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')

  useEffect(() => {
    getDepartments().then((data) => {
      setDepartments(data)
      setDepartment(data[0]?.code ?? '')
    })
    getDistricts().then((data) => {
      setDistricts(data)
      setDistrict(data[0]?.code ?? '')
    })
  }, [])

  useEffect(() => {
    if (!district) return
    onFilterChange({
      district,
      department: department || undefined,
      date,
      fromTime: fromTime || undefined,
      toTime: toTime || undefined,
    })
  }, [district, department, date, fromTime, toTime, onFilterChange])

  return (
    <div className="rounded-[22px] border border-black/[0.04] bg-white p-4 shadow-[0_8px_20px_-14px_rgba(20,35,29,0.3)]">
      <div className="mb-3 flex gap-2.5">
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">지역구</div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={districts.length === 0}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink disabled:text-ink-faint"
          >
            {districts.length > 0 ? (
              districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))
            ) : (
              <option value="">지역구 정보 없음</option>
            )}
          </select>
        </label>
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">진료과목</div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink"
          >
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-3">
        <label>
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">날짜</div>
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink"
          >
            {DATES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2.5">
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">시작 시간</div>
          <select
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink"
          >
            <option value="">전체</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <div className="mb-1.5 text-xs font-semibold text-ink-muted">종료 시간</div>
          <select
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink"
          >
            <option value="">전체</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default SelectHospital
