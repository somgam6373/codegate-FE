import { useEffect, useState } from 'react'
import { getHospitalMe, getHospitalSlots } from '../../api/hospital'
import type { HospitalSlot, PageResponse } from '../../api/hospital'
import { useToast } from '../../context/ToastContext'
import { HospitalHeader } from './HospitalLayout'

const PAGE_SIZE = 20

function SlotsPage() {
  const showToast = useToast()
  const [date, setDate] = useState('')
  const [department, setDepartment] = useState('')
  const [departments, setDepartments] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse<HospitalSlot> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHospitalMe()
      .then((me) => setDepartments(me.medicalSubjects.split(',').map((s) => s.trim()).filter(Boolean)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getHospitalSlots({ date: date || undefined, department: department || undefined, page, size: PAGE_SIZE })
      .then(setData)
      .catch((err) => showToast(err instanceof Error ? err.message : '슬롯 조회에 실패했어요', 'error'))
      .finally(() => setLoading(false))
  }, [date, department, page, showToast])

  function handleDateChange(value: string) {
    setPage(0)
    setDate(value)
  }

  function handleDepartmentChange(value: string) {
    setPage(0)
    setDepartment(value)
  }

  const slots = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const isFirst = page <= 0
  const isLast = totalPages === 0 || page >= totalPages - 1

  return (
    <>
      <HospitalHeader title="슬롯 조회" subtitle="진료 가능 시간대 확인" />
      <div className="h-content">
        <div className="h-card" style={{ overflow: 'hidden' }}>
          <div className="h-list-header">
            <span className="h-list-title">예약 시간대</span>
            <span className="h-list-count">총 {(data?.totalElements ?? 0).toLocaleString()}건</span>
            <div className="h-filter-group">
              <input
                type="date"
                className="h-field-input"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{ width: 160 }}
              />
              <select
                className="h-field-input"
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                style={{ width: 140 }}
              >
                <option value="">전체 진료과</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-slot-head">
            <span>날짜</span>
            <span>요일</span>
            <span>시간</span>
            <span>진료과</span>
            <span>상태</span>
          </div>

          {loading ? (
            <p style={{ padding: '64px 0', textAlign: 'center', color: '#7c8c83' }}>불러오는 중이에요</p>
          ) : slots.length === 0 ? (
            <p style={{ padding: '64px 0', textAlign: 'center', color: '#7c8c83' }}>조회된 예약 시간대가 없어요</p>
          ) : (
            slots.map((slot) => (
              <div key={slot.slotId} className="h-slot-row">
                <span className="h-table-name">{slot.date}</span>
                <span className="h-table-sub">{slot.dayOfWeek}</span>
                <span className="h-table-sub">
                  {slot.startTime} - {slot.endTime}
                </span>
                <span className="h-table-sub">{slot.department}</span>
                <span>
                  <span className={`h-status-badge${slot.available ? ' normal' : ' warn'}`}>
                    {slot.available ? '예약 가능' : '예약됨'}
                  </span>
                </span>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '18px 0' }}>
              <button
                type="button"
                className="h-cal-arrow"
                onClick={() => setPage((p) => p - 1)}
                disabled={isFirst}
                style={isFirst ? { opacity: 0.4, cursor: 'default' } : undefined}
                aria-label="이전 페이지"
              >
                ‹
              </button>
              <span style={{ fontSize: 15, color: 'var(--h-text-sub)' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="h-cal-arrow"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLast}
                style={isLast ? { opacity: 0.4, cursor: 'default' } : undefined}
                aria-label="다음 페이지"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SlotsPage
