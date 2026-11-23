import type { AgentAccess } from '@meta-platform/chain'
import { NoAccessScreen } from '@meta-platform/ui'
import { Building2, MapPin } from 'lucide-react'

export function AgentGate({ access }: { access: AgentAccess }) {
  if (access.kind === 'login') {
    return <NoAccessScreen title="Chưa kết nối ví" description="Kết nối ví để quản lý cửa hàng." />
  }
  if (access.kind === 'pick-branch') {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Chọn chi nhánh</h2>
        <p className="text-sm text-muted-foreground">Ví của bạn là quản lý tại các chi nhánh sau.</p>
        <ul className="space-y-2">
          {access.branches.map((b) => (
            <li key={b.branchId}>
              <a
                className="flex items-start gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                href={`?domain=${encodeURIComponent(b.domain)}`}
              >
                <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{b.name}</span>
                  {b.storeName ? (
                    <span className="text-xs text-muted-foreground">{b.storeName}</span>
                  ) : null}
                  <span className="mt-0.5 flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" aria-hidden />
                    {b.domain}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (access.kind === 'domain-not-found') {
    return (
      <NoAccessScreen
        title="Domain không tồn tại"
        description={
          access.domain.includes('khong-co')
            ? 'Chi nhánh đã ngừng hoạt động hoặc domain không hợp lệ.'
            : `Không tìm thấy chi nhánh ${access.domain}.`
        }
      />
    )
  }
  if (access.kind === 'no-access') {
    return <NoAccessScreen title="Không có quyền" description={access.message} />
  }
  return null
}