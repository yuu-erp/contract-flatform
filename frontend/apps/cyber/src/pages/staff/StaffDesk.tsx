import { LogOut, Play, UserPlus, Utensils, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBranchFloor, useCustomerRequests } from '../../data/hooks'
import { pcDisplayState } from '../../data/pc'
import { PcGrid, QuickAction, RequestItem } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Button, Card, CountBadge, Tabs } from '../../ui'

type ZoneTab = 'all' | 'STD' | 'VIP' | 'attention'

export function StaffDesk() {
  const { pcs } = useBranchFloor('q1')
  const requests = useCustomerRequests()
  const [tab, setTab] = useState<ZoneTab>('all')
  const attention = useMemo(() => pcs.filter((p) => ['help', 'low'].includes(pcDisplayState(p))), [pcs])
  const shown = tab === 'all' ? pcs : tab === 'attention' ? attention : pcs.filter((p) => p.zoneId === tab)

  return (
    <>
      <ContentPanel>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={<Play className="size-6" />} title="Mở máy" detail="Vãng lai / hội viên" tone="play" shortcut="F3" />
          <QuickAction icon={<Wallet className="size-6" />} title="Nạp tiền" detail="Tiền mặt · chuyển khoản" tone="topup" shortcut="F4" />
          <QuickAction icon={<Utensils className="size-6" />} title="Gọi món" detail="Đồ ăn tới máy" tone="help" shortcut="F5" />
          <QuickAction icon={<UserPlus className="size-6" />} title="Hội viên" detail="Đăng ký bằng SĐT" tone="reserve" shortcut="F6" />
        </div>
        <PageHead title={<span className="text-[19px]">Máy trạm</span>}>
          <Tabs
            items={[
              { value: 'all', label: `Tất cả ${pcs.length}` },
              { value: 'STD', label: 'Standard' },
              { value: 'VIP', label: 'VIP' },
              { value: 'attention', label: `Cần xử lý ${attention.length}`, tone: '#f9a8d4' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </PageHead>
        <PcGrid pcs={shown} columns={7} />
      </ContentPanel>
      <SidePanel>
        <div className="px-1 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold">Yêu cầu từ khách</h2>
            <CountBadge count={requests.length} />
          </div>
          {requests.map((r) => (
            <RequestItem key={r.id} request={r} />
          ))}
        </div>
        <div className="flex-1" />
        <Card className="px-4 py-3.5">
          <div className="font-extrabold">Ca của tôi</div>
          <div className="text-xs text-ink-dim">Vào ca 14:02 · 86 giao dịch</div>
          <Button className="mt-2.5" block size="sm" icon={<LogOut className="size-3.5" />}>
            Kết ca & bàn giao
          </Button>
        </Card>
      </SidePanel>
    </>
  )
}
