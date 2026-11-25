import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ComingSoon } from './pages/ComingSoon'
import { FoodView } from './pages/launcher/FoodView'
import { GamesView } from './pages/launcher/GamesView'
import { LauncherLayout } from './pages/launcher/LauncherLayout'
import { TopUpView } from './pages/launcher/TopUpView'
import { VouchersView } from './pages/launcher/VouchersView'
import { ManagerFloor } from './pages/manager/ManagerFloor'
import { ManagerLayout } from './pages/manager/ManagerLayout'
import { OwnerLayout } from './pages/owner/OwnerLayout'
import { OwnerOverview } from './pages/owner/OwnerOverview'
import { RolePicker } from './pages/RolePicker'
import { StaffDesk } from './pages/staff/StaffDesk'
import { StaffLayout } from './pages/staff/StaffLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<RolePicker />} />
      <Route path="owner" element={<OwnerLayout />}>
        <Route index element={<OwnerOverview />} />
        <Route path="*" element={<ComingSoon title="Màn Owner" />} />
      </Route>
      <Route path="manager" element={<ManagerLayout />}>
        <Route index element={<ManagerFloor />} />
        <Route path="*" element={<ComingSoon title="Màn Manager" />} />
      </Route>
      <Route path="staff" element={<StaffLayout />}>
        <Route index element={<StaffDesk />} />
        <Route path="*" element={<ComingSoon title="Màn Staff" />} />
      </Route>
      <Route path="launcher" element={<LauncherLayout />}>
        <Route index element={<GamesView />} />
        <Route path="food" element={<FoodView />} />
        <Route path="topup" element={<TopUpView />} />
        <Route path="vouchers" element={<VouchersView />} />
        <Route path="*" element={<p className="text-ink-muted">Màn này sẽ làm ở bước sau.</p>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
