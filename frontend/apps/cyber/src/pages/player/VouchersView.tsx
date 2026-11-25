import { Coins, Sparkles, Ticket } from 'lucide-react'
import { formatNumber } from '../../data/format'
import { usePlayer } from '../../data/hooks'
import { VoucherCard } from '../../domain'
import { Button, Card } from '../../ui'
import { ContentPanel, PageHead } from '../../layout/DashboardLayout'

export function VouchersView() {
  const { player, vouchers, voucherShop } = usePlayer()
  return (
    <ContentPanel>
      <PageHead title="Voucher của tôi" />
      <Card className="mt-4 flex max-w-[520px] items-center gap-4 border-[1.5px] border-white/50 px-5 py-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#fb923c] to-[#ef4444] text-white">
          <Coins className="size-6" />
        </span>
        <div className="flex-1">
          <div className="caption">Xu thưởng của tôi</div>
          <div className="text-[26px] font-extrabold">
            {formatNumber(player.bonusBalance)} <span className="text-sm">xu</span>
          </div>
        </div>
        <Button size="sm">Lịch sử</Button>
      </Card>
      <h2 className="mt-5 mb-2.5 flex items-center gap-2 text-base font-extrabold">
        <Ticket className="size-5" /> Voucher hiện có
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {vouchers.map((v) => (
          <VoucherCard key={v.id} voucher={v} />
        ))}
      </div>
      <h2 className="mt-5 flex items-center gap-2 text-base font-extrabold">
        <Sparkles className="size-5" /> Đổi xu lấy voucher
      </h2>
      <p className="mb-2.5 text-[12.5px] text-ink-dim">Dùng xu thưởng để đổi các ưu đãi.</p>
      <div className="grid grid-cols-2 gap-3">
        {voucherShop.map((v) => (
          <VoucherCard key={v.id} voucher={v} />
        ))}
      </div>
    </ContentPanel>
  )
}
