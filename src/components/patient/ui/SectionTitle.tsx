import type { ReactNode } from 'react'

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 px-0.5 text-[15px] font-extrabold text-ink">{children}</h2>
}

export default SectionTitle
