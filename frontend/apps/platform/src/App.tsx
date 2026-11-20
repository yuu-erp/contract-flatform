import { ContractsProvider, deploymentsError, useActiveWallet, useConnectWallet, usePlatformContracts } from '@meta-platform/chain'
import { ErrorState, LoginScreen } from '@meta-platform/ui'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import deployments from '../../../../deployments/platform-991.json'
import { PlatformLayout } from './layout/PlatformLayout'
import { AgentsPage } from './pages/AgentsPage'
import { OverviewPage } from './pages/OverviewPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? '991')

function AppRoutes() {
  const missing = deploymentsError(deployments as Record<string, unknown>)
  const { data: wallet } = useActiveWallet()
  const connect = useConnectWallet()
  const contracts = usePlatformContracts(CHAIN_ID, deployments as Record<string, unknown>)

  if (missing) {
    return <ErrorState message={missing} onRetry={() => window.location.reload()} />
  }

  if (!wallet) {
    return (
      <LoginScreen
        title="Dashboard Nền tảng"
        description="Kết nối ví có quyền Owner hoặc Admin nền tảng."
        onConnect={() => connect.mutate()}
        pending={connect.isPending}
      />
    )
  }

  if (!contracts) {
    return <p className="p-6 text-sm text-muted-foreground">Đang khởi tạo kết nối contract…</p>
  }

  return (
    <ContractsProvider value={contracts}>
      <Routes>
        <Route element={<PlatformLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="audit" element={<PlaceholderPage title="Nhật ký toàn hệ" />} />
          <Route path="system" element={<PlaceholderPage title="Hệ thống" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ContractsProvider>
  )
}

export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}