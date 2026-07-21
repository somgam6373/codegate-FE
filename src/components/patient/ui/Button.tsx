import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({ className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`w-full cursor-pointer rounded-[13px] bg-primary py-3.5 text-[15px] font-bold text-white shadow-[0_14px_28px_-14px_rgba(11,107,80,0.55)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-14px_rgba(11,107,80,0.6)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_8px_16px_-10px_rgba(11,107,80,0.4)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    />
  )
}

export function GhostButton({ className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full bg-primary-bg px-4 py-2 text-sm font-bold text-primary-text transition-all duration-200 active:scale-95 hover:bg-primary-bg/70 ${className}`}
      {...rest}
    />
  )
}
