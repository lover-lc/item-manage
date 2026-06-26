export type DbArea = {
  id: string
  user_id: string
  name: string
  is_system_reserved: boolean
  created_at: string
}

export type DbCategory = {
  id: string
  user_id: string
  name: string
  is_system_reserved: boolean
  created_at: string
}

export type DbItem = {
  id: string
  user_id: string
  name: string
  purchase_price: number | string
  start_date: string
  end_date: string | null
  expiry_date: string | null
  area_id: string
  category_id: string
  specific_location: string
  created_at: string
  updated_at: string
}

export type DbItemRow = DbItem & {
  area?: DbArea | null
  category?: DbCategory | null
}

export type Area = {
  id: string
  userId: string
  name: string
  isSystemReserved: boolean
  createdAt: string
}

export type Category = {
  id: string
  userId: string
  name: string
  isSystemReserved: boolean
  createdAt: string
}

export type Item = {
  id: string
  userId: string
  name: string
  purchasePrice: number
  startDate: string
  endDate: string | null
  expiryDate: string | null
  areaId: string
  categoryId: string
  specificLocation: string
  createdAt: string
  updatedAt: string
  area?: Area
  category?: Category
}

export type ItemInsert = Omit<
  Item,
  'id' | 'createdAt' | 'updatedAt' | 'area' | 'category'
>

export type ItemUpdateInput = Partial<ItemInsert>

export type DbAreaInsert = Pick<DbArea, 'user_id' | 'name' | 'is_system_reserved'>
export type DbCategoryInsert = Pick<
  DbCategory,
  'user_id' | 'name' | 'is_system_reserved'
>

export function toArea(row: DbArea): Area {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isSystemReserved: row.is_system_reserved,
    createdAt: row.created_at,
  }
}

export function toCategory(row: DbCategory): Category {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isSystemReserved: row.is_system_reserved,
    createdAt: row.created_at,
  }
}

function parsePurchasePrice(value: number | string): number {
  return typeof value === 'number' ? value : Number(value)
}

export function toItem(row: DbItemRow): Item {
  const item: Item = {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    purchasePrice: parsePurchasePrice(row.purchase_price),
    startDate: row.start_date,
    endDate: row.end_date,
    expiryDate: row.expiry_date,
    areaId: row.area_id,
    categoryId: row.category_id,
    specificLocation: row.specific_location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }

  if (row.area) {
    item.area = toArea(row.area)
  }
  if (row.category) {
    item.category = toCategory(row.category)
  }

  return item
}

export function toDbItem(
  item: ItemInsert | ItemUpdateInput,
  userId: string,
): Partial<DbItem> {
  const row: Partial<DbItem> = { user_id: userId }

  if (item.name !== undefined) row.name = item.name
  if (item.purchasePrice !== undefined) {
    row.purchase_price = item.purchasePrice
  }
  if (item.startDate !== undefined) row.start_date = item.startDate
  if (item.endDate !== undefined) row.end_date = item.endDate
  if (item.expiryDate !== undefined) row.expiry_date = item.expiryDate
  if (item.areaId !== undefined) row.area_id = item.areaId
  if (item.categoryId !== undefined) row.category_id = item.categoryId
  if (item.specificLocation !== undefined) {
    row.specific_location = item.specificLocation
  }

  return row
}
