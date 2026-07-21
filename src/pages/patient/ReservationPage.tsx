import { useState } from 'react'
import SelectHospital from '../../components/patient/reservation/makeReservation/SelectHospital'
import SearchResult from '../../components/patient/reservation/makeReservation/SearchResult'
import ReservationSearchList from '../../components/patient/reservation/viewReservation/ReservationSearchList'
import NavBar from '../../components/patient/public/NavBar'

function ReservationPage() {
  const [tab, setTab] = useState<'make' | 'view'>('make')

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-app-bg">
      <main className="flex-1 px-5.5 pt-1 pb-[104px]">
        <h1 className="px-0.5 py-3 text-[22px] font-extrabold text-ink">병원 예약</h1>

        <div className="mb-3.5 flex rounded-[13px] bg-[#e2ebe6] p-1">
          <button
            type="button"
            onClick={() => setTab('make')}
            className={`flex-1 rounded-[10px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
              tab === 'make' ? 'bg-white text-ink shadow-[0_4px_10px_-4px_rgba(20,35,29,0.18)]' : 'text-ink-muted'
            }`}
          >
            예약하기
          </button>
          <button
            type="button"
            onClick={() => setTab('view')}
            className={`flex-1 rounded-[10px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
              tab === 'view' ? 'bg-white text-ink shadow-[0_4px_10px_-4px_rgba(20,35,29,0.18)]' : 'text-ink-muted'
            }`}
          >
            예약 조회
          </button>
        </div>

        {tab === 'make' ? (
          <div className="flex flex-col gap-4">
            <SelectHospital />
            <SearchResult />
          </div>
        ) : (
          <ReservationSearchList />
        )}
      </main>

      <NavBar />
    </div>
  )
}

export default ReservationPage
