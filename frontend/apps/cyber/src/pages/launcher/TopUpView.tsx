import { ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { formatNumber } from '../../data/format'
import { useLauncher } from '../../data/hooks'
import { WalletTxRow } from '../../domain'
import { Button, Card, cn } from '../../ui'
import { ViewHead } from './ViewHead'

/** Tỉ giá nạp: 1 VND = 1 xu (cấu hình theo quán sau). */
const XU_PER_VND = 1

function AmountField({ label, value, unit, onChange }: { label: string; value: string; unit: string; onChange?: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink-muted">{label}</span>
      <div className="mt-1.5 flex h-12 items-center overflow-hidden rounded-[14px] border border-edge bg-black/25">
        <input
          inputMode="numeric"
          value={value}
          readOnly={!onChange}
          placeholder="0"
          onChange={(e) => onChange?.(e.target.value.replace(/\D/g, ''))}
          className="min-w-0 flex-1 bg-transparent px-4 font-bold text-ink outline-none"
        />
        <span className="border-l border-edge px-4 text-[13px] font-bold text-ink-muted">{unit}</span>
      </div>
    </label>
  )
}

export function TopUpView() {
  const { player, walletTx } = useLauncher()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'cash' | 'bank'>('cash')
  const vnd = Number(amount || 0)
  return (
    <>
      <ViewHead title="Nạp tiền" back />
      <div className="mt-4 grid grid-cols-[400px_1fr] gap-4">
        <Card className="p-5">
          <h2 className="text-lg font-extrabold">Nạp tiền</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-ink-dim">Ví chính</div>
              <div className="text-2xl font-extrabold">{formatNumber(player.mainBalance)} <span className="text-sm">xu</span></div>
            </div>
            <div>
              <div className="text-xs text-ink-dim">Ví thưởng</div>
              <div className="text-2xl font-extrabold text-warn">{formatNumber(player.bonusBalance)} <span className="text-sm">xu</span></div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <AmountField label="Nhập số tiền muốn nạp" value={amount ? formatNumber(vnd) : ''} unit="VND" onChange={setAmount} />
            <div className="flex justify-center text-ink-dim">
              <ArrowUpDown className="size-5" />
            </div>
            <AmountField label="Nhận vào ví chính" value={formatNumber(vnd * XU_PER_VND)} unit="Xu" />
          </div>
          <div className="mt-4 flex gap-5" role="radiogroup" aria-label="Hình thức nạp">
            {(['cash', 'bank'] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className="flex items-center gap-2 font-bold">
                <span className={cn('grid size-5 place-items-center rounded-full border-2', method === m ? 'border-play' : 'border-white/40')}>
                  {method === m ? <span className="size-2.5 rounded-full bg-play" /> : null}
                </span>
                {m === 'cash' ? 'Tiền mặt' : 'Ngân hàng'}
              </button>
            ))}
          </div>
          <Button className="mt-5" size="lg" variant="topup" block disabled={vnd <= 0}>
            Gửi yêu cầu nạp
          </Button>
        </Card>
        <Card className="min-w-0 p-5">
          <h2 className="text-lg font-extrabold">Lịch sử giao dịch</h2>
          <div className="mt-1">
            {walletTx.map((tx) => (
              <WalletTxRow key={tx.id} tx={tx} />
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
