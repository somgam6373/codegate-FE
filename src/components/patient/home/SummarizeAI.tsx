interface SummarizeAIProps {
  message?: string
}

function SummarizeAI({ message = '콜레스테롤 수치를\n확인해 주세요' }: SummarizeAIProps) {
  const lines = message.split('\n')

  return (
    <div className="flex items-center gap-4 rounded-[20px] bg-[#fff6e6] px-[22px] py-5 shadow-[0_10px_24px_-14px_rgba(245,200,105,0.45)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5c869] text-2xl">
        !
      </span>
      <p className="text-[17px] leading-snug font-bold text-[#7a5a13]">
        {lines.map((line, i) => (
          <span key={line}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    </div>
  )
}

export default SummarizeAI
