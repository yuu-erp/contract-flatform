import { ArrowLeftRight, Banknote, Landmark, PiggyBank, Receipt } from 'lucide-react'
import { useState } from 'react'
import { formatVnd, formatVndShort } from '../../data/format'
import { branchName, useOwnerRevenue } from '../../data/hooks'
import { MODULE_LABEL } from '../../data/mock-owner'
import { ModuleChip } from '../../domain'
import { ContentPanel, PageHead, SidePanel } from '../../layout/DashboardLayout'
import { AreaChart, Card, CardBody, CardHeader, ChartLegend, ListRow, ProgressBar, StatTile, Table, Tabs, Td, Th, Tr } from '../../ui'

type Range = 'today' | '7d' | 'month'

/**
 * Doanh thu & ví (Ledger): doanh thu theo module (moduleRollup), theo chi nhánh, tiền thu theo phương thức,
 * nợ ví khách (walletLiability). Tiền nạp thuộc chi nhánh nạp; khách tiêu ở chi nhánh khác ghi "phục vụ hộ".
 */
export function OwnerRevenue() {
  const { modules, branches, liability, hourly } = useOwnerRevenue()
  const [range, setRange] = useState<Range>('today')
  const net = (m: (typeof modules)[number]) => m.gross - m.refund
  const totalNet = modules.reduce((n, m) => n + net(m), 0)
  const topup = branches.reduce((n, b) => n + b.topup, 0)
  const cashIn = branches.reduce((n, b) => n + b.cash + b.transfer + b.card, 0)
  const series = [
    { name: 'NET', color: '#60a5fa', values: hourly.net },
    { name: 'Nạp ví', color: '#f472b6', values: hourly.topup },
  ]
  return (
    <>
      <ContentPanel>
        <PageHead title="Doanh thu & ví">
          <Tabs
            items={[
              { value: 'today', label: 'Hôm nay' },
              { value: '7d', label: '7 ngày' },
              { value: 'month', label: 'Tháng này' },
            ]}
            value={range}
            onChange={setRange}
          />
        </PageHead>
        <div className="grid grid-cols-4 gap-3.5">
          <StatTile icon={<Receipt className="size-6" />} tone="play" label="Doanh thu thuần" value={formatVndShort(totalNet)} delta="Sau hoàn, trước thuế" />
          <StatTile icon={<Banknote className="size-6" />} tone="reserve" label="Tiền thu vào" value={formatVndShort(cashIn)} delta="Tiền mặt + CK + thẻ" />
          <StatTile icon={<PiggyBank className="size-6" />} tone="warn" label="Nạp ví" value={formatVndShort(topup)} delta="Ghi cho chi nhánh nạp" />
          <StatTile icon={<Landmark className="size-6" />} tone="violet" label="Nợ ví khách" value={formatVndShort(liability)} delta="Xu khách chưa tiêu" />
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-3.5">
          <Card>
            <CardHeader title="Theo giờ" extra={<ChartLegend series={series} />} />
            <CardBody>
              <AreaChart series={series} labels={[[0, '00h'], [6, '06h'], [12, '12h'], [18, '18h'], [23, '23h']]} formatPeak={(v) => formatVnd(v * 225_000)} peakLabel={(i) => `${String(i).padStart(2, '0')}:00`} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Theo dịch vụ" />
            <CardBody className="pt-0">
              {modules.map((m) => (
                <ListRow
                  key={m.module}
                  leading={<ModuleChip module={m.module} />}
                  title={formatVnd(net(m))}
                  subtitle={`Gộp ${formatVnd(m.gross)} · giảm ${formatVnd(m.discount)} · hoàn ${formatVnd(m.refund)} · thuế ${formatVnd(m.tax)}`}
                >
                  <ProgressBar className="mt-1.5" value={net(m) / totalNet} tone={m.module === 'net' ? 'violet' : 'topup'} height={6} label={MODULE_LABEL[m.module]} />
                </ListRow>
              ))}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Theo chi nhánh" />
          <Table>
            <thead>
              <tr>
                <Th>Chi nhánh</Th>
                <Th align="right">NET</Th>
                <Th align="right">IQR</Th>
                <Th align="right">Nạp ví</Th>
                <Th align="right">Phục vụ hộ</Th>
                <Th align="right">Tiền mặt</Th>
                <Th align="right">Chuyển khoản</Th>
                <Th align="right">Thẻ</Th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <Tr key={b.branchId}>
                  <Td className="font-bold">{branchName(b.branchId)}</Td>
                  <Td align="right">{formatVnd(b.net)}</Td>
                  <Td align="right">{b.iqr ? formatVnd(b.iqr) : '—'}</Td>
                  <Td align="right">{formatVnd(b.topup)}</Td>
                  <Td align="right" className="text-reserve">{b.servedHere ? formatVnd(b.servedHere) : '—'}</Td>
                  <Td align="right">{formatVnd(b.cash)}</Td>
                  <Td align="right">{formatVnd(b.transfer)}</Td>
                  <Td align="right">{b.card ? formatVnd(b.card) : '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </ContentPanel>
      <SidePanel>
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><ArrowLeftRight className="size-4" /> Ví dùng chung chi nhánh</span>} />
          <CardBody className="flex flex-col gap-2 pt-0 text-[12.5px] text-ink-muted">
            <p>Khách dùng một ví ở mọi chi nhánh. Tiền nạp và doanh thu tính cho <b className="text-ink">chi nhánh nơi khách nạp</b>.</p>
            <p>Khách nạp ở Quận 1, chơi ở Thủ Đức: doanh thu ghi Quận 1, Thủ Đức ghi <b className="text-reserve">phục vụ hộ</b>.</p>
            <p>Khi trừ ví, túi của chi nhánh đang chơi trừ trước, rồi tới túi nạp sớm nhất.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Tiền thu theo phương thức" />
          <CardBody className="pt-0">
            {(
              [
                ['Tiền mặt', branches.reduce((n, b) => n + b.cash, 0), 'warn'],
                ['Chuyển khoản', branches.reduce((n, b) => n + b.transfer, 0), 'violet'],
                ['Thẻ', branches.reduce((n, b) => n + b.card, 0), 'topup'],
              ] as const
            ).map(([label, v, tone]) => (
              <ListRow key={label} title={label} trailing={<b>{formatVnd(v)}</b>}>
                <ProgressBar className="mt-1.5" value={v / cashIn} tone={tone} height={6} />
              </ListRow>
            ))}
          </CardBody>
        </Card>
      </SidePanel>
    </>
  )
}
