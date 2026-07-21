import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'

function HomeButton1() {
  const navigate = useNavigate()
  return (
    <Card as="button" onClick={() => navigate('/reservation')} className="group flex items-center gap-5">
      <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] bg-primary-bg text-primary-text shadow-[0_6px_14px_-8px_rgba(11,107,80,0.35)] transition-transform duration-200 group-hover:scale-105">
        <svg width="30" height="30" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.9}>
          <circle cx="8.5" cy="8.5" r="6" />
          <line x1="13" y1="13" x2="17" y2="17" strokeLinecap="round" />
        </svg>
      </span>
      <span className="flex-1">
        <span className="block text-2xl font-extrabold text-ink">병원 예약</span>
        <span className="mt-0.5 block text-base text-ink-soft">진료과·날짜로 찾기</span>
      </span>
      <span className="shrink-0 text-3xl font-bold text-primary-text transition-transform duration-200 group-hover:translate-x-0.5">
        ›
      </span>
    </Card>
  )
}

export default HomeButton1
