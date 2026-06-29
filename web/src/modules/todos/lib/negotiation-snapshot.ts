import type {
  NegotiationSnapshot,
  RecurrenceRule,
  TodoFormInput,
  TodoItem,
  TodoPriority,
} from '../types/todo-types'

export type { NegotiationSnapshot }

export type NegotiationFormState = {
  title: string
  description: string
  priority: TodoPriority | ''
  startDate: string
  dueDate: string
  tagIds: string[]
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
}

export function formStateToSnapshot(state: NegotiationFormState): NegotiationSnapshot {
  let recurrenceRule: RecurrenceRule | null = null
  if (state.recurrence !== 'none') {
    recurrenceRule = {
      frequency: state.recurrence,
      interval: 1,
      endType: 'never',
      generatedCount: 0,
    }
  }

  return {
    title: state.title.trim(),
    description: state.description.trim() || null,
    priority: state.priority || null,
    startDate: state.startDate || null,
    dueDate: state.dueDate || null,
    tagIds: [...state.tagIds].sort(),
    recurrenceRule,
  }
}

export function snapshotFromFormInput(
  input: Partial<TodoFormInput> & { tagIds?: string[] },
): NegotiationSnapshot {
  return {
    title: (input.title ?? '').trim(),
    description: input.description?.trim() || null,
    priority: input.priority ?? null,
    startDate: input.startDate || null,
    dueDate: input.dueDate ?? null,
    tagIds: [...(input.tagIds ?? [])].sort(),
    recurrenceRule: input.recurrenceRule ?? null,
  }
}

export function snapshotsEqual(a: NegotiationSnapshot | null, b: NegotiationSnapshot): boolean {
  if (!a) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

export type NegotiationFieldKey =
  | 'title'
  | 'description'
  | 'priority'
  | 'startDate'
  | 'dueDate'
  | 'tagIds'
  | 'recurrenceRule'

export function diffSnapshotFields(
  baseline: NegotiationSnapshot | null,
  current: NegotiationSnapshot,
): Set<NegotiationFieldKey> {
  const changed = new Set<NegotiationFieldKey>()
  if (!baseline) return changed

  if (baseline.title !== current.title) changed.add('title')
  if (baseline.description !== current.description) changed.add('description')
  if (baseline.priority !== current.priority) changed.add('priority')
  if (baseline.startDate !== current.startDate) changed.add('startDate')
  if (baseline.dueDate !== current.dueDate) changed.add('dueDate')
  if (JSON.stringify(baseline.tagIds) !== JSON.stringify(current.tagIds)) {
    changed.add('tagIds')
  }
  if (JSON.stringify(baseline.recurrenceRule) !== JSON.stringify(current.recurrenceRule)) {
    changed.add('recurrenceRule')
  }

  return changed
}

export function parseNegotiationSnapshot(raw: unknown): NegotiationSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  return {
    title: String(row.title ?? ''),
    description: row.description == null ? null : String(row.description),
    priority: (row.priority as TodoPriority | null) ?? null,
    startDate: row.startDate == null ? null : String(row.startDate),
    dueDate: row.dueDate == null ? null : String(row.dueDate),
    tagIds: Array.isArray(row.tagIds) ? row.tagIds.map(String).sort() : [],
    recurrenceRule: (row.recurrenceRule as RecurrenceRule | null) ?? null,
  }
}

export function snapshotToFormState(snapshot: NegotiationSnapshot): NegotiationFormState {
  const frequency = snapshot.recurrenceRule?.frequency
  const recurrence: NegotiationFormState['recurrence'] =
    frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly'
      ? frequency
      : 'none'

  return {
    title: snapshot.title,
    description: snapshot.description ?? '',
    priority: snapshot.priority ?? '',
    startDate: snapshot.startDate ?? '',
    dueDate: snapshot.dueDate ?? '',
    tagIds: [...snapshot.tagIds],
    recurrence,
  }
}

export function todoToCommittedSnapshot(
  todo: Pick<
    TodoItem,
    'title' | 'description' | 'priority' | 'startDate' | 'dueDate' | 'recurrenceRule'
  > & { tags?: { id: string }[] },
): NegotiationSnapshot {
  return {
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    startDate: todo.startDate,
    dueDate: todo.dueDate,
    tagIds: [...(todo.tags ?? []).map((t) => t.id)].sort(),
    recurrenceRule: todo.recurrenceRule,
  }
}
