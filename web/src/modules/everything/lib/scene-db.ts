import Dexie, { type EntityTable } from 'dexie'
import type { SceneConfig } from '../types/scene-types'

const DEFAULT_SCENE_ID = 'default-scene'

class SceneDatabase extends Dexie {
  scenes!: EntityTable<SceneConfig, 'id'>

  constructor() {
    super('EverythingSceneDB')

    this.version(1).stores({
      scenes: 'id, version, lastModified',
    })
  }
}

const db = new SceneDatabase()

export async function saveSceneConfig(config: SceneConfig): Promise<void> {
  await db.scenes.put(config)
}

export async function loadSceneConfig(): Promise<SceneConfig | null> {
  const config = await db.scenes.get(DEFAULT_SCENE_ID)
  return config ?? null
}

export async function clearSceneConfig(): Promise<void> {
  await db.scenes.clear()
}

export async function hasSceneConfig(): Promise<boolean> {
  const count = await db.scenes.count()
  return count > 0
}
