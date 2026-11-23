import {
  formatWalletAddress,
  isAddress,
  normalizeHexAddress,
  Role,
  useActiveWallet,
  useAgentBranches,
  useContracts,
  useMembers,
  type AgentAccess,
} from '@meta-platform/chain'
import {
  Address,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  PageLoader,
  useAppTx,
} from '@meta-platform/ui'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useOutletContext } from 'react-router-dom'
import { allowedStaffActions, type StaffAction, type StaffViewer } from '../lib/allowed-staff-actions'

type Ctx = { access: AgentAccess; domain?: string }

const ROLE_LABEL: Record<number, string> = {
  [Role.Staff]: 'Staff',
  [Role.Manager]: 'Manager',
}

const ACTION_LABEL: Record<StaffAction, string> = {
  grantManager: 'Cấp Manager',
  grantStaff: 'Cấp Staff',
  demoteToStaff: 'Hạ xuống Staff',
  promoteToManager: 'Thăng Manager',
  revoke: 'Thu hồi',
  renounce: 'Rời chi nhánh',
}

export function StaffPage() {
  const { access } = useOutletContext<Ctx>()
  if (access.kind !== 'owner' && access.kind !== 'manager') {
    return <EmptyState title="Không có quyền" description="Trang nhân sự chỉ dành cho chủ agent hoặc quản lý." />
  }
  if (access.kind === 'manager') {
    return <StaffBranchPanel agentId={access.agentId} branchId={access.branchId} viewerKind="manager" />
  }
  return <OwnerStaffPage agentId={access.agentId} />
}

function OwnerStaffPage({ agentId }: { agentId: number }) {
  const branches = useAgentBranches(agentId)
  const list = useMemo(
    () =>
      (branches.data?.rows ?? []).map((b) => ({
        branchId: b.record.branchId,
        name: b.record.profile.name,
      })),
    [branches.data],
  )
  const [branchId, setBranchId] = useState<number | null>(null)
  const activeId = branchId ?? list[0]?.branchId ?? null

  if (branches.isLoading) return <PageLoader message="Đang tải chi nhánh…" />
  if (!activeId) return <EmptyState title="Chưa có chi nhánh" />

  return (
    <div className="space-y-4">
      <BranchPicker branches={list} value={activeId} onChange={setBranchId} />
      <StaffBranchPanel agentId={agentId} branchId={activeId} viewerKind="owner" key={activeId} />
    </div>
  )
}

