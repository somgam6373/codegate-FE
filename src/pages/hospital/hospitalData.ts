import { useEffect, useState } from 'react'
import { getHospitalReservations } from '../../api/hospital'
import type { HospitalReservation } from '../../api/hospital'

export interface CalendarCell {
  day: number | null
  hasBadge: boolean
  badgeCount?: number
  isToday?: boolean
}

export function buildCalendarCells(year: number, month: number, badgeCounts: Record<number, number> = {}): CalendarCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = new Date(year, month, 1).getDay()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const totalCells = Math.ceil((daysInMonth + leadingBlanks) / 7) * 7
  const cells: CalendarCell[] = []
  for (let i = 0; i < totalCells; i++) {
    const day = i - leadingBlanks + 1
    if (day < 1 || day > daysInMonth) {
      cells.push({ day: null, hasBadge: false })
      continue
    }
    cells.push({
      day,
      hasBadge: day in badgeCounts,
      badgeCount: badgeCounts[day],
      isToday: isCurrentMonth && day === today.getDate(),
    })
  }
  return cells
}

export const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']
export const MON_FIRST_DAYS = ['월', '화', '수', '목', '금', '토', '일']

export interface ClinicSubject {
  id: string
  name: string
}

export interface WeeklyHours {
  day: string
  open: boolean
  start: string
  end: string
}

export function todayDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 일요일(0)을 주의 끝으로 보고 월요일 기준 0부터 시작하는 요일 오프셋으로 바꾼다
export function daysSinceMonday(date: Date): number {
  return date.getDay() === 0 ? 6 : date.getDay() - 1
}

const CLOSED_STATUSES: HospitalReservation['status'][] = ['REJECTED', 'PATIENT_CANCELED', 'HOSPITAL_CANCELED']

function nowTimeString(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export interface HospitalTodayStats {
  todayReservations: HospitalReservation[]
  pendingCount: number
  completedCount: number
  canceledCount: number
  patientCount: number
}

// 대시보드·예약관리 페이지 상단 통계 카드가 공유하는 데이터. 각 페이지는 필요한 필드만 골라 쓴다.
export function useHospitalTodayStats(onError?: (message: string) => void): HospitalTodayStats {
  const [stats, setStats] = useState<HospitalTodayStats>({
    todayReservations: [],
    pendingCount: 0,
    completedCount: 0,
    canceledCount: 0,
    patientCount: 0,
  })

  useEffect(() => {
    const today = todayDateString()
    Promise.all([
      getHospitalReservations({ fromDate: today, toDate: today, size: 200 }),
      getHospitalReservations({ status: 'REQUESTED', size: 1 }),
      getHospitalReservations({ size: 200 }),
    ])
      .then(([todayPage, pendingPage, recentPage]) => {
        const todayReservations = todayPage.content
        const now = nowTimeString()
        setStats({
          todayReservations,
          pendingCount: pendingPage.totalElements,
          completedCount: todayReservations.filter((r) => r.status === 'APPROVED' && r.endTime <= now).length,
          canceledCount: todayReservations.filter((r) => CLOSED_STATUSES.includes(r.status)).length,
          patientCount: new Set(recentPage.content.map((r) => r.patientId)).size,
        })
      })
      .catch((err) => onError?.(err instanceof Error ? err.message : '통계 조회에 실패했어요'))
  }, [])

  return stats
}

