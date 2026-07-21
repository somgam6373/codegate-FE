import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from './authStore'
import './auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  function handleKakaoLogin() {
    setLoading(true)
    setTimeout(() => {
      login()
      navigate('/hospital/dashboard', { replace: true })
    }, 500)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-mark">
          <svg width="26" height="26" viewBox="0 0 22 22" fill="#fff">
            <rect x="9" y="3" width="4" height="16" rx="1" />
            <rect x="3" y="9" width="16" height="4" rx="1" />
          </svg>
        </div>
        <div className="auth-title">메디링크</div>
        <div className="auth-subtitle">병원 관리자 시스템</div>
        <button type="button" className="auth-kakao-btn" onClick={handleKakaoLogin} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="#191600">
            <path d="M10 2C5.03 2 1 5.13 1 9c0 2.49 1.68 4.68 4.2 5.93-.18.66-.66 2.4-.76 2.77-.12.46.17.45.36.33.15-.1 2.35-1.6 3.31-2.25.62.09 1.26.14 1.89.14 4.97 0 9-3.13 9-7 0-3.87-4.03-6.92-9-6.92z" />
          </svg>
          카카오로 시작하기
        </button>
        <div className="auth-hint">
          카카오 계정으로 로그인하면 별도 회원가입 없이
          <br />
          바로 메디링크를 이용할 수 있습니다.
        </div>
      </div>
    </div>
  )
}

export default LoginPage
