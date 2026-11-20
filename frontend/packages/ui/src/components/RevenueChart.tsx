import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatVnd, formatVndCompact } from '../lib/format'
import { cn } from '../lib/cn'
import { useChartDarkMode } from '../hooks/use-chart-theme'

export type RevenueChartPoint = {
  label: string
  net: number
  iqr: number
}

export function RevenueChart({
  data,
  className,
}: {
  data: RevenueChartPoint[]
  className?: string
}) {
  const dark = useChartDarkMode()
  const grid = dark ? '#3f3f46' : '#e4e4e7'
  const text = dark ? '#a1a1aa' : '#71717a'

  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: text, fontSize: 12 }} />
          <YAxis tick={{ fill: text, fontSize: 12 }} width={56} tickFormatter={(v) => formatVndCompact(BigInt(Math.round(v)))} />
          <Tooltip
            formatter={(value: number, name: string) => [formatVnd(BigInt(Math.round(value))), name === 'net' ? 'NET' : 'IQR']}
            contentStyle={{
              background: dark ? '#18181b' : '#fff',
              border: `1px solid ${grid}`,
              borderRadius: 8,
            }}
          />
          <Bar dataKey="net" stackId="a" fill="#2563eb" name="net" />
          <Bar dataKey="iqr" stackId="a" fill="#7c3aed" name="iqr" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}