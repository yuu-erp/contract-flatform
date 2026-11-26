import { Copy, Plus, ShieldCheck, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useOwnerBranches, useOwnerStaff } from '../../data/hooks'
import type { ModuleKey, Position, StaffMember } from '../../data/types'
import { BranchPicker, PermissionMatrix, StatePill } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Avatar, Button, Card, CardBody, CardHeader, Chip, ListRow, Table, Tabs, Td, Th, Tr } from '../../ui'

type View = 'people' | 'positions' | 'roster'

/**
 * Nhân sự theo chi nhánh (ADR 0033): nhân viên → vị trí (quyền theo module) → phân công (ca, vị trí).
 * Manager có mọi quyền ở chi nhánh, không cần ca. Nhân viên chỉ có quyền của vị trí trong ca đang trực.
 */
export function OwnerStaff() {
  const branches = useOwnerBranches()
  const { staff, positions, shifts, catalog } = useOwnerStaff()
  const [branchId, setBranchId] = useState(branches[0]!.id)
  const [view, setView] = useState<View>('people')
  const branch = branches.find((b) => b.id === branchId)!
  const people = staff.filter((s) => s.branchId === branchId)
  const branchPositions = positions.filter((p) => p.branchId === branchId)
  const branchShifts = shifts.filter((s) => s.branchId === branchId)
  const modules: ModuleKey[] = ['core', ...branch.modules]

  return (
    <>
      <ContentPanel>
        <PageHead title="Nhân sự" meta={`${people.length} người · ${branchPositions.filter((p) => p.active).length} vị trí`}>
          <Tabs
            items={[
              { value: 'people', label: 'Nhân viên' },
              { value: 'positions', label: 'Vị trí & quyền' },
              { value: 'roster', label: 'Phân công' },
            ]}
            value={view}
            onChange={setView}
          />
        </PageHead>
        <BranchPicker branches={branches} value={branchId} onChange={setBranchId} />
        {view === 'people' ? <PeopleTable people={people} positions={branchPositions} shifts={branchShifts} /> : null}
        {view === 'positions' ? (
          <PositionsEditor key={branchId} positions={branchPositions} modules={modules} catalog={catalog} />
        ) : null}
        {view === 'roster' ? <Roster people={people.filter((p) => p.role === 'staff')} positions={branchPositions} shifts={branchShifts} /> : null}
      </ContentPanel>
      <SidePanel>
        <AddStaffCard branchName={branch.name} />
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Quy tắc quyền</span>} />
          <CardBody className="flex flex-col gap-2 pt-0 text-[12.5px] text-ink-muted">
            <p><b className="text-ink">Chủ agent, Manager:</b> mọi quyền ở chi nhánh, không cần vào ca.</p>
            <p><b className="text-ink">Nhân viên:</b> chỉ quyền của vị trí trong ca đang trực. Hết ca vẫn làm tiếp tới trần tăng ca.</p>
            <p><b className="text-ink">Quyền khoá</b> (hoàn tiền, chặn khách, sửa giá…) chỉ Manager làm được, không gán cho vị trí.</p>
            <p>Chi nhánh tắt một dịch vụ thì quyền của dịch vụ đó tự mất hiệu lực.</p>
          </CardBody>
        </Card>
      </SidePanel>
    </>
  )
}

function dutyState(s: StaffMember) {
  if (s.role === 'manager') return <StatePill tone="violet">Manager</StatePill>
  if (!s.onDuty) return <StatePill tone="neutral">Nghỉ</StatePill>
  if (s.onDuty.handoverTo) return <StatePill tone="topup">Chờ giao ca</StatePill>
  if (s.onDuty.overtimeMin > 0) return <StatePill tone="warn">Tăng ca {s.onDuty.overtimeMin}′</StatePill>
  return <StatePill tone="play">Đang trực</StatePill>
}

