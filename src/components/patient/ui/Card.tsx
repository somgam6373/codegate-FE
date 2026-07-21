import type { ReactNode } from 'react'

interface CardProps {
  as?: 'div' | 'button'
  onClick?: () => void
  className?: string
  padding?: 'default' | 'sm'
  children: ReactNode
}

const SHADOW = 'rounded-[22px] border border-black/[0.04] bg-white shadow-[0_10px_24px_-18px_rgba(20,35,29,0.35)]'

function Card({ as = 'div', onClick, className = '', padding = 'default', children }: CardProps) {
  const paddingClass = padding === 'sm' ? 'p-4' : 'p-5'

  if (as === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${SHADOW} ${paddingClass} w-full cursor-pointer text-left transition-transform duration-200 active:scale-[0.98] ${className}`}
      >
        {children}
      </button>
    )
  }

  return <div className={`${SHADOW} ${paddingClass} ${className}`}>{children}</div>
}

export default Card
