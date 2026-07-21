import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/patient/public/NavBar'
import { useAuth } from '../../context/AuthContext'

const YEARS = Array.from({ length: 71 }, (_, i) => 2010 - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const REGIONS = [
    '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
    '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]
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
        <div className="flex flex-wrap gap-2">
            {options.map((item) => {
                const active = selected.includes(item)
                return (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onToggle(item)}
                        className={`cursor-pointer rounded-[22px] px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-95 ${
                            active
                                ? 'border border-[#b6ddca] bg-primary-bg text-primary-text shadow-[0_6px_14px_-8px_rgba(11,107,80,0.3)]'
                                : 'border border-black/12 bg-white text-ink-soft hover:border-black/20'
                        }`}
                    >
                        {item}
                    </button>
                )
            })}
        </div>
    )
}

function ProfilePage() {
    const navigate = useNavigate()
    const { name: authName, token } = useAuth() // token 필드명은 실제 AuthContext에 맞게 확인
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState(authName ?? '')
    const [gender, setGender] = useState<'male' | 'female' | null>(null)
    const [year, setYear] = useState<number | null>(null)
    const [month, setMonth] = useState<number | null>(null)
    const [day, setDay] = useState<number | null>(null)
    const [region, setRegion] = useState('')
    const [medications, setMedications] = useState<string[]>([])
    const [conditions, setConditions] = useState<string[]>([])

    useEffect(() => {
        fetch('/api/v1/patients/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((res) => {
                if (!res.success) {
                    console.error('프로필 조회 실패', res.error)
                    return
                }
                const { name, gender, birthDate, medications, diseases } = res.data

                setName(name ?? '')
                setGender(gender === 'MALE' ? 'male' : gender === 'FEMALE' ? 'female' : null)

                if (birthDate) {
                    const [y, m, d] = birthDate.split('-').map(Number)
                    setYear(y)
                    setMonth(m)
                    setDay(d)
                }

                setMedications(medications ?? [])
                setConditions(diseases ?? [])
            })
            .catch((err) => console.error('프로필 조회 실패', err))
    }, [token])

    const handleSave = async () => {
        // 생년월일은 세 값이 모두 있을 때만 보냄 (하나라도 없으면 필드 생략 -> 기존 값 유지)
        const birthDate = year && month && day
            ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : undefined

        const payload: Record<string, unknown> = {
            name,
            gender: gender === 'male' ? 'MALE' : gender === 'female' ? 'FEMALE' : undefined,
            birthDate,
            medications,
            diseases: conditions,
        }

        setSaving(true)
        try {
            const res = await fetch('/api/v1/patients/me', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            const json = await res.json()

            if (!json.success) {
                alert(json.error?.message ?? '수정에 실패했습니다.')
                return
            }

            const data = json.data
            setName(data.name ?? '')
            setGender(data.gender === 'MALE' ? 'male' : data.gender === 'FEMALE' ? 'female' : null)
            if (data.birthDate) {
                const [y, m, d] = data.birthDate.split('-').map(Number)
                setYear(y)
                setMonth(m)
                setDay(d)
            }
            setMedications(data.medications ?? [])
            setConditions(data.diseases ?? [])
            setEditing(false)
        } catch (err) {
            console.error('프로필 수정 실패', err)
            alert('수정 중 오류가 발생했습니다.')
        } finally {
            setSaving(false)
        }
    }

    const handleEditToggle = () => {
        if (editing) {
            handleSave()
        } else {
            setEditing(true)
        }
    }

    const birthDisplay =
        year && month && day ? `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}` : '-'
    const basicInfoRows: [string, string][] = [
        ['이름', name || '-'],
        ['성별', gender === 'male' ? '남성' : gender === 'female' ? '여성' : '-'],
        ['생년월일', birthDisplay],
        ['거주 지역', region || '-'],
    ]

    return (
        <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-app-bg">
            <main className="flex-1 px-5.5 pt-1 pb-[104px]">
                <div className="flex items-center py-3">
                    <h1 className="text-[22px] font-extrabold text-ink">내 정보</h1>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleEditToggle}
                        className={`ml-auto cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                            editing
                                ? 'bg-primary text-white shadow-[0_8px_18px_-8px_rgba(11,107,80,0.45)] hover:bg-primary-deep'
                                : 'bg-primary-bg text-primary-text hover:bg-primary-bg/70'
                        }`}
                    >
                        {saving ? '저장 중...' : editing ? '저장' : '수정'}
                    </button>
                </div>

                <div className="mb-4.5 flex items-center gap-3.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary-bg text-[22px] font-extrabold text-primary-text shadow-[0_6px_14px_-8px_rgba(11,107,80,0.35)]">
                        {name.charAt(0) || '?'}
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-ink">{name || '-'}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-kakao">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-kakao-ink)">
                  <path d="M12 4C6.9 4 3 7.2 3 11.1c0 2.5 1.7 4.7 4.2 5.9-.2.6-.7 2.4-.8 2.8 0 .2.1.4.4.2.2-.1 2.6-1.8 3.6-2.5.5.1 1.1.1 1.6.1 5.1 0 9-3.2 9-7.1S17.1 4 12 4z" />
                </svg>
              </span>
                            <span className="text-xs font-semibold text-ink-muted">카카오 계정 연결됨</span>
                        </div>
                    </div>
                </div>

                <h2 className="mt-1.5 mb-2.5 px-0.5 text-sm font-extrabold text-ink">기본 정보</h2>
                {editing ? (
                    <div className="mb-5 rounded-[22px] border border-black/[0.04] bg-white p-4.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]">
                        <div className="mb-1.5 text-xs font-bold text-ink-muted">이름</div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mb-3.5 w-full rounded-xl border border-black/10 bg-[#f0f5f2] p-3 text-[15px] font-bold text-ink transition-colors duration-200 focus:border-primary-text/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                        <div className="mb-1.5 text-xs font-bold text-ink-muted">성별</div>
                        <div className="mb-3.5 flex gap-2.5">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`flex-1 cursor-pointer rounded-xl py-3 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
                                    gender === 'male'
                                        ? 'bg-primary-deep text-white shadow-[0_8px_18px_-8px_rgba(11,107,80,0.45)]'
                                        : 'border border-black/10 bg-white text-ink-soft hover:border-black/20'
                                }`}
                            >
                                남성
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`flex-1 cursor-pointer rounded-xl py-3 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
                                    gender === 'female'
                                        ? 'bg-primary-deep text-white shadow-[0_8px_18px_-8px_rgba(11,107,80,0.45)]'
                                        : 'border border-black/10 bg-white text-ink-soft hover:border-black/20'
                                }`}
                            >
                                여성
                            </button>
                        </div>
                        <div className="mb-1.5 text-xs font-bold text-ink-muted">생년월일</div>
                        <div className="mb-3.5 flex gap-2">
                            <select
                                value={year ?? YEARS[0]}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="flex-[1.4] rounded-[11px] border border-black/10 bg-[#f0f5f2] px-2 py-3 text-sm font-bold text-ink transition-colors duration-200 focus:border-primary-text/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            >
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>
                                        {y}년
                                    </option>
                                ))}
                            </select>
                            <select
                                value={month ?? MONTHS[0]}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="flex-1 rounded-[11px] border border-black/10 bg-[#f0f5f2] px-2 py-3 text-sm font-bold text-ink transition-colors duration-200 focus:border-primary-text/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            >
                                {MONTHS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}월
                                    </option>
                                ))}
                            </select>
                            <select
                                value={day ?? DAYS[0]}
                                onChange={(e) => setDay(Number(e.target.value))}
                                className="flex-1 rounded-[11px] border border-black/10 bg-[#f0f5f2] px-2 py-3 text-sm font-bold text-ink transition-colors duration-200 focus:border-primary-text/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            >
                                {DAYS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}일
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-1.5 text-xs font-bold text-ink-muted">거주 지역</div>
                        <select
                            value={region || REGIONS[0]}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full rounded-xl border border-black/10 bg-[#f0f5f2] p-3 text-[15px] font-bold text-ink transition-colors duration-200 focus:border-primary-text/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        >
                            {REGIONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="mb-5 rounded-[22px] border border-black/[0.04] bg-white px-4.5 shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]">
                        {basicInfoRows.map(([label, value], i) => (
                            <div
                                key={label}
                                className={`flex justify-between py-3.5 ${i < basicInfoRows.length - 1 ? 'border-b border-black/[0.06]' : ''}`}
                            >
                                <span className="text-sm text-ink-muted">{label}</span>
                                <span className="text-sm font-bold text-ink">{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                <h2 className="mt-5 mb-2.5 px-0.5 text-sm font-extrabold text-ink">복용 중인 약</h2>
                {editing ? (
                    <ChipGroup
                        options={MEDICATIONS}
                        selected={medications}
                        onToggle={(v) => setMedications((prev) => toggleSelection(prev, v))}
                    />
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {(medications.length ? medications : ['없음']).map((m) => (
                            <span key={m} className="rounded-[20px] bg-primary-bg px-3.5 py-2 text-[13px] font-bold text-primary-text">
                {m}
              </span>
                        ))}
                    </div>
                )}

                <h2 className="mt-5 mb-2.5 px-0.5 text-sm font-extrabold text-ink">앓고 있는 질병</h2>
                {editing ? (
                    <ChipGroup
                        options={CONDITIONS}
                        selected={conditions}
                        onToggle={(v) => setConditions((prev) => toggleSelection(prev, v))}
                    />
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {(conditions.length ? conditions : ['없음']).map((c) => (
                            <span key={c} className="rounded-[20px] bg-primary-bg px-3.5 py-2 text-[13px] font-bold text-primary-text">
                {c}
              </span>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="mt-6.5 w-full cursor-pointer text-center text-[13px] font-semibold text-ink-faint transition-colors duration-200 hover:text-ink-soft active:scale-95"
                >
                    로그아웃
                </button>
            </main>

            <NavBar />
        </div>
    )
}

export default ProfilePage