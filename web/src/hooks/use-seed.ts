import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import {
  buildDefaultAreaRows,
  buildDefaultCategoryRows,
} from '../lib/seed-defaults'
import { supabase } from '../lib/supabase'
import { useAuth } from './use-auth'

export function useSeedUserDefaults() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const seedingRef = useRef(false)

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId || !supabase || seedingRef.current) return

    let cancelled = false

    async function seedIfNeeded() {
      if (!supabase || !userId) return

      const { count, error: countError } = await supabase
        .from('areas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (cancelled) return
      if (countError) {
        console.error('Failed to check areas count:', countError.message)
        return
      }
      if (count && count > 0) return

      seedingRef.current = true

      const areaRows = buildDefaultAreaRows(userId)
      const categoryRows = buildDefaultCategoryRows(userId)

      const [{ error: areaError }, { error: categoryError }] =
        await Promise.all([
          supabase.from('areas').insert(areaRows),
          supabase.from('categories').insert(categoryRows),
        ])

      if (cancelled) return

      if (areaError) {
        console.error('Failed to seed default areas:', areaError.message)
      }
      if (categoryError) {
        console.error('Failed to seed default categories:', categoryError.message)
      }

      if (!areaError && !categoryError) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['areas'] }),
          queryClient.invalidateQueries({ queryKey: ['categories'] }),
        ])
      }

      seedingRef.current = false
    }

    void seedIfNeeded()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, queryClient])
}
