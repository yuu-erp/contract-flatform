import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { EmptyState } from '../../components/EmptyState'
import { PageLoader } from '../../components/PageLoader'
import { formatBps } from '../../lib/format'
import { useAgentSalesRead } from '../hooks/use-agent-sales-read'
import { formatPaymentMethods } from '../lib/payment-methods'
import {
  FieldHelp,
  HELP_READONLY_IQR,
  HELP_READONLY_METHODS,
  HELP_READONLY_NET,
  HELP_TAX_MODE_IQR,
  HELP_TAX_MODE_NET,
  SALES_SETTINGS_INTRO_MANAGER,
} from '../lib/sales-settings-help'

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
          <CardDescription>{SALES_SETTINGS_INTRO_MANAGER}</CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className="space-y-3 pt-6 text-sm">
        <ValueRow
          label="Thuế NET"
          value={bt.net.isSet ? formatBps(bt.net.bps) : 'Theo agent'}
          help={HELP_READONLY_NET}
        />
        <ValueRow
          label="Thuế IQR"
          value={bt.iqr.isSet ? formatBps(bt.iqr.bps) : 'Theo agent'}
          help={HELP_READONLY_IQR}
        />
        <ValueRow label="Kiểu giá NET" value="Đã gồm thuế (khoá)" help={HELP_TAX_MODE_NET} />
        <ValueRow
          label="Kiểu giá IQR"
          value={sales.data?.exIqr ? 'Tách thuế' : 'Đã gồm thuế'}
          help={HELP_TAX_MODE_IQR}
        />
        <ValueRow
          label="Phương thức hiệu lực"
          value={formatPaymentMethods(bt.methods)}
          help={HELP_READONLY_METHODS}
        />
      </CardContent>
    </Card>
  )
}

function ValueRow({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className="space-y-0.5">
      <p>
        <span className="font-medium">{label}:</span> {value}
      </p>
      <FieldHelp className="pl-0">{help}</FieldHelp>
    </div>
  )
}