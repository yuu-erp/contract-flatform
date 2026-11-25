import roomBg from '../assets/room-bg.webp'

/** Hình nền phòng + lớp phủ tối để kính mờ và chữ luôn đủ tương phản. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <img src={roomBg} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#120a1c]/35 via-[#120a1c]/20 to-[#0a0610]/60" />
    </div>
  )
}
