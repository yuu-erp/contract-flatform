import { useLocation } from 'react-router-dom'

export function useDashboardTitle(): string {
  const { pathname } = useLocation()
  if (pathname === '/') return 'Tổng quan'
  if (pathname === '/agents') return 'Danh sách agent'
  if (pathname.startsWith('/agents/')) return 'Chi tiết agent'
  if (pathname.startsWith('/branches/')) return 'Chi tiết chi nhánh'
  if (pathname === '/audit') return 'Nhật ký toàn hệ'
  if (pathname === '/system') return 'Quản trị hệ thống'
  return 'Dashboard nền tảng'
}