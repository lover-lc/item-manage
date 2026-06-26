export const DEFAULT_AREAS = ['客厅', '卧室', '厨房', '卫生间', '储藏室']
export const DEFAULT_CATEGORIES = ['日用品', '食品', '宠物用品', '清洁用品']

export const SYSTEM_RESERVED_NAME = '未分类'

export function buildDefaultAreaRows(userId: string) {
  return [
    ...DEFAULT_AREAS.map((name) => ({
      user_id: userId,
      name,
      is_system_reserved: false,
    })),
    {
      user_id: userId,
      name: SYSTEM_RESERVED_NAME,
      is_system_reserved: true,
    },
  ]
}

export function buildDefaultCategoryRows(userId: string) {
  return [
    ...DEFAULT_CATEGORIES.map((name) => ({
      user_id: userId,
      name,
      is_system_reserved: false,
    })),
    {
      user_id: userId,
      name: SYSTEM_RESERVED_NAME,
      is_system_reserved: true,
    },
  ]
}
