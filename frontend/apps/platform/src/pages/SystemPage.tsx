import { formatWalletAddress, useActiveWallet, useContracts, useTx } from '@meta-platform/chain'
import {
  Address,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,

} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { usePlatformRole } from '../hooks/use-platform-role'

export function SystemPage() {
  const contracts = useContracts()
  const { data: wallet } = useActiveWallet()
  const { role, paused, refetchRole } = usePlatformRole()
  const tx = useTx()

  const ownerQuery = useQuery({
    queryKey: ['platform-owner'],
    enabled: !!contracts,
    queryFn: () => contracts!.access.ownerAddress(),
  })

  const walletAddr = wallet?.address?.toLowerCase() ?? ''
  const isOwner = Boolean(role?.isOwner && walletAddr)
  const ownerDisplay = ownerQuery.data ? formatWalletAddress(ownerQuery.data) : '…'

  const togglePause = (nextPaused: boolean) => {
    void tx.run(
      async () => {
        if (nextPaused) await contracts!.access.pause()
        else await contracts!.access.unpause()
      },
      {
        invalidate: [['platform-paused'], ['platform-role']],
        onSuccess: () => {
          void refetchRole()
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quản trị hệ thống</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cấu hình pause toàn platform và thông tin owner.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tạm dừng toàn hệ</CardTitle>
          <CardDescription>
            Khi pause, mọi ghi on-chain (agent, chi nhánh, …) bị chặn. Chỉ PLATFORM_OWNER được pause/unpause.
            Admin vẫn đọc dashboard nhưng không ghi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{paused ? 'Hệ đang tạm dừng' : 'Hệ đang chạy'}</p>
              <p className="text-xs text-muted-foreground">
                Owner: {ownerDisplay}
                {isOwner ? ' — đúng ví đăng nhập' : ' — cần ví owner để bật/tắt'}
              </p>
            </div>
            <span
              className={
                paused
                  ? 'inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-100'
                  : 'inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200'
              }
            >
              {paused ? 'Pause' : 'Running'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={!isOwner || paused || tx.pending}
              onClick={() => togglePause(true)}
            >
              Tạm dừng (pause)
            </Button>
            <Button variant="default" size="sm" disabled={!isOwner || !paused || tx.pending} onClick={() => togglePause(false)}>
              Mở lại (unpause)
            </Button>
          </div>
          {!isOwner ? (
            <p className="text-sm text-muted-foreground">
              Đăng nhập ví owner (<Address value={ownerQuery.data ?? ''} className="inline text-xs" />) để thao tác.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
