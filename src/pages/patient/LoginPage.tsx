import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-onboarding-bg">
      <main className="flex flex-1 flex-col px-7 pb-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px] bg-primary-deep shadow-[0_16px_34px_-14px_rgba(11,107,80,0.7)]">
            <svg width="40" height="40" viewBox="0 0 22 22" fill="#fff">
              <rect x="9" y="3" width="4" height="16" rx="1" />
              <rect x="3" y="9" width="16" height="4" rx="1" />
            </svg>
          </div>
          <h1 className="mt-6 text-[30px] font-extrabold text-ink">메디링크</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            예약부터 AI 건강 분석까지,
            <br />
            내 건강을 한 곳에서
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/register')}
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
