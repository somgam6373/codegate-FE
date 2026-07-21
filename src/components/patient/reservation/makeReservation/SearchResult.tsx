import { useState } from 'react'
import type { HospitalSearchHospital, HospitalSearchSlot } from '../../../../api/hospitals'
import { createReservation } from '../../../../api/reservations'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'

const PHONE_PATTERN = /^010-\d{4}-\d{4}$/

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function HospitalStripe() {
  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] text-center font-mono text-[10px] font-semibold text-black/40"
      style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,35,29,.05) 0 8px, transparent 8px 16px)' }}
    >
      병원
    </span>
  )
}

function HospitalCard({
  hospital,
  expanded,
  onToggle,
}: {
  hospital: HospitalSearchHospital
  expanded: boolean
  onToggle: () => void
}) {
  const auth = useAuth()
  const showToast = useToast()
  const [selectedSlot, setSelectedSlot] = useState<HospitalSearchSlot | undefined>(hospital.availableSlots[0])
  const [patientName, setPatientName] = useState(auth.name ?? '')
  const [patientPhone, setPatientPhone] = useState('')
  const [symptom, setSymptom] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reservedSlotIds, setReservedSlotIds] = useState<number[]>([])

  async function handleReserve() {
    if (!selectedSlot) return
    if (!patientName.trim()) {
      showToast('환자 이름을 입력해 주세요', 'error')
      return
    }
    if (!PHONE_PATTERN.test(patientPhone)) {
      showToast('연락처를 010-1234-5678 형식으로 입력해 주세요', 'error')
      return
    }

    setSubmitting(true)
    try {
      await createReservation({
        slotId: selectedSlot.slotId,
        patientName: patientName.trim(),
        patientPhone,
        symptom: symptom.trim() || undefined,
      })
      showToast('예약 요청이 접수되었습니다', 'success')
      setReservedSlotIds((prev) => [...prev, selectedSlot.slotId])
      setSelectedSlot(hospital.availableSlots.find((s) => s.slotId !== selectedSlot.slotId && !reservedSlotIds.includes(s.slotId)))
      setSymptom('')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '예약 요청에 실패했어요', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`rounded-[22px] bg-white p-4 shadow-[0_8px_20px_-14px_rgba(20,35,29,0.3)] transition-all duration-200 ${
        expanded ? 'border-2 border-primary-deep shadow-[0_14px_30px_-18px_rgba(12,107,80,0.5)]' : 'border border-black/[0.04]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full cursor-pointer items-center gap-3.5 text-left active:scale-[0.99]"
      >
        <HospitalStripe />
        <div className="flex-1">
          <p className="text-base font-extrabold text-ink">{hospital.hospitalName}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {hospital.availableDepartments.join(', ')} · {hospital.location}
          </p>
        </div>
        <span
          className={`text-xl text-[#c3cec8] transition-transform duration-200 ${
            expanded ? 'rotate-90 text-primary-deep' : 'group-hover:translate-x-0.5'
          }`}
        >
          ›
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          expanded ? 'mt-3.5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {hospital.availableSlots.map((slot) => {
              const isReserved = reservedSlotIds.includes(slot.slotId)
              return (
                <button
                  key={slot.slotId}
                  type="button"
                  disabled={isReserved}
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex-1 cursor-pointer rounded-[11px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                    slot.slotId === selectedSlot?.slotId
                      ? 'bg-primary-deep text-white shadow-[0_8px_16px_-8px_rgba(12,107,80,0.55)]'
                      : 'bg-[#f0f5f2] text-ink-soft hover:bg-[#e6ede9]'
                  }`}
                >
                  {isReserved ? '요청완료' : slot.startTime}
                </button>
              )
            })}
          </div>

          {selectedSlot && (
            <div className="mt-3 flex flex-col gap-2">
              <input
                type="text"
                placeholder="환자 이름"
                value={patientName}
                maxLength={20}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-faint"
              />
              <input
                type="tel"
                placeholder="연락처 (010-1234-5678)"
                value={patientPhone}
                onChange={(e) => setPatientPhone(formatPhone(e.target.value))}
                className="w-full rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-faint"
              />
              <textarea
                placeholder="증상 또는 병원에 전달할 내용 (선택)"
                value={symptom}
                maxLength={200}
                rows={2}
                onChange={(e) => setSymptom(e.target.value)}
                className="w-full resize-none rounded-xl border border-black/[0.08] bg-[#f0f5f2] p-3 text-sm font-medium text-ink placeholder:font-normal placeholder:text-ink-faint"
              />
            </div>
          )}

          <button
            type="button"
            disabled={!selectedSlot || submitting}
            onClick={handleReserve}
            className="mt-3 w-full cursor-pointer rounded-[13px] bg-primary py-3.5 text-[15px] font-bold text-white shadow-[0_14px_28px_-14px_rgba(11,107,80,0.55)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-14px_rgba(11,107,80,0.6)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_8px_16px_-10px_rgba(11,107,80,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '예약 요청 중...' : selectedSlot ? `${selectedSlot.startTime} 예약 요청` : '예약 가능한 슬롯 없음'}
          </button>
          <p className="mt-2 text-center text-[11px] text-ink-faint">병원 승인 후 확정됩니다</p>
        </div>
      </div>
    </div>
  )
}

function SearchResult({ hospitals }: { hospitals: HospitalSearchHospital[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div>
      <p className="mb-2.5 px-0.5 text-[13px] font-semibold text-ink-soft">검색 결과 {hospitals.length}곳</p>
      <div className="flex flex-col gap-3">
        {hospitals.map((hospital) => (
          <HospitalCard
            key={hospital.hospitalId}
            hospital={hospital}
            expanded={expandedId === hospital.hospitalId}
            onToggle={() => setExpandedId((prev) => (prev === hospital.hospitalId ? null : hospital.hospitalId))}
          />
        ))}
      </div>
    </div>
  )
}

export default SearchResult
