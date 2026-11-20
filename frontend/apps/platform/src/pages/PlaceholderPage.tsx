import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@meta-platform/ui'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Màn hình này sẽ hoàn thiện ở task tiếp theo.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Bạn vẫn có thể điều hướng qua sidebar; dữ liệu on-chain sẽ được gắn ở các task trong lộ trình dashboard.
      </CardContent>
    </Card>
  )
}