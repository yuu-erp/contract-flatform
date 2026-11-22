import { BranchOverviewPanel, Card, CardContent, CardHeader, CardTitle, EmptyState } from '@meta-platform/ui'
import { useOutletContext } from 'react-router-dom'
import type { PreviewAccess } from '../preview/preview-access'

type Ctx = { access: PreviewAccess; domain?: string }

export function OverviewPage() {
  const { access } = useOutletContext<Ctx>()
  if (access.kind === 'manager') {
    return <BranchOverviewPanel branchId={access.branchId} tzMinutes={420} />
  }
  if (access.kind === 'owner') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan agent</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Khung tổng quan chủ agent (KPI + so sánh chi nhánh) sẽ hoàn thiện ở Task A3.
            {access.focusBranchId ? ` Đang focus chi nhánh #${access.focusBranchId}.` : ''}
          </CardContent>
        </Card>
      </div>
    )
  }
  return <EmptyState title="Không có dữ liệu" />
}