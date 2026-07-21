export interface PatientDetail {
  initial: string
  name: string
  pid: string
  age: string
  ageOnly: string
  sex: string
  birth: string
  phone: string
  doctor: string
  date: string
  time: string
  symptom: string
  history: string
  allergy: string
  memo: string
  status: string
}

export interface Patient {
  initial: string
  name: string
  ageShort: string
  visit: string
  metric: string
  status: '정상' | '주의'
  detail: PatientDetail
}

export interface PendingReservation {
  id: string
  initial: string
  name: string
  meta: string
  dept: string
  slot: string
  detail: PatientDetail
}

export interface TodaySchedule {
  time: string
  name: string
  age: string
  state: '완료' | '진료 중' | '대기'
  note?: string
}

const detailBase: PatientDetail = {
  initial: '김',
  name: '김민준',
  pid: 'P-20260721-001',
  age: '42세 · 남',
  ageOnly: '42세',
  sex: '남',
  birth: '1984.03.12',
  phone: '010-2345-6789',
  doctor: '박정형 (정형외과)',
  date: '2026.07.21 (화)',
  time: '09:00',
  symptom: '우측 무릎 통증 및 부종. 2주 전 등산 중 부상.',
  history: '2023년 좌측 반월상 연골 파열 수술',
  allergy: '페니실린',
  memo: '우측 슬관절 MRI 상 반월상 연골 부분 손상 소견. 추가 정밀 판독 요망.',
  status: '예약 승인됨',
}

function detail(overrides: Partial<PatientDetail>): PatientDetail {
  return { ...detailBase, ...overrides }
}

export const pendingReservations: PendingReservation[] = [
  {
    id: 'res-1',
    initial: '김',
    name: '김민준',
    meta: '· 42세 남',
    dept: '정형외과',
    slot: '7/21 (화) 09:00',
    detail: detail({}),
  },
  {
    id: 'res-2',
    initial: '이',
    name: '이서연',
    meta: '· 33세 여',
    dept: '내과',
    slot: '7/23 (수) 11:00',
    detail: detail({
      name: '이서연',
      initial: '이',
      pid: 'P-20260723-014',
      age: '33세 · 여',
      ageOnly: '33세',
      sex: '여',
      doctor: '박지현 (내과)',
      date: '2026.07.23 (수)',
      time: '11:00',
      symptom: '기침 및 미열 3일 지속.',
      history: '특이사항 없음',
      allergy: '없음',
      memo: '흉부 CT 상 특이 소견 없음. 경과 관찰 권장.',
    }),
  },
  {
    id: 'res-3',
    initial: '정',
    name: '정우진',
    meta: '· 58세 남',
    dept: '내과',
    slot: '7/24 (목) 14:00',
    detail: detail({
      name: '정우진',
      initial: '정',
      pid: 'P-20260724-021',
      age: '58세 · 남',
      ageOnly: '58세',
      sex: '남',
      doctor: '박지현 (내과)',
      date: '2026.07.24 (목)',
      time: '14:00',
      symptom: '공복혈당 상승, 피로감.',
      history: '2021년 고혈압 진단',
      allergy: '없음',
      memo: '혈당 재검사 및 당화혈색소 확인 필요.',
    }),
  },
  {
    id: 'res-4',
    initial: '최',
    name: '최유나',
    meta: '· 41세 여',
    dept: '내과',
    slot: '7/24 (목) 15:30',
    detail: detail({
      name: '최유나',
      initial: '최',
      pid: 'P-20260724-022',
      age: '41세 · 여',
      ageOnly: '41세',
      sex: '여',
      doctor: '박지현 (내과)',
      date: '2026.07.24 (목)',
      time: '15:30',
      symptom: '건강검진 후 콜레스테롤 상담 요청.',
      history: '특이사항 없음',
      allergy: '아스피린',
      memo: '지질 프로필 재확인 권장.',
    }),
  },
  {
    id: 'res-5',
    initial: '강',
    name: '강태오',
    meta: '· 29세 남',
    dept: '가정의학과',
    slot: '7/25 (금) 09:30',
    detail: detail({
      name: '강태오',
      initial: '강',
      pid: 'P-20260725-031',
      age: '29세 · 남',
      ageOnly: '29세',
      sex: '남',
      doctor: '이가정 (가정의학과)',
      date: '2026.07.25 (금)',
      time: '09:30',
      symptom: '건강검진 예약.',
      history: '특이사항 없음',
      allergy: '없음',
      memo: '기본 검진 항목 진행 예정.',
    }),
  },
  {
    id: 'res-6',
    initial: '윤',
    name: '윤소라',
    meta: '· 37세 여',
    dept: '내과',
    slot: '7/25 (금) 10:00',
    detail: detail({
      name: '윤소라',
      initial: '윤',
      pid: 'P-20260725-032',
      age: '37세 · 여',
      ageOnly: '37세',
      sex: '여',
      doctor: '박지현 (내과)',
      date: '2026.07.25 (금)',
      time: '10:00',
      symptom: '소화불량 및 복부 불편감.',
      history: '2022년 위염',
      allergy: '없음',
      memo: '복부 CT 판독 대기 중.',
    }),
  },
]

