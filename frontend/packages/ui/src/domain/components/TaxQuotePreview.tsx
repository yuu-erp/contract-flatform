import { decodeContractError, SERVICE_IQR, SERVICE_NET, useContracts } from '@meta-platform/chain'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { formatBps, formatVnd } from '../../lib/format'
import { PageLoader } from '../../components/PageLoader'
import {
  FieldHelp,
  HELP_QUOTE_AMOUNT,
  HELP_QUOTE_PREVIEW,
  HELP_QUOTE_SERVICE,
} from '../lib/sales-settings-help'

export function TaxQuotePreview({
  branchId,
  branchLabel,
}: {
  branchId: number | null
  branchLabel?: string
}) {
  const contracts = useContracts()
  const [amountText, setAmountText] = useState('100000')
  const [service, setService] = useState<number>(SERVICE_NET)

  const amount = (() => {
    const digits = amountText.replace(/[^\d]/g, '')
    try {
      return BigInt(digits || '0')
    } catch {
      return 0n
    }
  })()

  const quote = useQuery({
    queryKey: ['quote-tax', branchId, service, amount.toString()],
    enabled: !!contracts && branchId != null && branchId > 0 && amount > 0n,
    queryFn: () => contracts!.salesSettings.quoteTax(branchId!, service, amount),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem trước quoteTax</CardTitle>
        <CardDescription>{HELP_QUOTE_PREVIEW}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {branchLabel ? <p className="text-muted-foreground">Chi nhánh: {branchLabel}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quote-amount">Số tiền (đồng)</Label>
            <FieldHelp>{HELP_QUOTE_AMOUNT}</FieldHelp>
            <Input
              id="quote-amount"
              inputMode="numeric"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Dịch vụ</Label>
            <FieldHelp>{HELP_QUOTE_SERVICE}</FieldHelp>
            <Select value={String(service)} onValueChange={(v) => setService(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(SERVICE_NET)}>NET</SelectItem>
                <SelectItem value={String(SERVICE_IQR)}>IQR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {!branchId ? <p className="text-muted-foreground">Chọn chi nhánh để xem trước.</p> : null}
        {quote.isLoading ? <PageLoader message="Đang gọi quoteTax…" /> : null}
        {quote.data ? (
          <dl className="grid grid-cols-2 gap-2 rounded-md border border-border p-3">
            <dt className="text-muted-foreground">Thuế suất</dt>
            <dd>{formatBps(quote.data.bps)}</dd>
            <dt className="text-muted-foreground">Kiểu giá</dt>
            <dd>{quote.data.exclusive ? 'Tách thuế' : 'Đã gồm thuế'}</dd>
            <dt className="text-muted-foreground">Thuế</dt>
            <dd>{formatVnd(quote.data.tax)}</dd>
            <dt className="text-muted-foreground">Khách trả</dt>
            <dd className="font-medium">{formatVnd(quote.data.total)}</dd>
          </dl>
        ) : null}
        {quote.isError ? (
          <p className="text-destructive text-sm">
            {decodeContractError(quote.error ?? new Error('Không gọi được quoteTax.'))}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}