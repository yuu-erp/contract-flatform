import { Moon, Package, Plus } from 'lucide-react'
import { useState } from 'react'
import { formatVnd } from '../../data/format'
import { useOwnerBranches, useOwnerPricing } from '../../data/hooks'
import { BranchPicker, StatePill } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Button, Card, CardBody, CardHeader, ListRow, Table, Td, Th, Toggle, Tr } from '../../ui'

/** Bảng giá giờ theo khu từng chi nhánh, giá đêm, gói giờ (module NET). Sửa giá là quyền chỉ Manager trở lên. */
export function OwnerPricing() {
  const branches = useOwnerBranches()
  const { plans, packages, zones } = useOwnerPricing()
  const [branchId, setBranchId] = useState(branches[0]!.id)
  const [edits, setEdits] = useState<Record<string, number>>({})
  const rows = plans.filter((p) => p.branchId === branchId)
  const [pkgs, setPkgs] = useState(packages)
  return (
    <>
      <ContentPanel>
        <PageHead title="Bảng giá & gói giờ">
          <Button size="sm" variant="play" disabled={!Object.keys(edits).length}>
            Lưu bảng giá
          </Button>
        </PageHead>
        <BranchPicker branches={branches} value={branchId} onChange={setBranchId} />
        <Card>
          <CardHeader title="Giá giờ chơi" extra={<span className="text-xs text-ink-dim">Đã gồm thuế</span>} />
          <Table>
            <thead>
              <tr>
                <Th>Khu</Th>
                <Th align="right">Giá / giờ</Th>
                <Th align="right">
                  <span className="inline-flex items-center gap-1"><Moon className="size-3" /> Đêm 22:00–06:00</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const zone = zones.find((z) => z.id === p.zoneId)
                const key = `${p.branchId}:${p.zoneId}`
                return (
                  <Tr key={key}>
                    <Td className="font-bold">{zone?.name ?? p.zoneId}</Td>
                    <Td align="right">
                      <input
                        aria-label={`Giá ${zone?.name}`}
                        inputMode="numeric"
                        value={edits[key] ?? p.pricePerHour}
                        onChange={(e) => setEdits({ ...edits, [key]: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        className="h-8 w-28 rounded-[10px] border border-edge-soft bg-sunken px-2 text-right font-bold"
                      />
                    </Td>
                    <Td align="right">{formatVnd(p.nightPrice)}</Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Package className="size-4" /> Gói giờ</span>} extra={<Button size="sm" icon={<Plus className="size-3.5" />}>Thêm gói</Button>} />
          <Table>
            <thead>
              <tr>
                <Th>Gói</Th>
                <Th>Khu</Th>
                <Th>Khung giờ</Th>
                <Th align="right">Giá</Th>
                <Th align="right">Quy ra / giờ</Th>
                <Th align="center">Bán</Th>
              </tr>
            </thead>
            <tbody>
              {pkgs.map((p) => (
                <Tr key={p.id}>
                  <Td className="font-bold">{p.name}</Td>
                  <Td>{p.zone}</Td>
                  <Td>{p.window}</Td>
                  <Td align="right" className="font-bold">{formatVnd(p.price)}</Td>
                  <Td align="right" className="text-ink-dim">{formatVnd(Math.round(p.price / p.hours))}</Td>
                  <Td align="center">
                    <Toggle label={p.name} checked={p.active} onChange={(v) => setPkgs(pkgs.map((x) => (x.id === p.id ? { ...x, active: v } : x)))} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </ContentPanel>
      <SidePanel>
        <Card>
          <CardHeader title="Áp dụng" />
          <CardBody className="pt-0">
            <ListRow title="Giá mới" subtitle="Áp cho phiên mở sau khi lưu; phiên đang chơi giữ giá cũ" trailing={<StatePill tone="reserve">An toàn</StatePill>} />
            <ListRow title="Ai sửa được" subtitle="Chủ agent và Manager (quyền NET · Sửa giá giờ). Nhân viên không có quyền này." />
            <ListRow title="Lịch sử" subtitle="Mỗi lần đổi giá ghi nhật ký kèm người sửa" />
          </CardBody>
        </Card>
      </SidePanel>
    </>
  )
}
