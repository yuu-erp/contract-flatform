import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AgentChrome } from './layout/AgentChrome'
import { OverviewPage } from './pages/OverviewPage'
import { StubPage } from './pages/StubPage'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AgentChrome />}>
          <Route index element={<OverviewPage />} />
          <Route path="branches" element={<StubPage title="Danh sách chi nhánh" hint="Chủ agent — bảng chi nhánh và link ?domain= (Task A3)." />} />
          <Route path="branches/:branchId" element={<StubPage title="Chi tiết chi nhánh" />} />
          <Route path="staff" element={<StubPage title="Nhân sự" hint="Task A4." />} />
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