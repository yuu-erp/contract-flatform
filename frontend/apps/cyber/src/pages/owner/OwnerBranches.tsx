import { CreditCard, Info, MapPin, Timer, Users } from 'lucide-react'
import { useState } from 'react'
import { formatVnd } from '../../data/format'
import { useOwnerBranches } from '../../data/hooks'
import type { BranchDetail, ModuleKey } from '../../data/types'
import { ModuleChip, StatePill } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Button, Card, CardBody, CardHeader, ListRow, ProgressBar, Table, Td, Th, Toggle, Tr } from '../../ui'

const ALL_MODULES: ModuleKey[] = ['net', 'iqr', 'loyalty']
const OVERTIME_PRESETS = [0, 60, 120, 180, 240, 360]

/** Chi nhánh: dịch vụ đang bật, Manager, công suất, doanh thu; cấu hình của chủ agent (tăng ca, thanh toán, thuế). */
export function OwnerBranches() {
  const branches = useOwnerBranches()
  const [selectedId, setSelectedId] = useState(branches[0]!.id)
  const selected = branches.find((b) => b.id === selectedId) ?? branches[0]!
  return (
    <>
      <ContentPanel>
        <PageHead title="Chi nhánh" meta={`${branches.length} chi nhánh · ${branches.reduce((s, b) => s + b.pcsTotal, 0)} máy`} />
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Chi nhánh</Th>
                <Th>Dịch vụ</Th>
                <Th>Manager</Th>
                <Th>Công suất</Th>
                <Th align="right">Doanh thu hôm nay</Th>
                <Th align="center">Trạng thái</Th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <Tr key={b.id} active={b.id === selectedId} onClick={() => setSelectedId(b.id)}>
                  <Td>
                    <div className="font-bold">{b.name}</div>
                    <div className="text-[11.5px] text-ink-dim">{b.address}</div>
                  </Td>
                  <Td>
                    <div className="flex gap-1">
                      {ALL_MODULES.map((m) => (
                        <ModuleChip key={m} module={m} off={!b.modules.includes(m)} />
                      ))}
                    </div>
                  </Td>
                  <Td>{b.managers.join(', ') || <span className="text-warn">Chưa có</span>}</Td>
                  <Td className="w-[160px]">
                    <div className="mb-1 text-[11.5px] text-ink-dim">
                      {b.pcsInUse}/{b.pcsTotal} máy
                    </div>
                    <ProgressBar value={b.pcsInUse / b.pcsTotal} tone="play" height={6} />
                  </Td>
                  <Td align="right" className="font-extrabold">{formatVnd(b.revenueToday)}</Td>
                  <Td align="center">
                    {b.status === 'active' ? <StatePill tone="play">Đang chạy</StatePill> : <StatePill tone="danger">Tạm dừng</StatePill>}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <p className="flex items-center gap-2 text-xs text-ink-dim">
          <Info className="size-3.5" /> Bật / tắt dịch vụ và tạm dừng chi nhánh do quản trị nền tảng thực hiện. Chủ agent cấu hình tăng ca, thanh toán, thuế và Manager.
        </p>
      </ContentPanel>
      <SidePanel>
        <BranchSettings key={selected.id} branch={selected} />
      </SidePanel>
    </>
  )
}

function BranchSettings({ branch }: { branch: BranchDetail }) {
  const [cap, setCap] = useState(branch.overtimeCapMin)
  const [methods, setMethods] = useState(branch.methods)
  const dirty = cap !== branch.overtimeCapMin || JSON.stringify(methods) !== JSON.stringify(branch.methods)
  return (
    <>
      <Card>
        <CardHeader title={branch.name} extra={branch.status === 'active' ? <StatePill tone="play">Đang chạy</StatePill> : <StatePill tone="danger">Tạm dừng</StatePill>} />
        <CardBody className="pt-0">
          <ListRow leading={<MapPin className="size-4 text-ink-dim" />} title={branch.address} subtitle="Địa chỉ" />
          <ListRow leading={<Users className="size-4 text-ink-dim" />} title={branch.managers.join(', ') || 'Chưa có Manager'} subtitle={`${branch.staffCount} nhân viên`} trailing={<Button size="sm">Đổi</Button>} />
          <div className="flex flex-wrap gap-1 pt-2.5">
            {branch.modules.map((m) => (
              <ModuleChip key={m} module={m} />
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><Timer className="size-4" /> Trần tăng ca</span>} />
        <CardBody className="flex flex-col gap-2.5 pt-0">
          <p className="text-xs text-ink-dim">Quá giờ ca mà người sau chưa tới, nhân viên vẫn làm tiếp tối đa chừng này. Quên ra ca thì tự hết hiệu lực.</p>
          <div className="flex flex-wrap gap-1.5">
            {OVERTIME_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setCap(m)}
                className={`h-8 rounded-[10px] border px-3 text-xs font-extrabold ${cap === m ? 'border-play/60 bg-play/15 text-play' : 'border-edge-soft bg-sunken text-ink-muted'}`}
              >
                {m === 0 ? 'Không' : `${m / 60} giờ`}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><CreditCard className="size-4" /> Thanh toán & thuế</span>} />
        <CardBody className="pt-0">
          {(
            [
              ['cash', 'Tiền mặt'],
              ['transfer', 'Chuyển khoản'],
              ['card', 'Thẻ'],
              ['wallet', 'Ví xu'],
            ] as const
          ).map(([k, label]) => (
            <ListRow key={k} title={label} trailing={<Toggle label={label} checked={methods[k]} onChange={(v) => setMethods({ ...methods, [k]: v })} />} />
          ))}
          <ListRow title="Thuế NET" subtitle="Giá giờ chơi luôn đã gồm thuế" trailing={<b>{branch.taxBps.net / 100}%</b>} />
          <ListRow title="Thuế IQR" subtitle="Đồ ăn uống" trailing={<b>{branch.taxBps.iqr / 100}%</b>} />
        </CardBody>
      </Card>

      <Button variant="play" block disabled={!dirty}>
        Lưu cấu hình
      </Button>
    </>
  )
}
