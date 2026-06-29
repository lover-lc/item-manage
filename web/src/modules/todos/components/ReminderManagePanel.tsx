import { ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import BottomSheet from '../../../shared/components/ui/BottomSheet'
import SwipeRow from '../../../shared/components/ui/SwipeRow'
import {
  createCustomReminderPreset,
  REMINDER_OFFSET_OPTIONS,
  type ReminderPreset,
  type ReminderPresetKind,
} from '../lib/reminder-presets'
import { useTodoUiStore } from '../store/todo-ui-store'

function OffsetPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (minutes: number) => void
}) {
  const [open, setOpen] = useState(false)
  const selected =
    REMINDER_OFFSET_OPTIONS.find((o) => o.minutes === value)?.label ?? '自定义'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full min-w-0 items-center justify-between rounded-button border border-bg-hover bg-bg px-3 py-2 text-left text-sm"
      >
        <span className="truncate text-text">截止前 {selected}</span>
        <ChevronRight className="size-4 shrink-0 text-text-tertiary" />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="选择提前量">
        <ul className="max-h-[50svh] overflow-y-auto">
          {REMINDER_OFFSET_OPTIONS.map((opt) => (
            <li key={opt.minutes}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.minutes)
                  setOpen(false)
                }}
                className={`flex w-full px-4 py-3 text-left text-sm hover:bg-bg-hover ${
                  value === opt.minutes ? 'font-medium text-primary' : 'text-text'
                }`}
              >
                截止前 {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  )
}

function PresetFormDialog({
  title,
  initial,
  onCancel,
  onConfirm,
}: {
  title: string
  initial?: ReminderPreset
  onCancel: () => void
  onConfirm: (preset: ReminderPreset) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<ReminderPresetKind>(initial?.kind ?? 'offset')
  const [offsetMinutes, setOffsetMinutes] = useState(
    initial?.offsetMinutes ?? REMINDER_OFFSET_OPTIONS[2].minutes,
  )
  const [fixedTime, setFixedTime] = useState(initial?.fixedTime ?? '09:00')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (initial) {
      onConfirm({
        ...initial,
        name: trimmed,
        kind,
        offsetMinutes: kind === 'offset' ? offsetMinutes : undefined,
        fixedTime: kind === 'fixed' ? fixedTime : undefined,
      })
      return
    }
    onConfirm(
      createCustomReminderPreset({
        name: trimmed,
        kind,
        offsetMinutes: kind === 'offset' ? offsetMinutes : undefined,
        fixedTime: kind === 'fixed' ? fixedTime : undefined,
      }),
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        role="dialog"
        aria-modal="true"
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
      >
        <h2 className="text-lg font-medium text-text">{title}</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="如：截止前 30 分钟"
              className="w-full rounded-button border border-bg-hover bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-secondary">类型</label>
            <div className="flex rounded-button bg-bg-hover p-1">
              {(
                [
                  { id: 'offset' as const, label: '时间间隔' },
                  { id: 'fixed' as const, label: '固定时间' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKind(opt.id)}
                  className={[
                    'flex-1 rounded-button py-2 text-sm font-medium transition-colors',
                    kind === opt.id
                      ? 'bg-bg-card text-text shadow-sm'
                      : 'text-text-secondary hover:text-text',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {kind === 'offset' ? (
            <div>
              <label className="mb-1 block text-xs text-text-secondary">提前量</label>
              <OffsetPicker value={offsetMinutes} onChange={setOffsetMinutes} />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs text-text-secondary">截止日当天</label>
              <input
                type="time"
                value={fixedTime}
                onChange={(e) => setFixedTime(e.target.value)}
                className="w-full rounded-button border border-bg-hover bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary/30"
              />
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-button px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-button bg-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ReminderManagePanel() {
  const reminderPresets = useTodoUiStore((s) => s.reminderPresets)
  const addReminderPreset = useTodoUiStore((s) => s.addReminderPreset)
  const updateReminderPreset = useTodoUiStore((s) => s.updateReminderPreset)
  const removeReminderPreset = useTodoUiStore((s) => s.removeReminderPreset)
  const [dialog, setDialog] = useState<'add' | { edit: ReminderPreset } | null>(null)

  function presetDetail(preset: ReminderPreset): string {
    if (preset.kind === 'fixed' && preset.fixedTime) {
      return `截止当天 ${preset.fixedTime}`
    }
    const opt = REMINDER_OFFSET_OPTIONS.find((o) => o.minutes === preset.offsetMinutes)
    return opt ? `截止前 ${opt.label}` : '时间间隔'
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-secondary">自定义提醒预设</h2>
        <button
          type="button"
          onClick={() => setDialog('add')}
          className="flex items-center gap-1 rounded-button px-2 py-1.5 text-sm text-primary hover:bg-bg-hover"
        >
          <Plus className="size-4" strokeWidth={2} />
          新建
        </button>
      </div>
      <p className="mt-1 text-xs text-text-tertiary">
        内置预设不可编辑。此处配置的成员专属预设会出现在新建待办的提醒选项中。
      </p>

      {reminderPresets.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">暂无自定义预设</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {reminderPresets.map((preset) => (
            <li key={preset.id}>
              <SwipeRow
                onDelete={() => removeReminderPreset(preset.id)}
                onContentClick={() => setDialog({ edit: preset })}
              >
                <div className="bg-card px-4 py-3">
                  <p className="text-sm font-medium text-text">{preset.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{presetDetail(preset)}</p>
                </div>
              </SwipeRow>
            </li>
          ))}
        </ul>
      )}

      {dialog === 'add' ? (
        <PresetFormDialog
          title="新建提醒预设"
          onCancel={() => setDialog(null)}
          onConfirm={(preset) => {
            addReminderPreset(preset)
            setDialog(null)
          }}
        />
      ) : null}

      {dialog && dialog !== 'add' ? (
        <PresetFormDialog
          title="编辑提醒预设"
          initial={dialog.edit}
          onCancel={() => setDialog(null)}
          onConfirm={(preset) => {
            updateReminderPreset(preset.id, {
              name: preset.name,
              kind: preset.kind,
              offsetMinutes: preset.offsetMinutes,
              fixedTime: preset.fixedTime,
            })
            setDialog(null)
          }}
        />
      ) : null}
    </section>
  )
}
