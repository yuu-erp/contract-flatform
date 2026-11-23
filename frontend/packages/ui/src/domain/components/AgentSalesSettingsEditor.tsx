import {
  ALL_PAYMENT_METHODS,
  BRANCH_PAYMENT_FOLLOW_AGENT,
  SERVICE_IQR,
  SERVICE_NET,
  bpsToPercentInput,
  decodeContractError,
  parsePercentToBps,
  PercentParseError,
  togglePaymentMethodBit,
  useContracts,
  type BranchTax,
} from '@meta-platform/chain'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { PageLoader } from '../../components/PageLoader'
import { useAgentSalesRead } from '../hooks/use-agent-sales-read'
import { useAppTx } from '../hooks/use-app-tx'
import { METHOD_BITS, formatPaymentMethods } from '../lib/payment-methods'
import { TaxQuotePreview } from './TaxQuotePreview'
import type { SalesBranchRow } from './SalesSettingsReadonly'
import {
  FieldHelp,
  HELP_BRANCH_EFFECTIVE_ZERO,
  HELP_BRANCH_OVERRIDE,
  HELP_BRANCH_PAYMENT_CUSTOM,
  HELP_BRANCH_PAYMENT_FOLLOW,
  HELP_BRANCH_TAX_CLEAR,
  HELP_PAYMENT_AGENT,
  HELP_PAYMENT_BITS,
  HELP_TAX_AGENT,
  HELP_TAX_IQR,
  HELP_TAX_MODE_IQR,
  HELP_TAX_MODE_NET,
  HELP_TAX_NET,
  SALES_SETTINGS_INTRO_OWNER,
} from '../lib/sales-settings-help'

type SalesData = NonNullable<ReturnType<typeof useAgentSalesRead>['data']>

export function AgentSalesSettingsEditor({
  agentId,
  branches,
  focusBranchId,
}: {
  agentId: number
  branches: SalesBranchRow[]
  focusBranchId?: number
}) {
  const sales = useAgentSalesRead(agentId, branches.map((b) => b.branchId))
  const previewBranch = focusBranchId ?? branches[0]?.branchId ?? null
  const previewLabel = branches.find((b) => b.branchId === previewBranch)?.name

  const warnings = useMemo(() => {
    if (!sales.data) return []
    return branches.filter((b) => (sales.data!.branchTaxes[b.branchId]?.methods ?? 0) === 0)
  }, [branches, sales.data])

  if (sales.isLoading) return <PageLoader message="Đang tải cài đặt…" />
  if (!sales.data) return null

  return (
    <div className="space-y-4">
      <FieldHelp>{SALES_SETTINGS_INTRO_OWNER}</FieldHelp>
      {warnings.length > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>Phương thức thanh toán</AlertTitle>
          <AlertDescription>
            Các chi nhánh sau không còn phương thức nào sau khi thu hẹp tập agent:{' '}
            {warnings.map((w) => w.name).join(', ')}. {HELP_BRANCH_EFFECTIVE_ZERO}
          </AlertDescription>
        </Alert>
      ) : null}

      <AgentTaxCard agentId={agentId} data={sales.data} />
      <AgentPaymentCard agentId={agentId} agentMask={sales.data.methods} />

      <Card>
        <CardHeader>
          <CardTitle>Ghi đè theo chi nhánh</CardTitle>
          <CardDescription>{HELP_BRANCH_OVERRIDE}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {branches.map((b) => (
            <BranchSalesOverride
              key={b.branchId}
              branch={b}
              agentMethods={sales.data!.methods}
              net={sales.data!.branchTaxes[b.branchId]!.net}
              iqr={sales.data!.branchTaxes[b.branchId]!.iqr}
              effectiveMethods={sales.data!.branchTaxes[b.branchId]!.methods}
            />
          ))}
        </CardContent>
      </Card>

      <TaxQuotePreview branchId={previewBranch} branchLabel={previewLabel} />
    </div>
  )
}

function useInvalidateSales(qc: ReturnType<typeof useQueryClient>) {
  return () => qc.invalidateQueries({ queryKey: ['agent-sales-read'] })
}

