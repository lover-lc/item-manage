import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeaderBar from '../../../shared/components/PageHeaderBar'
import TodoListManage from '../components/TodoListManage'
import {
  useCreateTodoList,
  useDeleteTodoList,
  useReorderTodoLists,
  useTodoLists,
  useTodos,
  useUpdateTodoList,
} from '../hooks/use-todos'
import type { TodoList } from '../types/todo-types'

function DeleteListDialog({
  listName,
  count,
  onCancel,
  onDeleteWithMove,
  onDeleteAll,
  canMove,
  moveTargetName,
  isPending,
}: {
  listName: string
  count: number
  onCancel: () => void
  onDeleteWithMove?: () => void
  onDeleteAll: () => void
  canMove: boolean
  moveTargetName?: string
  isPending?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
      >
        <h2 className="text-lg font-medium text-text">删除清单</h2>
        <p className="mt-2 text-sm text-text-secondary">
          「{listName}」中有 {count} 个待办，如何处理？
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {canMove && onDeleteWithMove ? (
            <button
              type="button"
              onClick={onDeleteWithMove}
              disabled={isPending}
              className="rounded-button bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              移至「{moveTargetName}」并删除清单
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDeleteAll}
            disabled={isPending}
            className="rounded-button bg-status-expired px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            删除清单及全部待办
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-button px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ListManagePage() {
  const navigate = useNavigate()
  const { data: lists = [], isLoading } = useTodoLists()
  const { data: todos = [] } = useTodos()
  const createList = useCreateTodoList()
  const updateList = useUpdateTodoList()
  const deleteList = useDeleteTodoList()
  const reorderLists = useReorderTodoLists()
  const [listToDelete, setListToDelete] = useState<TodoList | null>(null)

  const todoCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const todo of todos) {
      counts[todo.listId] = (counts[todo.listId] ?? 0) + 1
    }
    return counts
  }, [todos])

  const moveTarget = lists.find((l) => l.id !== listToDelete?.id)

  return (
    <div className="px-4 py-3">
      <PageHeaderBar
        embedded
        leading={{
          kind: 'button',
          label: '返回',
          onClick: () => navigate(-1),
          variant: 'outline',
        }}
        title="清单管理"
      />

      <TodoListManage
        lists={lists}
        todoCounts={todoCounts}
        isLoading={isLoading}
        onAdd={async (name, color) => {
          await createList.mutateAsync({ name, visibility: 'private', color })
        }}
        onRename={async (id, name, color) => {
          await updateList.mutateAsync({ id, name, color })
        }}
        onDeleteRequest={(list) => {
          const count = todoCounts[list.id] ?? 0
          if (count === 0) {
            void deleteList.mutateAsync({ id: list.id })
          } else {
            setListToDelete(list)
          }
        }}
        onReorderPrivate={(orderedIds) => {
          reorderLists.mutate({ visibility: 'private', orderedIds })
        }}
        onReorderShared={(orderedIds) => {
          reorderLists.mutate({ visibility: 'shared', orderedIds })
        }}
      />

      {listToDelete ? (
        <DeleteListDialog
          listName={listToDelete.name}
          count={todoCounts[listToDelete.id] ?? 0}
          canMove={Boolean(moveTarget)}
          moveTargetName={moveTarget?.name}
          isPending={deleteList.isPending}
          onCancel={() => setListToDelete(null)}
          onDeleteWithMove={
            moveTarget
              ? () => {
                  void deleteList
                    .mutateAsync({
                      id: listToDelete.id,
                      moveToListId: moveTarget.id,
                    })
                    .then(() => setListToDelete(null))
                }
              : undefined
          }
          onDeleteAll={() => {
            void deleteList
              .mutateAsync({ id: listToDelete.id })
              .then(() => setListToDelete(null))
          }}
        />
      ) : null}
    </div>
  )
}
