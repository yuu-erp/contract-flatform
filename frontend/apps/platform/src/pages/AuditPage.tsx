import { AuditLogPanel } from '@meta-platform/ui'

export function AuditPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Nhật ký toàn hệ</h2>
        <p className="mt-1 text-sm text-muted-foreground">Lọc theo agent, chi nhánh, hành động, người làm và khoảng ngày.</p>
      </div>
      <AuditLogPanel />
    </div>
  )
}