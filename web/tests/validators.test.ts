import { describe, expect, it } from 'vitest'
import { parseISODate } from '../src/lib/date-utils'
import {
  type ItemFormInput,
  validateItemForm,
} from '../src/lib/validators'

const areaId = 'area-1'
const categoryId = 'category-1'

function validInput(overrides: Partial<ItemFormInput> = {}): ItemFormInput {
  return {
    name: '毛巾',
    priceText: '29.9',
    areaId,
    categoryId,
    startDate: new Date(),
    endDate: null,
    ...overrides,
  }
}

describe('validateItemForm', () => {
  it('rejects empty name', () => {
    expect(validateItemForm(validInput({ name: '   ' }))).toBe('emptyName')
  })

  it('rejects negative price', () => {
    expect(validateItemForm(validInput({ priceText: '-1' }))).toBe('invalidPrice')
  })

  it('rejects missing area', () => {
    expect(validateItemForm(validInput({ areaId: null }))).toBe('missingArea')
  })

  it('rejects missing category', () => {
    expect(validateItemForm(validInput({ categoryId: null }))).toBe(
      'missingCategory',
    )
  })

  it('rejects start date after end date', () => {
    const startDate = parseISODate('2026-06-10')
    const endDate = parseISODate('2026-06-05')
    expect(
      validateItemForm(validInput({ startDate, endDate })),
    ).toBe('startAfterEnd')
  })

  it('accepts valid input', () => {
    expect(validateItemForm(validInput())).toBeNull()
  })

  it('does not require end date', () => {
    const startDate = parseISODate('2026-01-01')
    expect(
      validateItemForm(
        validInput({
          name: '物品',
          priceText: '0',
          startDate,
          endDate: null,
        }),
      ),
    ).toBeNull()
  })
})
