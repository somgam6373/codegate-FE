import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hospitalSignup } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import '../auth/auth.css'

function SignupPage() {
  const auth = useAuth()
  const showToast = useToast()
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [hospitalLocation, setHospitalLocation] = useState('')
  const [availableTime, setAvailableTime] = useState('')
  const [medicalSubjects, setMedicalSubjects] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!loginId || !password || !hospitalName || !hospitalLocation || !availableTime || !medicalSubjects) {
      showToast('모든 항목을 입력해 주세요', 'error')
      return
    }
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
      auth.login(result, hospitalName)
      showToast('회원가입이 완료됐어요', 'success')
      navigate('/hospital/dashboard', { replace: true })
    } catch (err) {
      showToast(err instanceof Error ? err.message : '회원가입에 실패했어요', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'left' }}>
        <div className="auth-title" style={{ textAlign: 'center' }}>병원 회원가입</div>
        <div className="auth-subtitle" style={{ textAlign: 'center' }}>병원 관리자 계정을 만들어 주세요</div>

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
        <input
          type="text"
          placeholder="병원명"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          className="auth-input"
        />
        <input
          type="text"
          placeholder="병원 위치"
          value={hospitalLocation}
          onChange={(e) => setHospitalLocation(e.target.value)}
          className="auth-input"
        />
        <input
          type="text"
          placeholder="진료 가능 시간 (예: 월-금 09:00-18:00)"
          value={availableTime}
          onChange={(e) => setAvailableTime(e.target.value)}
          className="auth-input"
        />
        <input
          type="text"
          placeholder="진료 항목 (예: 내과, 영상의학과)"
          value={medicalSubjects}
          onChange={(e) => setMedicalSubjects(e.target.value)}
          className="auth-input"
        />

        <button type="button" className="auth-kakao-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </div>
    </div>
  )
}

export default SignupPage
