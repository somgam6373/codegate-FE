import { useToast } from '../../context/ToastContext'
import { getKakaoLoginUrl } from '../../services/kakaoAuth'

function LoginPage() {
  const showToast = useToast()

  async function handleKakaoStart() {
    try {
      const redirectUri = `${window.location.origin}/oauth/kakao/callback`
      window.location.href = await getKakaoLoginUrl(redirectUri)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '로그인에 실패했어요', 'error')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-onboarding-bg">
      <main className="flex flex-1 flex-col px-7 pb-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-50 w-50 items-center justify-center">
            <img src="/bear.png" alt="메디링크" className="h-full w-full object-contain" />
          </div>
          <img src="/Smart%20Clinical.png" alt="Smart Clinical" className="h-10 w-auto object-contain" />
          <img src="/automation.png" alt="Automation" className="h-[35px] w-auto object-contain" />
          <p className="text-[15px] leading-relaxed text-ink-soft">
            예약부터 AI 건강 분석까지,
            <br />
            내 건강을 한 곳에서
          </p>
        </div>

        <button
          type="button"
          onClick={handleKakaoStart}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-kakao py-4"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-kakao-ink)">
            <path d="M12 4C6.9 4 3 7.2 3 11.1c0 2.5 1.7 4.7 4.2 5.9-.2.6-.7 2.4-.8 2.8 0 .2.1.4.4.2.2-.1 2.6-1.8 3.6-2.5.5.1 1.1.1 1.6.1 5.1 0 9-3.2 9-7.1S17.1 4 12 4z" />
          </svg>
          <span className="text-base font-bold text-kakao-ink">카카오로 시작하기</span>
        </button>
        <p className="mt-4 text-center text-[13px] text-ink-faint">카카오 계정으로 간편하게 로그인·회원가입</p>
      </main>
    </div>
  )
}

export default LoginPage
