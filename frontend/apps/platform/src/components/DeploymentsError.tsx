import { ErrorState } from '@meta-platform/ui'

export function DeploymentsError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <ErrorState message={message} onRetry={() => window.location.reload()} />
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Vì sao?</p>
        <p className="mt-2">
          Bản ghi chain <strong>991</strong> trong repo chưa deploy (hoặc chưa commit) module{' '}
          <code className="text-xs">SalesSettings</code> và <code className="text-xs">Ledger</code> — thiếu ít nhất{' '}
          <code className="text-xs">salesSettingsProxy</code> / <code className="text-xs">ledgerProxy</code>.
        </p>
        <p className="mt-2 font-medium text-foreground">Cách xử lý</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Owner chạy deploy/nâng cấp theo <code className="text-xs">docs/07-deploy-va-nang-cap.md</code>, cập nhật{' '}
            <code className="text-xs">deployments/platform-991.json</code>.
          </li>
          <li>
            Hoặc chỉ trên máy dev: copy{' '}
            <code className="text-xs">deployments/platform-991.local.json.example</code> →{' '}
            <code className="text-xs">deployments/platform-991.local.json</code> và điền proxy thật, rồi reload.
          </li>
        </ol>
      </div>
    </div>
  )
}