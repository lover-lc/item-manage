import { describe, test, expect, beforeEach } from 'vitest'
import {
  saveSceneConfig,
  loadSceneConfig,
  clearSceneConfig,
} from '../src/modules/everything/lib/scene-db'
import type { SceneConfig } from '../src/modules/everything/types/scene-types'

const mockConfig: SceneConfig = {
  id: 'default-scene',
  version: 1,
  camera: {
    position: [0, 1.6, 5],
    rotation: [0, 0, 0],
  },
  lighting: {
    ambient: 0.5,
    directional: {
      intensity: 1,
      position: [10, 10, 10],
    },
  },
  environment: {
    floor: {
      material: 'wood',
      size: [20, 20],
    },
    walls: [],
  },
  lastModified: Date.now(),
}

describe('scene-db', () => {
  beforeEach(async () => {
    await clearSceneConfig()
  })

  test('saves and loads scene config', async () => {
    await saveSceneConfig(mockConfig)
    const loaded = await loadSceneConfig()

    expect(loaded).toBeDefined()
    expect(loaded?.id).toBe('default-scene')
    expect(loaded?.camera.position).toEqual([0, 1.6, 5])
  })

  test('returns null when config missing', async () => {
    const loaded = await loadSceneConfig()
    expect(loaded).toBeNull()
  })

  test('updates existing config', async () => {
    await saveSceneConfig(mockConfig)

    const updated = { ...mockConfig, version: 2 }
    await saveSceneConfig(updated)

    const loaded = await loadSceneConfig()
    expect(loaded?.version).toBe(2)
  })
})
