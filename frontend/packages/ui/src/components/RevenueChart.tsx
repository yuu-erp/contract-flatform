import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
            formatter={(value, name) => {
              const n = typeof value === 'number' ? value : Number(value ?? 0)
              const key = String(name)
              return [formatVnd(BigInt(Math.round(n))), key === 'net' ? 'NET' : 'IQR']
            }}
            contentStyle={{
              background: dark ? '#18181b' : '#fff',
              border: `1px solid ${grid}`,
              borderRadius: 8,
            }}
          />
          <Legend
            verticalAlign="top"
            height={32}
            content={({ payload }) => {
              const order = ['net', 'iqr'] as const
              const colorOf = (key: string) =>
                payload?.find((p) => p.value === key)?.color ?? (key === 'net' ? 'var(--chart-1)' : 'var(--chart-2)')
              return (
                <ul className="flex list-none flex-wrap items-center justify-center gap-4 pb-1 text-sm text-muted-foreground">
                  {order.map((key) => (
                    <li key={key} className="flex items-center gap-1.5">
                      <span className="size-2.5 shrink-0 rounded-sm" style={{ background: colorOf(key) }} aria-hidden />
                      <span>{key === 'net' ? 'NET' : 'IQR'}</span>
                    </li>
                  ))}
                </ul>
              )
            }}
          />
          <Bar dataKey="net" stackId="a" fill="var(--chart-1)" name="net" />
          <Bar dataKey="iqr" stackId="a" fill="var(--chart-2)" name="iqr" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}