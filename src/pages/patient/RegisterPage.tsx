import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const YEARS = Array.from({ length: 71 }, (_, i) => 2010 - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [year, setYear] = useState(1985)
  const [month, setMonth] = useState(3)
  const [day, setDay] = useState(12)
  const [region, setRegion] = useState('서울')

  function handleNext() {
    navigate('/register/health', { state: { name, gender, year, month, day, region } })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-onboarding-bg">
      <main className="flex-1 px-6.5 pt-2 pb-2.5">
        <div className="my-1.5 flex gap-1.5">
          <span className="h-[5px] flex-1 rounded-[3px] bg-primary-deep" />
          <span className="h-[5px] flex-1 rounded-[3px] bg-progress-track" />
        </div>

        <h1 className="text-[26px] leading-[1.35] font-extrabold text-ink">
          기본 정보를
          <br />
          입력해 주세요
        </h1>
        <p className="mt-2 mb-6 text-sm text-ink-muted">카카오 계정으로 본인 확인이 완료됐어요 ✓</p>

        <div className="mb-2 text-[13px] font-bold text-ink">이름</div>
        <input
          type="text"
          placeholder="이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-[18px] w-full rounded-[13px] border border-black/12 bg-white p-3.5 text-[15px] font-bold text-ink placeholder:font-normal placeholder:text-ink-faint"
        />

        <div className="mb-2 text-[13px] font-bold text-ink">성별</div>
        <div className="mb-[18px] flex gap-2.5">
          <button
            type="button"
            onClick={() => setGender('male')}
            className={`flex-1 rounded-[13px] py-3.5 text-[15px] font-bold ${
              gender === 'male' ? 'bg-primary-deep text-white' : 'border border-black/12 bg-white text-ink-soft'
            }`}
          >
            남성
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className={`flex-1 rounded-[13px] py-3.5 text-[15px] font-bold ${
              gender === 'female' ? 'bg-primary-deep text-white' : 'border border-black/12 bg-white text-ink-soft'
            }`}
          >
            여성
          </button>
        </div>

        <div className="mb-2 text-[13px] font-bold text-ink">생년월일</div>
        <div className="mb-[18px] flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="flex-[1.4] rounded-xl border border-black/12 bg-white px-2.5 py-3.5 text-[15px] font-bold text-ink"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex-1 rounded-xl border border-black/12 bg-white px-2.5 py-3.5 text-[15px] font-bold text-ink"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="flex-1 rounded-xl border border-black/12 bg-white px-2.5 py-3.5 text-[15px] font-bold text-ink"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2 text-[13px] font-bold text-ink">거주 지역</div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-[13px] border border-black/12 bg-white p-3.5 text-[15px] font-bold text-ink"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </main>

      <div className="px-6.5 pt-3.5 pb-[calc(22px+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-2xl bg-primary py-[17px] text-base font-extrabold text-white"
        >
          다음
        </button>
      </div>
    </div>
  )
}

export default RegisterPage
