import { Hammer } from 'lucide-react'
import { ContentPanel } from '../layout/DashboardLayout'

/** Mục menu chưa làm trong bản demo. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <ContentPanel className="items-center justify-center text-center">
      <Hammer className="size-10 text-ink-dim" />
      <h1 className="text-xl font-extrabold">{title}</h1>
      <p className="text-ink-muted">Màn này sẽ làm ở bước sau.</p>
    </ContentPanel>
  )
}
