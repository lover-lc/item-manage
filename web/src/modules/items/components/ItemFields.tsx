import {
  formatPrice,
  formatQuantity,
  formatUnitPrice,
} from '../lib/cost-calculator'
import type { ItemStatus } from '../lib/item-status'
import {
  DateInputRow,
  compactFieldInputClass,
  fieldInputClass,
  FormField,
  FormRow,
  FormRowGrid,
  FormSection,
  ItemStatusBadge,
  PickerButton,
  ReadOnlyDateRow,
  ReadOnlyValue,
} from './item-form-layout'

export type ItemFieldsMode = 'view' | 'edit'

export type ItemFieldsCostStats = {
  days: number
  dailyCost: number
  unitPrice: string | null
}

export type ItemFieldsProps = {
  mode: ItemFieldsMode
  status?: ItemStatus
  name: string
  onNameChange?: (value: string) => void
  priceText: string
  onPriceChange?: (value: string) => void
  quantityText: string
  onQuantityChange?: (value: string) => void
  unitName: string | null
  onOpenUnitPicker?: () => void
  areaName: string | null
  onOpenAreaPicker?: () => void
  categoryName: string | null
  onOpenCategoryPicker?: () => void
  containerName?: string | null
  onOpenContainerPicker?: () => void
  containerPickerDisabled?: boolean
  purchaseDate: string | null
  onPurchaseDateChange?: (value: string | null) => void
  startDate: string | null
  onStartDateChange?: (value: string | null) => void
  endDate: string | null
  onEndDateChange?: (value: string | null) => void
  expiryDate: string | null
  onExpiryDateChange?: (value: string | null) => void
  hideNameField?: boolean
  hideStatusInGrid?: boolean
}

export default function ItemFields({
  mode,
  status,
  name,
  onNameChange,
  priceText,
  onPriceChange,
  quantityText,
  onQuantityChange,
  unitName,
  onOpenUnitPicker,
  areaName,
  onOpenAreaPicker,
  categoryName,
  onOpenCategoryPicker,
  containerName,
  onOpenContainerPicker,
  containerPickerDisabled = false,
  purchaseDate,
  onPurchaseDateChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  expiryDate,
  onExpiryDateChange,
  hideNameField = false,
  hideStatusInGrid = false,
}: ItemFieldsProps) {
  const isView = mode === 'view'
  const showStatus = status != null && !hideStatusInGrid
  const priceDisplay = priceText ? formatPrice(Number(priceText)) : null
  const quantityDisplay =
    quantityText.trim() !== '' ? formatQuantity(Number(quantityText)) : null

  return (
    <div className="space-y-3">
      <FormSection>
        {!hideNameField ? (
          <FormRow label="物品名称">
            {isView ? (
              <ReadOnlyValue value={name || null} />
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange?.(e.target.value)}
                placeholder="物品名称"
                className={fieldInputClass}
              />
            )}
          </FormRow>
        ) : null}
        <FormRowGrid columns={showStatus ? 4 : 3}>
          <FormField label="价格" compact>
            {isView ? (
              <ReadOnlyValue value={priceDisplay} compact />
            ) : (
              <input
                type="text"
                inputMode="decimal"
                value={priceText}
                onChange={(e) => onPriceChange?.(e.target.value)}
                placeholder="0"
                className={compactFieldInputClass}
              />
            )}
          </FormField>
          <FormField label="数量" compact>
            {isView ? (
              <ReadOnlyValue value={quantityDisplay} compact placeholder="—" />
            ) : (
              <input
                type="text"
                inputMode="decimal"
                value={quantityText}
                onChange={(e) => onQuantityChange?.(e.target.value)}
                placeholder="选填"
                className={compactFieldInputClass}
              />
            )}
          </FormField>
          <FormField label="单位" compact>
            {isView ? (
              <ReadOnlyValue value={unitName} compact placeholder="—" />
            ) : (
              <PickerButton
                value={unitName}
                placeholder="选填"
                compact
                onClick={() => onOpenUnitPicker?.()}
              />
            )}
          </FormField>
          {showStatus ? (
            <FormField label="状态" compact>
              <ItemStatusBadge status={status} />
            </FormField>
          ) : null}
        </FormRowGrid>
      </FormSection>

      <FormSection>
        <FormRow label="区域">
          {isView ? (
            <ReadOnlyValue value={areaName} placeholder="—" />
          ) : (
            <PickerButton
              value={areaName}
              placeholder="请选择"
              onClick={() => onOpenAreaPicker?.()}
            />
          )}
        </FormRow>
        {onOpenContainerPicker || containerName != null ? (
          <FormRow label="所在容器">
            {isView ? (
              <ReadOnlyValue value={containerName ?? null} placeholder="—" />
            ) : (
              <PickerButton
                value={containerName ?? null}
                placeholder={containerPickerDisabled ? '请先选择区域' : '未指定'}
                disabled={containerPickerDisabled}
                onClick={() => onOpenContainerPicker?.()}
              />
            )}
          </FormRow>
        ) : null}
        <FormRow label="分类">
          {isView ? (
            <ReadOnlyValue value={categoryName} placeholder="—" />
          ) : (
            <PickerButton
              value={categoryName}
              placeholder="请选择"
              onClick={() => onOpenCategoryPicker?.()}
            />
          )}
        </FormRow>
      </FormSection>

      <FormSection>
        {isView ? (
          <>
            <ReadOnlyDateRow label="购入日期" value={purchaseDate} />
            <ReadOnlyDateRow label="开始日期" value={startDate} />
            {endDate ? (
              <ReadOnlyDateRow label="用完日期" value={endDate} />
            ) : null}
            {expiryDate ? (
              <ReadOnlyDateRow label="过期日期" value={expiryDate} />
            ) : null}
          </>
        ) : (
          <>
            <DateInputRow
              label="购入日期"
              value={purchaseDate}
              onChange={(value) => onPurchaseDateChange?.(value)}
            />
            <DateInputRow
              label="开始日期"
              value={startDate}
              onChange={(value) => onStartDateChange?.(value)}
            />
            <DateInputRow
              label="用完日期"
              value={endDate}
              onChange={(value) => onEndDateChange?.(value)}
            />
            <DateInputRow
              label="过期日期"
              value={expiryDate}
              onChange={(value) => onExpiryDateChange?.(value)}
            />
          </>
        )}
      </FormSection>
    </div>
  )
}

export function buildCostStats(
  item: {
    purchasePrice: number
    quantity: number | null
    unit?: { name: string } | null
  },
  days: number,
  dailyCost: number,
): ItemFieldsCostStats {
  const hasUnitPrice =
    item.quantity != null && item.quantity > 0 && item.unit != null

  return {
    days,
    dailyCost,
    unitPrice: hasUnitPrice
      ? formatUnitPrice(item.purchasePrice, item.quantity!, item.unit!.name)
      : null,
  }
}
