import type { QueryKey } from '@tanstack/react-query'
import { useTx } from '@meta-platform/chain'
import { Button, type ButtonProps } from '../primitives/button'

export function TxButton({
  onClick,
  invalidate,
  onError,
  onSuccess,
  children,
  ...props
}: ButtonProps & {
  onClick: () => Promise<void>
  invalidate?: QueryKey[]
  onError?: (message: string) => void
  onSuccess?: () => void
}) {
  const tx = useTx()

  return (
    <Button
      {...props}
      disabled={props.disabled || tx.pending}
      onClick={() => {
        void tx.run(onClick, { invalidate, onError, onSuccess })
      }}
    >
      {tx.pending ? 'Đang ký…' : children}
    </Button>
  )
}