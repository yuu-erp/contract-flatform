import { Bell, History, House, KeyRound, Languages, MessageCircle, ShoppingCart, Ticket, Timer, UtensilsCrossed, Wallet } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { formatHms, formatNumber } from '../../data/format'
import { useCountdown, usePlayer } from '../../data/hooks'
import { DashboardLayout } from '../../layout/DashboardLayout'
import { IconCluster, InfoPill, UserChip, type NavSection } from '../../ui'

const NAV: NavSection[] = [
  {
    title: 'Của tôi',
    items: [
      { to: '/player', label: 'Trang chủ', icon: House, end: true },
      { to: '/player/food', label: 'Gọi món', icon: UtensilsCrossed },
      { to: '/player/topup', label: 'Nạp tiền', icon: Wallet },
      { to: '/player/vouchers', label: 'Voucher của tôi', icon: Ticket },
      { to: '/player/history', label: 'Lịch sử chơi', icon: History },
    ],
  },
  {
    title: 'Tài khoản',
    items: [
      { to: '/player/password', label: 'Đổi mật khẩu', icon: KeyRound },
      { to: '/player/language', label: 'Ngôn ngữ', icon: Languages },
    ],
  },
]

/** Người chơi mở app (webview): cùng khung dashboard với các vai trò khác. */
export function PlayerLayout() {
  const { player, session } = usePlayer()
  const left = useCountdown(session.remainingSec)
  return (
    <DashboardLayout
      nav={NAV}
      topbar={
        <>
          <UserChip name={player.name} tag={player.rank} subtitle={player.phoneMasked} gradient="linear-gradient(135deg,#475569,#1e293b)" />
          <InfoPill
            items={[
              { label: 'Ví chính:', value: formatNumber(player.mainBalance) },
              { label: 'Ví KM:', value: formatNumber(player.bonusBalance), tone: 'warn' },
            ]}
            status="play"
          />
          <InfoPill
            tone="play"
            items={[{ icon: <Timer className="size-4" />, label: session.pcId, value: <span className="text-[15px]">{formatHms(left)}</span>, tone: 'play' }]}
          />
          <div className="flex-1" />
          <IconCluster
            items={[
              { icon: ShoppingCart, label: 'Giỏ món' },
              { icon: MessageCircle, label: 'Chat với quầy' },
              { icon: Bell, label: 'Thông báo', dot: true },
            ]}
          />
        </>
      }
    >
      <Outlet />
    </DashboardLayout>
  )
}
