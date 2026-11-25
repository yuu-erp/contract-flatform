import { AuditLogPanel, PageHeader } from '@meta-platform/ui'

export function AuditPage() {
  return (
    <>
      <PageHeader title="Nhật ký" description="Toàn hệ · lọc theo agent, chi nhánh, hành động, người làm và khoảng ngày" />
      <AuditLogPanel />
    </>
  )
}
