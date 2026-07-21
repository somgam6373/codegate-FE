import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomSheet from '../../components/patient/public/BottomSheet'

interface RecommendedHospital {
  rank: number
  name: string
  department: string
  distance: string
  rating: string
  tags: string[]
  featured?: boolean
}

const RECOMMENDED_HOSPITALS: RecommendedHospital[] = [
  {
    rank: 1,
    name: '서울내과의원',
    department: '내과',
    distance: '0.4km',
    rating: '4.8',
    tags: ['고지혈증 전문', '거리 가까움', '당일 예약'],
    featured: true,
  },
  {
    rank: 2,
    name: '건강드림내과',
    department: '내과',
    distance: '1.2km',
    rating: '4.9',
    tags: ['만성질환 관리', '높은 평점'],
  },
  {
    rank: 3,
    name: '해맑은가정의학과',
    department: '가정의학과',
    distance: '0.9km',
    rating: '4.6',
    tags: ['종합 검진'],
  },
]

interface Metric {
  label: string
  value: string
  valueColor: string
  percent: number
  barColor: string
  note: string
  noteColor: string
}

const REPORT = {
  title: '2025 상반기 건강검진 분석',
  summary: '경계성 고지혈증이 의심됩니다. 종합 위험도는 보통 수준이에요.',
  riskPercent: 52,
  metrics: [
    {
      label: '총콜레스테롤',
      value: '214 mg/dL',
      valueColor: '#c98a1e',
      percent: 75,
      barColor: '#e0a23a',
      note: '평균 190 대비 +24 높음',
      noteColor: '#c98a1e',
    },
    {
      label: '혈압',
      value: '118/76',
      valueColor: '#0b7d5c',
      percent: 45,
      barColor: '#43c78a',
      note: '평균 이하 · 정상',
      noteColor: '#0b7d5c',
    },
  ] satisfies Metric[],
  diet: '포화지방·튀김 줄이고 등푸른 생선·채소 늘리기',
  exercise: '주 4회 30분 이상 빠르게 걷기 권장',
  hospitalNote: '고지혈증 진료에 적합한 병원 3곳',
}

