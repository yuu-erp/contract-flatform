import { unwrapValue } from '@meta-platform/chain'
import { formatWalletAddress, useActiveWallet, useContracts } from '@meta-platform/chain'
import {
  Address,
  Button,
  ColumnHeader,
  ColumnSection,
  ConfirmDialog,
  HashAvatar,
  Input,
  ListRow,
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
import { usePlatformWrite } from '../hooks/use-platform-write'

const FULLDB_KINDS = [
  'platform_agents',
  'platform_branches',
  'platform_audit',
  'ledger',
] as const

const PERMISSION_ROWS: [string, boolean][] = [
  ['Xem thống kê, nhật ký', true],
  ['Tạo / sửa / tạm dừng / xoá agent', true],
  ['Đổi ví chủ agent', true],
  ['Tạo / sửa / xoá chi nhánh', true],
  ['Tạm dừng / mở lại hệ thống', true],
  ['Thêm / gỡ Admin, chuyển Owner', false],
  ['Writer FullDB, Ledger poster, nguồn vai trò', false],
  ['Nâng cấp contract (proxy)', false],
]

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
  const { canPause, canUnpause, isAdmin } = usePlatformWrite()

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
    <>
      <ColumnHeader title="Hệ thống" subtitle="Owner và Admin bật/tắt hệ thống · cấu hình hệ chỉ Owner" />

      <ColumnSection title={<>Trạng thái hệ thống</>} description={<>Tạm dừng chặn mọi giao dịch ghi (agent, chi nhánh, sổ tiền…). Owner hoặc Admin bật/tắt được.</>}>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className={`inline-flex items-center gap-2 text-[17px] font-bold ${paused ? 'text-danger' : 'text-success'}`}>
            <span className="size-2.5 rounded-full bg-current" />
            {paused ? 'Hệ đang tạm dừng' : 'Hệ đang chạy'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={!canPause || tx.pending}
              onClick={() => setConfirm({ type: 'pause' })}
            >
              Tạm dừng hệ thống
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={!canUnpause || tx.pending}
              onClick={() => setConfirm({ type: 'unpause' })}
            >
              Mở lại hệ thống
            </Button>
          </div>
        </div>
      </ColumnSection>

      <ColumnSection title={<>Phân quyền nền tảng</>} description={<>Theo contract hiện tại.</>}>
        <div className="">
          <table className="w-full text-[15px]">
            <thead>
              <tr className="border-b border-border text-left text-[13px] text-muted-foreground">
                <th className="py-2 font-medium">Việc</th>
                <th className="py-2 text-center font-medium">Owner</th>
                <th className="py-2 text-center font-medium">Admin</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_ROWS.map(([label, admin]) => (
                <tr key={label} className="border-b border-border/60 last:border-0">
                  <td className="py-2">{label}</td>
                  <td className="py-2 text-center font-bold text-primary">✓</td>
                  <td className={`py-2 text-center font-bold ${admin ? 'text-primary' : 'text-muted-foreground'}`}>{admin ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ColumnSection>

      <ColumnSection title={<>Quản trị viên</>}>
        <div className="space-y-3 text-sm">
          <div className="-mx-4">
            {data?.admins.map((a) => (
              <ListRow
                key={a}
                avatar={<HashAvatar seed={a} size={40} />}
                title={formatWalletAddress(a)}
                subtitle={<span className="font-mono text-[13px]">{a}</span>}
                right={
                  isOwner ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={tx.pending}
                      onClick={() => setConfirm({ type: 'removeAdmin', account: a })}
                    >
                      Gỡ
                    </Button>
                  ) : null
                }
              />
            ))}
          </div>
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
        </div>
      </ColumnSection>

      <ColumnSection title={<>Nguồn vai trò agent (đọc)</>}>
        <div className="space-y-1 text-sm">
          {data?.sources.map((s) => (
            <div key={s}>
              <Address value={s} />
            </div>
          ))}
        </div>
      </ColumnSection>

      <ColumnSection title={<>Tra quyền ghi FullDB</>}>
        <div className="space-y-2 text-sm">
          <Input placeholder="Writer 0x…" value={canWriteWriter} onChange={(e) => setCanWriteWriter(e.target.value)} />
          <select
            className="h-10 w-full rounded-md border border-input bg-transparent px-2 text-[15px]"
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
        </div>
      </ColumnSection>

      <ColumnSection title={<>Ledger poster (đọc)</>}>
        <div className="space-y-3 text-sm">
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
        </div>
      </ColumnSection>

      <ColumnSection className="bg-danger/[0.03]" title={<><span className="text-danger">Vùng nguy hiểm (chỉ Owner)</span></>} description={<>Thao tác bất khả đảo — cần xác nhận trước khi gửi giao dịch.</>}>
        <div className="space-y-6 text-sm">
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
        </div>
      </ColumnSection>

      {!isOwner && data ? (
        <p className="text-sm text-muted-foreground">
          {isAdmin ? 'Ví Admin chỉ bật/tắt hệ thống ở trang này. ' : ''}
          Các mục cấu hình hệ cần ví Owner ({formatWalletAddress(data.owner)}).
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
    </>
  )
}

function describeConfirm(kind: ConfirmKind): { title: string; description: string } {
  switch (kind.type) {
    case 'pause':
      return {
        title: 'Tạm dừng toàn hệ?',
        description:
          'Mọi giao dịch ghi on-chain (agent, chi nhánh, sổ tiền, …) bị chặn cho đến khi mở lại. Owner hoặc Admin mở lại được.',
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