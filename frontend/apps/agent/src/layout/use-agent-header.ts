import { useLocation } from 'react-router-dom'
import type { PreviewAccess } from '../preview/preview-access'

export function useAgentHeader(access: PreviewAccess | null): { title: string; subtitle?: string } {
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
      title: access.storeName,
      subtitle: `${access.branchName} · ${access.domain}`,
    }
  }
  if (access.kind === 'owner') {
    return {
      title: access.storeName,
      subtitle: access.focusDomain ? `Chi nhánh: ${access.focusDomain}` : routeTitle,
    }
  }
  return { title: 'Meta Agent', subtitle: routeTitle }
}