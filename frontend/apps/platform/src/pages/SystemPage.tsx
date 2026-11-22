import { unwrapValue } from '@meta-platform/chain'
import { formatWalletAddress, useActiveWallet, useContracts, useTx } from '@meta-platform/chain'
import {
  Address,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@meta-platform/ui'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { isValidEthAddress } from '../lib/address'
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

export function SystemPage() {
  const contracts = useContracts()
  const { data: wallet } = useActiveWallet()
  const { role, paused, refetchRole } = usePlatformRole()
  const tx = useTx()

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

  const togglePause = (nextPaused: boolean) => {
    void tx.run(
      async () => {
        if (nextPaused) await contracts!.access.pause()
        else await contracts!.access.unpause()
      },
      {
        invalidate: [['platform-paused'], ['platform-role'], ['system-snapshot']],
        onSuccess: () => void refetchRole(),
      },
    )
  }

  const data = systemQuery.data

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quản trị hệ thống</h2>
        <p className="mt-1 text-sm text-muted-foreground">Chỉ PLATFORM_OWNER. Pause, admin, owner, FullDB và Ledger poster.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạm dừng toàn hệ</CardTitle>
          <CardDescription>Khi pause, mọi ghi on-chain bị chặn. Chỉ PLATFORM_OWNER được pause/unpause.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{paused ? 'Hệ đang tạm dừng' : 'Hệ đang chạy'}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={!isOwner || paused || tx.pending}
              onClick={() => togglePause(true)}
            >
              Tạm dừng (pause)
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={!isOwner || !paused || tx.pending}
              onClick={() => togglePause(false)}
            >
              Mở lại (unpause)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quản trị viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-1">
            {data?.admins.map((a) => (
              <li key={a} className="flex flex-wrap items-center justify-between gap-2">
                <Address value={a} />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!isOwner || tx.pending}
                  onClick={() =>
                    void tx.run(
                      async () => contracts!.access.removePlatformAdmin(a),
                      { invalidate: [['system-snapshot']] },
                    )
                  }
                >
                  Gỡ
                </Button>
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
          <CardTitle>Chuyển owner (hai bước)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Owner hiện tại: {data ? <Address value={data.owner} /> : '…'}
          </p>
          <p>
            Pending: {data?.pending && data.pending !== '0x0000000000000000000000000000000000000000' ? (
              <Address value={data.pending} />
            ) : (
              '—'
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Input placeholder="0x… owner mới" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
            <Button
              disabled={!isOwner || tx.pending || !isValidEthAddress(newOwner.trim())}
              onClick={() =>
                void tx.run(
                  async () => contracts!.access.transferOwnership(newOwner.trim()),
                  { invalidate: [['system-snapshot'], ['platform-role']] },
                )
              }
            >
              Đề xuất owner
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
          <CardTitle>Ledger poster</CardTitle>
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
            <legend>Loại bút toán</legend>
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
          <Button
            disabled={!isOwner || tx.pending || !isValidEthAddress(posterAddr.trim())}
            onClick={() =>
              void tx.run(async () => {
                const mask = ledgerKindsMaskFromBits(posterKindsSelected)
                await contracts!.ledger.setPoster(posterAddr.trim(), mask)
              })
            }
          >
            setPoster
          </Button>
        </CardContent>
      </Card>

      {!isOwner && data ? (
        <p className="text-sm text-muted-foreground">
          Đăng nhập ví owner ({formatWalletAddress(data.owner)}) để ghi.
        </p>
      ) : null}
    </div>
  )
}