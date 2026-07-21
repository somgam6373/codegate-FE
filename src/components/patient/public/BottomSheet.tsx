import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] items-end">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative flex max-h-[80dvh] w-full flex-col rounded-t-[28px] bg-white pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="flex justify-center pt-3 pb-2">
          <span className="h-1.5 w-10 rounded-full bg-black/15" />
        </div>
        {title && <h2 className="px-6 pb-3 text-lg font-extrabold text-ink">{title}</h2>}
        <div className="overflow-y-auto px-6">{children}</div>
      </div>
    </div>
  )
}

export default BottomSheet
