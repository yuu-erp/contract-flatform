import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function FieldHelp({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-xs leading-relaxed text-muted-foreground', className)}>{children}</p>
}

export const SALES_SETTINGS_INTRO_OWNER =
  'Cấu hình này ghi lên SalesSettings on-chain. Ledger dùng khi ghi bút toán mới; đổi sau không sửa chứng từ cũ.'

export const SALES_SETTINGS_INTRO_MANAGER =
  'Bạn chỉ xem thuế và phương thức hiệu lực tại chi nhánh; chỉ chủ agent mới được sửa.'

export const HELP_TAX_AGENT =
  'Thuế mặc định cho mọi chi nhánh khi chưa ghi đè. Ví dụ: NET 8% — menu 200.000 ₫ (đã gồm) thì thuế ~14.815 ₫, khách vẫn trả 200.000 ₫.'

export const HELP_TAX_NET =
  'NET = dịch vụ tại chỗ (ăn uống, karaoke…). Nhập dạng 8,5 hoặc 8 — tối đa 100%. Ví dụ cửa hàng một chi nhánh: toàn hệ thống 8% NET.'

export const HELP_TAX_IQR =
  'IQR = hàng hoá / bán thêm. Ví dụ agent 10% IQR; chi nhánh sân bay có thể ghi đè 12% ở mục dưới.'

export const HELP_TAX_MODE_NET =
  'NET luôn hiển thị giá đã gồm thuế (quy định contract). Ví dụ bảng giá 150.000 ₫ là số khách thấy trên menu.'

export const HELP_TAX_MODE_IQR =
  'Bật = giá IQR chưa gồm thuế (cộng thêm khi tính). Tắt = giá đã gồm. Ví dụ món 100.000 ₫ đã gồm 10%: khách trả 100.000 ₫; tách thuế: khách trả 110.000 ₫.'

export const HELP_PAYMENT_AGENT =
  'Khách được phép thanh toán bằng những kênh này ở mọi chi nhánh (trừ khi chi nhánh thu hẹp). Ví dụ: Tiền mặt + Ví — quán vừa thu tiền mặt vừa trừ ví khách on-chain.'

export const HELP_PAYMENT_BITS =
  'Tiền mặt: thu trực tiếp. Chuyển khoản: QR/ngân hàng. Thẻ: POS. Ví: trừ số dư ví khách trên Ledger.'

export const HELP_BRANCH_OVERRIDE =
  'Mỗi chi nhánh có thể thuế riêng hoặc «Theo agent». Ví dụ: CN trung tâm 8% NET, CN khu du lịch 10% NET.'

export const HELP_BRANCH_TAX_CLEAR =
  '«Theo agent» = xoá ghi đè, dùng lại % đã đặt ở khối «Thuế mức agent».'

export const HELP_BRANCH_PAYMENT_FOLLOW =
  'Bật = on-chain lưu 0, chi nhánh dùng đúng tập phương thức agent. Ví dụ agent bật Tiền mặt + Ví thì chi nhánh tự theo.'

export const HELP_BRANCH_PAYMENT_CUSTOM =
  'Chỉ chọn được kênh agent đã bật. Ví dụ agent có Tiền mặt + Ví, chi nhánh chỉ Tiền mặt — không nhận trừ ví tại quầy đó.'

export const HELP_BRANCH_EFFECTIVE_ZERO =
  'Khi agent bỏ một kênh mà chi nhánh vẫn chỉ kênh đó, hiệu lực = 0 — khách không thanh toán được cho đến khi sửa.'

export const HELP_QUOTE_PREVIEW =
  'Gọi view quoteTax — không ghi sổ. Ví dụ: IQR 100.000 ₫, thuế 10% đã gồm → thuế ~9.091 ₫, khách trả 100.000 ₫.'

export const HELP_QUOTE_AMOUNT =
  'Số tiền gốc trước khi contract tách thuế / cộng thuế (đơn vị đồng, không dấu phẩy).'

export const HELP_QUOTE_SERVICE =
  'NET: dùng thuế & kiểu giá NET của chi nhánh. IQR: dùng thuế IQR và tuỳ chọn tách thuế ở cấp agent.'

export const HELP_READONLY_NET = 'Thuế áp dụng cho dịch vụ tại chỗ tại chi nhánh này.'
export const HELP_READONLY_IQR = 'Thuế áp dụng cho bán IQR tại chi nhánh này.'
export const HELP_READONLY_METHODS = 'Kênh khách được chọn khi thanh toán tại quầy chi nhánh này.'