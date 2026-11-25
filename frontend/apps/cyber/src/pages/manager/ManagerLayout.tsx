import { Bell, ChevronDown, ClipboardCheck, Crown, LayoutDashboard, ListOrdered, MessageCircle, Monitor, Settings, Store, Tags, Users, Utensils, Wallet, Wrench } from 'lucide-react'
import { createContext, use, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { formatVnd } from '../../data/format'
import { useManagerScope } from '../../data/hooks'
import type { Branch } from '../../data/types'
import { DashboardLayout } from '../../layout/DashboardLayout'
import { IconCluster, InfoPill, UserChip, type NavSection } from '../../ui'

const NAV: NavSection[] = [
  {
    title: 'Chi nhánh',
    items: [
      { to: '/manager/overview', label: 'Tổng quan', icon: LayoutDashboard },
      { to: '/manager', label: 'Phòng máy', icon: Monitor, end: true },
      { to: '/manager/sessions', label: 'Phiên chơi', icon: ListOrdered },
      { to: '/manager/members', label: 'Hội viên', icon: Crown },
    ],
  },
  {
    title: 'Vận hành',
    items: [
      { to: '/manager/shifts', label: 'Ca làm', icon: ClipboardCheck },
      { to: '/manager/staff', label: 'Nhân viên', icon: Users },
      { to: '/manager/topups', label: 'Nạp & thu tiền', icon: Wallet, badge: 3 },
      { to: '/manager/orders', label: 'Đơn món', icon: Utensils, badge: 2 },
      { to: '/manager/pricing', label: 'Bảng giá', icon: Tags },
      { to: '/manager/maintenance', label: 'Bảo trì', icon: Wrench, badge: 2 },
    ],
  },
]

/** Chi nhánh manager đang xem, dùng chung cho các trang con. */
const BranchContext = createContext<string>('')
export const useManagerBranch = () => use(BranchContext)

function BranchSwitcher({ branches, value, onChange }: { branches: Branch[]; value: string; onChange: (id: string) => void }) {
  const idx = branches.findIndex((b) => b.id === value)
  return (
    <label className="relative flex h-11 shrink-0 items-center gap-2.5 rounded-[14px] border-[1.5px] border-white/40 bg-white/10 px-3.5">
      <Store className="size-4" />
      <span className="font-extrabold whitespace-nowrap">{branches[idx]?.name}</span>
      <span className="text-xs whitespace-nowrap text-ink-dim">
        {idx + 1}/{branches.length} chi nhánh
      </span>
      <ChevronDown className="size-4" />
      <select aria-label="Chọn chi nhánh" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ManagerLayout() {
  const { branches, shift, shiftRevenue } = useManagerScope()
  const [branchId, setBranchId] = useState(branches[0]!.id)
  return (
    <BranchContext value={branchId}>
      <DashboardLayout
        nav={NAV}
        topbar={
          <>
            <UserChip name="Minh Trí" tag="MANAGER" subtitle={`Quản lý ${branches.length} chi nhánh`} gradient="linear-gradient(135deg,#60a5fa,#22d3ee)" />
            <BranchSwitcher branches={branches} value={branchId} onChange={setBranchId} />
            <InfoPill
              items={[
                { value: <span className="font-normal text-ink-muted">{shift.name} {shift.window}</span> },
                { label: 'Doanh thu ca:', value: formatVnd(shiftRevenue), tone: 'play' },
              ]}
            />
            <div className="flex-1" />
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
    </BranchContext>
  )
}
