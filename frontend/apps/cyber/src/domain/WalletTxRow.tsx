import { ArrowDownLeft } from 'lucide-react'
import type { WalletTx } from '../data/types'
import { formatNumber } from '../data/format'
import { ListRow } from '../ui'

/** Một dòng lịch sử nạp ví. */
export function WalletTxRow({ tx }: { tx: WalletTx }) {
  return (
    <ListRow
      className="py-3"
      leading={
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-edge bg-sunken">
          <ArrowDownLeft className="size-4" />
        </span>
      }
      title={tx.label}
      subtitle={tx.at}
      trailing={
        <>
          <div className="font-extrabold text-play">+{formatNumber(tx.amount)} VND</div>
          <div className="text-[11px] text-ink-dim">Số dư trước: {formatNumber(tx.balanceBefore)}</div>
        </>
      }
    />
  )
}
