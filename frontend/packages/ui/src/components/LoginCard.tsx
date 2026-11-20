import { Loader2, Wallet } from 'lucide-react'
import { Button } from '../primitives/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

/** Thẻ đăng nhập ví (mẫu web-admin `AdminLogin`). */
export function LoginCard({
  heading,
  intro,
  cardTitle = 'Đăng nhập ví',
  cardDescription,
  pending = false,
  onLogin,
}: {
  heading: string
  intro: string
  cardTitle?: string
  cardDescription?: string
  pending?: boolean
  onLogin: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{intro}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{cardTitle}</CardTitle>
          {cardDescription ? <CardDescription>{cardDescription}</CardDescription> : null}
        </CardHeader>
        <CardContent className="pt-0">
          <Button type="button" className="w-full sm:w-auto" disabled={pending} onClick={onLogin}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
            Chọn ví
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}