function AiReportPage() {
  const navigate = useNavigate()
  const [showHospitals, setShowHospitals] = useState(false)

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-onboarding-bg">
      <div
        className="px-6 pt-1.5 pb-[26px] text-white"
        style={{ background: 'linear-gradient(160deg, var(--color-primary-deep), #0a5540)' }}
      >
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cursor-pointer text-2xl transition-transform duration-200 active:scale-90"
          >
            ‹
          </button>
          <span className="text-[13px] font-semibold text-[#a9dcc9]">{REPORT.title}</span>
        </div>
        <div className="mb-1.5 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="#7bf0c4">
            <path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14 8.4 9.6 4 8l4.4-1.6z" />
          </svg>
          <span className="text-[13px] font-bold text-[#7bf0c4]">AI 요약</span>
        </div>
        <p className="text-[19px] leading-[1.45] font-extrabold">{REPORT.summary}</p>
      </div>

      <main className="flex-1 px-5.5 pt-4.5 pb-6">
        <div className="mb-3.5 rounded-[22px] border border-black/[0.04] bg-white p-4.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]">
          <p className="mb-3 text-sm font-bold text-ink">종합 위험도</p>
          <div
            className="relative h-3 rounded-full"
            style={{ background: 'linear-gradient(90deg, #43c78a, #f5c869, #e8705a)' }}
          >
            <div
              className="border-ink absolute top-[-4px] h-5 w-5 -translate-x-1/2 rounded-full border-[3px] bg-white"
              style={{ left: `${REPORT.riskPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-ink-faint">
            <span>양호</span>
            <span className="text-[#c98a1e]">보통</span>
            <span>위험</span>
          </div>
        </div>

        <h2 className="mt-1.5 mb-3 px-0.5 text-[15px] font-extrabold text-ink">주요 수치 · 또래 평균 비교</h2>
        <div className="flex flex-col gap-3">
          {REPORT.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[22px] border border-black/[0.04] bg-white p-4.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]"
            >
              <div className="mb-2 flex justify-between">
                <span className="text-sm font-bold text-ink">{m.label}</span>
                <span className="text-sm font-extrabold" style={{ color: m.valueColor }}>
                  {m.value}
                </span>
              </div>
              <div className="relative h-2 rounded bg-[#eef2ef]">
                <div className="h-full rounded" style={{ width: `${m.percent}%`, background: m.barColor }} />
                <div className="absolute top-[-3px] left-[60%] h-3.5 w-0.5 bg-ink-soft" />
              </div>
              <p className="mt-1.5 text-[11px] font-bold" style={{ color: m.noteColor }}>
                {m.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-[22px] border border-black/[0.04] bg-white p-4 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]">
            <p className="mb-2 text-[13px] font-bold text-primary-text">식단</p>
            <p className="text-[13px] leading-relaxed text-[#2b3a33]">{REPORT.diet}</p>
          </div>
          <div className="flex-1 rounded-[22px] border border-black/[0.04] bg-white p-4 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]">
            <p className="mb-2 text-[13px] font-bold text-primary-text">운동</p>
            <p className="text-[13px] leading-relaxed text-[#2b3a33]">{REPORT.exercise}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-primary-deep p-4.5 text-white shadow-[0_14px_30px_-16px_rgba(11,107,80,0.55)]">
          <p className="mb-1 text-sm font-bold">분석 기반 병원 추천</p>
          <p className="mb-3.5 text-xs text-[#bfe6d6]">{REPORT.hospitalNote}</p>
          <button
            type="button"
            onClick={() => setShowHospitals(true)}
            className="w-full cursor-pointer rounded-xl bg-white py-3.5 text-[15px] font-extrabold text-primary-text transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
          >
            추천 병원 보기
          </button>
        </div>
      </main>

      <BottomSheet open={showHospitals} onClose={() => setShowHospitals(false)} title="추천 병원">
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-primary-bg px-4.5 py-3.5">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="#0b7d5c" className="shrink-0">
            <path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14 8.4 9.6 4 8l4.4-1.6z" />
          </svg>
          <p className="text-[13px] leading-snug font-semibold text-[#0b6b50]">
            <b className="font-extrabold">경계성 고지혈증</b> 분석 결과에 맞춰 추천했어요
          </p>
        </div>

        <div className="flex flex-col gap-3 pb-6">
          {RECOMMENDED_HOSPITALS.map((h) => (
            <div
              key={h.name}
              className={`rounded-[22px] bg-white p-4.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)] transition-shadow duration-200 hover:shadow-[0_14px_28px_-16px_rgba(20,35,29,0.4)] ${
                h.featured ? 'border-2 border-primary-deep' : 'border border-black/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ${
                    h.featured ? 'bg-primary-deep text-white' : 'bg-[#dbe6e0] text-ink-soft'
                  }`}
                >
                  {h.rank}
                </span>
                <div className="flex-1">
                  <p className="text-[17px] font-extrabold text-ink">{h.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {h.department} · {h.distance} · ★ {h.rating}
                  </p>
                </div>
                {!h.featured && <span className="text-xl text-[#c3cec8]">›</span>}
              </div>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {h.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                      h.featured ? 'bg-primary-bg text-primary-text' : 'bg-[#f0f5f2] text-ink-soft'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {h.featured && (
                <button
                  type="button"
                  onClick={() => navigate('/reservation')}
                  className="mt-3.5 w-full cursor-pointer rounded-xl bg-primary py-3 text-[15px] font-bold text-white transition-all duration-200 hover:bg-primary-deep active:scale-[0.98]"
                >
                  예약하기
                </button>
              )}
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}

export default AiReportPage
