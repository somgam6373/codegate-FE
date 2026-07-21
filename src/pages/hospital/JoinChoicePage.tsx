import { Link, useNavigate } from 'react-router-dom'
import '../auth/auth.css'

function JoinChoicePage() {
  const navigate = useNavigate()

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
        <div className="auth-subtitle">회원가입 유형을 선택해 주세요</div>
        <button type="button" className="auth-choice-btn primary" onClick={() => navigate('/hospitals/signup')}>
          병원 관계자 회원가입
        </button>
        <button type="button" className="auth-choice-btn" onClick={() => navigate('/login')}>
          일반 사용자 회원가입
        </button>
        <div className="auth-link-row">
          이미 계정이 있으신가요? <Link className="auth-link" to="/hospitals/login">로그인</Link>
        </div>
      </div>
    </div>
  )
}

export default JoinChoicePage