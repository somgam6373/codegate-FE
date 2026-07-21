import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { kakaoLogin, ApiError } from '../../services/kakaoAuth'

function KakaoCallbackPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const showToast = useToast()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const code = new URLSearchParams(window.location.search).get('code')
    const redirectUri = `${window.location.origin}/oauth/kakao/callback`
    if (!code) {
      navigate('/login', { replace: true })
      return
    }

    kakaoLogin(code, redirectUri)
      .then((result) => {
        auth.login(result)
        navigate('/home', { replace: true })
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === 'PATIENT_SIGNUP_REQUIRED') {
          const signupToken = typeof err.details?.signupToken === 'string' ? err.details.signupToken : undefined
          navigate('/register', { replace: true, state: { signupToken } })
        } else {
          showToast(err instanceof Error ? err.message : '로그인에 실패했어요', 'error')
          navigate('/login', { replace: true })
        }
      })
  }, [auth, navigate, showToast])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-onboarding-bg">
      <p className="text-sm text-ink-muted">로그인 처리 중...</p>
    </div>
  )
}

export default KakaoCallbackPage
