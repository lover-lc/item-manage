import { useEffect, useState } from 'react'
import {
  loadSceneConfig,
  saveSceneConfig,
  hasSceneConfig,
} from '../lib/scene-db'
import type { SceneConfig } from '../types/scene-types'

export function useSceneConfig() {
  const [config, setConfig] = useState<SceneConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadSceneConfig()
      .then((loaded) => {
        setConfig(loaded)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return { config, loading, error }
}

export function useHasScene() {
  const [hasScene, setHasScene] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hasSceneConfig()
      .then((exists) => {
        setHasScene(exists)
        setLoading(false)
      })
      .catch(() => {
        setHasScene(false)
        setLoading(false)
      })
  }, [])

  return { hasScene, loading }
}

export function useSaveSceneConfig() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const save = async (config: SceneConfig) => {
    setSaving(true)
    setError(null)
    try {
      await saveSceneConfig(config)
      setSaving(false)
    } catch (err) {
      setError(err as Error)
      setSaving(false)
      throw err
    }
  }

  return { save, saving, error }
}
