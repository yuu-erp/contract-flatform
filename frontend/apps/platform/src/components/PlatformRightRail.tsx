import { useContracts } from '@meta-platform/chain'
import { HashAvatar, Money, RailCard, RailRow, SearchPill, resolveRangeDays, useAppTx } from '@meta-platform/ui'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAgentRankingsPage } from '../hooks/use-agent-rankings'
import { useAgentStatusCounts } from '../hooks/use-agent-status-counts'
import { useGlobalBranchCount } from '../hooks/use-global-branch-count'
import { usePlatformRole } from '../hooks/use-platform-role'
import { PLATFORM_TZ_MINUTES } from '../lib/scopes'

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'ok' | 'warn' }) {
  return (
    <RailRow className="flex items-center justify-between gap-3">
      <span className="text-[0.9375rem] text-muted-foreground">{label}</span>
      <span
        className={
          tone === 'ok'
            ? 'inline-flex items-center gap-1.5 font-bold text-success'
            : tone === 'warn'
              ? 'inline-flex items-center gap-1.5 font-bold text-danger'
              : 'font-bold tabular-nums'
        }
      >
        {tone ? <span className="size-2 rounded-full bg-current" /> : null}
        {value}
      </span>
    </RailRow>
  )
}

/** Cột phải: tìm agent, tình trạng hệ thống, agent nổi bật 7 ngày. */
export function PlatformRightRail() {
  const navigate = useNavigate()
  const contracts = useContracts()
  const tx = useAppTx()
  const [q, setQ] = useState('')
  const { role, paused } = usePlatformRole()
  const counts = useAgentStatusCounts()
  const branches = useGlobalBranchCount()
  const { fromDay, toDay } = useMemo(() => resolveRangeDays('7d', PLATFORM_TZ_MINUTES), [])
  const top = useAgentRankingsPage(0, 10, fromDay, toDay, 'ALL', '')

  return (
    <>
      <div className="sticky top-0 z-10 -mt-1.5 bg-background pt-1.5 pb-1">
        <SearchPill
          value={q}
          onChange={setQ}
          placeholder="Tìm agent theo tên, ví, SĐT…"
          onSubmit={(value) => navigate(`/agents${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`)}
        />
      </div>

      {role?.isPendingOwner ? (
        <RailCard title="Nhận quyền owner">
          <RailRow>
            <p className="text-[0.9375rem] text-muted-foreground">Ví này được đề xuất làm Owner nền tảng.</p>
            <button
              type="button"
              disabled={tx.pending || !contracts}
              onClick={() =>
                void tx.run(async () => contracts!.access.acceptOwnership(), {
                  invalidate: [['platform-role'], ['system-snapshot']],
                })
              }
              className="mt-3 h-9 rounded-full bg-foreground px-4 text-[0.9375rem] font-bold text-background hover:bg-foreground/85 disabled:opacity-50"
            >
              Nhận quyền owner
            </button>
          </RailRow>
        </RailCard>
      ) : null}

      <RailCard title="Hệ thống" footerLink={{ to: '/system', label: 'Quản trị hệ thống' }}>
        <Stat label="Trạng thái" value={paused ? 'Tạm dừng' : 'Đang chạy'} tone={paused ? 'warn' : 'ok'} />
        <Stat label="Agent hoạt động" value={counts.data?.active ?? '…'} />
        <Stat
          label="Tạm dừng · Đã xoá"
          value={counts.data ? `${counts.data.suspended} · ${counts.data.deleted}` : '…'}
        />
        <Stat label="Chi nhánh" value={branches.isLoading ? '…' : (branches.data ?? '—')} />
      </RailCard>

      <RailCard title="Agent nổi bật · 7 ngày" footerLink={{ to: '/agents', label: 'Xem tất cả agent' }}>
        {top.isLoading ? (
          <RailRow className="text-[0.9375rem] text-muted-foreground">Đang tải…</RailRow>
        ) : top.data.length === 0 ? (
          <RailRow className="text-[0.9375rem] text-muted-foreground">Chưa có doanh thu.</RailRow>
        ) : (
          top.data.slice(0, 4).map((row, i) => (
            <RailRow key={row.agentId} to={`/agents/${row.agentId}`} className="flex items-center gap-3">
              <HashAvatar seed={row.owner} label={row.name || String(row.agentId)} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-bold">{row.name || `Agent #${row.agentId}`}</p>
                <p className="truncate text-[0.8125rem] text-muted-foreground">
                  #{i + 1} · <Money value={row.net} />
                </p>
              </div>
            </RailRow>
          ))
        )}
      </RailCard>

      <p className="px-4 text-[0.8125rem] leading-5 text-muted-foreground">
        Số liệu đọc trực tiếp từ Ledger on-chain · Ngày kinh doanh UTC+7
      </p>
    </>
  )
}
