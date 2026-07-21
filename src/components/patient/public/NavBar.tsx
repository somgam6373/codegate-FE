import { Link, useLocation } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <path d="M4 9l7-5.5L18 9v8a1 1 0 01-1 1H5a1 1 0 01-1-1z" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <rect x="4" y="5" width="14" height="13" rx="2.5" />
      <line x1="4" y1="9" x2="18" y2="9" />
      <line x1="8" y1="3" x2="8" y2="6" strokeLinecap="round" />
      <line x1="14" y1="3" x2="14" y2="6" strokeLinecap="round" />
    </svg>
  )
}

function RecordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <rect x="5" y="3" width="12" height="16" rx="2.5" />
      <line x1="8" y1="8" x2="14" y2="8" strokeLinecap="round" />
      <line x1="8" y1="12" x2="12" y2="12" strokeLinecap="round" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.9}>
      <circle cx="11" cy="8" r="3.4" />
      <path d="M5 18a6 6 0 0112 0" strokeLinecap="round" />
    </svg>
  )
}

const TABS = [
  { key: 'home', label: '홈', to: '/home', Icon: HomeIcon },
  { key: 'reservation', label: '예약', to: '/reservation', Icon: CalendarIcon },
  { key: 'record', label: '기록', to: '/record', Icon: RecordIcon },
  { key: 'profile', label: '내정보', to: '/profile', Icon: ProfileIcon },
] as const

function NavBar() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 flex h-[84px] w-full max-w-[480px] -translate-x-1/2 justify-around border-t border-black/[0.07] bg-white px-3.5 pt-3">
      {TABS.map(({ key, label, to, Icon }) => {
        const active = pathname === to
        const className = `flex cursor-pointer flex-col items-center gap-1 text-[11px] font-semibold transition-colors duration-200 active:scale-95 ${active ? 'text-primary' : 'text-ink-faint'}`
        return (
          <Link key={key} to={to} className={className}>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${active ? 'bg-primary-bg' : 'bg-transparent'}`}
            >
              <Icon />
            </span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default NavBar
