import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import { chainIdFromEnv } from '@/config'
import { readDeployment } from '@/hooks/use-contracts'
import { formatWalletAddress, useActiveWallet, useConnectWallet } from '@/hooks/use-active-wallet'
import { useMyRoles } from '@/hooks/use-platform'
import { ROLE_LABEL } from '@/lib/roles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdminTab } from '@/pages/admin-tab'
import { ManagerTab } from '@/pages/manager-tab'
import { OwnerTab } from '@/pages/owner-tab'
import { ProbeTab } from '@/pages/probe-tab'
import { StaffTab } from '@/pages/staff-tab'

const NAV = [
  { to: '/admin', label: 'Admin' },
  { to: '/owner', label: 'Chủ agent' },
  { to: '/manager', label: 'Quản lý' },
  { to: '/staff', label: 'Nhân viên' },
  { to: '/probe', label: 'Thử quyền' },
]

function Login() {
  const connect = useConnectWallet()
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Meta Platform test</h1>
      <p className="text-sm text-muted-foreground">Đăng nhập ví MetaNode để thử luồng vai trò trên chain đã deploy.</p>
      <Button
        type="button"
        disabled={connect.isPending}
        onClick={() => {
          void connect.mutateAsync().catch((error: unknown) => {
            toast.error(error instanceof Error ? error.message : 'Không đăng nhập được ví.')
          })
        }}
      >
        {connect.isPending ? 'Đang kết nối…' : 'Kết nối ví'}
      </Button>
    </div>
  )
}

function RoleBar() {
  const { data: wallet } = useActiveWallet()
  const roles = useMyRoles()
  const chainId = chainIdFromEnv()
  const data = roles.data
  return (
    <header className="grid gap-2 border-b px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">Meta Platform test</span>
        <Badge variant="outline">chain {chainId}</Badge>
        <span className="font-mono text-xs">{wallet?.address ? formatWalletAddress(wallet.address) : 'Chưa có ví'}</span>
        {data?.paused ? <Badge variant="destructive">Hệ đang pause</Badge> : null}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {data?.isPlatformOwner ? <Badge>PLATFORM_OWNER</Badge> : null}
        {data?.isPendingOwner ? <Badge variant="secondary">Pending owner</Badge> : null}
        {data?.isAdmin ? <Badge>PLATFORM_ADMIN</Badge> : null}
        {data && data.agentId !== 0 ? <Badge>Chủ agent #{data.agentId}</Badge> : null}
        {data?.branches.map((branch) => (
          <Badge key={branch.branchId} variant="outline">
            Chi nhánh #{branch.branchId}: {ROLE_LABEL[branch.role] ?? branch.role}
          </Badge>
        ))}
        {data && !data.isPlatformOwner && !data.isPendingOwner && !data.isAdmin && data.agentId === 0 && data.branches.length === 0 ? (
          <span className="text-muted-foreground">Không có vai trò</span>
        ) : null}
        {roles.isPending ? <span className="text-muted-foreground">Đang đọc quyền…</span> : null}
        {roles.isError ? <span className="text-destructive">Không đọc được quyền.</span> : null}
      </div>
    </header>
  )
}

function Shell() {
  const deployment = readDeployment()
  const { data: wallet, isPending } = useActiveWallet()
  if ('error' in deployment) {
    return <p className="p-6 text-sm text-destructive">{deployment.error}</p>
  }
  if (isPending) return <p className="p-6 text-sm text-muted-foreground">Đang tải ví…</p>
  if (!wallet) return <Login />
  return (
    <div className="min-h-screen">
      <RoleBar />
      <nav className="flex flex-wrap gap-2 border-b px-4 py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="mx-auto grid max-w-5xl gap-6 p-4">
        <Routes>
          <Route index element={<Navigate to="/admin" replace />} />
          <Route path="admin" element={<AdminTab />} />
          <Route path="owner" element={<OwnerTab />} />
          <Route path="manager" element={<ManagerTab />} />
          <Route path="staff" element={<StaffTab />} />
          <Route path="probe" element={<ProbeTab />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
