import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Sheet from '../../../shared/components/ui/Sheet'
import { useCurrentMember } from '../../../shared/hooks/use-current-member'
import { useFamilyMembers } from '../../../shared/hooks/use-family-members'
import {
  useCreateTodo,
  useCreateTodoList,
  useCreateTodoTag,
  useDeleteTodo,
  useTodo,
  useTodoLists,
  useTodoStatusAction,
  useTodoTags,
  useUpdateTodo,
} from '../hooks/use-todos'
import type { RecurrenceRule, TodoFormInput, TodoPriority } from '../types/todo-types'

const fieldInputClass =
  'w-full rounded-button border border-bg-hover bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary'

const dateInputClass =
  'rounded-button border border-bg-hover bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-primary'

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-card bg-bg-card">
      <h2 className="px-4 pt-3 pb-1.5 text-sm font-medium text-text-secondary">{title}</h2>
      <div className="divide-y divide-bg-hover">{children}</div>
    </section>
  )
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-4 py-2.5">
      <label className="mb-1 block text-xs text-text-secondary">{label}</label>
      {children}
    </div>
  )
}

function DateInputRow({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <label className="shrink-0 text-sm text-text-secondary">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={dateInputClass}
      />
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-bg-hover'
        }`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function PickerButton({
  value,
  placeholder,
  onClick,
}: {
  value: string | null
  placeholder: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-center justify-between rounded-button border border-bg-hover bg-bg px-3 py-2 text-left text-sm"
    >
      <span className={value ? 'truncate text-text' : 'truncate text-text-tertiary'}>
        {value ?? placeholder}
      </span>
      <ChevronRight className="size-4 shrink-0 text-text-tertiary" />
    </button>
  )
}

function QuickAddSheet({
  open,
  title,
  placeholder,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean
  title: string
  placeholder: string
  onClose: () => void
  onSubmit: (name: string) => void
  isPending: boolean
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName('')
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className={fieldInputClass}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-button px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="rounded-button bg-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '添加中…' : '添加'}
          </button>
        </div>
      </form>
    </Sheet>
  )
}

function OptionSheet({
  open,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
  onAddNew,
  addLabel,
  manageHref,
  manageLabel = '管理清单',
}: {
  open: boolean
  title: string
  options: { id: string; name: string }[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
  onAddNew: () => void
  addLabel?: string
  manageHref?: string
  manageLabel?: string
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <ul className="max-h-[50svh] overflow-y-auto">
        {options.map((opt) => (
          <li key={opt.id}>
            <button
              type="button"
              onClick={() => {
                onSelect(opt.id)
                onClose()
              }}
              className={`flex w-full px-4 py-3 text-left text-sm hover:bg-bg-hover ${
                selectedId === opt.id ? 'font-medium text-primary' : 'text-text'
              }`}
            >
              {opt.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-bg-hover p-4">
        {addLabel ? (
          <button
            type="button"
            onClick={() => {
              onClose()
              onAddNew()
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-button py-2.5 text-sm text-primary hover:bg-bg-hover"
          >
            <Plus className="size-4" />
            {addLabel}
          </button>
        ) : null}
        {manageHref ? (
          <Link
            to={manageHref}
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-button py-2.5 text-sm text-text-secondary hover:bg-bg-hover"
          >
            {manageLabel}
          </Link>
        ) : null}
      </div>
    </Sheet>
  )
}

export default function TodoFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { currentMemberId } = useCurrentMember()
  const { data: members = [] } = useFamilyMembers()
  const { data: lists = [] } = useTodoLists()
  const { data: tags = [] } = useTodoTags()
  const { data: existing, isLoading: todoLoading } = useTodo(id)
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const createList = useCreateTodoList()
  const createTag = useCreateTodoTag()
  const statusAction = useTodoStatusAction()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [priority, setPriority] = useState<TodoPriority | ''>('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [requireFeedback, setRequireFeedback] = useState(false)
  const [tagIds, setTagIds] = useState<string[]>([])
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')
  const [reminderOffset, setReminderOffset] = useState<'1h' | '1d' | '1w' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [updateSeries, setUpdateSeries] = useState(false)
  const [listSheetOpen, setListSheetOpen] = useState(false)
  const [newListSheetOpen, setNewListSheetOpen] = useState(false)
  const [assigneeSheetOpen, setAssigneeSheetOpen] = useState(false)
  const [newTagSheetOpen, setNewTagSheetOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [showReasonInput, setShowReasonInput] = useState<string | null>(null)

  useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setDescription(existing.description ?? '')
    setListId(existing.listId)
    setAssigneeId(existing.assigneeId)
    setPriority(existing.priority ?? '')
    setStartDate(existing.startDate ?? '')
    setDueDate(existing.dueDate ?? '')
    setRequireFeedback(existing.requireFeedback)
    setTagIds(existing.tags?.map((t) => t.id) ?? [])
    if (existing.recurrenceRule) {
      setRecurrence(existing.recurrenceRule.frequency as typeof recurrence)
    }
  }, [existing])

  useEffect(() => {
    if (!listId && lists.length > 0) setListId(lists[0].id)
    if (!assigneeId && currentMemberId) setAssigneeId(currentMemberId)
  }, [lists, listId, assigneeId, currentMemberId])

  const selectedListName = lists.find((l) => l.id === listId)?.name ?? null
  const selectedAssigneeName = members.find((m) => m.id === assigneeId)?.name ?? null
  const isSaving = createTodo.isPending || updateTodo.isPending
  const isCreator = existing?.creatorId === currentMemberId
  const isAssignee = existing?.assigneeId === currentMemberId

  async function handleSave() {
    setError(null)

    if (!title.trim()) {
      setError('标题不能为空')
      return
    }
    if (!dueDate) {
      setError('请选择截止日期')
      return
    }
    if (startDate && dueDate < startDate) {
      setError('截止日期不能早于开始日期')
      return
    }
    if (requireFeedback && !assigneeId) {
      setError('需要反馈时必须指定负责人')
      return
    }

    let recurrenceRule: RecurrenceRule | null = null
    if (recurrence !== 'none') {
      recurrenceRule = {
        frequency: recurrence,
        interval: 1,
        endType: 'never',
        generatedCount: 0,
      }
    }

    const input: TodoFormInput = {
      title,
      description,
      listId,
      assigneeId,
      priority: priority || null,
      startDate: startDate || undefined,
      dueDate,
      requireFeedback,
      recurrenceRule,
      tagIds,
      reminderOffset,
    }

    try {
      if (isEdit && id) {
        await updateTodo.mutateAsync({
          id,
          patch: input,
          updateRecurrenceSeries: updateSeries,
        })
      } else {
        await createTodo.mutateAsync(input)
      }
      navigate('/todos')
    } catch (err) {
      setError(String((err as Error).message || '保存失败'))
    }
  }

  async function handleAddList(name: string) {
    const list = await createList.mutateAsync({ name })
    setListId(list.id)
    setNewListSheetOpen(false)
  }

  async function handleAddTag(name: string) {
    const tag = await createTag.mutateAsync({ name })
    setTagIds((prev) => [...prev, tag.id])
    setNewTagSheetOpen(false)
  }

  async function handleAction(
    action: 'accept' | 'reject' | 'complete' | 'verify' | 'return',
  ) {
    if (!existing || !id) return
    const needsReason = action === 'reject' || action === 'return'
    if (needsReason && !reason.trim()) {
      setShowReasonInput(action)
      return
    }

    const role = action === 'verify' || action === 'return' ? 'creator' : 'assignee'
    await statusAction.mutateAsync({
      id,
      action,
      reason: reason.trim() || undefined,
      role,
      currentStatus: existing.status,
    })
    setReason('')
    setShowReasonInput(null)
  }

  if (isEdit && todoLoading) {
    return (
      <div className="min-h-svh bg-bg">
        <p className="py-12 text-center text-sm text-text-secondary">加载中…</p>
      </div>
    )
  }

  if (isEdit && !todoLoading && !existing) {
    return (
      <div className="min-h-svh bg-bg">
        <p className="py-12 text-center text-sm text-text-secondary">待办不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-bg pb-8">
      <header className="sticky top-0 z-10 border-b border-bg-hover bg-bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/todos')}
            className="text-sm text-primary"
          >
            取消
          </button>
          <h1 className="text-lg font-medium text-text">
            {isEdit ? '编辑待办' : '新建待办'}
          </h1>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="text-sm font-medium text-primary disabled:opacity-50"
          >
            {isSaving ? '保存中…' : '保存'}
          </button>
        </div>
      </header>

      <div className="space-y-3 px-4 py-3">
        <FormSection title="基本信息">
          <FormRow label="标题 *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="待办标题"
              className={fieldInputClass}
            />
          </FormRow>
          <FormRow label="描述">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="备注"
              className={fieldInputClass}
              rows={3}
            />
          </FormRow>
          <FormRow label="所属清单">
            <PickerButton
              value={selectedListName}
              placeholder="请选择"
              onClick={() => setListSheetOpen(true)}
            />
          </FormRow>
        </FormSection>

        <FormSection title="分配">
          <FormRow label="负责人 *">
            <PickerButton
              value={selectedAssigneeName}
              placeholder="请选择"
              onClick={() => setAssigneeSheetOpen(true)}
            />
          </FormRow>
          <ToggleRow
            label="需要反馈"
            checked={requireFeedback}
            onToggle={() => setRequireFeedback((v) => !v)}
          />
        </FormSection>

        <FormSection title="时间">
          <DateInputRow label="开始日期" value={startDate} onChange={setStartDate} />
          <DateInputRow
            label="截止日期"
            value={dueDate}
            onChange={setDueDate}
            required
          />
          <FormRow label="重复">
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
              className={fieldInputClass}
            >
              <option value="none">不重复</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </FormRow>
          <FormRow label="提醒">
            <select
              value={reminderOffset ?? ''}
              onChange={(e) =>
                setReminderOffset((e.target.value || null) as typeof reminderOffset)
              }
              className={fieldInputClass}
            >
              <option value="">不提醒</option>
              <option value="1h">截止前 1 小时</option>
              <option value="1d">截止前 1 天</option>
              <option value="1w">截止前 1 周</option>
            </select>
          </FormRow>
        </FormSection>

        <FormSection title="其他">
          <FormRow label="优先级">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority | '')}
              className={fieldInputClass}
            >
              <option value="">未设置</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </FormRow>
          <FormRow label="标签">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={tagIds.includes(tag.id)}
                    onChange={(e) => {
                      setTagIds((prev) =>
                        e.target.checked
                          ? [...prev, tag.id]
                          : prev.filter((tid) => tid !== tag.id),
                      )
                    }}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setNewTagSheetOpen(true)}
              className="mt-2 flex items-center gap-1 text-sm text-primary"
            >
              <Plus className="size-4" />
              新建标签
            </button>
          </FormRow>
        </FormSection>

        {isEdit && (existing?.recurrenceRule || existing?.parentRecurrenceId) ? (
          <label className="flex items-center gap-2 px-1 text-sm">
            <input
              type="checkbox"
              checked={updateSeries}
              onChange={(e) => setUpdateSeries(e.target.checked)}
            />
            此项及后续所有（更新重复规则）
          </label>
        ) : null}

        {isEdit && existing && (isAssignee || isCreator) ? (
          <FormSection title="协作操作">
            {showReasonInput ? (
              <div className="space-y-2 px-4 py-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请填写理由"
                  className={fieldInputClass}
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() =>
                    void handleAction(showReasonInput as 'reject' | 'return')
                  }
                  className="w-full rounded-button bg-primary py-2 text-sm text-white"
                >
                  确认
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {isAssignee && existing.status === 'pending_accept' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleAction('accept')}
                      className="rounded-button bg-status-active px-4 py-2 text-sm text-white"
                    >
                      同意
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReasonInput('reject')}
                      className="rounded-button border border-status-expired px-4 py-2 text-sm text-status-expired"
                    >
                      拒绝
                    </button>
                  </>
                ) : null}
                {isAssignee &&
                ['accepted', 'in_progress', 'returned'].includes(existing.status) ? (
                  <button
                    type="button"
                    onClick={() => void handleAction('complete')}
                    className="rounded-button bg-primary px-4 py-2 text-sm text-white"
                  >
                    标记完成
                  </button>
                ) : null}
                {isCreator && existing.status === 'pending_review' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleAction('verify')}
                      className="rounded-button bg-status-active px-4 py-2 text-sm text-white"
                    >
                      验收通过
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReasonInput('return')}
                      className="rounded-button border border-status-expiring px-4 py-2 text-sm text-status-expiring"
                    >
                      驳回
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </FormSection>
        ) : null}

        {isEdit && isCreator ? (
          <button
            type="button"
            onClick={async () => {
              if (!id) return
              if (existing?.recurrenceRule || existing?.parentRecurrenceId) {
                const series = window.confirm('删除所有重复实例？取消则仅删除此项')
                await deleteTodo.mutateAsync({ id, deleteSeries: series })
              } else {
                await deleteTodo.mutateAsync({ id })
              }
              navigate('/todos')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-card bg-bg-card py-3 text-sm text-status-expired"
          >
            <Trash2 className="size-4" />
            删除待办
          </button>
        ) : null}

        {error ? <p className="px-1 text-sm text-status-expired">{error}</p> : null}
      </div>

      <OptionSheet
        open={listSheetOpen}
        title="选择清单"
        options={lists.map((l) => ({ id: l.id, name: l.name }))}
        selectedId={listId || null}
        onSelect={setListId}
        onClose={() => setListSheetOpen(false)}
        onAddNew={() => setNewListSheetOpen(true)}
        addLabel="新建清单"
        manageHref="/todos/lists"
      />

      <OptionSheet
        open={assigneeSheetOpen}
        title="选择负责人"
        options={members.map((m) => ({ id: m.id, name: m.name }))}
        selectedId={assigneeId || null}
        onSelect={setAssigneeId}
        onClose={() => setAssigneeSheetOpen(false)}
        onAddNew={() => navigate('/settings')}
        manageHref="/settings"
        manageLabel="管理家庭成员"
      />

      <QuickAddSheet
        open={newListSheetOpen}
        title="新建清单"
        placeholder="清单名称"
        onClose={() => setNewListSheetOpen(false)}
        onSubmit={handleAddList}
        isPending={createList.isPending}
      />

      <QuickAddSheet
        open={newTagSheetOpen}
        title="新建标签"
        placeholder="标签名称"
        onClose={() => setNewTagSheetOpen(false)}
        onSubmit={handleAddTag}
        isPending={createTag.isPending}
      />
    </div>
  )
}
