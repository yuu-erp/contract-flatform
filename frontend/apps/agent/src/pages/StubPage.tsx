import { Card, CardContent, CardHeader, CardTitle } from '@meta-platform/ui'

export function StubPage({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{hint ?? 'Nội dung sẽ triển khai ở các task tiếp theo.'}</CardContent>
    </Card>
  )
}