import { Crown, Gamepad2, Headset, Store, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Backdrop } from '../layout/Backdrop'
import { Brand, Glass, IconBox, type Tone } from '../ui'

const ROLES: { to: string; title: string; detail: string; icon: LucideIcon; tone: Tone }[] = [
  { to: '/owner', title: 'Owner', detail: 'Chủ sở hữu agent: toàn bộ chi nhánh, doanh thu, công suất', icon: Crown, tone: 'help' },
  { to: '/manager', title: 'Manager', detail: 'Quản lý một hoặc nhiều chi nhánh: phòng máy, ca, nhân viên', icon: Store, tone: 'reserve' },
  { to: '/staff', title: 'Staff', detail: 'Nhân viên quầy: mở máy, nạp tiền, gọi món, yêu cầu khách', icon: Headset, tone: 'play' },
  { to: '/launcher', title: 'Người chơi', detail: 'Launcher trên máy trạm: game, giờ còn lại, gọi món, nạp tiền', icon: Gamepad2, tone: 'topup' },
]

/** Màn chọn vai trò (bản demo). Bản thật xác định vai trò từ ví / máy trạm. */
export function RolePicker() {
  return (
    <div className="relative grid min-h-dvh place-items-center p-6">
      <Backdrop />
      <Glass className="w-full max-w-[760px] p-8">
        <Brand subtitle="Chọn vai trò để xem giao diện" />
        <div className="mt-2 grid grid-cols-2 gap-3.5">
          {ROLES.map(({ to, title, detail, icon: Icon, tone }) => (
            <Link key={to} to={to} className="flex gap-3.5 rounded-[18px] border border-edge-soft bg-surface p-4 transition hover:border-edge-strong hover:bg-surface-hover">
              <IconBox tone={tone} size={48} solid>
                <Icon className="size-6" />
              </IconBox>
              <div>
                <div className="text-base font-extrabold">{title}</div>
                <div className="text-[12.5px] text-ink-muted">{detail}</div>
              </div>
            </Link>
          ))}
        </div>
      </Glass>
    </div>
  )
}
