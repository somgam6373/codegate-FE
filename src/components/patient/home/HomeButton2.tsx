import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'

function HomeButton2() {
  const navigate = useNavigate()
  return (
    <Card as="button" onClick={() => navigate('/record')} className="group flex items-center gap-5">
      <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] bg-primary-bg text-primary-text shadow-[0_6px_14px_-8px_rgba(11,107,80,0.35)] transition-transform duration-200 group-hover:scale-105">
        <svg width="30" height="30" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.9}>
          <path d="M10 13V4M6.5 7.5L10 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 14v1.5A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5V14" strokeLinecap="round" />
        </svg>
      </span>
      <span className="flex-1">
        <span className="block text-2xl font-extrabold text-ink">업로드</span>
        <span className="mt-0.5 block text-base text-ink-soft">검사자료 올리기</span>
      </span>
      <span className="shrink-0 text-3xl font-bold text-primary-text transition-transform duration-200 group-hover:translate-x-0.5">
        ›
      </span>
    </Card>
  )
}

export default HomeButton2
