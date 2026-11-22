/** `DataTable` và hook on-chain dùng chỉ số trang bắt đầu từ 0. */
export function pageOffset(page: number, pageSize: number): number {
  return page * pageSize
}

export function paginateAgents<T>(rows: T[], page: number, pageSize: number) {
  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(0, page), totalPages - 1)
  const start = safePage * pageSize
  return {
    items: rows.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  }
}