import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hospitalSignup } from '../../services/hospitalAuth'
import { ApiError } from '../../api/response'
import '../auth/auth.css'

function SignupPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [hospitalLocation, setHospitalLocation] = useState('')
  const [availableTime, setAvailableTime] = useState('')
  const [medicalSubjects, setMedicalSubjects] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignup() {
    console.log('[SignupPage] handleSignup 시작', {
      loginId,
      password,
      hospitalName,
      hospitalLocation,
      availableTime,
      medicalSubjects,
    })
    setError(null)
    setLoading(true)
    try {
      const result = await hospitalSignup({
        loginId,
        password,
        hospitalName,
        hospitalLocation,
        availableTime,
        medicalSubjects,
      })
      console.log('[SignupPage] hospitalSignup 성공', result)
      auth.login(result)
      console.log('[SignupPage] auth.login 완료, /hospital/dashboard 로 이동')
      navigate('/hospital/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        console.log('[SignupPage] ApiError 발생', { code: err.code, message: err.message, details: err.details })
        setError(err.message)
      } else {
        console.log('[SignupPage] 알 수 없는 에러 발생', err)
        setError('회원가입에 실패했습니다.')
      }
    } finally {
      console.log('[SignupPage] handleSignup 종료')
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
        <div className="auth-title">병원 회원가입</div>
        <div className="auth-subtitle">병원 관계자 전용 가입</div>
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleSignup()
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
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="hospitalName">
              병원명
            </label>
            <input
              id="hospitalName"
              className="auth-field-input"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="hospitalLocation">
              병원 위치
            </label>
            <input
              id="hospitalLocation"
              className="auth-field-input"
              value={hospitalLocation}
              onChange={(e) => setHospitalLocation(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="availableTime">
              진료 가능 시간
            </label>
            <input
              id="availableTime"
              className="auth-field-input"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              placeholder="예: 월-금 09:00-18:00"
              required
            />
          </div>
          <div>
            <label className="auth-field-label" htmlFor="medicalSubjects">
              진료 항목
            </label>
            <input
              id="medicalSubjects"
              className="auth-field-input"
              value={medicalSubjects}
              onChange={(e) => setMedicalSubjects(e.target.value)}
              placeholder="예: 내과, 영상의학과, 종합검진"
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-link-row">
          이미 계정이 있으신가요? <Link className="auth-link" to="/hospital/login">로그인</Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage