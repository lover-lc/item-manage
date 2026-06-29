import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomSheet from '../../../shared/components/ui/BottomSheet'
import ItemHero from '../components/ItemHero'
import ItemFields, { type ItemFieldsCostStats } from '../components/ItemFields'
import { useAreas, useCreateArea } from '../hooks/use-areas'
import { useCategories, useCreateCategory } from '../hooks/use-categories'
import { useCreateItem, useItem, useUpdateItem } from '../hooks/use-items'
import { useCreateUnit, useUnits } from '../hooks/use-units'
import PageHeaderBar from '../../../shared/components/PageHeaderBar'
import {
  dailyCost,
  formatUnitPrice,
  usedDays,
} from '../lib/cost-calculator'
import { parseISODate, toISODate } from '../../../shared/lib/date-utils'
import { getItemStatus } from '../lib/item-status'
import {
  parsePrice,
  parseQuantity,
  validateItemForm,
  validationErrorMessage,
} from '../lib/validators'

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
    <BottomSheet open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full rounded-button border border-bg-hover bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
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
    </BottomSheet>
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
}: {
  open: boolean
  title: string
  options: { id: string; name: string }[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
  onAddNew: () => void
  addLabel: string
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
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
      <div className="border-t border-bg-hover p-4">
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
      </div>
    </BottomSheet>
  )
}

export default function ItemFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { data: existingItem, isLoading: itemLoading } = useItem(id)
  const { data: areas = [] } = useAreas()
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const createArea = useCreateArea()
  const createCategory = useCreateCategory()
  const createUnit = useCreateUnit()

  const selectableAreas = useMemo(
    () => areas.filter((a) => !a.isSystemReserved),
    [areas],
  )
  const selectableCategories = useMemo(
    () => categories.filter((c) => !c.isSystemReserved),
    [categories],
  )

  const todayIso = toISODate(new Date())

  const [name, setName] = useState('')
  const [priceText, setPriceText] = useState('')
  const [quantityText, setQuantityText] = useState('')
  const [unitId, setUnitId] = useState<string | null>(null)
  const [areaId, setAreaId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [specificLocation, setSpecificLocation] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(todayIso)
  const [startDate, setStartDate] = useState(todayIso)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState(todayIso)
  const [hasExpiryDate, setHasExpiryDate] = useState(false)
  const [expiryDate, setExpiryDate] = useState(todayIso)
  const [initialized, setInitialized] = useState(false)

  const [areaSheetOpen, setAreaSheetOpen] = useState(false)
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [unitSheetOpen, setUnitSheetOpen] = useState(false)
  const [newAreaSheetOpen, setNewAreaSheetOpen] = useState(false)
  const [newCategorySheetOpen, setNewCategorySheetOpen] = useState(false)
  const [newUnitSheetOpen, setNewUnitSheetOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit || !existingItem || initialized) return
    setName(existingItem.name)
    setPriceText(String(existingItem.purchasePrice))
    setQuantityText(
      existingItem.quantity != null ? String(existingItem.quantity) : '',
    )
    setUnitId(existingItem.unitId)
    setAreaId(existingItem.areaId)
    setCategoryId(existingItem.categoryId)
    setSpecificLocation(existingItem.specificLocation)
    setPurchaseDate(existingItem.purchaseDate)
    setStartDate(existingItem.startDate)
    setHasEndDate(existingItem.endDate != null)
    setEndDate(existingItem.endDate ?? todayIso)
    setHasExpiryDate(existingItem.expiryDate != null)
    setExpiryDate(existingItem.expiryDate ?? todayIso)
    setInitialized(true)
  }, [isEdit, existingItem, initialized, todayIso])

  const selectedAreaName =
    selectableAreas.find((a) => a.id === areaId)?.name ??
    areas.find((a) => a.id === areaId)?.name ??
    null
  const selectedCategoryName =
    selectableCategories.find((c) => c.id === categoryId)?.name ??
    categories.find((c) => c.id === categoryId)?.name ??
    null
  const selectedUnitName = units.find((u) => u.id === unitId)?.name ?? null

  const editStatus = useMemo(() => {
    if (!isEdit) return undefined
    return getItemStatus({
      endDate: hasEndDate ? parseISODate(endDate) : null,
      expiryDate: hasExpiryDate ? parseISODate(expiryDate) : null,
      today: new Date(),
    })
  }, [isEdit, hasEndDate, endDate, hasExpiryDate, expiryDate])

  const previewCostStats = useMemo((): ItemFieldsCostStats | undefined => {
    if (!isEdit) return undefined
    const price = parsePrice(priceText)
    if (price === null) return undefined

    const days = usedDays(
      parseISODate(startDate),
      hasEndDate ? parseISODate(endDate) : new Date(),
    )
    const quantity = parseQuantity(quantityText)
    const hasUnitPrice =
      quantity != null && quantity > 0 && selectedUnitName != null

    return {
      days,
      dailyCost: dailyCost(price, days),
      unitPrice: hasUnitPrice
        ? formatUnitPrice(price, quantity!, selectedUnitName!)
        : null,
    }
  }, [
    isEdit,
    priceText,
    startDate,
    hasEndDate,
    endDate,
    quantityText,
    selectedUnitName,
  ])

  const isSaving = createItem.isPending || updateItem.isPending

  async function handleSave() {
    const error = validateItemForm({
      name,
      priceText,
      quantityText,
      unitId,
      areaId,
      categoryId,
      purchaseDate: parseISODate(purchaseDate),
      startDate: parseISODate(startDate),
      endDate: hasEndDate ? parseISODate(endDate) : null,
    })

    if (error) {
      setValidationError(validationErrorMessage(error))
      return
    }

    const price = parsePrice(priceText)
    if (price === null || !areaId || !categoryId) return

    const quantity = parseQuantity(quantityText)

    const payload = {
      name: name.trim(),
      purchasePrice: price,
      purchaseDate,
      quantity,
      unitId: quantity != null ? unitId : null,
      areaId,
      categoryId,
      specificLocation: specificLocation.trim(),
      startDate,
      endDate: hasEndDate ? endDate : null,
      expiryDate: hasExpiryDate ? expiryDate : null,
    }

    try {
      if (isEdit && id) {
        await updateItem.mutateAsync({ id, ...payload })
      } else {
        await createItem.mutateAsync(payload)
      }
      navigate(-1)
    } catch {
      setValidationError('保存失败，请稍后重试')
    }
  }

  async function handleAddArea(name: string) {
    const area = await createArea.mutateAsync({ name })
    setAreaId(area.id)
    setNewAreaSheetOpen(false)
  }

  async function handleAddCategory(name: string) {
    const category = await createCategory.mutateAsync({ name })
    setCategoryId(category.id)
    setNewCategorySheetOpen(false)
  }

  async function handleAddUnit(name: string) {
    const unit = await createUnit.mutateAsync({ name })
    setUnitId(unit.id)
    setNewUnitSheetOpen(false)
  }

  if (isEdit && itemLoading) {
    return (
      <div className="min-h-svh bg-bg">
        <header className="border-b border-bg-hover bg-bg-card px-4 py-3">
          <h1 className="text-center text-lg font-medium text-text">编辑物品</h1>
        </header>
        <p className="py-12 text-center text-sm text-text-secondary">加载中…</p>
      </div>
    )
  }

  if (isEdit && !itemLoading && !existingItem) {
    return (
      <div className="min-h-svh bg-bg">
        <header className="border-b border-bg-hover bg-bg-card px-4 py-3">
          <h1 className="text-center text-lg font-medium text-text">编辑物品</h1>
        </header>
        <p className="py-12 text-center text-sm text-text-secondary">物品不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-bg pb-8">
      <PageHeaderBar
        leading={{
          kind: 'button',
          label: '取消',
          onClick: () => navigate(-1),
          variant: 'outline',
        }}
        title={isEdit ? '编辑' : '添加'}
        trailing={{
          kind: 'button',
          label: isSaving ? '保存中…' : '保存',
          onClick: () => void handleSave(),
          variant: 'default',
          disabled: isSaving,
        }}
      />

      <div className="space-y-3 px-4 py-3">
        <ItemHero
          mode="edit"
          name={name}
          onNameChange={setName}
          status={editStatus}
          costStats={previewCostStats}
        />

        <ItemFields
          mode="edit"
          hideNameField
          hideStatusInGrid={editStatus != null}
          name={name}
          onNameChange={setName}
          priceText={priceText}
          onPriceChange={setPriceText}
          quantityText={quantityText}
          onQuantityChange={setQuantityText}
          unitName={selectedUnitName}
          onOpenUnitPicker={() => setUnitSheetOpen(true)}
          areaName={selectedAreaName}
          onOpenAreaPicker={() => setAreaSheetOpen(true)}
          categoryName={selectedCategoryName}
          onOpenCategoryPicker={() => setCategorySheetOpen(true)}
          specificLocation={specificLocation}
          onSpecificLocationChange={setSpecificLocation}
          purchaseDate={purchaseDate}
          onPurchaseDateChange={setPurchaseDate}
          startDate={startDate}
          onStartDateChange={setStartDate}
          hasEndDate={hasEndDate}
          onHasEndDateChange={setHasEndDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          hasExpiryDate={hasExpiryDate}
          onHasExpiryDateChange={setHasExpiryDate}
          expiryDate={expiryDate}
          onExpiryDateChange={setExpiryDate}
        />
      </div>

      {validationError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="alertdialog"
            aria-labelledby="validation-title"
            className="w-full max-w-sm rounded-card bg-bg-card p-6 shadow-lg"
          >
            <h2 id="validation-title" className="text-lg font-medium text-text">
              无法保存
            </h2>
            <p className="mt-2 text-sm text-text-secondary">{validationError}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="rounded-button px-4 py-2 text-sm text-primary hover:bg-bg-hover"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <OptionSheet
        open={areaSheetOpen}
        title="选择区域"
        options={selectableAreas}
        selectedId={areaId}
        onSelect={setAreaId}
        onClose={() => setAreaSheetOpen(false)}
        onAddNew={() => setNewAreaSheetOpen(true)}
        addLabel="新建区域"
      />

      <OptionSheet
        open={categorySheetOpen}
        title="选择分类"
        options={selectableCategories}
        selectedId={categoryId}
        onSelect={setCategoryId}
        onClose={() => setCategorySheetOpen(false)}
        onAddNew={() => setNewCategorySheetOpen(true)}
        addLabel="新建分类"
      />

      <QuickAddSheet
        open={newAreaSheetOpen}
        title="新建区域"
        placeholder="区域名称"
        onClose={() => setNewAreaSheetOpen(false)}
        onSubmit={handleAddArea}
        isPending={createArea.isPending}
      />

      <QuickAddSheet
        open={newCategorySheetOpen}
        title="新建分类"
        placeholder="分类名称"
        onClose={() => setNewCategorySheetOpen(false)}
        onSubmit={handleAddCategory}
        isPending={createCategory.isPending}
      />

      <OptionSheet
        open={unitSheetOpen}
        title="选择计量单位"
        options={units}
        selectedId={unitId}
        onSelect={setUnitId}
        onClose={() => setUnitSheetOpen(false)}
        onAddNew={() => setNewUnitSheetOpen(true)}
        addLabel="新建计量单位"
      />

      <QuickAddSheet
        open={newUnitSheetOpen}
        title="新建计量单位"
        placeholder="单位名称"
        onClose={() => setNewUnitSheetOpen(false)}
        onSubmit={handleAddUnit}
        isPending={createUnit.isPending}
      />
    </div>
  )
}
