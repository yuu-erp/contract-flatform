export function AdminOnlyNote({ hint }: { hint: string | null }) {
  if (!hint) return null
  return (
    <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
      {hint} — contract chỉ cho phép PLATFORM_ADMIN ghi.
    </p>
  )
}