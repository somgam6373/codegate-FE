import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hospitalLogin } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import './auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const showToast = useToast()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!loginId || !password) {
      showToast('아이디와 비밀번호를 입력해 주세요', 'error')
      return
    }
    setLoading(true)
    try {
      const result = await hospitalLogin({ loginId, password })
      auth.login(result)
      navigate('/hospital/dashboard', { replace: true })
    } catch (err) {
      showToast(err instanceof Error ? err.message : '로그인에 실패했어요', 'error')
    } finally {
      setLoading(false)
    }
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
        <input
          type="text"
          placeholder="로그인 아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <button type="button" className="auth-kakao-btn" onClick={handleLogin} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </div>
    </div>
  )
}

export default LoginPage
