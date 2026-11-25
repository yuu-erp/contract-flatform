import { RangePicker } from '../../components/RangePicker'
import { ServiceFilter } from '../../components/ServiceFilter'
import type { RangePickerValue } from '../../lib/range-picker'
import type { ServiceFilterValue } from '../../components/ServiceFilter'

export function OverviewFiltersBar({
  range,
  onRangeChange,
  service,
  onServiceChange,
  className,
}: {
  range: RangePickerValue
  onRangeChange: (v: RangePickerValue) => void
  service: ServiceFilterValue
  onServiceChange: (v: ServiceFilterValue) => void
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <RangePicker value={range} onChange={onRangeChange} />
      <ServiceFilter value={service} onChange={onServiceChange} />
    </div>
  )
}