import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMedicalFileOcrResult, type MedicalFileOcrResult } from '../../api/medicalFiles'
import BottomSheet from '../../components/patient/public/BottomSheet'
import Card from '../../components/patient/ui/Card'
import SectionTitle from '../../components/patient/ui/SectionTitle'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

interface RecommendedHospital {
  rank: number
  name: string
  department: string
  distance: string
  rating: string
  tags: string[]
  featured?: boolean
}

interface Metric {
  label: string
  percent: number | null
}

const RECOMMENDED_HOSPITALS: RecommendedHospital[] = [
  {
    rank: 1,
    name: '서울내과의원',
    department: '내과',
    distance: '0.4km',
    rating: '4.8',
    tags: ['검진 상담', '거리 가까움', '당일 예약'],
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

function AiReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const showToast = useToast()
  const [showHospitals, setShowHospitals] = useState(false)
  const [result, setResult] = useState<MedicalFileOcrResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !id) return

    let cancelled = false
    let timer: number | undefined

    async function load() {
      try {
        const next = await getMedicalFileOcrResult(token!, id!)
        if (cancelled) return
        setResult(next)
        setLoading(false)

        if (next.status === 'PENDING' || next.status === 'PROCESSING') {
          timer = window.setTimeout(load, 3000)
        }
      } catch (error) {
        if (cancelled) return
        setLoading(false)
        showToast(error instanceof Error ? error.message : 'AI 분석 결과를 불러오지 못했습니다.', 'error')
      }
    }

    void load()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [id, showToast, token])

  const metrics = useMemo<Metric[]>(
    () => [
      { label: '혈압', percent: result?.bloodPressureScorePercent ?? null },
      { label: '혈당', percent: result?.bloodSugarScorePercent ?? null },
      { label: '간수치(감마GTP)', percent: result?.gammaGtpScorePercent ?? null },
    ],
    [result],
  )

  const riskPercent = useMemo(() => {
    const values = metrics.map((metric) => metric.percent).filter((value): value is number => value !== null)
    if (values.length === 0) return 0
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  }, [metrics])

  const statusLabel =
    result?.status === 'COMPLETED'
      ? 'AI 요약'
      : result?.status === 'FAILED'
        ? '분석 실패'
        : result?.status === 'PROCESSING'
          ? '분석 중'
          : '분석 대기'

  const summary =
    result?.status === 'FAILED'
      ? (result.errorMessage ?? 'AI 분석 중 오류가 발생했습니다.')
      : (result?.summary ?? 'OCR과 Claude 분석이 진행 중입니다. 완료되면 이 화면에 자동으로 표시됩니다.')

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
          <span className="text-[13px] font-semibold text-[#a9dcc9]">건강검진결과지 AI 분석</span>
        </div>
        <div className="mb-1.5 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="#7bf0c4">
            <path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14 8.4 9.6 4 8l4.4-1.6z" />
          </svg>
          <span className="text-[13px] font-bold text-[#7bf0c4]">{statusLabel}</span>
        </div>
        <p className="text-[19px] leading-[1.45] font-extrabold">
          {loading ? 'AI 분석 결과를 불러오는 중입니다.' : summary}
        </p>
      </div>

      <main className="flex-1 px-5.5 pt-4.5 pb-6">
        <Card className="mb-3.5">
          <p className="mb-3 text-sm font-bold text-ink">종합 위험도</p>
          <div
            className="relative h-3 rounded-full"
            style={{ background: 'linear-gradient(90deg, #43c78a, #f5c869, #e8705a)' }}
          >
            <div
              className="border-ink absolute top-[-4px] h-5 w-5 -translate-x-1/2 rounded-full border-[3px] bg-white"
              style={{ left: `${riskPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-ink-faint">
            <span>양호</span>
            <span className="text-[#c98a1e]">보통</span>
            <span>위험</span>
          </div>
        </Card>

        <SectionTitle>주요 수치 · 평균 대비 나쁨 정도</SectionTitle>
        <div className="flex flex-col gap-3">
          {metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <Card padding="sm" className="flex-1">
            <p className="mb-2 text-[13px] font-bold text-primary-text">식단</p>
            <p className="text-[13px] leading-relaxed text-[#2b3a33]">
              {result?.recommendedFood ?? '분석 완료 후 추천 식단이 표시됩니다.'}
            </p>
          </Card>
          <Card padding="sm" className="flex-1">
            <p className="mb-2 text-[13px] font-bold text-primary-text">운동</p>
            <p className="text-[13px] leading-relaxed text-[#2b3a33]">
              {result?.recommendedExercise ?? '분석 완료 후 추천 운동이 표시됩니다.'}
            </p>
          </Card>
        </div>

        <div className="mt-4 rounded-2xl bg-primary-deep p-4.5 text-white shadow-[0_14px_30px_-16px_rgba(11,107,80,0.55)]">
          <p className="mb-1 text-sm font-bold">분석 기반 병원 추천</p>
          <p className="mb-3.5 text-xs text-[#bfe6d6]">검진 결과 상담에 적합한 병원 3곳</p>
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
            <b className="font-extrabold">건강검진 분석</b> 결과 상담 기준으로 추천했어요
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

function MetricCard({ metric }: { metric: Metric }) {
  const percent = metric.percent
  const displayPercent = percent ?? 0
  const color = percent === null ? '#9aa8a0' : percent >= 70 ? '#e8705a' : percent >= 40 ? '#e0a23a' : '#43c78a'
  const note = percent === null ? 'OCR 텍스트에서 값을 찾지 못했습니다.' : averageNote(percent)

  return (
    <Card>
      <div className="mb-2 flex justify-between">
        <span className="text-sm font-bold text-ink">{metric.label}</span>
        <span className="text-sm font-extrabold" style={{ color }}>
          {percent === null ? '자료 없음' : `${percent}%`}
        </span>
      </div>
      <div className="relative h-2 rounded bg-[#eef2ef]">
        <div className="h-full rounded" style={{ width: `${displayPercent}%`, background: color }} />
        <div className="absolute top-[-3px] left-[50%] h-3.5 w-0.5 bg-ink-soft" />
      </div>
      <p className="mt-1.5 text-[11px] font-bold" style={{ color }}>
        {note}
      </p>
    </Card>
  )
}

function averageNote(percent: number) {
  if (percent >= 70) return '평균 대비 관리가 필요한 수준입니다.'
  if (percent >= 40) return '평균 대비 보통 수준입니다.'
  return '평균 대비 양호한 수준입니다.'
}

export default AiReportPage
