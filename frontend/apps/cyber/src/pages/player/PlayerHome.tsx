import { Coins, Gift, Headset, Monitor, Plus, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatHm, formatHms, formatNumber } from '../../data/format'
import { useCountdown, usePlayer } from '../../data/hooks'
import { PromoCard, RecentGameRow } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { AvatarStack, Button, Card, CardBody, CardHeader, RingProgress, StatTile } from '../../ui'

export function PlayerHome() {
  const { player, session, recentGames } = usePlayer()
  const left = useCountdown(session.remainingSec)
  const total = session.usedSec + session.remainingSec
  return (
    <>
      <ContentPanel>
        <PageHead title={`Xin chào, ${player.name}`} meta={`Đang chơi tại ${session.pcId} · ${session.zoneName}`} />

        <div className="grid grid-cols-3 gap-3.5">
          <StatTile icon={<Wallet className="size-6" />} tone="reserve" label="Ví chính" value={`${formatNumber(player.mainBalance)} xu`} delta="Trừ theo giờ chơi" deltaTone="neutral" />
          <StatTile icon={<Coins className="size-6" />} tone="warn" label="Ví KM" value={`${formatNumber(player.bonusBalance)} xu`} delta="Đổi voucher" />
          <StatTile icon={<Monitor className="size-6" />} tone="violet" label="Máy đang dùng" value={session.pcId} delta={`${session.zoneName} · ${formatNumber(session.pricePerHour)} xu/giờ`} deltaTone="neutral" />
        </div>

        <div className="grid grid-cols-[1.1fr_1fr] gap-3.5">
          <Card>
            <CardHeader title="Phiên chơi hiện tại" extra={<span className="text-xs text-ink-dim">bắt đầu {session.startedAt} · đã dùng {formatHm(session.usedSec)}</span>} />
            <CardBody className="flex items-center gap-6">
              <RingProgress value={total ? left / total : 0} size={168} stroke={12}>
                <div className="text-[26px] font-extrabold text-play">{formatHms(left)}</div>
                <div className="text-[11px] text-ink-dim">giờ : phút : giây</div>
              </RingProgress>
              <div className="min-w-0 flex-1 space-y-2.5">
                <p className="text-[13px] text-ink-muted">
                  Hết giờ máy tự khoá. Nạp thêm hoặc mua gói giờ để chơi tiếp; xu KM được trừ trước khi hết ví chính.
                </p>
                <Link to="/player/topup" className="block">
                  <Button variant="topup" block icon={<Plus className="size-4" />}>
                    Nạp thêm giờ
                  </Button>
                </Link>
                <Button block icon={<Headset className="size-4" />}>
                  Gọi nhân viên
                </Button>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Chơi gần đây" />
            <CardBody className="pt-0">
              {recentGames.map((g) => (
                <RecentGameRow key={g.id} game={g} />
              ))}
            </CardBody>
          </Card>
        </div>
      </ContentPanel>

      <SidePanel>
        <PromoCard title="Nạp 100K tặng 20K" detail="Đến hết 30/11 · cộng vào ví KM" action="Nạp ngay" />
        <Card className="bg-[radial-gradient(90%_120%_at_90%_0%,rgb(96_165_250/0.45),transparent_60%)] p-4">
          <div className="caption">Sự kiện tại quán</div>
          <div className="mt-1 text-[15px] font-extrabold">Giải MOBA Q.1</div>
          <div className="text-[11.5px] text-ink-dim">Còn 2 ngày · 64/64 đội</div>
          <div className="mt-2.5">
            <AvatarStack names={['Kuro', 'Bơ', 'Tèo', 'Minh']} size={26} extra="+38 người đang chơi" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 font-extrabold">
            <Gift className="size-4 text-warn" /> Ưu đãi hạng {player.rank}
          </div>
          <ul className="mt-2 space-y-1.5 text-[12.5px] text-ink-muted">
            <li>· Tích 1 xu KM cho mỗi 10.000 ₫ nạp</li>
            <li>· Giảm 5% khi gọi món</li>
            <li>· Lên hạng VÀNG khi nạp đủ 2.000.000 ₫</li>
          </ul>
        </Card>
      </SidePanel>
    </>
  )
}
