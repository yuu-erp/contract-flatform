import { Check } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { cn } from '../lib/cn'
import { DISPLAY_ACCENTS, DISPLAY_BACKGROUNDS, DISPLAY_FONT_SIZES, useDisplay } from './display'

/** Hộp "Tuỳ chỉnh hiển thị": màu chủ đạo + nền (Mặc định / Mờ / Tối hẳn). */
export function DisplaySettingsDialog({
  open,
  onOpenChange,
  brand = 'Meta Platform',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand?: string
}) {
  const [display, setDisplay] = useDisplay()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(100%-2rem,600px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background p-8 text-foreground shadow-[0_0_15px_rgb(101_119_134/0.2)] outline-none sm:px-12">
          <Dialog.Title className="text-center text-[1.4375rem] leading-7 font-extrabold">Tuỳ chỉnh hiển thị</Dialog.Title>
          <Dialog.Description className="mt-2 text-center text-[0.9375rem] text-muted-foreground">
            Chọn cỡ chữ, màu chủ đạo và nền. Cài đặt lưu trên trình duyệt này.
          </Dialog.Description>

          <div className="mt-5 flex gap-3 rounded-2xl border border-border px-4 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
              M
            </span>
            <div className="min-w-0 text-[0.9375rem]">
              <p>
                <span className="font-bold">{brand}</span>{' '}
                <span className="text-muted-foreground">@meta · 2 phút</span>
              </p>
              <p className="mt-0.5">
                Doanh thu hôm nay tăng <span className="text-primary">+12,4%</span>. Mở{' '}
                <span className="text-primary">Tổng quan</span> để xem chi tiết theo agent.
              </p>
            </div>
          </div>

          <section className="mt-6">
            <h3 className="mb-1 text-[0.8125rem] font-bold text-muted-foreground">Cỡ chữ</h3>
            <div className="flex items-center gap-4 rounded-2xl bg-muted px-5 py-4">
              <span className="text-[13px] font-bold" aria-hidden>
                Aa
              </span>
              <div className="relative flex flex-1 items-center justify-between" role="radiogroup" aria-label="Cỡ chữ">
                <span className="absolute inset-x-1.5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary/30" aria-hidden />
                <span
                  className="absolute left-1.5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
                  style={{
                    width: `calc((100% - 0.75rem) * ${DISPLAY_FONT_SIZES.findIndex((f) => f.id === display.fontSize) / (DISPLAY_FONT_SIZES.length - 1)})`,
                  }}
                  aria-hidden
                />
                {DISPLAY_FONT_SIZES.map((f, i) => {
                  const activeIndex = DISPLAY_FONT_SIZES.findIndex((x) => x.id === display.fontSize)
                  const active = f.id === display.fontSize
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={`${f.label} (${f.px}px)`}
                      title={f.label}
                      onClick={() => setDisplay({ fontSize: f.id })}
                      className="relative z-10 flex size-8 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          'rounded-full transition-all',
                          active ? 'size-4 bg-primary ring-4 ring-primary/25' : 'size-3',
                          !active && (i <= activeIndex ? 'bg-primary' : 'bg-primary/40'),
                        )}
                      />
                    </button>
                  )
                })}
              </div>
              <span className="text-[20px] font-bold" aria-hidden>
                Aa
              </span>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-1 text-[0.8125rem] font-bold text-muted-foreground">Màu chủ đạo</h3>
            <div className="flex justify-around rounded-2xl bg-muted px-2 py-3" role="radiogroup" aria-label="Màu chủ đạo">
              {DISPLAY_ACCENTS.map((a) => {
                const active = display.accent === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={a.label}
                    title={a.label}
                    onClick={() => setDisplay({ accent: a.id })}
                    className="flex size-11 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
                    style={{ backgroundColor: a.hex }}
                  >
                    {active ? <Check className="size-6" strokeWidth={3} color={a.id === 'yellow' ? '#0F1419' : '#FFFFFF'} /> : null}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-1 text-[0.8125rem] font-bold text-muted-foreground">Nền</h3>
            <div className="grid gap-2 rounded-2xl bg-muted p-2 sm:grid-cols-3" role="radiogroup" aria-label="Nền">
              {DISPLAY_BACKGROUNDS.map((b) => {
                const active = display.background === b.id
                return (
                  <button
                    key={b.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDisplay({ background: b.id })}
                    className={cn(
                      'flex h-16 items-center gap-3 rounded-md border-2 px-4 text-[0.9375rem] font-bold transition-colors',
                      active ? 'border-primary' : 'border-transparent',
                    )}
                    style={{ backgroundColor: b.bg, color: b.fg }}
                  >
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                        active ? 'border-primary bg-primary' : 'border-[#B9CAD3]',
                      )}
                    >
                      {active ? <Check className="size-3.5" strokeWidth={3} color="#fff" /> : null}
                    </span>
                    {b.label}
                  </button>
                )
              })}
            </div>
          </section>

          <div className="mt-6 flex justify-center">
            <Dialog.Close className="h-9 rounded-full bg-primary px-6 text-[0.9375rem] font-bold text-primary-foreground hover:bg-primary/90">
              Xong
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