export const patients: Patient[] = [
  {
    initial: '김',
    name: '김민준',
    ageShort: '42세 · 남',
    visit: '2026.07.10',
    metric: '무릎 MRI 판독',
    status: '주의',
    detail: detail({}),
  },
  {
    initial: '이',
    name: '이서연',
    ageShort: '33세 · 여',
    visit: '2026.07.08',
    metric: '혈압 122/80',
    status: '정상',
    detail: detail({
      name: '이서연',
      initial: '이',
      pid: 'P-20260723-014',
      age: '33세 · 여',
      ageOnly: '33세',
      sex: '여',
      symptom: '기침 및 미열 3일 지속.',
      history: '특이사항 없음',
      allergy: '없음',
    }),
  },
  {
    initial: '정',
    name: '정우진',
    ageShort: '58세 · 남',
    visit: '2026.06.30',
    metric: '혈당 141',
    status: '주의',
    detail: detail({
      name: '정우진',
      initial: '정',
      pid: 'P-20260724-021',
      age: '58세 · 남',
      ageOnly: '58세',
      sex: '남',
      symptom: '공복혈당 상승, 피로감.',
      history: '2021년 고혈압 진단',
      allergy: '없음',
    }),
  },
  {
    initial: '최',
    name: '최유나',
    ageShort: '41세 · 여',
    visit: '2026.06.22',
    metric: '혈압 118/76',
    status: '정상',
    detail: detail({
      name: '최유나',
      initial: '최',
      pid: 'P-20260724-022',
      age: '41세 · 여',
      ageOnly: '41세',
      sex: '여',
      allergy: '아스피린',
    }),
  },
  {
    initial: '강',
    name: '강태오',
    ageShort: '29세 · 남',
    visit: '2026.06.15',
    metric: 'BMI 21.4',
    status: '정상',
    detail: detail({
      name: '강태오',
      initial: '강',
      pid: 'P-20260725-031',
      age: '29세 · 남',
      ageOnly: '29세',
      sex: '남',
      allergy: '없음',
    }),
  },
  {
    initial: '윤',
    name: '윤소라',
    ageShort: '37세 · 여',
    visit: '2026.06.02',
    metric: '콜레스테롤 205',
    status: '주의',
    detail: detail({
      name: '윤소라',
      initial: '윤',
      pid: 'P-20260725-032',
      age: '37세 · 여',
      ageOnly: '37세',
      sex: '여',
      history: '2022년 위염',
    }),
  },
  {
    initial: '한',
    name: '한지민',
    ageShort: '52세 · 여',
    visit: '2026.05.28',
    metric: '혈압 130/85',
    status: '정상',
    detail: detail({
      name: '한지민',
      initial: '한',
      pid: 'P-20260528-009',
      age: '52세 · 여',
      ageOnly: '52세',
      sex: '여',
      allergy: '없음',
    }),
  },
]

export const todaySchedule: TodaySchedule[] = [
  { time: '09:30', name: '한지민', age: '46세', state: '완료' },
  { time: '10:00', name: '오세훈', age: '52세', state: '완료' },
  { time: '10:30', name: '김민수', age: '46세', state: '진료 중', note: '고지혈증 경과' },
  { time: '11:00', name: '이서연', age: '33세', state: '대기' },
  { time: '11:30', name: '강태오', age: '29세', state: '대기' },
]

export interface CalendarCell {
  day: number | null
  hasBadge: boolean
  badgeCount?: number
  isToday?: boolean
}

const badgeCounts: Record<number, number> = {
  18: 4,
  19: 2,
  21: 7,
  22: 3,
  24: 2,
  25: 1,
  28: 4,
  30: 2,
}

export function buildCalendarCells(daysInMonth = 31, leadingBlanks = 2, todayDay = 21): CalendarCell[] {
  const cells: CalendarCell[] = []
  const totalCells = 35
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
      isToday: day === todayDay,
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

export const hospitalProfile = {
  name: '서울내과의원',
  phone: '02-1234-5678',
  address: '서울특별시 강남구 테헤란로 123',
}

export const defaultSubjects: ClinicSubject[] = [
  { id: 'sub-1', name: '내과' },
  { id: 'sub-2', name: '가정의학과' },
]

export const defaultWeeklyHours: WeeklyHours[] = [
  { day: '월', open: true, start: '09:00', end: '18:00' },
  { day: '화', open: true, start: '09:00', end: '18:00' },
  { day: '수', open: true, start: '09:00', end: '18:00' },
  { day: '목', open: true, start: '09:00', end: '18:00' },
  { day: '금', open: true, start: '09:00', end: '18:00' },
  { day: '토', open: true, start: '09:00', end: '13:00' },
  { day: '일', open: false, start: '-', end: '-' },
]
