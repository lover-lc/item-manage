import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { GanttFullscreenContext } from './gantt-layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type GanttFullscreenHandle = {
  enter: () => Promise<void>
  exit: () => Promise<void>
}

type GanttFullscreenProps = {
  children: ReactNode
  className?: string
}

function supportsElementFullscreen(): boolean {
  return typeof document !== 'undefined' && document.documentElement.requestFullscreen != null
}

const GanttFullscreen = forwardRef<GanttFullscreenHandle, GanttFullscreenProps>(
  function GanttFullscreen({ children, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [nativeFullscreen, setNativeFullscreen] = useState(false)
    const [pseudoFullscreen, setPseudoFullscreen] = useState(false)

    const isFullscreen = nativeFullscreen || pseudoFullscreen

    const exit = useCallback(async () => {
      const orientation = screen.orientation as ScreenOrientation & {
        unlock?: () => void
      }
      orientation.unlock?.()

      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => undefined)
      }

      setPseudoFullscreen(false)
      document.body.style.overflow = ''
    }, [])

    const enter = useCallback(async () => {
      const el = containerRef.current
      if (!el) return

      if (supportsElementFullscreen()) {
        try {
          await el.requestFullscreen()
          const orientation = screen.orientation as ScreenOrientation & {
            lock?: (orientation: string) => Promise<void>
          }
          await orientation.lock?.('landscape').catch(() => undefined)
          return
        } catch {
          // Fall through to pseudo fullscreen (iOS / restricted contexts).
        }
      }

      setPseudoFullscreen(true)
      document.body.style.overflow = 'hidden'

      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>
      }
      await orientation.lock?.('landscape').catch(() => undefined)
    }, [])

    useImperativeHandle(ref, () => ({ enter, exit }), [enter, exit])

    useEffect(() => {
      function onFullscreenChange() {
        setNativeFullscreen(document.fullscreenElement === containerRef.current)
        if (!document.fullscreenElement) {
          setPseudoFullscreen(false)
          document.body.style.overflow = ''
        }
      }

      document.addEventListener('fullscreenchange', onFullscreenChange)
      return () => {
        document.removeEventListener('fullscreenchange', onFullscreenChange)
        document.body.style.overflow = ''
      }
    }, [])

    const content = (
      <div
        ref={containerRef}
        className={cn(
          'relative flex min-h-0 flex-col bg-card',
          isFullscreen && !pseudoFullscreen && 'p-2',
          pseudoFullscreen && 'fixed inset-0 z-[100] h-dvh w-dvw p-2',
          !pseudoFullscreen && className,
        )}
        onClick={isFullscreen ? () => void exit() : undefined}
      >
        {isFullscreen ? (
          <div className="absolute right-2 top-2 z-30">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="size-8 bg-background/90"
              aria-label="退出全屏"
              onClick={(event) => {
                event.stopPropagation()
                void exit()
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
        <div
          className={cn('flex min-h-0 flex-1 flex-col', pseudoFullscreen && className)}
          onClick={isFullscreen ? (event) => event.stopPropagation() : undefined}
        >
          <GanttFullscreenContext.Provider value={isFullscreen}>
            {children}
          </GanttFullscreenContext.Provider>
        </div>
      </div>
    )

    if (pseudoFullscreen) {
      return createPortal(content, document.body)
    }

    return content
  },
)

export default GanttFullscreen
