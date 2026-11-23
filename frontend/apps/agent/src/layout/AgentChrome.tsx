import { ContractsProvider, deploymentsError, usePlatformContracts } from '@meta-platform/chain'
import { NoAccessScreen, PageLoader } from '@meta-platform/ui'
import { agentChainId, agentDeployments } from '../config/deployments'
import { isPreviewMock } from '../preview/env'
import { AgentAppChrome } from './AgentAppChrome'

export function AgentChrome() {
  if (isPreviewMock()) {
    return <AgentAppChrome />
  }

  const missing = deploymentsError(agentDeployments)
  if (missing) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <NoAccessScreen title="Thiếu cấu hình deployments" description={missing} />
      </div>
    )
  }

  return <LiveAgentChrome />
}

function LiveAgentChrome() {
  const contracts = usePlatformContracts(agentChainId, agentDeployments)
  if (!contracts) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <PageLoader message="Kết nối ví để mở Meta Agent…" />
      </div>
    )
  }

  return (
    <ContractsProvider value={contracts}>
      <AgentAppChrome />
    </ContractsProvider>
  )
}