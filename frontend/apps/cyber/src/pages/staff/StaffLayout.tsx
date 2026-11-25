import { Bell, BellRing, ClipboardCheck, MessageCircle, MonitorPlay, ScanLine, UserPlus, Utensils, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { formatVnd } from '../../data/format'
import { DashboardLayout } from '../../layout/DashboardLayout'
import { IconCluster, InfoPill, Kbd, SearchInput, UserChip, type NavSection } from '../../ui'

const NAV: NavSection[] = [
  {
    items: [
      { to: '/staff', label: 'Quầy', icon: MonitorPlay, end: true },
      { to: '/staff/requests', label: 'Yêu cầu', icon: BellRing, badge: 4 },
      { to: '/staff/topup', label: 'Nạp tiền', icon: Wallet },
      { to: '/staff/orders', label: 'Gọi món', icon: Utensils, badge: 1 },
      { to: '/staff/members', label: 'Hội viên', icon: UserPlus },
      { to: '/staff/shift', label: 'Ca của tôi', icon: ClipboardCheck },
    ],
  },
]

export function StaffLayout() {
  const [q, setQ] = useState('')
  return (
    <DashboardLayout
      nav={NAV}
      topbar={
        <>
          <UserChip name="Bảo Anh" tag="STAFF" subtitle="Cyber Quận 1 · ca chiều" gradient="linear-gradient(135deg,#4ade80,#16a34a)" />
          <SearchInput
            value={q}
            onChange={setQ}
            icon={<ScanLine className="size-4" />}
            placeholder="Quét QR hoặc nhập SĐT, tên, số máy…"
            hint={<Kbd>F2</Kbd>}
            className="h-11 w-[440px] shrink-0 border-[1.5px] border-white/35"
          />
          <div className="flex-1" />
          <InfoPill items={[{ label: 'Tiền mặt đang giữ:', value: formatVnd(1_420_000), tone: 'play' }]} />
          <IconCluster
            items={[
              { icon: Bell, label: 'Thông báo', dot: true },
              { icon: MessageCircle, label: 'Tin nhắn' },
            ]}
          />
        </>
      }
    >
      <Outlet />
    </DashboardLayout>
  )
}
