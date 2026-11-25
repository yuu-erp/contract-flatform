import { Bell, ClipboardCheck, Crown, LayoutDashboard, MessageCircle, Monitor, ScrollText, Settings, Store, Tags, Ticket, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { formatVnd, formatNumber } from '../../data/format'
import { DashboardLayout } from '../../layout/DashboardLayout'
import { IconCluster, InfoPill, SearchInput, UserChip, type NavSection } from '../../ui'

const NAV: NavSection[] = [
  {
    title: 'Điều hành',
    items: [
      { to: '/owner', label: 'Tổng quan', icon: LayoutDashboard, end: true },
      { to: '/owner/branches', label: 'Chi nhánh', icon: Store },
      { to: '/owner/floor', label: 'Phòng máy', icon: Monitor },
      { to: '/owner/members', label: 'Hội viên', icon: Crown },
    ],
  },
  {
    title: 'Kinh doanh',
    items: [
      { to: '/owner/revenue', label: 'Doanh thu & ví', icon: Wallet },
      { to: '/owner/pricing', label: 'Bảng giá & gói giờ', icon: Tags },
      { to: '/owner/vouchers', label: 'Voucher & khuyến mãi', icon: Ticket },
    ],
  },
  {
    title: 'Vận hành',
    items: [
      { to: '/owner/staff', label: 'Nhân sự', icon: Users },
      { to: '/owner/shifts', label: 'Ca & đối soát', icon: ClipboardCheck, badge: 2 },
      { to: '/owner/audit', label: 'Nhật ký', icon: ScrollText },
    ],
  },
]

export function OwnerLayout() {
  const [q, setQ] = useState('')
  return (
    <DashboardLayout
      nav={NAV}
      topbar={
        <>
          <UserChip name="Hoàng Long" tag="OWNER" subtitle="5 chi nhánh · 240 máy" gradient="linear-gradient(135deg,#f472b6,#a78bfa)" />
          <InfoPill
            items={[
              { label: 'Hôm nay:', value: formatVnd(18_420_000) },
              { label: 'Nạp ví:', value: formatNumber(9_860_000), tone: 'warn' },
            ]}
            status="play"
          />
          <div className="flex-1" />
          <SearchInput value={q} onChange={setQ} placeholder="Tìm chi nhánh, máy…" className="w-[260px]" />
          <IconCluster
            items={[
              { icon: Bell, label: 'Thông báo', dot: true },
              { icon: MessageCircle, label: 'Tin nhắn' },
              { icon: Settings, label: 'Cài đặt' },
            ]}
          />
        </>
      }
    >
      <Outlet />
    </DashboardLayout>
  )
}
