import { Ban, KeyRound, ShieldCheck, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatVnd } from '../../data/format'
import { branchName, useOwnerMembers } from '../../data/hooks'
import type { MemberRow } from '../../data/types'
import { StatePill } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Avatar, Button, Card, CardBody, CardHeader, ListRow, RankTag, SearchInput, Table, Tabs, Td, Th, Tr } from '../../ui'

type RankFilter = 'all' | 'ĐỒNG' | 'BẠC' | 'VÀNG' | 'KIM CƯƠNG'

/** Hội viên của agent (AgentUserRegistry + Ledger + Loyalty): số dư theo túi chi nhánh, điểm, hạng, trạng thái. */
export function OwnerMembers() {
  const members = useOwnerMembers()
  const [q, setQ] = useState('')
  const [rank, setRank] = useState<RankFilter>('all')
  const [selectedId, setSelectedId] = useState(members[0]!.id)
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return members.filter((m) => (rank === 'all' || m.rank === rank) && (!needle || m.name.toLowerCase().includes(needle) || m.phoneMasked.includes(needle)))
  }, [members, q, rank])
  const selected = members.find((m) => m.id === selectedId) ?? members[0]!
  return (
    <>
      <ContentPanel>
        <PageHead title="Hội viên" meta={`${members.length} tài khoản`}>
          <SearchInput value={q} onChange={setQ} placeholder="Tên, số điện thoại…" className="w-[240px]" />
        </PageHead>
        <Tabs
          items={[
            { value: 'all', label: 'Tất cả' },
            { value: 'KIM CƯƠNG', label: 'Kim cương' },
            { value: 'VÀNG', label: 'Vàng' },
            { value: 'BẠC', label: 'Bạc' },
            { value: 'ĐỒNG', label: 'Đồng' },
          ]}
          value={rank}
          onChange={setRank}
        />
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Hội viên</Th>
                <Th>Hạng</Th>
                <Th align="right">Ví xu</Th>
                <Th align="right">Xu thưởng</Th>
                <Th align="right">Điểm</Th>
                <Th>Chi nhánh nạp</Th>
                <Th>Lần cuối</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <Tr key={m.id} active={m.id === selectedId} onClick={() => setSelectedId(m.id)}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={m.name} size={30} />
                      <div>
                        <div className={`font-bold ${m.blocked ? 'text-danger' : ''}`}>{m.name}</div>
                        <div className="text-[11.5px] text-ink-dim">{m.phoneMasked}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <RankTag tone={m.rank === 'VÀNG' || m.rank === 'KIM CƯƠNG' ? 'gold' : 'light'}>{m.rank}</RankTag>
                  </Td>
                  <Td align="right" className="font-bold">{formatVnd(m.mainBalance)}</Td>
                  <Td align="right">{formatVnd(m.bonusBalance)}</Td>
                  <Td align="right">{m.points}</Td>
                  <Td>{branchName(m.homeBranch)}</Td>
                  <Td>{m.lastVisit}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </ContentPanel>
      <SidePanel>
        <MemberDetail key={selected.id} m={selected} />
      </SidePanel>
    </>
  )
}

function MemberDetail({ m }: { m: MemberRow }) {
  const [blocked, setBlocked] = useState(Boolean(m.blocked))
  return (
    <>
      <Card>
        <CardBody className="flex items-center gap-3">
          <Avatar name={m.name} size={48} />
          <div className="min-w-0 flex-1">
            <div className="text-lg font-extrabold">{m.name}</div>
            <div className="text-xs text-ink-dim">{m.phoneMasked}</div>
          </div>
          {blocked ? <StatePill tone="danger">Đang chặn</StatePill> : <StatePill tone="play">Hoạt động</StatePill>}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><Wallet className="size-4" /> Ví xu theo chi nhánh nạp</span>} />
        <CardBody className="pt-0">
          {m.buckets.map((b) => (
            <ListRow key={b.branchId} title={branchName(b.branchId)} trailing={<b>{formatVnd(b.amount)}</b>} />
          ))}
          <ListRow title="Xu thưởng (Loyalty)" subtitle="Có hạn dùng, theo lô" trailing={<b className="text-warn">{formatVnd(m.bonusBalance)}</b>} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Thao tác" />
        <CardBody className="flex flex-col gap-2 pt-0">
          <Button block icon={<KeyRound className="size-4" />}>Đặt lại mật khẩu</Button>
          <Button block icon={<ShieldCheck className="size-4" />}>Cấp OTP đăng nhập</Button>
          <Button block variant={blocked ? 'glass' : 'danger'} icon={<Ban className="size-4" />} onClick={() => setBlocked(!blocked)}>
            {blocked ? 'Mở chặn' : 'Chặn khách'}
          </Button>
          <p className="text-[11.5px] text-ink-dim">Chặn / mở cần lý do và chỉ Manager trở lên làm được. Mọi thao tác được ghi nhật ký.</p>
        </CardBody>
      </Card>
    </>
  )
}
