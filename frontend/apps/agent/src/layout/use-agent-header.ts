import type { AgentAccess } from '@meta-platform/chain'
import { useLocation } from 'react-router-dom'

export function useAgentHeader(access: AgentAccess | null): { title: string; subtitle?: string } {
  const { pathname } = useLocation()
  const routeTitle =
    pathname === '/'
      ? 'Tổng quan'
      : pathname.startsWith('/branches')
        ? 'Chi nhánh'
        : pathname === '/staff'
          ? 'Nhân sự'
          : pathname === '/settings'
            ? 'Cài đặt'
            : pathname === '/wallets'
              ? 'Ví khách'
              : pathname === '/transactions'
                ? 'Giao dịch'
                : pathname === '/audit'
                  ? 'Nhật ký'
                  : 'Meta Agent'

  if (!access) return { title: routeTitle }
  if (access.kind === 'manager') {
    return {
      title: access.storeName ?? 'Meta Agent',
      subtitle: `${access.branchName ?? 'Chi nhánh'} · ${access.domain}`,
    }
  }
  if (access.kind === 'owner') {
    return {
      title: access.storeName ?? 'Meta Agent',
      subtitle: access.focusDomain ? `Chi nhánh: ${access.focusDomain}` : routeTitle,
    }
  }
  return { title: 'Meta Agent', subtitle: routeTitle }
}