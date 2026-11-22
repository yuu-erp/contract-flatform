import { deploymentsError } from '@meta-platform/chain'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DeploymentsError } from './components/DeploymentsError'
import { platformDeployments } from './config/deployments'
import { PlatformChrome } from './layout/PlatformChrome'
import { AgentDetailPage } from './pages/AgentDetailPage'
import { AgentsPage } from './pages/AgentsPage'
import { BranchDetailPage } from './pages/BranchDetailPage'
import { OverviewPage } from './pages/OverviewPage'
import { AuditPage } from './pages/AuditPage'
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
          <Route path="agents/:agentId" element={<AgentDetailPage />} />
          <Route path="branches/:branchId" element={<BranchDetailPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}