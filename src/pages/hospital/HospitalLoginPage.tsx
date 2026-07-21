import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hospitalLogin } from '../../services/hospitalAuth'
import { ApiError } from '../../api/response'
import '../auth/auth.css'

function HospitalLoginPage() {
    const navigate = useNavigate()
    const auth = useAuth()
    const [loginId, setLoginId] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin() {
        setError(null)
        setLoading(true)
        try {
            // 1. API 명세서 (POST /api/v1/auth/hospitals/login) 호출
            const result = await hospitalLogin({
                loginId,
                password,
            })

            // 2. 인증 상태(JWT 및 사용자 정보) 업데이트
            auth.login(result)

            // 3. 대시보드 페이지로 이동
            navigate('/hospital/dashboard', { replace: true })
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : '아이디 또는 비밀번호가 올바르지 않습니다.'
            )
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
                <div className="auth-title">병원 로그인</div>
                <div className="auth-subtitle">병원 관계자 전용 로그인 서비스</div>

                <form
                    className="auth-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleLogin()
                    }}
                >
                    <div>
                        <label className="auth-field-label" htmlFor="loginId">
                            아이디
                        </label>
                        <input
                            id="loginId"
                            className="auth-field-input"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            autoComplete="username"
                            placeholder="아이디를 입력해 주세요"
                            required
                        />
                    </div>

                    <div>
                        <label className="auth-field-label" htmlFor="password">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            className="auth-field-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="비밀번호를 입력해 주세요"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                {error && <div className="auth-error">{error}</div>}

                <div className="auth-link-row">
                    아직 계정이 없으신가요?{' '}
                    <Link className="auth-link" to="/hospital/signup">
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default HospitalLoginPage