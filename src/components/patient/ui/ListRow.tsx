import type { ReactNode } from 'react'

interface ListRowProps {
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  onClick?: () => void
}

function ListRow({ title, subtitle, badge, onClick }: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3.5 rounded-[22px] border border-black/[0.04] bg-white p-4 text-left shadow-[0_8px_20px_-14px_rgba(20,35,29,0.3)] transition-transform duration-200 active:scale-[0.99]"
    >
      <div className="flex-1">
        <p className="text-base font-extrabold text-ink">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
        {badge && <div className="mt-1.5">{badge}</div>}
      </div>
      <span className="shrink-0 text-xl text-[#c3cec8]">›</span>
    </button>
  )
}

export default ListRow
