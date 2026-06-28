import { useState } from 'react'
import type { TimelineMode } from '../lib/timeline-utils'

const STORAGE_KEY = 'todo-timeline-mode'

function readStoredMode(): TimelineMode {
  if (typeof window === 'undefined') return 'due'
  return localStorage.getItem(STORAGE_KEY) === 'span' ? 'span' : 'due'
}

export function useTimelineMode() {
  const [mode, setModeState] = useState<TimelineMode>(readStoredMode)

  function setMode(next: TimelineMode) {
    setModeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return [mode, setMode] as const
}
