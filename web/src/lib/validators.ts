import { startOfDay } from './date-utils'

export type ItemFormInput = {
  name: string
  priceText: string
  areaId: string | null | undefined
  categoryId: string | null | undefined
  startDate: Date
  endDate?: Date | null
}

export type ValidationError =
  | 'emptyName'
  | 'invalidPrice'
  | 'missingArea'
  | 'missingCategory'
  | 'startAfterEnd'

export function parsePrice(text: string): number | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return null
  return value
}

export function validateItemForm(input: ItemFormInput): ValidationError | null {
  if (input.name.trim().length === 0) {
    return 'emptyName'
  }

  const price = parsePrice(input.priceText)
  if (price === null || price < 0) {
    return 'invalidPrice'
  }

  if (!input.areaId) {
    return 'missingArea'
  }

  if (!input.categoryId) {
    return 'missingCategory'
  }

  if (input.endDate) {
    const startDay = startOfDay(input.startDate)
    const endDay = startOfDay(input.endDate)
    if (startDay > endDay) {
      return 'startAfterEnd'
    }
  }

  return null
}

export function validationErrorMessage(error: ValidationError): string {
  switch (error) {
    case 'emptyName':
      return '请输入物品名称'
    case 'invalidPrice':
      return '请输入有效的价格（≥ 0）'
    case 'missingArea':
      return '请选择区域'
    case 'missingCategory':
      return '请选择分类'
    case 'startAfterEnd':
      return '开始时间不能晚于用完时间'
  }
}
