import { AuditLogPanel, ColumnHeader } from '@meta-platform/ui'

export function AuditPage() {
  return (
    <>
      <ColumnHeader title="Nhật ký" subtitle="Toàn hệ · lọc theo agent, chi nhánh, hành động, người làm" />
      <AuditLogPanel variant="list" />
    </>
  )
}