function BranchPicker({
  branches,
  value,
  onChange,
}: {
  branches: { branchId: number; name: string }[]
  value: number
  onChange: (id: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-2">
      {branches.map((b) => (
        <button
          key={b.branchId}
          type="button"
          onClick={() => onChange(b.branchId)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            value === b.branchId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {b.name || `#${b.branchId}`}
        </button>
      ))}
    </div>
  )
}

function StaffBranchPanel({
  agentId: _agentId,
  branchId,
  viewerKind,
}: {
  agentId: number
  branchId: number
  viewerKind: 'owner' | 'manager'
}) {
  const { data: wallet } = useActiveWallet()
  const account = wallet?.address ?? ''
  const viewer: StaffViewer =
    viewerKind === 'owner' ? { kind: 'owner' } : { kind: 'manager', account, branchId }
  const members = useMembers(branchId, 0)
  const contracts = useContracts()
  const tx = useAppTx()
  const [grantOpen, setGrantOpen] = useState(false)
  const [confirm, setConfirm] = useState<{ action: StaffAction; target?: string } | null>(null)

  const invalidateKey = ['members', branchId, 0] as const
  const grantActions = allowedStaffActions(viewer, { kind: 'none' })

  const runAction = async (action: StaffAction, targetAccount?: string) => {
    if (!contracts) return false
    const target = normalizeHexAddress(targetAccount ?? account)
    if (action === 'grantManager' || action === 'promoteToManager') {
      return tx.run(() => contracts.agentAccess.grantRole(branchId, target, Role.Manager), { invalidate: [invalidateKey] })
    }
    if (action === 'grantStaff' || action === 'demoteToStaff') {
      return tx.run(() => contracts.agentAccess.grantRole(branchId, target, Role.Staff), { invalidate: [invalidateKey] })
    }
    if (action === 'revoke') {
      return tx.run(() => contracts.agentAccess.revokeRole(branchId, target), { invalidate: [invalidateKey] })
    }
    if (action === 'renounce') {
      return tx.run(() => contracts.agentAccess.renounceRole(branchId), { invalidate: [invalidateKey] })
    }
    return false
  }

  type Row = NonNullable<typeof members.data>[number]
  const columns = [
    {
      key: 'account',
      header: 'Ví',
      render: (r: Row) => <Address value={r.account} />,
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (r: Row) => ROLE_LABEL[r.role] ?? String(r.role),
    },
    {
      key: 'actions',
      header: '',
      render: (r: Row) => {
        const isSelf = normalizeHexAddress(r.account) === normalizeHexAddress(account)
        const target = isSelf ? ({ kind: 'self' } as const) : { kind: 'member' as const, account: r.account, role: r.role }
        const actions = allowedStaffActions(viewer, target)
        return <ActionButtons actions={actions} onPick={(a) => setConfirm({ action: a, target: isSelf ? undefined : r.account })} />
      },
    },
  ]

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Nhân sự chi nhánh #{branchId}</CardTitle>
          {grantActions.length > 0 ? (
            <Button type="button" size="sm" onClick={() => setGrantOpen(true)}>
              Cấp vai trò
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={members.data ?? []}
            loading={members.isLoading}
            error={members.error?.message}
            onRetry={() => members.refetch()}
            emptyTitle="Chưa có thành viên"
            page={0}
            pageSize={50}
            total={members.data?.length ?? 0}
            onPageChange={() => {}}
          />
        </CardContent>
      </Card>

      {grantOpen ? (
        <GrantRoleOverlay
          canManager={grantActions.includes('grantManager')}
          canStaff={grantActions.includes('grantStaff')}
          onClose={() => setGrantOpen(false)}
          onSubmit={async (addr, asManager) => {
            if (!isAddress(addr)) return false
            const ownerId = await contracts!.agents.agentIdOf(addr)
            if (ownerId !== 0) {
              toast.error('Chủ agent không được gán vai trò Manager/Staff.')
              return false
            }
            return runAction(asManager ? 'grantManager' : 'grantStaff', addr)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={confirm != null}
        title={confirm ? ACTION_LABEL[confirm.action] : ''}
        description={
          confirm?.action === 'renounce'
            ? 'Bạn có chắc muốn rời chi nhánh này?'
            : confirm?.target
              ? `Xác nhận thao tác với ví ${formatWalletAddress(confirm.target)}?`
              : 'Xác nhận thao tác?'
        }
        onConfirm={async () => {
          if (!confirm) return
          const ok = await runAction(confirm.action, confirm.target)
          if (ok) setConfirm(null)
        }}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
      />
    </>
  )
}

function ActionButtons({ actions, onPick }: { actions: StaffAction[]; onPick: (a: StaffAction) => void }) {
  if (actions.length === 0) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {actions.map((a) => (
        <Button
          key={a}
          type="button"
          size="sm"
          variant={a === 'revoke' || a === 'renounce' ? 'outline' : 'secondary'}
          onClick={() => onPick(a)}
        >
          {ACTION_LABEL[a]}
        </Button>
      ))}
    </div>
  )
}

function GrantRoleOverlay({
  canManager,
  canStaff,
  onClose,
  onSubmit,
}: {
  canManager: boolean
  canStaff: boolean
  onClose: () => void
  onSubmit: (address: string, asManager: boolean) => Promise<boolean>
}) {
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (asManager: boolean) => {
    setBusy(true)
    try {
      const ok = await onSubmit(address, asManager)
      if (ok) onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Cấp vai trò</h3>
          <Button type="button" size="sm" variant="ghost" onClick={onClose} aria-label="Đóng">
            ×
          </Button>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Địa chỉ ví</span>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x…" className="font-mono" />
        </label>
        <div className="flex flex-wrap gap-2">
          {canManager ? (
            <Button type="button" disabled={busy} onClick={() => void submit(true)}>
              Cấp Manager
            </Button>
          ) : null}
          {canStaff ? (
            <Button type="button" disabled={busy} variant="secondary" onClick={() => void submit(false)}>
              Cấp Staff
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
        </div>
      </div>
    </div>
  )
}