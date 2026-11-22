import { useContracts, useCustomerWallet } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Money } from '../../components/Money'
import { PageLoader } from '../../components/PageLoader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { bucketRowsFromPortions } from '../lib/wallet-buckets'

export type WalletBranchLabel = { branchId: number; name: string }

export function CustomerWalletPanel({
  agentId,
  branches,
  highlightBranchId,
}: {
  agentId: number
  branches: WalletBranchLabel[]
  highlightBranchId?: number
}) {
  const contracts = useContracts()
  const [customer, setCustomer] = useState('')
  const trimmed = customer.trim()
  const validCustomer = /^0x[0-9a-fA-F]{40}$/.test(trimmed) ? trimmed : null
  const wallet = useCustomerWallet(agentId, validCustomer)
  const liability = useQuery({
    queryKey: ['wallet-liability', agentId],
    enabled: !!contracts,
    queryFn: () => contracts!.ledger.walletLiability(agentId),
  })
  const nameById = useMemo(() => new Map(branches.map((b) => [b.branchId, b.name])), [branches])
  const rows = bucketRowsFromPortions(wallet.data?.buckets ?? [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ví khách</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Dư nợ tổng agent: {liability.isLoading ? '…' : <Money value={liability.data ?? 0n} />}
        </p>
        <Input placeholder="0x… ví khách" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        {trimmed && !validCustomer ? (
          <p className="text-sm text-destructive">Địa chỉ ví không hợp lệ (0x + 40 hex).</p>
        ) : null}
        {wallet.isFetching ? <PageLoader message="Đang tra…" /> : null}
        {wallet.data ? (
          <div className="space-y-2 text-sm">
            <p>
              Số dư: <Money value={wallet.data.balance} />
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chi nhánh</TableHead>
                    <TableHead className="text-right">Túi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const highlight = highlightBranchId != null && row.branchId === highlightBranchId
                    return (
                      <TableRow key={`${row.branchId}-${row.amount}`} className={highlight ? 'bg-primary/10' : undefined}>
                        <TableCell>{nameById.get(row.branchId) ?? `Chi nhánh #${row.branchId}`}</TableCell>
                        <TableCell className="text-right">
                          <Money value={row.amount} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}