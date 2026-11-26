import { AlarmClock, ArrowRightLeft, CalendarDays, Check, Plus, TimerReset } from 'lucide-react'
import { useState } from 'react'
import { formatVnd } from '../../data/format'
import { branchName, useOwnerShifts } from '../../data/hooks'
import type { CashCloseout, StaffMember, WorkShift } from '../../data/types'
import { BranchPicker, StatePill } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Avatar, Button, Card, CardBody, CardHeader, CountBadge, ListRow, StatTile, Table, Td, Th, Tr } from '../../ui'

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

/**
 * Ca & đối soát (ADR 0033 + docs/08 mục 5): ca lặp theo thứ, ai đang trực / tăng ca / chờ giao ca,
 * đối soát két cuối ca (người nhận ca xác nhận, chủ agent / Manager duyệt chênh lệch).
 */
export function OwnerShifts() {
  const { shifts, staff, positions, closeouts, branches } = useOwnerShifts()
  const [branchId, setBranchId] = useState('all')
  const inBranch = <T extends { branchId: string }>(xs: T[]) => (branchId === 'all' ? xs : xs.filter((x) => x.branchId === branchId))
  const onDuty = inBranch(staff).filter((s) => s.onDuty)
  const overtime = onDuty.filter((s) => (s.onDuty?.overtimeMin ?? 0) > 0)
  const pending = inBranch(closeouts).filter((c) => c.status === 'pending')
  const mismatched = inBranch(closeouts).filter((c) => c.counted !== c.expected)
  const absDiff = mismatched.reduce((n, c) => n + Math.abs(c.counted - c.expected), 0)
  const posName = (id: string) => positions.find((p) => p.id === id)?.name ?? '—'
  const shiftName = (id: string) => shifts.find((s) => s.id === id)?.name ?? '—'

  return (
    <>
      <ContentPanel>
        <PageHead title="Ca & đối soát">
          <BranchPicker branches={branches} value={branchId} onChange={setBranchId} withAll />
        </PageHead>

        <div className="grid grid-cols-4 gap-3.5">
          <StatTile icon={<CalendarDays className="size-6" />} tone="play" label="Đang trực" value={`${onDuty.length} người`} delta={`${inBranch(shifts).filter((s) => s.active).length} ca đang dùng`} />
          <StatTile icon={<AlarmClock className="size-6" />} tone="warn" label="Tăng ca" value={`${overtime.length} người`} delta="Chưa có người nhận ca" />
          <StatTile icon={<ArrowRightLeft className="size-6" />} tone="topup" label="Két chờ duyệt" value={pending.length} delta="Đối soát cuối ca" />
          <StatTile icon={<TimerReset className="size-6" />} tone={mismatched.length ? 'danger' : 'play'} label="Ca lệch két" value={mismatched.length} delta={mismatched.length ? `Tổng lệch ${formatVnd(absDiff)}` : 'Mọi ca đều khớp'} deltaTone={mismatched.length ? 'danger' : 'play'} />
        </div>

        <Card>
          <CardHeader title={<>Đang trực <CountBadge count={onDuty.length} /></>} />
          <Table>
            <thead>
              <tr>
                <Th>Nhân viên</Th>
                <Th>Chi nhánh</Th>
                <Th>Ca · vị trí</Th>
                <Th>Vào lúc</Th>
                <Th align="center">Trạng thái</Th>
                <Th align="right">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {onDuty.map((s) => (
                <DutyRow key={s.id} s={s} shift={shiftName(s.onDuty!.shiftId)} position={posName(s.onDuty!.positionId)} />
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Đối soát két" extra={<span className="text-xs text-ink-dim">Người nhận ca xác nhận số đếm trước khi người giao ra ca</span>} />
          <Table>
            <thead>
              <tr>
                <Th>Ca</Th>
                <Th>Người giao → nhận</Th>
                <Th align="right">Dự kiến</Th>
                <Th align="right">Đếm được</Th>
                <Th align="right">Chênh lệch</Th>
                <Th align="right" />
              </tr>
            </thead>
            <tbody>
              {inBranch(closeouts).map((c) => (
                <CloseoutRow key={c.id} c={c} />
              ))}
            </tbody>
          </Table>
        </Card>
      </ContentPanel>

      <SidePanel>
        <Card>
          <CardHeader title="Lịch ca" extra={<Button size="sm" icon={<Plus className="size-3.5" />}>Tạo ca</Button>} />
          <CardBody className="pt-0">
            {inBranch(shifts).map((s) => (
              <ShiftRow key={s.id} shift={s} showBranch={branchId === 'all'} />
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Khi người ca sau chưa tới" />
          <CardBody className="flex flex-col gap-2 pt-0 text-[12.5px] text-ink-muted">
            <p>Nhân viên giữ nguyên quyền và làm tiếp (tăng ca), tối đa theo trần của chi nhánh (mục Chi nhánh).</p>
            <p>Người ca sau vào ca, người trước bấm <b className="text-ink">Giao ca</b>, người sau đếm két và <b className="text-ink">xác nhận</b> thì phiên của người trước mới đóng.</p>
            <p>Manager có thể vào ca hộ, gia hạn hoặc đóng phiên (ghi lý do).</p>
          </CardBody>
        </Card>
      </SidePanel>
    </>
  )
}

function DutyRow({ s, shift, position }: { s: StaffMember; shift: string; position: string }) {
  const d = s.onDuty!
  return (
    <Tr>
      <Td>
        <div className="flex items-center gap-2.5">
          <Avatar name={s.name} size={30} />
          <b>{s.name}</b>
        </div>
      </Td>
      <Td>{branchName(s.branchId)}</Td>
      <Td>
        {shift} · {position}
      </Td>
      <Td>{d.since}</Td>
      <Td align="center">
        {d.handoverTo ? (
          <StatePill tone="topup">Chờ {d.handoverTo} xác nhận</StatePill>
        ) : d.overtimeMin > 0 ? (
          <StatePill tone="warn">Tăng ca {d.overtimeMin} phút</StatePill>
        ) : (
          <StatePill tone="play">Trong ca</StatePill>
        )}
      </Td>
      <Td align="right">
        <div className="flex justify-end gap-1.5">
          <Button size="sm">+30 phút</Button>
          <Button size="sm" variant="danger">
            Đóng phiên
          </Button>
        </div>
      </Td>
    </Tr>
  )
}

function CloseoutRow({ c }: { c: CashCloseout }) {
  const [approved, setApproved] = useState(c.status === 'approved')
  const delta = c.counted - c.expected
  return (
    <Tr>
      <Td>
        <b>{c.shift}</b>
        <div className="text-[11.5px] text-ink-dim">
          {branchName(c.branchId)} · {c.date}
        </div>
      </Td>
      <Td>
        {c.staff} → {c.receivedBy ?? '—'}
      </Td>
      <Td align="right">{formatVnd(c.expected)}</Td>
      <Td align="right">{formatVnd(c.counted)}</Td>
      <Td align="right" className={delta === 0 ? 'text-play' : 'font-extrabold text-danger'}>
        {delta === 0 ? 'Khớp' : formatVnd(delta)}
      </Td>
      <Td align="right">
        {approved ? (
          <StatePill tone="play">Đã duyệt</StatePill>
        ) : (
          <Button size="sm" variant="play" icon={<Check className="size-3.5" />} onClick={() => setApproved(true)}>
            Duyệt
          </Button>
        )}
      </Td>
    </Tr>
  )
}

function ShiftRow({ shift, showBranch }: { shift: WorkShift; showBranch: boolean }) {
  const overnight = shift.end <= shift.start
  return (
    <ListRow
      title={
        <span className={shift.active ? '' : 'text-ink-dim line-through'}>
          {shift.name} · {shift.start}–{shift.end}
          {overnight ? ' (qua đêm)' : ''}
        </span>
      }
      subtitle={showBranch ? branchName(shift.branchId) : undefined}
    >
      <div className="mt-1.5 flex gap-1">
        {DAYS.map((d, i) => (
          <span
            key={d}
            className={`grid size-6 place-items-center rounded-md text-[10.5px] font-extrabold ${shift.weekdays.includes(i) ? 'bg-play/20 text-play' : 'bg-sunken text-ink-dim'}`}
          >
            {d}
          </span>
        ))}
      </div>
    </ListRow>
  )
}
