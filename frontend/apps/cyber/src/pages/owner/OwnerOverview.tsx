import { Banknote, Gauge, HandCoins, MonitorPlay, Timer, Wallet, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { formatVnd } from '../../data/format'
import { useOwnerOverview } from '../../data/hooks'
import { BranchRow, GameGlyph } from '../../domain'
import { ContentPanel, PageHead } from '../../layout/DashboardLayout'
import { AreaChart, Card, CardBody, CardHeader, ChartLegend, Chip, CountBadge, IconBox, ListRow, StatTile, Tabs, type Tone } from '../../ui'

type Range = 'today' | '7d' | '30d' | 'month'

const ALERT_ICON = { danger: WifiOff, topup: Gauge, help: HandCoins } as const

export function OwnerOverview() {
  const { branches, hourly, gameShares, alerts } = useOwnerOverview()
  const [range, setRange] = useState<Range>('today')
  const series = [
    { name: 'Giờ chơi NET', color: '#60a5fa', values: hourly.net },
    { name: 'Nạp ví', color: '#f472b6', values: hourly.topup },
  ]
  return (
    <ContentPanel>
      <PageHead title="Tổng quan hệ thống">
        <Tabs
          items={[
            { value: 'today', label: 'Hôm nay' },
            { value: '7d', label: '7 ngày' },
            { value: '30d', label: '30 ngày' },
            { value: 'month', label: 'Tháng này' },
          ]}
          value={range}
          onChange={setRange}
        />
      </PageHead>

      <div className="grid grid-cols-4 gap-3.5">
        <StatTile icon={<Banknote className="size-6" />} tone="play" label="Doanh thu NET hôm nay" value={formatVnd(18_420_000)} delta="▲ 12,4% so hôm qua" />
        <StatTile icon={<MonitorPlay className="size-6" />} tone="reserve" label="Máy đang chạy" value="186 / 240" delta="77,5% công suất" />
        <StatTile icon={<Timer className="size-6" />} tone="violet" label="Giờ chơi hôm nay" value="1.284 giờ" delta="▲ 8,1% · TB 2h06/khách" deltaTone="play" />
        <StatTile icon={<Wallet className="size-6" />} tone="warn" label="Nạp ví hôm nay" value={formatVnd(9_860_000)} delta="312 lượt nạp" />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-3.5">
        <Card>
          <CardHeader title="Doanh thu theo giờ" extra={<ChartLegend series={series} />} />
          <CardBody>
            <AreaChart
              series={series}
              labels={[[0, '00h'], [6, '06h'], [12, '12h'], [18, '18h'], [23, '23h']]}
              formatPeak={(v) => formatVnd(v * 225_000)}
              peakLabel={(i) => `${String(i).padStart(2, '0')}:00 · cao điểm`}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Chi nhánh" extra={<Chip>Công suất</Chip>} />
          <CardBody className="pt-0">
            {branches.map((b) => (
              <BranchRow key={b.id} branch={b} />
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Card>
          <CardHeader title="Game được chơi nhiều" extra={<span className="text-xs text-ink-dim">hôm nay</span>} />
          <CardBody className="pt-0">
            {gameShares.map((g) => (
              <ListRow
                key={g.name}
                leading={
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${g.color}, #1e1b2e)` }}>
                    <GameGlyph icon={g.icon} className="size-5" />
                  </span>
                }
                title={g.name}
                subtitle={g.genre}
                trailing={
                  <>
                    <div className="font-extrabold">{g.share}%</div>
                    <div className="text-[11px] text-ink-dim">giờ chơi</div>
                  </>
                }
              />
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={<>Cần chú ý <CountBadge count={alerts.length} /></>} extra={<Chip onClick={() => {}}>Xem tất cả</Chip>} />
          <CardBody className="pt-0">
            {alerts.map((a) => {
              const Icon = ALERT_ICON[a.tone]
              return <ListRow key={a.id} leading={<IconBox tone={a.tone as Tone} size={36}><Icon className="size-4" /></IconBox>} title={a.title} subtitle={a.detail} />
            })}
          </CardBody>
        </Card>
      </div>
    </ContentPanel>
  )
}
