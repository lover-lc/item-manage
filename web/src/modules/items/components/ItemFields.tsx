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
  ToggleRow,
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
  specificLocation: string
  onSpecificLocationChange?: (value: string) => void
  purchaseDate: string
  onPurchaseDateChange?: (value: string) => void
  startDate: string
  onStartDateChange?: (value: string) => void
  hasEndDate: boolean
  onHasEndDateChange?: (value: boolean) => void
  endDate: string
  onEndDateChange?: (value: string) => void
  hasExpiryDate: boolean
  onHasExpiryDateChange?: (value: boolean) => void
  expiryDate: string
  onExpiryDateChange?: (value: string) => void
  /** Hide name row when shown in hero card above. */
  hideNameField?: boolean
  /** Hide status column when shown in hero card above. */
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
  specificLocation,
  onSpecificLocationChange,
  purchaseDate,
  onPurchaseDateChange,
  startDate,
  onStartDateChange,
  hasEndDate,
  onHasEndDateChange,
  endDate,
  onEndDateChange,
  hasExpiryDate,
  onHasExpiryDateChange,
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
        <FormRowGrid>
          <FormField label="区域">
            {isView ? (
              <ReadOnlyValue value={areaName} placeholder="—" />
            ) : (
              <PickerButton
                value={areaName}
                placeholder="请选择"
                onClick={() => onOpenAreaPicker?.()}
              />
            )}
          </FormField>
          <FormField label="分类">
            {isView ? (
              <ReadOnlyValue value={categoryName} placeholder="—" />
            ) : (
              <PickerButton
                value={categoryName}
                placeholder="请选择"
                onClick={() => onOpenCategoryPicker?.()}
              />
            )}
          </FormField>
        </FormRowGrid>
        <FormRow label="具体位置">
          {isView ? (
            <ReadOnlyValue value={specificLocation.trim() || null} placeholder="—" />
          ) : (
            <input
              type="text"
              value={specificLocation}
              onChange={(e) => onSpecificLocationChange?.(e.target.value)}
              placeholder="具体位置"
              className={fieldInputClass}
            />
          )}
        </FormRow>
      </FormSection>

      <FormSection>
        {isView ? (
          <>
            <ReadOnlyDateRow label="购入时间" value={purchaseDate} />
            <ReadOnlyDateRow label="开始使用时间" value={startDate} />
            {hasEndDate ? (
              <ReadOnlyDateRow label="用完时间" value={endDate} />
            ) : null}
            {hasExpiryDate ? (
              <ReadOnlyDateRow label="过期时间" value={expiryDate} />
            ) : null}
          </>
        ) : (
          <>
            <DateInputRow
              label="购入时间"
              value={purchaseDate}
              onChange={(value) => onPurchaseDateChange?.(value)}
            />
            <DateInputRow
              label="开始使用时间"
              value={startDate}
              onChange={(value) => onStartDateChange?.(value)}
            />
            <ToggleRow
              label="设置用完时间"
              checked={hasEndDate}
              onToggle={() => onHasEndDateChange?.(!hasEndDate)}
            />
            {hasEndDate ? (
              <DateInputRow
                label="用完时间"
                value={endDate}
                onChange={(value) => onEndDateChange?.(value)}
              />
            ) : null}
            <ToggleRow
              label="设置过期时间"
              checked={hasExpiryDate}
              onToggle={() => onHasExpiryDateChange?.(!hasExpiryDate)}
            />
            {hasExpiryDate ? (
              <DateInputRow
                label="过期时间"
                value={expiryDate}
                onChange={(value) => onExpiryDateChange?.(value)}
              />
            ) : null}
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
