import { deploymentsError } from '@meta-platform/chain'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DeploymentsError } from './components/DeploymentsError'
import { platformDeployments } from './config/deployments'
import { PlatformChrome } from './layout/PlatformChrome'
import { AgentsPage } from './pages/AgentsPage'
import { OverviewPage } from './pages/OverviewPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { SystemPage } from './pages/SystemPage'

export function App() {
  const missing = deploymentsError(platformDeployments)

  if (missing) {
    return <DeploymentsError message={missing} />
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<PlatformChrome />}>
          <Route index element={<OverviewPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="audit" element={<PlaceholderPage title="Nhật ký toàn hệ" />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}