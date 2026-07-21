import { useRef } from 'react'
import { PrimaryButton } from '../../ui/Button'

interface TextUploadProps {
  uploading?: boolean
  onUpload: (file: File) => void
}

function TextUpload({ uploading = false, onUpload }: TextUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    onUpload(file)
  }

  return (
    <div className="group mb-5 rounded-[20px] border-2 border-dashed border-[#a9c6b8] bg-white px-5 py-[34px] text-center transition-all duration-200 hover:border-primary-text/50 hover:shadow-[0_14px_28px_-18px_rgba(20,35,29,0.3)]">
      <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-bg transition-transform duration-200 group-hover:scale-105">
        <svg
          width="26"
          height="26"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          className="text-primary-text"
        >
          <path d="M10 14V4m0 0L6 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 14v2a1 1 0 001 1h10a1 1 0 001-1v-2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-base font-bold text-ink">건강검진결과지 업로드</p>
      <p className="mt-1.5 text-[13px] text-ink-muted">PDF 파일만 지원</p>
      <PrimaryButton onClick={() => inputRef.current?.click()} disabled={uploading} className="mt-4">
        {uploading ? '업로드 중...' : 'PDF 선택'}
      </PrimaryButton>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleChange} />
    </div>
  )
}

export default TextUpload
