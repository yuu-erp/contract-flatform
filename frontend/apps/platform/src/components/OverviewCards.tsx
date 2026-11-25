import { useContracts } from '@meta-platform/chain'
import { HashAvatar, Money, Panel, useAppTx } from '@meta-platform/ui'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AgentRankingRow } from '../lib/agent-ranking'
import { useAgentStatusCounts } from '../hooks/use-agent-status-counts'
import { useGlobalBranchCount } from '../hooks/use-global-branch-count'
import { usePlatformRole } from '../hooks/use-platform-role'

function StatRow({ label, value, tone }: { label: string; value: ReactNode; tone?: 'ok' | 'warn' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <span className="text-[15px] text-muted-foreground">{label}</span>
      <span
        className={
          tone === 'ok'
            ? 'inline-flex items-center gap-1.5 font-bold text-success'
            : tone === 'warn'
              ? 'inline-flex items-center gap-1.5 font-bold text-danger'
              : 'text-[17px] font-extrabold tabular-nums'
        }
      >
        {tone ? <span className="size-2 rounded-full bg-current" /> : null}
        {value}
      </span>
    </div>
  )
}

/** Thẻ tình trạng hệ thống: chạy/tạm dừng, số agent, số chi nhánh. */
export function SystemStatusCard() {
  const { paused } = usePlatformRole()
  const counts = useAgentStatusCounts()
  const branches = useGlobalBranchCount()
  return (
    <Panel
      title="Hệ thống"
      actions={
        <Link to="/system" className="text-[15px] text-primary hover:underline">
          Quản trị
        </Link>
      }
      bodyClassName="pb-2"
    >
      <StatRow label="Trạng thái" value={paused ? 'Tạm dừng' : 'Đang chạy'} tone={paused ? 'warn' : 'ok'} />
      <StatRow label="Agent hoạt động" value={counts.data?.active ?? '…'} />
      <StatRow label="Tạm dừng · Đã xoá" value={counts.data ? `${counts.data.suspended} · ${counts.data.deleted}` : '…'} />
      <StatRow label="Tổng chi nhánh" value={branches.isLoading ? '…' : (branches.data ?? '—')} />
    </Panel>
  )
}

/** Thẻ top agent theo doanh thu thuần của trang xếp hạng hiện tại. */
export function TopAgentsCard({ rows, loading }: { rows: AgentRankingRow[]; loading: boolean }) {
  const max = rows.reduce((m, r) => (r.net > m ? r.net : m), 0n)
  return (
    <Panel
      title="Agent dẫn đầu"
      actions={
        <Link to="/agents" className="text-[15px] text-primary hover:underline">
          Tất cả
        </Link>
      }
      bodyClassName="pb-3"
    >
      {loading ? (
        <p className="py-4 text-[15px] text-muted-foreground">Đang tải…</p>
      ) : rows.length === 0 ? (
        <p className="py-4 text-[15px] text-muted-foreground">Chưa có doanh thu.</p>
      ) : (
        <ul className="space-y-3">
          {rows.slice(0, 5).map((row, i) => {
            const pct = max > 0n ? Number((row.net * 1000n) / max) / 10 : 0
            return (
              <li key={row.agentId}>
                <Link to={`/agents/${row.agentId}`} className="group flex items-center gap-3">
                  <HashAvatar seed={row.owner} label={row.name || String(row.agentId)} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[15px] font-bold group-hover:underline">
                        {i + 1}. {row.name || `Agent #${row.agentId}`}
                      </span>
                      <span className="shrink-0 text-[13px] font-bold tabular-nums">
                        <Money value={row.net} />
                      </span>
                    </span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

/** Thẻ nhận quyền owner (ví pending). */
export function AcceptOwnerCard() {
  const contracts = useContracts()
  const tx = useAppTx()
  const { role } = usePlatformRole()
  if (!role?.isPendingOwner) return null
  return (
    <Panel title="Nhận quyền owner" description="Ví này được đề xuất làm Owner nền tảng." className="mb-4">
      <button
        type="button"
        disabled={tx.pending || !contracts}
        onClick={() =>
          void tx.run(async () => contracts!.access.acceptOwnership(), {
            invalidate: [['platform-role'], ['system-snapshot']],
          })
        }
        className="h-9 rounded-full bg-foreground px-4 text-[15px] font-bold text-background hover:bg-foreground/85 disabled:opacity-50"
      >
        Nhận quyền owner
      </button>
    </Panel>
  )
}
