import { useRef, useState } from 'react'
import type { MedicalFileType } from '../../../../api/medicalFiles'
import { PrimaryButton } from '../../ui/Button'

interface VideoUploadProps {
  uploading?: boolean
  onUpload: (type: MedicalFileType, file: File) => void
}

const TYPE_OPTIONS: { value: MedicalFileType; label: string }[] = [
  { value: 'MRI', label: 'MRI' },
  { value: 'CT', label: 'CT' },
  { value: 'OPINION_LETTER', label: '소견서' },
  { value: 'XRAY', label: 'X-Ray' },
]

function VideoUpload({ uploading = false, onUpload }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [type, setType] = useState<MedicalFileType>('MRI')

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    onUpload(type, file)
  }

  return (
    <div className="mb-5 rounded-[20px] border-2 border-dashed border-[#a9c6b8] bg-white px-5 py-6 text-center transition-all duration-200 hover:border-primary-text/50 hover:shadow-[0_14px_28px_-18px_rgba(20,35,29,0.3)]">
      <div className="mb-4 flex justify-center gap-2">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setType(option.value)}
            className={`cursor-pointer rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.96] ${
              type === option.value ? 'bg-primary text-white' : 'bg-primary-bg text-primary-text'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
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
      <p className="text-base font-bold text-ink">MRI·CT·소견서 업로드</p>
      <p className="mt-1.5 text-[13px] text-ink-muted">DICOM · MP4 · JPG · PNG · PDF 파일 지원</p>
      <PrimaryButton onClick={() => inputRef.current?.click()} disabled={uploading} className="mt-4">
        {uploading ? '업로드 중...' : '파일 선택'}
      </PrimaryButton>
      <input
        ref={inputRef}
        type="file"
        accept=".dcm,.mp4,.jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

export default VideoUpload
