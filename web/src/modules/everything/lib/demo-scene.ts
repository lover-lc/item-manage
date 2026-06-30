import type { SceneConfig, ContainerInsert } from '../types/scene-types'

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  id: 'default-scene',
  version: 1,
  camera: {
    position: [0, 1.6, 5],
    rotation: [0, 0, 0],
  },
  lighting: {
    ambient: 0.4,
    directional: {
      intensity: 0.8,
      position: [10, 15, 10],
    },
  },
  environment: {
    floor: {
      material: 'wood',
      size: [20, 20],
    },
    walls: [
      { id: 'wall-north', points: [[-10, 10], [10, 10]], height: 3 },
      { id: 'wall-south', points: [[-10, -10], [10, -10]], height: 3 },
      { id: 'wall-east', points: [[10, -10], [10, 10]], height: 3 },
      { id: 'wall-west', points: [[-10, -10], [-10, 10]], height: 3 },
    ],
  },
  lastModified: Date.now(),
}

export function getDemoContainers(clientRoomAreaId: string): ContainerInsert[] {
  return [
    {
      name: '客厅电视柜',
      areaId: clientRoomAreaId,
      position: { x: 0, y: 0, z: -8, rotationY: 0, scale: 1 },
      modelRef: 'cabinet_tv',
      modelType: 'builtin',
    },
    {
      name: '客厅书架左',
      areaId: clientRoomAreaId,
      position: { x: -7, y: 0, z: -5, rotationY: Math.PI / 2, scale: 1 },
      modelRef: 'bookshelf',
      modelType: 'builtin',
    },
    {
      name: '客厅书架右',
      areaId: clientRoomAreaId,
      position: { x: 7, y: 0, z: -5, rotationY: -Math.PI / 2, scale: 1 },
      modelRef: 'bookshelf',
      modelType: 'builtin',
    },
    {
      name: '玄关鞋柜',
      areaId: clientRoomAreaId,
      position: { x: -5, y: 0, z: 8, rotationY: Math.PI, scale: 1 },
      modelRef: 'shoe_cabinet',
      modelType: 'builtin',
    },
    {
      name: '餐边柜',
      areaId: clientRoomAreaId,
      position: { x: 5, y: 0, z: 5, rotationY: Math.PI, scale: 1 },
      modelRef: 'sideboard',
      modelType: 'builtin',
    },
    {
      name: '储物箱1',
      areaId: clientRoomAreaId,
      position: { x: -3, y: 0, z: 0, rotationY: 0, scale: 1 },
      modelRef: 'storage_box',
      modelType: 'builtin',
    },
    {
      name: '储物箱2',
      areaId: clientRoomAreaId,
      position: { x: 3, y: 0, z: 0, rotationY: 0, scale: 1 },
      modelRef: 'storage_box',
      modelType: 'builtin',
    },
    {
      name: '抽屉柜',
      areaId: clientRoomAreaId,
      position: { x: 0, y: 0, z: 3, rotationY: Math.PI, scale: 1 },
      modelRef: 'drawer_chest',
      modelType: 'builtin',
    },
  ]
}
