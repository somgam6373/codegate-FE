import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MEDICATIONS = ['고혈압약', '당뇨약', '고지혈증약', '갑상선약', '항응고제', '진통제', '없음']
const CONDITIONS = ['고혈압', '당뇨', '고지혈증', '심장질환', '갑상선질환', '관절염', '천식', '없음']

function toggleSelection(current: string[], value: string): string[] {
  if (value === '없음') return current.includes('없음') ? [] : ['없음']
  const base = current.filter((item) => item !== '없음')
  return base.includes(value) ? base.filter((item) => item !== value) : [...base, value]
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((item) => {
        const active = selected.includes(item)
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={`rounded-[22px] px-4 py-2.5 text-sm font-bold ${
              active
                ? 'border border-[#b6ddca] bg-primary-bg text-primary-text'
                : 'border border-black/12 bg-white text-ink-soft'
            }`}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

function InformationPage() {
  const navigate = useNavigate()
  const [medications, setMedications] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])

  function handleComplete() {
    navigate('/home', { state: { medications, conditions } })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-onboarding-bg">
      <main className="flex-1 px-6.5 pt-2 pb-2.5">
        <div className="my-1.5 flex gap-1.5">
          <span className="h-[5px] flex-1 rounded-[3px] bg-primary-deep" />
          <span className="h-[5px] flex-1 rounded-[3px] bg-primary-deep" />
        </div>

        <h1 className="text-[26px] leading-[1.35] font-extrabold text-ink">
          건강 정보를
          <br />
          알려주세요
        </h1>
        <p className="mt-2 mb-6 text-sm text-ink-muted">AI 분석과 병원 추천에 활용됩니다</p>

        <div className="mb-3 text-[15px] font-extrabold text-ink">
          복용 중인 약 <span className="text-[13px] font-semibold text-ink-faint">(여러 개 선택)</span>
        </div>
        <div className="mb-[26px]">
          <ChipGroup
            options={MEDICATIONS}
            selected={medications}
            onToggle={(value) => setMedications((prev) => toggleSelection(prev, value))}
          />
        </div>

        <div className="mb-3 text-[15px] font-extrabold text-ink">
          앓고 있는 질병 <span className="text-[13px] font-semibold text-ink-faint">(여러 개 선택)</span>
        </div>
        <ChipGroup
          options={CONDITIONS}
          selected={conditions}
          onToggle={(value) => setConditions((prev) => toggleSelection(prev, value))}
        />
      </main>

      <div className="px-6.5 pt-3.5 pb-[calc(22px+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleComplete}
          className="w-full rounded-2xl bg-primary py-[17px] text-base font-extrabold text-white"
        >
          완료
        </button>
      </div>
    </div>
  )
}

export default InformationPage
