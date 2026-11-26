import { Banknote, Settings2, UserCog, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { branchName, useOwnerAudit, useOwnerBranches } from '../../data/hooks'
import type { AuditEntry } from '../../data/types'
import { BranchPicker } from '../../domain'
import { ContentPanel, PageHead } from '../../layout/DashboardLayout'
import { Card, IconBox, SearchInput, Table, Tabs, Td, Th, Tr, type Tone } from '../../ui'

type KindFilter = 'all' | AuditEntry['kind']

const KIND: Record<AuditEntry['kind'], { label: string; icon: typeof Users; tone: Tone }> = {
  money: { label: 'Tiền', icon: Banknote, tone: 'warn' },
  staff: { label: 'Nhân sự & ca', icon: UserCog, tone: 'reserve' },
  config: { label: 'Cấu hình', icon: Settings2, tone: 'violet' },
  member: { label: 'Hội viên', icon: Users, tone: 'help' },
}
const ROLE: Record<AuditEntry['role'], string> = { owner: 'Chủ agent', manager: 'Manager', staff: 'Nhân viên', system: 'Hệ thống' }

/** Nhật ký thao tác (event + FullDB): ai làm gì, ở chi nhánh nào, lúc nào. Chỉ đọc. */
export function OwnerAudit() {
  const entries = useOwnerAudit()
  const branches = useOwnerBranches()
  const [kind, setKind] = useState<KindFilter>('all')
  const [branchId, setBranchId] = useState('all')
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return entries.filter(
      (e) =>
        (kind === 'all' || e.kind === kind) &&
        (branchId === 'all' || e.branch === branchId) &&
        (!needle || `${e.actor} ${e.action} ${e.detail}`.toLowerCase().includes(needle)),
    )
  }, [entries, kind, branchId, q])
  return (
    <ContentPanel>
      <PageHead title="Nhật ký" meta={`${rows.length} mục`}>
        <SearchInput value={q} onChange={setQ} placeholder="Người, thao tác…" className="w-[220px]" />
      </PageHead>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          items={[
            { value: 'all', label: 'Tất cả' },
            { value: 'money', label: 'Tiền' },
            { value: 'staff', label: 'Nhân sự' },
            { value: 'member', label: 'Hội viên' },
            { value: 'config', label: 'Cấu hình' },
          ]}
          value={kind}
          onChange={setKind}
        />
        <BranchPicker branches={branches} value={branchId} onChange={setBranchId} withAll />
      </div>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Lúc</Th>
              <Th>Loại</Th>
              <Th>Người làm</Th>
              <Th>Chi nhánh</Th>
              <Th>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const k = KIND[e.kind]
              const Icon = k.icon
              return (
                <Tr key={e.id}>
                  <Td className="whitespace-nowrap text-ink-dim">{e.at}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <IconBox tone={k.tone} size={28}>
                        <Icon className="size-3.5" />
                      </IconBox>
                      {k.label}
                    </span>
                  </Td>
                  <Td>
                    <b>{e.actor}</b>
                    <div className="text-[11.5px] text-ink-dim">{ROLE[e.role]}</div>
                  </Td>
                  <Td>{branchName(e.branch)}</Td>
                  <Td>
                    <b>{e.action}</b>
                    <div className="text-[11.5px] text-ink-dim">{e.detail}</div>
                  </Td>
                </Tr>
              )
            })}
          </tbody>
        </Table>
      </Card>
    </ContentPanel>
  )
}
