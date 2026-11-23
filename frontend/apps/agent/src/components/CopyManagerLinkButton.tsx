import { Button } from '@meta-platform/ui'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { copyManagerAgentLink, buildManagerAgentUrl } from '../lib/manager-link'

export function CopyManagerLinkButton({ domain, label = 'Mở link quản lý' }: { domain: string; label?: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="gap-1"
      onClick={() => {
        void copyManagerAgentLink(domain).then(
          () => toast.success('Đã copy link quản lý', { description: buildManagerAgentUrl(domain) }),
          () => toast.error('Không copy được link'),
        )
      }}
    >
      <ExternalLink className="size-3.5" aria-hidden />
      {label}
    </Button>
  )
}