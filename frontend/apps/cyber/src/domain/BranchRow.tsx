import type { Branch } from '../data/types'
import { formatVnd } from '../data/format'
import { Avatar, ListRow, ProgressBar } from '../ui'

/** Chi nhánh: doanh thu hôm nay + công suất máy (≥90% chuyển cam). */
export function BranchRow({ branch }: { branch: Branch }) {
  const ratio = branch.pcsInUse / branch.pcsTotal
  const hot = ratio >= 0.9
  return (
    <ListRow
      leading={<Avatar name={branch.name.split(' ').at(-1) ?? branch.name} size={36} shape="rounded" />}
      title={
        <span className="flex justify-between gap-2">
          <span className="truncate">{branch.name}</span>
          <span className="font-extrabold">{formatVnd(branch.revenueToday)}</span>
        </span>
      }
    >
      <div className="mt-1.5 flex items-center gap-2.5">
        <ProgressBar value={ratio} height={6} tone={hot ? 'topup' : ratio > 0.6 ? 'play' : 'violet'} className="flex-1" label={`Công suất ${branch.name}`} />
        <span className={`w-[66px] text-right text-[11.5px] font-bold whitespace-nowrap ${hot ? 'text-topup' : 'text-ink-dim'}`}>
          {branch.pcsInUse}/{branch.pcsTotal} máy
        </span>
      </div>
    </ListRow>
  )
}
