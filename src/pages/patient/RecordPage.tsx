import { useState } from 'react'
import VideoUpload from '../../components/patient/record/video/VideoUpload'
import VideoList from '../../components/patient/record/video/VideoList'
import TextUpload from '../../components/patient/record/text/textUpload'
import TextList from '../../components/patient/record/text/textList'
import NavBar from '../../components/patient/public/NavBar'

function RecordPage() {
  const [tab, setTab] = useState<'video' | 'photo'>('video')

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-app-bg">
      <main className="flex-1 px-5.5 pt-1 pb-[104px]">
        <h1 className="px-0.5 py-3 text-[22px] font-extrabold text-ink">검사자료</h1>

        <div className="mb-4 flex rounded-[13px] bg-[#e2ebe6] p-1">
          <button
            type="button"
            onClick={() => setTab('video')}
            className={`flex-1 cursor-pointer rounded-[10px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
              tab === 'video' ? 'bg-white text-ink shadow-[0_4px_10px_-4px_rgba(20,35,29,0.18)]' : 'text-ink-muted'
            }`}
          >
            영상 (MRI·CT·소견서)
          </button>
          <button
            type="button"
            onClick={() => setTab('photo')}
            className={`flex-1 cursor-pointer rounded-[10px] py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
              tab === 'photo' ? 'bg-white text-ink shadow-[0_4px_10px_-4px_rgba(20,35,29,0.18)]' : 'text-ink-muted'
            }`}
          >
            사진 (건강검진결과지)
          </button>
        </div>

        {tab === 'video' ? (
          <>
            <VideoUpload />
            <VideoList />
          </>
        ) : (
          <>
            <TextUpload />
            <TextList />
          </>
        )}
      </main>

      <NavBar />
    </div>
  )
}

export default RecordPage
