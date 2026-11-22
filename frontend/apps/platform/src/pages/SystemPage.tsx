import { unwrapValue } from '@meta-platform/chain'
import { formatWalletAddress, useActiveWallet, useContracts } from '@meta-platform/chain'
import {
  Address,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Input,
} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { isValidEthAddress, useAppTx } from '@meta-platform/ui'
import {
  LEDGER_KIND_CHECKBOXES,
  ledgerKindsMaskFromBits,
  ledgerKindsMaskLabels,
} from '../lib/ledger-poster'
import { usePlatformRole } from '../hooks/use-platform-role'

const FULLDB_KINDS = [
  'platform_agents',
  'platform_branches',
  'platform_audit',
  'ledger',
] as const

type ConfirmKind =
  | { type: 'pause' }
  | { type: 'unpause' }
  | { type: 'removeAdmin'; account: string }
  | { type: 'transferOwner'; account: string }
  | { type: 'setPoster'; account: string; mask: number; kindLabels: string[] }

export function SystemPage() {
  const contracts = useContracts()
  const { data: wallet } = useActiveWallet()
  const { role, paused, refetchRole } = usePlatformRole()
  const tx = useAppTx()

  const walletAddr = wallet?.address?.toLowerCase() ?? ''
  const isOwner = Boolean(role?.isOwner && walletAddr)

  const systemQuery = useQuery({
    queryKey: ['system-snapshot'],
    enabled: !!contracts,
    queryFn: async () => {
      const access = contracts!.access
      const [owner, pending, count, sources] = await Promise.all([
        access.ownerAddress(),
        access.pendingOwnerAddress(),
        access.platformAdminCount(),
        access.agentRoleSources(),
      ])
      const admins: string[] = []
      for (let offset = 0; offset < count; offset += 20) {
        admins.push(...(await access.platformAdmins(offset, 20)))
      }
      return { owner, pending, count, sources, admins }
    },
  })

  const [newAdmin, setNewAdmin] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [canWriteWriter, setCanWriteWriter] = useState('')
  const [canWriteKind, setCanWriteKind] = useState<(typeof FULLDB_KINDS)[number]>('platform_agents')
  const [canWriteResult, setCanWriteResult] = useState<boolean | null>(null)
  const [posterAddr, setPosterAddr] = useState('')
  const [posterKindsSelected, setPosterKindsSelected] = useState<number[]>([])
  const [posterMaskRead, setPosterMaskRead] = useState<number | null>(null)
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null)

  const data = systemQuery.data

  const confirmCopy = confirm ? describeConfirm(confirm) : null

  const executeConfirm = async () => {
    if (!confirm || !contracts) return
    const kind = confirm
    setConfirm(null)
    switch (kind.type) {
      case 'pause':
        await tx.run(
          async () => contracts.access.pause(),
          { invalidate: [['platform-paused'], ['platform-role'], ['system-snapshot']], onSuccess: () => void refetchRole() },
        )
        break
      case 'unpause':
        await tx.run(
          async () => contracts.access.unpause(),
          { invalidate: [['platform-paused'], ['platform-role'], ['system-snapshot']], onSuccess: () => void refetchRole() },
        )
        break
      case 'removeAdmin':
        await tx.run(async () => contracts.access.removePlatformAdmin(kind.account), {
          invalidate: [['system-snapshot']],
        })
        break
      case 'transferOwner':
        await tx.run(async () => contracts.access.transferOwnership(kind.account), {
          invalidate: [['system-snapshot'], ['platform-role']],
          onSuccess: () => setNewOwner(''),
        })
        break
      case 'setPoster':
        await tx.run(async () => contracts.ledger.setPoster(kind.account, kind.mask))
        break
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quản trị hệ thống</h2>
        <p className="mt-1 text-sm text-muted-foreground">Chỉ PLATFORM_OWNER. Pause, admin, owner, FullDB và Ledger poster.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản trị viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-1">
            {data?.admins.map((a) => (
              <li key={a} className="flex flex-wrap items-center justify-between gap-2">
                <Address value={a} />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Input placeholder="0x… admin mới" value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} />
            <Button
              disabled={!isOwner || tx.pending || !isValidEthAddress(newAdmin.trim())}
              onClick={() =>
                void tx.run(
                  async () => contracts!.access.addPlatformAdmin(newAdmin.trim()),
                  { invalidate: [['system-snapshot']], onSuccess: () => setNewAdmin('') },
                )
              }
            >
              Thêm admin
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nguồn vai trò agent (đọc)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {data?.sources.map((s) => (
            <div key={s}>
              <Address value={s} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tra quyền ghi FullDB</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Input placeholder="Writer 0x…" value={canWriteWriter} onChange={(e) => setCanWriteWriter(e.target.value)} />
          <select
            className="h-9 w-full rounded-md border px-2"
            value={canWriteKind}
            onChange={(e) => setCanWriteKind(e.target.value as (typeof FULLDB_KINDS)[number])}
          >
            {FULLDB_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            disabled={!isValidEthAddress(canWriteWriter.trim())}
            onClick={() =>
              void (async () => {
                const r = await contracts!.history.canWrite(canWriteWriter.trim(), canWriteKind)
                setCanWriteResult(Boolean(unwrapValue(r)))
              })()
            }
          >
            Kiểm tra canWrite
          </Button>
          {canWriteResult != null ? (
            <p>{canWriteResult ? 'Được phép ghi' : 'Không được phép'}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ledger poster (đọc)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Input placeholder="Poster 0x…" value={posterAddr} onChange={(e) => setPosterAddr(e.target.value)} />
          <Button
            variant="outline"
            disabled={!isValidEthAddress(posterAddr.trim())}
            onClick={() =>
              void (async () => {
                const mask = await contracts!.ledger.posterKinds(posterAddr.trim())
                setPosterMaskRead(mask)
                const kinds: number[] = []
                for (const { kind } of LEDGER_KIND_CHECKBOXES) {
                  if ((mask & (1 << kind)) !== 0) kinds.push(kind)
                }
                setPosterKindsSelected(kinds)
              })()
            }
          >
            Đọc posterKinds
          </Button>
          {posterMaskRead != null ? <p>Hiện tại: {ledgerKindsMaskLabels(posterMaskRead).join(', ') || '—'}</p> : null}
          <fieldset className="space-y-2">
            <legend>Loại bút toán (dùng khi đặt poster ở Vùng nguy hiểm)</legend>
            {LEDGER_KIND_CHECKBOXES.map(({ kind, label }) => (
              <label key={kind} className="mr-3 inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={posterKindsSelected.includes(kind)}
                  onChange={() => {
                    setPosterKindsSelected((prev) =>
                      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind],
                    )
                  }}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
          <CardDescription>Thao tác bất khả đảo — cần xác nhận trước khi gửi giao dịch.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <section className="space-y-2">
            <p className="font-medium">Tạm dừng toàn hệ</p>
            <p>{paused ? 'Hệ đang tạm dừng' : 'Hệ đang chạy'}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                size="sm"
                disabled={!isOwner || paused || tx.pending}
                onClick={() => setConfirm({ type: 'pause' })}
              >
                Tạm dừng (pause)
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={!isOwner || !paused || tx.pending}
                onClick={() => setConfirm({ type: 'unpause' })}
              >
                Mở lại (unpause)
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <p className="font-medium">Gỡ quản trị viên</p>
            <ul className="space-y-2">
              {data?.admins.map((a) => (
                <li key={a} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs break-all">{a}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!isOwner || tx.pending}
                    onClick={() => setConfirm({ type: 'removeAdmin', account: a })}
                  >
                    Gỡ
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <p className="font-medium">Chuyển owner (hai bước)</p>
            <p>
              Owner hiện tại: {data ? <Address value={data.owner} /> : '…'}
            </p>
            <p>
              Pending:{' '}
              {data?.pending && data.pending !== '0x0000000000000000000000000000000000000000' ? (
                <Address value={data.pending} />
              ) : (
                '—'
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Input placeholder="0x… owner mới" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
              <Button
                variant="destructive"
                disabled={!isOwner || tx.pending || !isValidEthAddress(newOwner.trim())}
                onClick={() => setConfirm({ type: 'transferOwner', account: newOwner.trim() })}
              >
                Đề xuất owner
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <p className="font-medium">Đặt poster Ledger (setPoster)</p>
            <Button
              variant="destructive"
              disabled={!isOwner || tx.pending || !isValidEthAddress(posterAddr.trim())}
              onClick={() => {
                const mask = ledgerKindsMaskFromBits(posterKindsSelected)
                setConfirm({
                  type: 'setPoster',
                  account: posterAddr.trim(),
                  mask,
                  kindLabels: ledgerKindsMaskLabels(mask),
                })
              }}
            >
              setPoster
            </Button>
          </section>
        </CardContent>
      </Card>

      {!isOwner && data ? (
        <p className="text-sm text-muted-foreground">
          Đăng nhập ví owner ({formatWalletAddress(data.owner)}) để ghi.
        </p>
      ) : null}

      <ConfirmDialog
        open={confirm != null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirmCopy?.title ?? 'Xác nhận'}
        description={confirmCopy?.description}
        confirmLabel="Gửi giao dịch"
        pending={tx.pending}
        onConfirm={() => void executeConfirm()}
      />
    </div>
  )
}

function describeConfirm(kind: ConfirmKind): { title: string; description: string } {
  switch (kind.type) {
    case 'pause':
      return {
        title: 'Tạm dừng toàn hệ?',
        description:
          'Mọi giao dịch ghi on-chain (agent, chi nhánh, sổ tiền, …) sẽ bị chặn cho đến khi unpause. Admin chỉ đọc được dashboard.',
      }
    case 'unpause':
      return {
        title: 'Mở lại hệ thống?',
        description: 'Khôi phục mọi thao tác ghi on-chain bình thường.',
      }
    case 'removeAdmin':
      return {
        title: 'Gỡ quản trị viên?',
        description: `Ví ${kind.account} sẽ mất quyền PLATFORM_ADMIN và không tạo/sửa agent hay chi nhánh được nữa.`,
      }
    case 'transferOwner':
      return {
        title: 'Đề xuất chủ sở hữu mới?',
        description: `Ví ${kind.account} sẽ nhận toàn quyền nâng cấp và quản trị nền tảng sau khi chấp nhận (acceptOwnership).`,
      }
    case 'setPoster': {
      if (kind.mask === 0) {
        return {
          title: 'Thu hồi poster Ledger?',
          description: `Thu hồi toàn bộ quyền ghi sổ của ${kind.account}. Địa chỉ này sẽ không đăng bút toán loại nào.`,
        }
      }
      const list = kind.kindLabels.length > 0 ? kind.kindLabels.join(', ') : '(không chọn loại — mask 0)'
      return {
        title: 'Đặt poster Ledger?',
        description: `Cấp cho ${kind.account} quyền ghi các loại bút toán: ${list}.`,
      }
    }
  }
}