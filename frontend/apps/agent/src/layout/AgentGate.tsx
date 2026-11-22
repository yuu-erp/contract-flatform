import { NoAccessScreen } from '@meta-platform/ui'
import { Link } from 'react-router-dom'
import type { PreviewAccess } from '../preview/preview-access'

export function AgentGate({ access }: { access: PreviewAccess }) {
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
              <Link
                className="block rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/40"
                to={{ pathname: '/', search: `?domain=${encodeURIComponent(b.domain)}` }}
              >
                <span className="font-medium">{b.name}</span>
                <span className="ml-2 text-muted-foreground">{b.domain}</span>
              </Link>
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
          access.domain.includes('khong-co') ? 'Chi nhánh đã ngừng hoạt động hoặc domain không hợp lệ.' : `Không tìm thấy chi nhánh ${access.domain}.`
        }
      />
    )
  }
  if (access.kind === 'no-access') {
    return <NoAccessScreen title="Không có quyền" description={access.message} />
  }
  return null
}