import { DashboardShell, SearchPill, type DashboardAccount, type DashboardNavItem } from '@meta-platform/ui'
import { House, ScrollText, Settings, ShieldCheck, Store, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CreateAgentDialog } from '../components/CreateAgentDialog'
import { usePlatformWrite } from '../hooks/use-platform-write'

export const PLATFORM_NAV: DashboardNavItem[] = [
  { to: '/', label: 'Tổng quan', icon: House, end: true },
  { to: '/agents', label: 'Agent', icon: Users },
  { to: '/audit', label: 'Nhật ký', icon: ScrollText },
  { to: '/system', label: 'Hệ thống', icon: Settings },
]

export function PausedBanner() {
  return (
    <div className="border-b border-border bg-warning/15 px-4 py-2.5 text-[15px] md:px-6">
      <span className="font-bold">Hệ đang tạm dừng.</span>{' '}
      <span className="text-muted-foreground">Mọi thao tác ghi on-chain bị khoá cho tới khi mở lại.</span>
    </div>
  )
}

function TopbarSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <SearchPill
      value={q}
      onChange={setQ}
      placeholder="Tìm agent theo tên, ví, SĐT…"
      className="w-full max-w-[420px]"
      onSubmit={(value) => navigate(`/agents${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`)}
    />
  )
}

function StatusChip({ paused }: { paused: boolean }) {
  return (
    <span
      className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-bold sm:inline-flex ${
        paused ? 'border-danger/40 text-danger' : 'border-success/40 text-success'
      }`}
    >
      <span className="size-2 rounded-full bg-current" />
      {paused ? 'Tạm dừng' : 'Đang chạy'}
    </span>
  )
}

/** Khung app platform khi đã có contract. */
export function PlatformShell({ account, children }: { account?: DashboardAccount; children: ReactNode }) {
  const { canWrite, adminOnlyHint, paused, isOperator } = usePlatformWrite()
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  return (
    <DashboardShell
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
      topbarLeft={<TopbarSearch />}
      topbarRight={<StatusChip paused={paused} />}
      banner={paused ? <PausedBanner /> : null}
    >
      {children}
      <CreateAgentDialog
        showTrigger={false}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void queryClient.invalidateQueries({ queryKey: ['agents'] })}
      />
    </DashboardShell>
  )
}

/** Khung tối giản trước khi đăng nhập / chưa nối contract. */
export function BareShell({ account, children }: { account?: DashboardAccount; children: ReactNode }) {
  return (
    <DashboardShell brand="Meta Platform" brandIcon={ShieldCheck} nav={PLATFORM_NAV} account={account}>
      {children}
    </DashboardShell>
  )
}

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
