import IncomingReservation from '../../components/patient/home/IncomingReservation'
import HomeButton1 from '../../components/patient/home/HomeButton1'
import HomeButton2 from '../../components/patient/home/HomeButton2'
import SummarizeAI from '../../components/patient/home/SummarizeAI'
import NavBar from '../../components/patient/public/NavBar'

function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-app-bg">
      <main className="flex-1 px-5.5 pt-1.5 pb-[104px]">
        <header className="my-1.5 mb-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-ink-soft">2025년 7월 21일 월요일</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">안녕하세요, 김민수님</h1>
          </div>
          <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-primary-bg font-bold text-primary-text shadow-[0_6px_14px_-8px_rgba(11,107,80,0.35)]">
            민
          </div>
        </header>

        <IncomingReservation />

        <section className="mt-[18px] flex flex-col gap-4">
          <HomeButton1 />
          <HomeButton2 />
        </section>

        <div className="mt-5">
          <SummarizeAI />
        </div>
      </main>

      <NavBar />
    </div>
  )
}

export default HomePage
