import type { BuiltinModelType, BuiltinModelConfig } from '../types/scene-types'

export const BUILTIN_MODELS: Record<BuiltinModelType, BuiltinModelConfig> = {
  cabinet_tv: {
    id: 'cabinet_tv',
    name: '电视柜',
    size: [1.5, 0.6, 0.5],
    color: '#8B7355',
    category: '容器',
  },
  wardrobe_large: {
    id: 'wardrobe_large',
    name: '大衣柜',
    size: [2.0, 2.0, 0.6],
    color: '#A0826D',
    category: '容器',
  },
  wardrobe_small: {
    id: 'wardrobe_small',
    name: '小衣柜',
    size: [1.0, 1.8, 0.5],
    color: '#A0826D',
    category: '容器',
  },
  shoe_cabinet: {
    id: 'shoe_cabinet',
    name: '鞋柜',
    size: [1.2, 1.0, 0.4],
    color: '#6B5D4F',
    category: '容器',
  },
  bookshelf: {
    id: 'bookshelf',
    name: '书架',
    size: [0.8, 1.8, 0.3],
    color: '#8B7355',
    category: '容器',
  },
  nightstand: {
    id: 'nightstand',
    name: '床头柜',
    size: [0.5, 0.5, 0.4],
    color: '#A0826D',
    category: '容器',
  },
  sideboard: {
    id: 'sideboard',
    name: '餐边柜',
    size: [1.5, 0.9, 0.5],
    color: '#8B7355',
    category: '容器',
  },
  drawer_chest: {
    id: 'drawer_chest',
    name: '抽屉柜',
    size: [0.6, 1.0, 0.5],
    color: '#6B5D4F',
    category: '容器',
  },
  storage_box: {
    id: 'storage_box',
    name: '储物箱',
    size: [0.5, 0.5, 0.5],
    color: '#9E9E9E',
    category: '容器',
  },
  kitchen_cabinet: {
    id: 'kitchen_cabinet',
    name: '橱柜',
    size: [1.0, 0.8, 0.6],
    color: '#A0826D',
    category: '容器',
  },
}

export function getBuiltinModel(id: BuiltinModelType): BuiltinModelConfig {
  return BUILTIN_MODELS[id]
}

export function getAllBuiltinModels(): BuiltinModelConfig[] {
  return Object.values(BUILTIN_MODELS)
}

export function isBuiltinModelRef(ref: string): ref is BuiltinModelType {
  return ref in BUILTIN_MODELS
}
