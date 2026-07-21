import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getHospitalMe } from '../../api/hospital'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/img.png'
import './hospital.css'

const navItems = [
  {
    to: '/hospital/dashboard',
    label: '대시보드',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/hospital/reservations',
    label: '예약 관리',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="4" width="14" height="13" rx="2.5" />
        <line x1="3" y1="8" x2="17" y2="8" />
        <line x1="7" y1="2" x2="7" y2="5.5" strokeLinecap="round" />
        <line x1="13" y1="2" x2="13" y2="5.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/hospital/patients',
    label: '환자 데이터',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="10" cy="7" r="3.2" />
        <path d="M4 17a6 6 0 0112 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/hospital/slots',
    label: '슬롯 조회',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 5.5V10l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/hospital/settings',
    label: '진료 설정',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="10" cy="10" r="3" />
        <path
          d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4M15.7 15.7l-1.4-1.4M5.7 5.7L4.3 4.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

interface HospitalHeaderProps {
  title: string
  subtitle: string
  hideSearch?: boolean
}

export function HospitalHeader({ title, subtitle, hideSearch }: HospitalHeaderProps) {
  return (
    <header className="h-header">
      <div>
        <div className="h-header-title">{title}</div>
        <div className="h-header-subtitle">{subtitle}</div>
      </div>
      {!hideSearch && (
        <div className="h-search">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#9aa8a0" strokeWidth={1.8}>
            <circle cx="8.5" cy="8.5" r="6" />
            <line x1="13" y1="13" x2="17" y2="17" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="환자·예약 검색" aria-label="환자·예약 검색" />
        </div>
      )}
      <button type="button" className="h-bell" style={hideSearch ? { marginLeft: 'auto' } : undefined} aria-label="알림">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5c6f66" strokeWidth={1.8}>
          <path d="M10 3a5 5 0 015 5v3l1.5 2.5H3.5L5 11V8a5 5 0 015-5z" />
          <path d="M8 16a2 2 0 004 0" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  )
}

function HospitalLayout() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [hospitalName, setHospitalName] = useState('')

  useEffect(() => {
    getHospitalMe().then((me) => setHospitalName(me.hospitalName)).catch(() => {})
  }, [])

  function handleLogout() {
    auth.logout()
    navigate('/hospital/login', { replace: true })
  }

  return (
    <div className="hospital-app">
      <aside className="h-sidebar">
        <div className="h-brand">
          <div className="h-brand-logo-wrap">
            <img src={logo} alt="Smart Clinical Automation" className="h-brand-logo" />
          </div>
        </div>
        <nav className="h-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `h-nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="h-sidebar-footer">
          <div className="h-avatar">박</div>
          <div style={{ flex: 1 }}>
            <div className="h-doctor-name">박지현 원장</div>
            <div className="h-doctor-org">{hospitalName}</div>
          </div>
          <button type="button" className="h-logout-btn" onClick={handleLogout} aria-label="로그아웃">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M8 3H4.5a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 004.5 17H8" strokeLinecap="round" />
              <path d="M13 14l4-4-4-4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>
      <div className="h-main">
        <Outlet />
      </div>
    </div>
  )
}

export default HospitalLayout
