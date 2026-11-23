import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AgentChrome } from './layout/AgentChrome'
import { BranchDetailPage } from './pages/BranchDetailPage'
import { BranchesPage } from './pages/BranchesPage'
import { OverviewPage } from './pages/OverviewPage'
import { StaffPage } from './pages/StaffPage'
import { StubPage } from './pages/StubPage'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AgentChrome />}>
          <Route index element={<OverviewPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="branches/:branchId" element={<BranchDetailPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="settings" element={<StubPage title="Cài đặt thuế & thanh toán" hint="Task A5." />} />
          <Route path="wallets" element={<StubPage title="Ví khách" hint="Task A6 — dùng CustomerWalletPanel." />} />
          <Route path="transactions" element={<StubPage title="Giao dịch" hint="Task A6 — LedgerEntriesPanel." />} />
          <Route path="audit" element={<StubPage title="Nhật ký" hint="Task A6 — AuditLogPanel." />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}