function AgentTaxCard({ agentId, data }: { agentId: number; data: SalesData }) {
  const contracts = useContracts()
  const tx = useAppTx()
  const qc = useQueryClient()
  const invalidate = useInvalidateSales(qc)
  const [net, setNet] = useState(() => bpsToPercentInput(data.taxNet))
  const [iqr, setIqr] = useState(() => bpsToPercentInput(data.taxIqr))

  useEffect(() => {
    setNet(bpsToPercentInput(data.taxNet))
    setIqr(bpsToPercentInput(data.taxIqr))
  }, [data.taxNet, data.taxIqr])

  const saveTax = (service: number, text: string) => {
    let bps: number
    try {
      bps = parsePercentToBps(text)
    } catch (e) {
      toast.error(e instanceof PercentParseError ? e.message : 'Phần trăm không hợp lệ.')
      return
    }
    void tx.run(async () => {
      await contracts!.salesSettings.setAgentTax(agentId, service, bps)
      invalidate()
    })
  }

  const saveExclusive = (exclusive: boolean) => {
    void tx.run(async () => {
      await contracts!.salesSettings.setTaxExclusive(agentId, SERVICE_IQR, exclusive)
      invalidate()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thuế mức agent</CardTitle>
        <CardDescription>{HELP_TAX_AGENT}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-6">
          <PercentField
            id="tax-net"
            label="Thuế NET (%)"
            hint={HELP_TAX_NET}
            value={net}
            onChange={setNet}
            onSave={() => saveTax(SERVICE_NET, net)}
          />
          <PercentField
            id="tax-iqr"
            label="Thuế IQR (%)"
            hint={HELP_TAX_IQR}
            value={iqr}
            onChange={setIqr}
            onSave={() => saveTax(SERVICE_IQR, iqr)}
          />
        </div>
        <FieldHelp>{HELP_TAX_MODE_NET}</FieldHelp>
        <MotionRowBlock
          id="iqr-exclusive"
          label="IQR tách thuế (chưa gồm)"
          hint={HELP_TAX_MODE_IQR}
          checked={data.exIqr}
          onCheckedChange={(v) => saveExclusive(v === true)}
        />
      </CardContent>
    </Card>
  )
}

function AgentPaymentCard({ agentId, agentMask }: { agentId: number; agentMask: number }) {
  const contracts = useContracts()
  const tx = useAppTx()
  const qc = useQueryClient()
  const invalidate = useInvalidateSales(qc)
  const [mask, setMask] = useState(agentMask)

  useEffect(() => setMask(agentMask), [agentMask])

  const save = () => {
    if (mask === 0 || (mask & ~ALL_PAYMENT_METHODS) !== 0) {
      toast.error('Chọn ít nhất một phương thức hợp lệ.')
      return
    }
    void tx.run(
      async () => {
        await contracts!.salesSettings.setAgentPaymentMethods(agentId, mask)
        invalidate()
      },
      {
        onError: (m) => toast.error(decodeContractError(new Error(m))),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phương thức thanh toán (agent)</CardTitle>
        <CardDescription>{HELP_PAYMENT_AGENT}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <FieldHelp>{HELP_PAYMENT_BITS}</FieldHelp>
        <PaymentChecks mask={mask} onChange={setMask} agentMask={ALL_PAYMENT_METHODS} />
        <p className="text-muted-foreground">Hiệu lực: {formatPaymentMethods(mask)}</p>
        <Button type="button" size="sm" onClick={save}>
          Lưu phương thức agent
        </Button>
      </CardContent>
    </Card>
  )
}

function BranchSalesOverride({
  branch,
  agentMethods,
  net,
  iqr,
  effectiveMethods,
}: {
  branch: SalesBranchRow
  agentMethods: number
  net: BranchTax
  iqr: BranchTax
  effectiveMethods: number
}) {
  const contracts = useContracts()
  const tx = useAppTx()
  const qc = useQueryClient()
  const invalidate = useInvalidateSales(qc)

  const [netText, setNetText] = useState(net.isSet ? bpsToPercentInput(net.bps) : '')
  const [iqrText, setIqrText] = useState(iqr.isSet ? bpsToPercentInput(iqr.bps) : '')
  const [overrideNet, setOverrideNet] = useState(net.isSet)
  const [overrideIqr, setOverrideIqr] = useState(iqr.isSet)

  const [followAgent, setFollowAgent] = useState(
    () => effectiveMethods === agentMethods || effectiveMethods === 0,
  )
  const [branchMask, setBranchMask] = useState(() =>
    followAgent ? agentMethods : effectiveMethods,
  )

  useEffect(() => {
    setNetText(net.isSet ? bpsToPercentInput(net.bps) : '')
    setIqrText(iqr.isSet ? bpsToPercentInput(iqr.bps) : '')
    setOverrideNet(net.isSet)
    setOverrideIqr(iqr.isSet)
    const follow = effectiveMethods === agentMethods
    setFollowAgent(follow)
    setBranchMask(follow ? agentMethods : effectiveMethods)
  }, [net, iqr, effectiveMethods, agentMethods])

  const saveBranchTax = (service: number, text: string, enabled: boolean, clear: boolean) => {
    if (!enabled || clear) {
      void tx.run(async () => {
        await contracts!.salesSettings.clearBranchTax(branch.branchId, service)
        invalidate()
      })
      return
    }
    try {
      const bps = parsePercentToBps(text)
      void tx.run(async () => {
        await contracts!.salesSettings.setBranchTax(branch.branchId, service, bps)
        invalidate()
      })
    } catch (e) {
      toast.error(e instanceof PercentParseError ? e.message : 'Phần trăm không hợp lệ.')
    }
  }

  const saveBranchMethods = () => {
    const payload = followAgent ? BRANCH_PAYMENT_FOLLOW_AGENT : branchMask
    if (!followAgent && (payload === 0 || (payload & ~agentMethods) !== 0)) {
      toast.error('Tập phương thức chi nhánh phải là con của agent.')
      return
    }
    void tx.run(
      async () => {
        await contracts!.salesSettings.setBranchPaymentMethods(branch.branchId, payload)
        invalidate()
      },
      { onError: (m) => toast.error(decodeContractError(new Error(m))) },
    )
  }

  return (
    <div className="space-y-3 border-b border-border pb-4 last:border-0">
      <p className="font-medium">{branch.name}</p>
      <FieldHelp>{HELP_BRANCH_TAX_CLEAR}</FieldHelp>
      <div className="flex flex-wrap items-center gap-3">
        <MotionRow
          id={`ov-net-${branch.branchId}`}
          label="Ghi đè thuế NET"
          checked={overrideNet}
          onCheckedChange={(v) => setOverrideNet(v === true)}
        />
        {overrideNet ? (
          <PercentField
            id={`net-${branch.branchId}`}
            label="NET (%)"
            value={netText}
            onChange={setNetText}
            onSave={() => saveBranchTax(SERVICE_NET, netText, true, false)}
          />
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => saveBranchTax(SERVICE_NET, '', false, true)}>
            Theo agent
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <MotionRow
          id={`ov-iqr-${branch.branchId}`}
          label="Ghi đè thuế IQR"
          checked={overrideIqr}
          onCheckedChange={(v) => setOverrideIqr(v === true)}
        />
        {overrideIqr ? (
          <PercentField
            id={`iqr-${branch.branchId}`}
            label="IQR (%)"
            value={iqrText}
            onChange={setIqrText}
            onSave={() => saveBranchTax(SERVICE_IQR, iqrText, true, false)}
          />
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => saveBranchTax(SERVICE_IQR, '', false, true)}>
            Theo agent
          </Button>
        )}
      </div>
      <MotionRowBlock
        id={`follow-${branch.branchId}`}
        label="Phương thức: Theo agent (= 0)"
        hint={HELP_BRANCH_PAYMENT_FOLLOW}
        checked={followAgent}
        onCheckedChange={(v) => {
          const on = v === true
          setFollowAgent(on)
          if (on) setBranchMask(agentMethods)
        }}
      />
      {!followAgent ? (
        <>
          <FieldHelp>{HELP_BRANCH_PAYMENT_CUSTOM}</FieldHelp>
          <PaymentChecks mask={branchMask} onChange={setBranchMask} agentMask={agentMethods} />
        </>
      ) : null}
      <p className="text-muted-foreground">
        Hiệu lực chi nhánh: {formatPaymentMethods(effectiveMethods)}
        {effectiveMethods === 0 ? ' — không có phương thức!' : ''}
      </p>
      {!followAgent ? (
        <Button type="button" size="sm" variant="secondary" onClick={saveBranchMethods}>
          Lưu phương thức chi nhánh
        </Button>
      ) : (
        <Button type="button" size="sm" variant="secondary" onClick={saveBranchMethods}>
          Đặt theo agent
        </Button>
      )}
    </div>
  )
}

function PercentField({
  id,
  label,
  hint,
  value,
  onChange,
  onSave,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  onSave: () => void
}) {
  return (
    <div className="max-w-md space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <FieldHelp className="mb-1">{hint}</FieldHelp> : null}
      <div className="flex gap-2">
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-28" />
        <Button type="button" size="sm" variant="secondary" onClick={onSave}>
          Lưu
        </Button>
      </div>
    </div>
  )
}

function MotionRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (v: boolean | 'indeterminate') => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

function MotionRowBlock({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (v: boolean | 'indeterminate') => void
}) {
  return (
    <div className="space-y-1">
      <MotionRow id={id} label={label} checked={checked} onCheckedChange={onCheckedChange} />
      {hint ? <FieldHelp className="pl-6">{hint}</FieldHelp> : null}
    </div>
  )
}

function PaymentChecks({
  mask,
  onChange,
  agentMask,
}: {
  mask: number
  onChange: (m: number) => void
  agentMask: number
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {METHOD_BITS.map((m) => {
        const disabled = (agentMask & m.bit) === 0
        return (
          <div key={m.bit} className="flex items-center gap-2">
            <Checkbox
              id={`pm-${m.bit}`}
              checked={(mask & m.bit) !== 0}
              disabled={disabled}
              onCheckedChange={(v) => onChange(togglePaymentMethodBit(mask, m.bit, v === true))}
            />
            <Label htmlFor={`pm-${m.bit}`} className={disabled ? 'text-muted-foreground' : undefined}>
              {m.label}
            </Label>
          </div>
        )
      })}
    </div>
  )
}