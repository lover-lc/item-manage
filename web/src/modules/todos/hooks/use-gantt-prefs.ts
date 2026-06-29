import { useCallback, useState } from 'react'
import {
  defaultRange,
  isValidGanttRangeFilter,
  type GanttGranularity,
  type GanttRange,
} from '../lib/gantt-scale'

const STORAGE_KEY = 'todo-gantt-prefs'

export type GanttPrefs = {
  granularity: GanttGranularity
  rangeStart: string
  rangeEnd: string
}

const VALID_GRANULARITIES = new Set<GanttGranularity>(['day', 'week', 'month'])

function isIsoDateLocal(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function normalizeStoredRange(start: unknown, end: unknown): { start: string; end: string } {
  return {
    start: isIsoDateLocal(start) ? start : '',
    end: isIsoDateLocal(end) ? end : '',
  }
}

function readStoredPrefs(): GanttPrefs {
  if (typeof window === 'undefined') {
    const range = defaultRange('day')
    return {
      granularity: 'day',
      rangeStart: range.start,
      rangeEnd: range.end,
    }
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const range = defaultRange('day')
    const prefs: GanttPrefs = {
      granularity: 'day',
      rangeStart: range.start,
      rangeEnd: range.end,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    return prefs
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GanttPrefs>
    const granularity = VALID_GRANULARITIES.has(parsed.granularity as GanttGranularity)
      ? (parsed.granularity as GanttGranularity)
      : 'day'

    const { start: rangeStart, end: rangeEnd } = normalizeStoredRange(
      parsed.rangeStart,
      parsed.rangeEnd,
    )

    if (isValidGanttRangeFilter(rangeStart, rangeEnd)) {
      return { granularity, rangeStart, rangeEnd }
    }

    const range = defaultRange(granularity)
    const prefs: GanttPrefs = {
      granularity,
      rangeStart: range.start,
      rangeEnd: range.end,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    return prefs
  } catch {
    const range = defaultRange('day')
    const prefs: GanttPrefs = {
      granularity: 'day',
      rangeStart: range.start,
      rangeEnd: range.end,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    return prefs
  }
}

function writePrefs(prefs: GanttPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function useGanttPrefs() {
  const [prefs, setPrefsState] = useState<GanttPrefs>(readStoredPrefs)

  const setGranularity = useCallback((granularity: GanttGranularity) => {
    setPrefsState((prev) => {
      const next = { ...prev, granularity }
      writePrefs(next)
      return next
    })
  }, [])

  const setRange = useCallback((range: GanttRange) => {
    if (!isValidGanttRangeFilter(range.start, range.end)) return
    setPrefsState((prev) => {
      const next = { ...prev, rangeStart: range.start, rangeEnd: range.end }
      writePrefs(next)
      return next
    })
  }, [])

  const range: GanttRange = { start: prefs.rangeStart, end: prefs.rangeEnd }

  return {
    granularity: prefs.granularity,
    rangeStart: prefs.rangeStart,
    rangeEnd: prefs.rangeEnd,
    range,
    setGranularity,
    setRange,
  }
}
