import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ComingSoon } from './pages/ComingSoon'
import { FoodView } from './pages/player/FoodView'
import { PlayerHome } from './pages/player/PlayerHome'
import { PlayerLayout } from './pages/player/PlayerLayout'
import { TopUpView } from './pages/player/TopUpView'
import { VouchersView } from './pages/player/VouchersView'
import { ManagerFloor } from './pages/manager/ManagerFloor'
import { ManagerLayout } from './pages/manager/ManagerLayout'
import { OwnerLayout } from './pages/owner/OwnerLayout'
import { OwnerAudit } from './pages/owner/OwnerAudit'
import { OwnerBranches } from './pages/owner/OwnerBranches'
import { OwnerCampaigns } from './pages/owner/OwnerCampaigns'
import { OwnerFloor } from './pages/owner/OwnerFloor'
import { OwnerMembers } from './pages/owner/OwnerMembers'
import { OwnerOverview } from './pages/owner/OwnerOverview'
import { OwnerPricing } from './pages/owner/OwnerPricing'
import { OwnerRevenue } from './pages/owner/OwnerRevenue'
import { OwnerShifts } from './pages/owner/OwnerShifts'
import { OwnerStaff } from './pages/owner/OwnerStaff'
import { RolePicker } from './pages/RolePicker'
import { StaffDesk } from './pages/staff/StaffDesk'
import { StaffLayout } from './pages/staff/StaffLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<RolePicker />} />
      <Route path="owner" element={<OwnerLayout />}>
        <Route index element={<OwnerOverview />} />
        <Route path="branches" element={<OwnerBranches />} />
        <Route path="floor" element={<OwnerFloor />} />
        <Route path="members" element={<OwnerMembers />} />
        <Route path="revenue" element={<OwnerRevenue />} />
        <Route path="pricing" element={<OwnerPricing />} />
        <Route path="vouchers" element={<OwnerCampaigns />} />
        <Route path="staff" element={<OwnerStaff />} />
        <Route path="shifts" element={<OwnerShifts />} />
        <Route path="audit" element={<OwnerAudit />} />
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
      <Route path="player" element={<PlayerLayout />}>
        <Route index element={<PlayerHome />} />
        <Route path="food" element={<FoodView />} />
        <Route path="topup" element={<TopUpView />} />
        <Route path="vouchers" element={<VouchersView />} />
        <Route path="*" element={<ComingSoon title="Màn người chơi" />} />
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
