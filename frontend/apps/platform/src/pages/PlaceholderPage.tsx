export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">Màn hình này sẽ hoàn thiện ở task tiếp theo.</p>
    </div>
  )
}