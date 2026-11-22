import { deploymentsError } from '@meta-platform/chain'
import { AppShell, NoAccessScreen, PageLoader, SidebarWallet, ThemeToggle, WalletSwitcher } from '@meta-platform/ui'
import { LayoutDashboard } from 'lucide-react'
import { agentDeployments } from '../config/deployments'
import { isPreviewMock } from '../preview/env'
import { PreviewAgentChrome } from './PreviewAgentChrome'

export function AgentChrome() {
  if (isPreviewMock()) return <PreviewAgentChrome />

  const missing = deploymentsError(agentDeployments)
  if (missing) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <NoAccessScreen title="Thiếu cấu hình deployments" description={missing} />
      </div>
    )
  }

  return (
    <AppShell
      title="Meta Agent"
      subtitle="Kết nối ví"
      menu={[{ to: '/', label: 'Tổng quan', end: true, icon: LayoutDashboard }]}
      chainLabel="—"
      sidebarFooter={<SidebarWallet />}
      headerWallet={<WalletSwitcher className="shrink-0 md:hidden" />}
      topbarTitle="Meta Agent"
      headerExtra={<ThemeToggle />}
      paused={false}
      main={
        <div className="mx-auto w-full max-w-7xl">
          <PageLoader message="App agent live — triển khai sau Task A2" />
        </div>
      }
    />
  )
}