function PeopleTable({ people, positions, shifts }: { people: StaffMember[]; positions: Position[]; shifts: { id: string; name: string }[] }) {
  const posName = (id: string) => positions.find((p) => p.id === id)?.name ?? '—'
  const shiftName = (id: string) => shifts.find((s) => s.id === id)?.name ?? '—'
  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <Th>Nhân viên</Th>
            <Th>Phân công</Th>
            <Th>Đang trực</Th>
            <Th align="center">Trạng thái</Th>
          </tr>
        </thead>
        <tbody>
          {people.map((s) => (
            <Tr key={s.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={s.name} size={32} />
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-[11.5px] text-ink-dim">@{s.username}</div>
                  </div>
                </div>
              </Td>
              <Td>
                {s.role === 'manager' ? (
                  <span className="text-ink-dim">Không cần ca</span>
                ) : s.assignments.length ? (
                  <div className="flex flex-wrap gap-1">
                    {s.assignments.map((a) => (
                      <Chip key={a.shiftId + a.positionId}>
                        {shiftName(a.shiftId)} · {posName(a.positionId)}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <span className="text-warn">Chưa phân công</span>
                )}
              </Td>
              <Td>{s.onDuty ? `${shiftName(s.onDuty.shiftId)} · ${posName(s.onDuty.positionId)} · từ ${s.onDuty.since}` : '—'}</Td>
              <Td align="center">{dutyState(s)}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}

function PositionsEditor({
  positions,
  modules,
  catalog,
}: {
  positions: Position[]
  modules: ModuleKey[]
  catalog: Parameters<typeof PermissionMatrix>[0]['catalog']
}) {
  const [list, setList] = useState(positions)
  const [selectedId, setSelectedId] = useState(positions[0]?.id ?? '')
  const selected = list.find((p) => p.id === selectedId)
  const toggle = (m: ModuleKey, bit: number) =>
    setList((all) =>
      all.map((p) => {
        if (p.id !== selectedId) return p
        const cur = new Set(p.perms[m] ?? [])
        if (cur.has(bit)) cur.delete(bit)
        else cur.add(bit)
        return { ...p, perms: { ...p.perms, [m]: [...cur].sort((x, y) => x - y) } }
      }),
    )
  return (
    <div className="grid grid-cols-[240px_1fr] gap-3.5">
      <Card>
        <CardHeader title="Vị trí" extra={<Button size="sm" icon={<Plus className="size-3.5" />}>Thêm</Button>} />
        <CardBody className="pt-0">
          {list.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-bold ${p.id === selectedId ? 'bg-white/10' : 'hover:bg-white/5'} ${p.active ? '' : 'text-ink-dim line-through'}`}
            >
              {p.name}
              <span className="text-[11px] font-semibold text-ink-dim">
                {Object.values(p.perms).reduce((n, bits) => n + (bits?.length ?? 0), 0)} quyền
              </span>
            </button>
          ))}
          <Button size="sm" block className="mt-2" icon={<Copy className="size-3.5" />}>
            Sao chép từ chi nhánh khác
          </Button>
        </CardBody>
      </Card>
      {selected ? (
        <Card>
          <CardHeader
            title={selected.name}
            extra={
              <div className="flex gap-2">
                <Button size="sm" variant={selected.active ? 'danger' : 'glass'}>
                  {selected.active ? 'Ngừng dùng' : 'Dùng lại'}
                </Button>
                <Button size="sm" variant="play" disabled={!selected.active}>
                  Lưu quyền
                </Button>
              </div>
            }
          />
          <CardBody className="pt-0">
            <p className="mb-3 text-xs text-ink-dim">Chỉ hiện dịch vụ chi nhánh đang bật. Ngừng vị trí thì mọi nhân viên đang trực ở vị trí này mất quyền ngay.</p>
            <PermissionMatrix modules={modules} catalog={catalog} value={selected.perms} onToggle={toggle} readOnly={!selected.active} />
          </CardBody>
        </Card>
      ) : (
        <Card className="grid place-items-center p-10 text-ink-dim">Chi nhánh chưa có vị trí nào.</Card>
      )}
    </div>
  )
}

function Roster({
  people,
  positions,
  shifts,
}: {
  people: StaffMember[]
  positions: Position[]
  shifts: { id: string; name: string; start: string; end: string }[]
}) {
  const active = positions.filter((p) => p.active)
  const initial = useMemo(() => {
    const m: Record<string, string> = {}
    for (const s of people) for (const a of s.assignments) m[`${s.id}:${a.shiftId}`] = a.positionId
    return m
  }, [people])
  const [cells, setCells] = useState(initial)
  if (!shifts.length) return <Card className="p-10 text-center text-ink-dim">Chi nhánh chưa có ca. Tạo ca ở mục "Ca & đối soát".</Card>
  return (
    <Card>
      <CardHeader title="Phân công theo ca" extra={<Button size="sm" variant="play">Lưu phân công</Button>} />
      <Table>
        <thead>
          <tr>
            <Th>Nhân viên</Th>
            {shifts.map((s) => (
              <Th key={s.id} align="center">
                {s.name}
                <div className="font-semibold normal-case">{s.start}–{s.end}</div>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <Tr key={p.id}>
              <Td className="font-bold">{p.name}</Td>
              {shifts.map((s) => {
                const key = `${p.id}:${s.id}`
                return (
                  <Td key={s.id} align="center">
                    <select
                      aria-label={`${p.name} – ${s.name}`}
                      value={cells[key] ?? ''}
                      onChange={(e) => setCells({ ...cells, [key]: e.target.value })}
                      className="h-8 rounded-[10px] border border-edge-soft bg-sunken px-2 text-xs font-bold text-ink"
                    >
                      <option value="">— Nghỉ —</option>
                      {active.map((pos) => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name}
                        </option>
                      ))}
                    </select>
                  </Td>
                )
              })}
            </Tr>
          ))}
        </tbody>
      </Table>
      <CardBody className="text-xs text-ink-dim">Một người có thể làm vị trí khác nhau ở từng ca (sáng Thu ngân, chiều Phục vụ).</CardBody>
    </Card>
  )
}

function AddStaffCard({ branchName }: { branchName: string }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'staff' | 'manager'>('staff')
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2"><UserPlus className="size-4" /> Thêm vào {branchName.replace('Cyber ', '')}</span>} />
      <CardBody className="flex flex-col gap-2.5 pt-0">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên" className="h-10 rounded-xl border border-edge-soft bg-sunken px-3 text-sm" />
        <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="Tên đăng nhập" className="h-10 rounded-xl border border-edge-soft bg-sunken px-3 text-sm" />
        <Tabs
          items={[
            { value: 'staff', label: 'Nhân viên' },
            { value: 'manager', label: 'Manager' },
          ]}
          value={role}
          onChange={setRole}
        />
        <ListRow title="Mật khẩu ban đầu" subtitle="Nhân viên đổi ở lần đăng nhập đầu. Không cần ví." />
        <Button variant="play" disabled={!name || username.length < 3}>
          Tạo tài khoản
        </Button>
      </CardBody>
    </Card>
  )
}
