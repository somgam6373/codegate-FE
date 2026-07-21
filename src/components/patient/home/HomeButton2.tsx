function HomeButton2() {
  return (
    <button
      type="button"
      className="group flex cursor-pointer items-center gap-5 rounded-[22px] border border-black/[0.04] bg-white p-6 text-left shadow-[0_10px_28px_-16px_rgba(20,35,29,0.35)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_rgba(20,35,29,0.4)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_6px_16px_-10px_rgba(20,35,29,0.3)]"
    >
      <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] bg-primary-bg text-primary-text shadow-[0_6px_14px_-8px_rgba(11,107,80,0.35)] transition-transform duration-200 group-hover:scale-105">
        <svg width="30" height="30" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14 8.4 9.6 4 8l4.4-1.6z" />
        </svg>
      </span>
      <span className="flex-1">
        <span className="block text-2xl font-extrabold text-ink">건강 분석</span>
        <span className="mt-0.5 block text-base text-ink-soft">검진 결과 쉽게 보기</span>
      </span>
      <span className="shrink-0 text-3xl font-bold text-primary-text transition-transform duration-200 group-hover:translate-x-0.5">
        ›
      </span>
    </button>
  )
}

export default HomeButton2
