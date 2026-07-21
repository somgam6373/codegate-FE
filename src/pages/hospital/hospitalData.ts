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

