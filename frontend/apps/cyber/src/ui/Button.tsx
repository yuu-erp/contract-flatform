import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type Variant = 'glass' | 'play' | 'topup' | 'help' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  glass: 'border border-edge bg-white/10 text-white hover:bg-white/15',
  play: 'bg-gradient-to-b from-[#34d36e] to-[#16a34a] text-[#04170b] shadow-[0_8px_20px_rgb(34_197_94/0.35)] hover:brightness-110',
  topup: 'bg-gradient-to-b from-[#fdba74] to-[#f97316] text-[#2a1200] shadow-[0_8px_20px_rgb(249_115_22/0.35)] hover:brightness-110',
  help: 'bg-gradient-to-b from-[#f9a8d4] to-[#ec4899] text-[#2a0016] shadow-[0_8px_20px_rgb(236_72_153/0.35)] hover:brightness-110',
  danger: 'border border-danger/50 bg-[#3a0d16]/80 text-red-300 backdrop-blur-md hover:bg-[#4a1019]/85',
}
const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 rounded-[10px] px-3 text-[12.5px]',
  md: 'h-10 gap-2 rounded-xl px-4 text-[13.5px]',
  lg: 'h-12 gap-2 rounded-2xl px-6 text-[15px]',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  block?: boolean
}

export function Button({ variant = 'glass', size = 'md', icon, block, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-extrabold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
