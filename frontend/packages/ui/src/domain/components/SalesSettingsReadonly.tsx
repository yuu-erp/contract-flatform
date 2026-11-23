import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { EmptyState } from '../../components/EmptyState'
import { PageLoader } from '../../components/PageLoader'
import { formatBps } from '../../lib/format'
import { useAgentSalesRead } from '../hooks/use-agent-sales-read'
import { formatPaymentMethods } from '../lib/payment-methods'

export type SalesBranchRow = { branchId: number; name: string }

export function AgentSalesSettingsReadonly({
  agentId,
  branches,
}: {
  agentId: number
  branches: SalesBranchRow[]
}) {
  const sales = useAgentSalesRead(agentId, branches.map((b) => b.branchId))
  if (sales.isLoading) return <PageLoader />
  const d = sales.data
  if (!d) return <EmptyState title="Không đọc được cấu hình thuế" />
  return (
    <div className="space-y-4 text-sm">
      <Card>
        <CardHeader>
          <CardTitle>Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p>Thuế NET: {formatBps(d.taxNet)}</p>
          <p>Thuế IQR: {formatBps(d.taxIqr)}</p>
          <p>Kiểu giá NET: {d.exNet ? 'Tách thuế' : 'Đã gồm thuế (khoá)'}</p>
          <p>Kiểu giá IQR: {d.exIqr ? 'Tách thuế' : 'Đã gồm thuế'}</p>
          <p>Phương thức: {formatPaymentMethods(d.methods)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Chi nhánh (chỉ đọc)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {branches.map((b) => {
            const bt = d.branchTaxes[b.branchId]
            if (!bt) return null
            return (
              <div key={b.branchId} className="border-b border-border pb-2">
                <p className="font-medium">{b.name}</p>
                <p>NET: {bt.net.isSet ? formatBps(bt.net.bps) : 'Theo agent'}</p>
                <p>IQR: {bt.iqr.isSet ? formatBps(bt.iqr.bps) : 'Theo agent'}</p>
                <p>Phương thức: {formatPaymentMethods(bt.methods)}</p>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export function BranchSalesSettingsReadonly({ agentId, branchId, branchName }: { agentId: number; branchId: number; branchName?: string }) {
  const sales = useAgentSalesRead(agentId, [branchId])
  const bt = sales.data?.branchTaxes[branchId]
  if (sales.isLoading) return <PageLoader />
  if (!bt) return <EmptyState title="Chưa có cấu hình" />
  return (
    <Card>
      {branchName ? (
        <CardHeader>
          <CardTitle>{branchName}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className="space-y-2 pt-6 text-sm">
        <p>Thuế NET: {bt.net.isSet ? formatBps(bt.net.bps) : 'Theo agent'}</p>
        <p>Thuế IQR: {bt.iqr.isSet ? formatBps(bt.iqr.bps) : 'Theo agent'}</p>
        <p>Kiểu giá NET: đã gồm thuế (khoá)</p>
        <p>Kiểu giá IQR: {sales.data?.exIqr ? 'Tách thuế' : 'Đã gồm thuế'}</p>
        <p>Phương thức hiệu lực: {formatPaymentMethods(bt.methods)}</p>
      </CardContent>
    </Card>
  )
}