import { useActiveWallet, useContracts } from '@meta-platform/chain'
import { HashAvatar, PageLoader, type ShellAccount } from '@meta-platform/ui'
import { platformRoleLabel } from '../components/PlatformRoleStatus'
import { usePlatformRole } from '../hooks/use-platform-role'
import { usePreviewWallet, type PreviewRole } from '../preview/PreviewBootstrap'
import { PlatformGate } from './PlatformChrome'
import { AccountMenuItem, PlatformShell } from './PlatformShell'

const PREVIEW_ROLES: { id: PreviewRole; label: string }[] = [
  { id: 'owner', label: 'Owner nền tảng' },
  { id: 'admin', label: 'Admin nền tảng' },
  { id: 'pending', label: 'Chờ nhận owner' },
  { id: 'none', label: 'Ví không có quyền' },
]

function PreviewRoleItems() {
  const { role, setRole } = usePreviewWallet()
  return (
    <>
      <p className="px-4 pb-1 text-[13px] font-bold text-muted-foreground">Xem trước với vai trò</p>
      {PREVIEW_ROLES.map((r) => (
        <AccountMenuItem key={r.id} active={role === r.id} onClick={() => setRole(r.id)}>
          {r.label}
        </AccountMenuItem>
      ))}
    </>
  )
}

export function PreviewPlatformChrome() {
  const contracts = useContracts()
  const { role, loading, error } = usePlatformRole()
  const { data: wallet } = useActiveWallet()

  if (!contracts) return <PageLoader message="Đang tải dữ liệu giả…" />

  const address = wallet?.address ?? '0x0'
  const account: ShellAccount = {
    avatar: <HashAvatar seed={address} size={40} />,
    name: error ? 'Mất kết nối' : loading ? 'Đang kiểm tra…' : platformRoleLabel(role, false),
    handle: `Xem trước · ${address.slice(0, 6)}…${address.slice(-4)}`,
    menu: <PreviewRoleItems />,
  }

  return (
    <PlatformShell account={account}>
      <PlatformGate noAccessExtra={<div className="rounded-2xl border border-border py-2"><PreviewRoleItems /></div>} />
    </PlatformShell>
  )
}
