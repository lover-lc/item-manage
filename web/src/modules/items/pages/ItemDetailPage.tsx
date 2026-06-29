import { Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ItemHero from '../components/ItemHero'
import ItemFields, { buildCostStats } from '../components/ItemFields'
import { useDeleteItem, useItem, useUpdateItem } from '../hooks/use-items'
import PageHeaderBar from '../../../shared/components/PageHeaderBar'
import { parseISODate, toISODate } from '../../../shared/lib/date-utils'
import { getItemStatus } from '../lib/item-status'
import { computeItemDailyCost, computeItemUsedDays } from '../lib/sort-filter'

function DeleteConfirmDialog({
  itemName,
  onCancel,
  onConfirm,
  isPending,
}: {
  itemName: string
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
      >
        <h2 id="delete-dialog-title" className="text-lg font-medium text-text">
          删除物品
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          确定要删除「{itemName}」吗？此操作无法撤销。
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-button px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-button bg-status-expired px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '删除中…' : '删除'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: item, isLoading } = useItem(id)
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const status = useMemo(() => {
    if (!item) return undefined
    return getItemStatus({
      endDate: item.endDate ? parseISODate(item.endDate) : null,
      expiryDate: item.expiryDate ? parseISODate(item.expiryDate) : null,
      today: new Date(),
    })
  }, [item])

  const costStats = useMemo(() => {
    if (!item) return undefined
    return buildCostStats(
      item,
      computeItemUsedDays(item),
      computeItemDailyCost(item),
    )
  }, [item])

  if (isLoading) {
    return (
      <div className="min-h-svh bg-bg">
        <header className="border-b border-bg-hover bg-bg-card px-4 py-3">
          <h1 className="text-center text-lg font-medium text-text">物品详情</h1>
        </header>
        <p className="py-12 text-center text-sm text-text-secondary">加载中…</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-svh bg-bg">
        <header className="border-b border-bg-hover bg-bg-card px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-primary"
          >
            返回
          </button>
        </header>
        <p className="py-12 text-center text-sm text-text-secondary">物品不存在</p>
      </div>
    )
  }

  const isUsedUp = item.endDate != null

  async function handleMarkUsedUp() {
    await updateItem.mutateAsync({
      id: item!.id,
      endDate: toISODate(new Date()),
    })
  }

  async function handleDelete() {
    await deleteItem.mutateAsync(item!.id)
    navigate(-1)
  }

  return (
    <div className="min-h-svh bg-bg pb-8">
      <PageHeaderBar
        leading={{
          kind: 'button',
          label: '返回',
          onClick: () => navigate(-1),
          variant: 'outline',
        }}
        title="详情"
        trailing={{
          kind: 'link',
          label: '编辑',
          to: `/items/${item.id}/edit`,
          variant: 'default',
          icon: <Pencil className="size-3.5" />,
        }}
      />

      <div className="space-y-3 px-4 py-3">
        {status && costStats ? (
          <ItemHero
            mode="view"
            name={item.name}
            status={status}
            costStats={costStats}
          />
        ) : null}

        <ItemFields
          mode="view"
          hideNameField
          hideStatusInGrid
          name={item.name}
          priceText={String(item.purchasePrice)}
          quantityText={item.quantity != null ? String(item.quantity) : ''}
          unitName={item.unit?.name ?? null}
          areaName={item.area?.name ?? null}
          categoryName={item.category?.name ?? null}
          specificLocation={item.specificLocation}
          purchaseDate={item.purchaseDate}
          startDate={item.startDate}
          hasEndDate={item.endDate != null}
          endDate={item.endDate ?? ''}
          hasExpiryDate={item.expiryDate != null}
          expiryDate={item.expiryDate ?? ''}
        />

        <div className="space-y-2 pt-3">
          {!isUsedUp ? (
            <button
              type="button"
              onClick={handleMarkUsedUp}
              disabled={updateItem.isPending}
              className="w-full rounded-card bg-bg-card px-4 py-3 text-sm font-medium text-primary hover:bg-bg-hover disabled:opacity-50"
            >
              {updateItem.isPending ? '处理中…' : '标记已用完'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-card bg-bg-card px-4 py-3 text-sm font-medium text-status-expired hover:bg-bg-hover"
          >
            <Trash2 className="size-4" />
            删除
          </button>
        </div>
      </div>

      {showDeleteConfirm ? (
        <DeleteConfirmDialog
          itemName={item.name}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          isPending={deleteItem.isPending}
        />
      ) : null}
    </div>
  )
}
