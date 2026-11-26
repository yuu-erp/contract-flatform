import { Gift, Percent, Plus, Sparkles, Ticket } from 'lucide-react'
import { useState } from 'react'
import { formatNumber } from '../../data/format'
import { useOwnerCampaigns } from '../../data/hooks'
import type { Campaign } from '../../data/types'
import { StatePill } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { Button, Card, CardBody, CardHeader, IconBox, ListRow, Tabs, type Tone } from '../../ui'

type Filter = 'all' | Campaign['status']

const KIND: Record<Campaign['kind'], { label: string; icon: typeof Gift; tone: Tone }> = {
  cashback: { label: 'Hoàn điểm', icon: Percent, tone: 'violet' },
  voucher: { label: 'Voucher', icon: Ticket, tone: 'help' },
  happy_hour: { label: 'Giờ vàng', icon: Sparkles, tone: 'warn' },
  bonus_topup: { label: 'Thưởng nạp', icon: Gift, tone: 'topup' },
}
const STATUS: Record<Campaign['status'], { label: string; tone: Tone }> = {
  running: { label: 'Đang chạy', tone: 'play' },
  scheduled: { label: 'Sắp chạy', tone: 'reserve' },
  ended: { label: 'Đã kết thúc', tone: 'neutral' },
}

/** Voucher & khuyến mãi (module Loyalty). Loyalty lỗi thì thanh toán vẫn chạy, điểm được cộng bù sau (ADR 0031). */
export function OwnerCampaigns() {
  const campaigns = useOwnerCampaigns()
  const [filter, setFilter] = useState<Filter>('all')
  const rows = campaigns.filter((c) => filter === 'all' || c.status === filter)
  return (
    <>
      <ContentPanel>
        <PageHead title="Voucher & khuyến mãi">
          <Button size="sm" variant="play" icon={<Plus className="size-3.5" />}>Tạo chương trình</Button>
        </PageHead>
        <Tabs
          items={[
            { value: 'all', label: 'Tất cả' },
            { value: 'running', label: 'Đang chạy' },
            { value: 'scheduled', label: 'Sắp chạy' },
            { value: 'ended', label: 'Đã kết thúc' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <div className="grid grid-cols-2 gap-3.5">
          {rows.map((c) => {
            const k = KIND[c.kind]
            const Icon = k.icon
            return (
              <Card key={c.id}>
                <CardBody className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-3">
                    <IconBox tone={k.tone} size={44}>
                      <Icon className="size-5" />
                    </IconBox>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold">{c.name}</div>
                      <div className="text-xs text-ink-dim">{k.label} · {c.detail}</div>
                    </div>
                    <StatePill tone={STATUS[c.status].tone}>{STATUS[c.status].label}</StatePill>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Fact label="Thời gian" value={c.period} />
                    <Fact label="Áp dụng" value={c.branches} />
                    <Fact label="Lượt dùng" value={formatNumber(c.used)} />
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </ContentPanel>
      <SidePanel>
        <Card>
          <CardHeader title="Điểm thưởng" />
          <CardBody className="pt-0">
            <ListRow title="Tỉ giá" subtitle="1 điểm = 100đ khi đổi voucher" />
            <ListRow title="Hạn dùng" subtitle="Điểm theo lô, hết hạn sau 90 ngày, tiêu lô sắp hết hạn trước" />
            <ListRow title="Trần dùng điểm" subtitle="Tối đa 30% hoá đơn đồ ăn, 20% giờ chơi" />
            <ListRow title="Khi Loyalty gặp sự cố" subtitle="Khách vẫn chơi và gọi món bình thường; điểm được cộng bù đúng một lần" />
          </CardBody>
        </Card>
      </SidePanel>
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-edge-soft bg-sunken px-2.5 py-2">
      <div className="text-[10.5px] font-bold tracking-wider text-ink-dim uppercase">{label}</div>
      <div className="truncate font-bold">{value}</div>
    </div>
  )
}
