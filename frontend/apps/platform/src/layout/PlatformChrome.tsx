import {
  ContractsProvider,
  formatWalletAddress,
  isConnectivityError,
  useActiveWallet,
  useConnectWallet,
  usePlatformContracts,
} from '@meta-platform/chain'
import { ColumnHeader, HashAvatar, PageLoader, SystemErrorScreen, useWalletTheme, type ShellAccount } from '@meta-platform/ui'
import { Loader2, Wallet } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { platformRoleLabel } from '../components/PlatformRoleStatus'
import { platformChainId, platformDeployments } from '../config/deployments'
import { usePlatformRole } from '../hooks/use-platform-role'
import { isPreviewMock } from '../preview/env'
import { AccountMenuItem, BareShell, PlatformShell } from './PlatformShell'
import { PreviewPlatformChrome } from './PreviewPlatformChrome'

/** Màn "không có quyền" trong cột giữa. */
export function NoPlatformAccess({ address, extra }: { address?: string; extra?: React.ReactNode }) {
  return (
    <>
      <ColumnHeader title="Không có quyền" />
      <div className="px-8 py-10">
        <h2 className="text-[31px] leading-9 font-extrabold tracking-tight">Ví này chưa được cấp quyền</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {address ? `Ví ${formatWalletAddress(address)} không phải Owner hay Admin nền tảng. ` : ''}
          Chọn ví khác ở menu tài khoản.
        </p>
        {extra ? <div className="mt-6">{extra}</div> : null}
      </div>
    </>
  )
}

/** Màn lỗi hệ thống khi không đọc được chain (RPC chết, chain tắt, hết thời gian). */
export function PlatformSystemError({
  error,
  onRetry,
  retrying,
}: {
  error: unknown
  onRetry: () => void
  retrying: boolean
}) {
  const network = isConnectivityError(error)
  return (
    <>
      <ColumnHeader title="Lỗi hệ thống" />
      <SystemErrorScreen
        title={network ? 'Không kết nối được hệ thống' : 'Không đọc được dữ liệu on-chain'}
        description={
          network
            ? 'Chain hoặc RPC đang tạm ngưng nên chưa kiểm tra được quyền và số liệu. Vui lòng thử lại sau ít phút.'
            : 'Lệnh đọc contract thất bại. Vui lòng thử lại sau; nếu vẫn lỗi, báo quản trị hệ thống kèm chi tiết bên dưới.'
        }
        detail={error instanceof Error ? `${error.name}: ${error.message}` : String(error)}
        onRetry={onRetry}
        retrying={retrying}
      />
    </>
  )
}

/** Gác quyền chung cho cả chế độ thật và xem trước. */
export function PlatformGate({ noAccessExtra }: { noAccessExtra?: React.ReactNode }) {
  const { role, loading, error, retry, retrying } = usePlatformRole()
  const { data: wallet } = useActiveWallet()
  const location = useLocation()

  if (error) return <PlatformSystemError error={error} onRetry={retry} retrying={retrying} />
  if (loading) return <PageLoader message="Đang kiểm tra quyền on-chain…" />
  if (!role?.isOwner && !role?.isAdmin && !role?.isPendingOwner) {
    return <NoPlatformAccess address={wallet?.address} extra={noAccessExtra} />
  }
  if (!role.isOwner && !role.isAdmin && location.pathname.startsWith('/system')) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

function useLiveAccount(roleText: string | null): ShellAccount | undefined {
  const theme = useWalletTheme()
  const { data: wallet } = useActiveWallet()
  const connect = useConnectWallet(theme)
  if (!wallet) return undefined
  return {
    avatar: <HashAvatar seed={wallet.address} size={40} />,
    name: wallet.name?.trim() || roleText || 'Ví đang chọn',
    handle: `${formatWalletAddress(wallet.address)}${roleText ? ` · ${roleText}` : ''}`,
    menu: (
      <AccountMenuItem onClick={() => connect.mutate()} disabled={connect.isPending}>
        Đổi ví {formatWalletAddress(wallet.address)}
      </AccountMenuItem>
    ),
  }
}

function PlatformChromeWithContracts() {
  const { role, loading, error } = usePlatformRole()
  const account = useLiveAccount(error ? 'Mất kết nối' : loading ? null : platformRoleLabel(role, false))
  return (
    <PlatformShell account={account}>
      <PlatformGate />
    </PlatformShell>
  )
}

function LoginPanel({ pending, onLogin }: { pending: boolean; onLogin: () => void }) {
  return (
    <>
      <ColumnHeader title="Đăng nhập" />
      <div className="px-8 py-12">
        <h2 className="text-[31px] leading-9 font-extrabold tracking-tight">Quản trị nền tảng on-chain</h2>
        <p className="mt-3 text-[17px] text-muted-foreground">
          Theo dõi doanh thu toàn hệ, quản lý agent và chi nhánh. Cần ví được cấp Owner hoặc Admin nền tảng.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={onLogin}
          className="mt-8 inline-flex h-[52px] w-full max-w-[300px] items-center justify-center gap-2 rounded-full bg-primary text-[17px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Wallet className="size-5" />}
          Chọn ví
        </button>
      </div>
    </>
  )
}

function LivePlatformChrome() {
  const theme = useWalletTheme()
  const { data: wallet, isPending: walletLoading } = useActiveWallet()
  const connect = useConnectWallet(theme)
  const contracts = usePlatformContracts(platformChainId, platformDeployments)
  const account = useLiveAccount(null)

  if (wallet && contracts) {
    return (
      <ContractsProvider value={contracts}>
        <PlatformChromeWithContracts />
      </ContractsProvider>
    )
  }

  return (
    <BareShell account={account}>
      {walletLoading ? (
        <PageLoader message="Đang tải ví…" />
      ) : !wallet ? (
        <LoginPanel pending={connect.isPending} onLogin={() => connect.mutate()} />
      ) : (
        <PageLoader message="Đang kết nối contract…" />
      )}
    </BareShell>
  )
}

export function PlatformChrome() {
  if (isPreviewMock()) return <PreviewPlatformChrome />
  return <LivePlatformChrome />
}
