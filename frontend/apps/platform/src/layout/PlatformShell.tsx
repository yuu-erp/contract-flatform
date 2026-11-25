import { ColumnShell, type ShellAccount, type ShellNavItem } from '@meta-platform/ui'
import { House, ScrollText, Settings, ShieldCheck, Store, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CreateAgentDialog } from '../components/CreateAgentDialog'
import { PlatformRightRail } from '../components/PlatformRightRail'
import { usePlatformRole } from '../hooks/use-platform-role'
import { usePlatformWrite } from '../hooks/use-platform-write'

export const PLATFORM_NAV: ShellNavItem[] = [
  { to: '/', label: 'Tổng quan', icon: House, end: true },
  { to: '/agents', label: 'Agent', icon: Users },
  { to: '/audit', label: 'Nhật ký', icon: ScrollText },
  { to: '/system', label: 'Hệ thống', icon: Settings },
]

/** Dải cảnh báo khi hệ tạm dừng, đặt trên cùng cột giữa. */
export function PausedBanner() {
  return (
    <div className="border-b border-border bg-warning/15 px-4 py-2.5 text-[15px] text-foreground">
      <span className="font-bold">Hệ đang tạm dừng.</span>{' '}
      <span className="text-muted-foreground">Mọi thao tác ghi on-chain bị khoá cho tới khi mở lại.</span>
    </div>
  )
}

/** Khung app platform khi đã có contract: nút "Tạo agent", cột phải, dải tạm dừng. */
export function PlatformShell({ account, children }: { account?: ShellAccount; children: ReactNode }) {
  const { canWrite, adminOnlyHint, paused, isOperator } = usePlatformWrite()
  const { error: chainError } = usePlatformRole()
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  return (
    <ColumnShell
      brand="Meta Platform"
      brandIcon={ShieldCheck}
      nav={PLATFORM_NAV}
      primaryAction={
        isOperator
          ? {
              label: 'Tạo agent',
              icon: Store,
              onClick: () => setCreateOpen(true),
              disabled: !canWrite,
              title: adminOnlyHint ?? 'Tạo agent mới',
            }
          : undefined
      }
      account={account}
      // Mất kết nối chain: ẩn cột phải để không hiện số liệu / trạng thái sai.
      rightRail={chainError ? undefined : <PlatformRightRail />}
      banner={paused && !chainError ? <PausedBanner /> : null}
    >
      {children}
      <CreateAgentDialog
        showTrigger={false}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void queryClient.invalidateQueries({ queryKey: ['agents'] })}
      />
    </ColumnShell>
  )
}

/** Khung tối giản trước khi đăng nhập / chưa nối contract. */
export function BareShell({ account, children }: { account?: ShellAccount; children: ReactNode }) {
  return (
    <ColumnShell brand="Meta Platform" brandIcon={ShieldCheck} nav={PLATFORM_NAV} account={account}>
      {children}
    </ColumnShell>
  )
}

/** Mục trong menu tài khoản. */
export function AccountMenuItem({
  children,
  onClick,
  active,
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-3 text-left text-[15px] font-bold transition-colors hover:bg-row-hover disabled:opacity-50"
    >
      {children}
      {active ? <span className="size-2.5 rounded-full bg-primary" /> : null}
    </button>
  )
}
