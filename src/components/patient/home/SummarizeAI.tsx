import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMedicalFileOcrResult, listMedicalFiles, type MedicalFileOcrResult } from '../../../api/medicalFiles'
import { useAuth } from '../../../context/AuthContext'

const METRICS: { key: keyof MedicalFileOcrResult; label: string }[] = [
  { key: 'bloodPressureScorePercent', label: '혈압' },
  { key: 'bloodSugarScorePercent', label: '혈당' },
  { key: 'gammaGtpScorePercent', label: '간수치(감마GTP)' },
]

const DEFAULT_MESSAGE = '건강검진결과지를 등록하고\nAI 분석을 받아보세요'

function SummarizeAI() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [tone, setTone] = useState<'warning' | 'healthy' | 'default'>('default')
  const [reportId, setReportId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    async function load() {
      const files = await listMedicalFiles(token as string)
      const latest = files.filter((f) => f.type === 'CHECKUP_RESULT').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
      if (!latest) return

      const result = await getMedicalFileOcrResult(token as string, latest.id)
      if (!result || result.status !== 'COMPLETED') return

      setReportId(latest.id)

      const worst = METRICS.map((m) => ({ label: m.label, percent: result[m.key] as number | null }))
        .filter((m): m is { label: string; percent: number } => m.percent !== null)
        .sort((a, b) => b.percent - a.percent)[0]

      if (worst && worst.percent >= 40) {
        setMessage(`${worst.label} 수치를\n확인해 주세요`)
        setTone('warning')
      } else {
        setMessage('검진 수치가 모두 양호해요')
        setTone('healthy')
      }
    }

    load().catch(() => {})
  }, [token])

  const goToReport = () => navigate(reportId ? `/record/analysis/${reportId}` : '/record')

  const lines = message.split('\n')
  const lineNodes = lines.map((line, i) => (
    <span key={line}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))

  if (tone === 'warning') {
    return (
      <button
        type="button"
        onClick={goToReport}
        className="flex w-full cursor-pointer items-center gap-4 rounded-[20px] bg-[#fff6e6] px-[22px] py-5 text-left shadow-[0_10px_24px_-14px_rgba(245,200,105,0.45)] transition-transform duration-200 active:scale-[0.98]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5c869] text-2xl">!</span>
        <p className="text-[17px] leading-snug font-bold text-[#7a5a13]">{lineNodes}</p>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={goToReport}
      className="flex w-full cursor-pointer items-center gap-4 rounded-[20px] px-[22px] py-5 text-left shadow-[0_10px_24px_-14px_rgba(67,199,138,0.35)] transition-transform duration-200 active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #eafbf3, #ffffff)' }}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#43c78a] text-2xl text-white">
        {tone === 'healthy' ? '✓' : '＋'}
      </span>
      <p className="text-[17px] leading-snug font-bold text-[#1f8a5f]">{lineNodes}</p>
    </button>
  )
}

export default SummarizeAI
