import { useEffect, useState } from 'react'

export function matchesTouchPrimaryDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none)').matches
}

/** 主输入为触摸屏（无 hover），兼容 iPhone 等 pointer:fine 设备 */
export function useTouchPrimaryDevice(): boolean {
  const [isTouchPrimary, setIsTouchPrimary] = useState(matchesTouchPrimaryDevice)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const update = () => setIsTouchPrimary(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isTouchPrimary
}
