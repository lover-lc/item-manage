import type { SceneConfig } from '../types/scene-types'
import { ROOM_DEPTH, ROOM_HEIGHT, ROOM_HALF_DEPTH, ROOM_HALF_WIDTH, ROOM_WIDTH } from './room-constants'

/** 20×20×3m 空房间场景配置（IndexedDB，不含容器） */
export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  id: 'default-scene',
  version: 3,
  camera: {
    position: [0, 1.6, 0],
    rotation: [0, 0, 0],
  },
  lighting: {
    ambient: 0.6,
    directional: {
      intensity: 0.8,
      position: [0, ROOM_HEIGHT - 0.2, 0],
    },
  },
  environment: {
    floor: {
      material: 'wood',
      size: [ROOM_WIDTH, ROOM_DEPTH],
    },
    walls: [
      {
        id: 'wall-north',
        points: [
          [-ROOM_HALF_WIDTH, -ROOM_HALF_DEPTH],
          [ROOM_HALF_WIDTH, -ROOM_HALF_DEPTH],
        ],
        height: ROOM_HEIGHT,
      },
      {
        id: 'wall-south',
        points: [
          [-ROOM_HALF_WIDTH, ROOM_HALF_DEPTH],
          [ROOM_HALF_WIDTH, ROOM_HALF_DEPTH],
        ],
        height: ROOM_HEIGHT,
      },
      {
        id: 'wall-east',
        points: [
          [ROOM_HALF_WIDTH, -ROOM_HALF_DEPTH],
          [ROOM_HALF_WIDTH, ROOM_HALF_DEPTH],
        ],
        height: ROOM_HEIGHT,
      },
      {
        id: 'wall-west',
        points: [
          [-ROOM_HALF_WIDTH, -ROOM_HALF_DEPTH],
          [-ROOM_HALF_WIDTH, ROOM_HALF_DEPTH],
        ],
        height: ROOM_HEIGHT,
      },
    ],
  },
  lastModified: Date.now(),
}
