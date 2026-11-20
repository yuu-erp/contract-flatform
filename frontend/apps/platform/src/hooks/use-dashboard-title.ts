import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/': 'Tổng quan',
  '/agents': 'Danh sách agent',
  '/audit': 'Nhật ký toàn hệ',
  '/system': 'Quản trị hệ thống',
}

export function useDashboardTitle(): string {
  const { pathname } = useLocation()
  return titles[pathname] ?? 'Dashboard nền tảng'
}