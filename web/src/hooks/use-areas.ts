import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toArea, type Area, type DbArea } from '../lib/types'
import { supabase } from '../lib/supabase'
import { useAuth } from './use-auth'

export function useAreas() {
  const { session } = useAuth()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['areas', userId],
    enabled: Boolean(userId && supabase),
    queryFn: async (): Promise<Area[]> => {
      if (!supabase || !userId) return []

      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      return (data as DbArea[]).map(toArea)
    },
    staleTime: 1000 * 60,
  })
}

export function useCreateArea() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: { name: string; isSystemReserved?: boolean }) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { data, error } = await supabase
        .from('areas')
        .insert({
          user_id: userId,
          name: input.name,
          is_system_reserved: input.isSystemReserved ?? false,
        })
        .select()
        .single()

      if (error) throw error
      return toArea(data as DbArea)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] })
    },
  })
}

export function useUpdateArea() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { data, error } = await supabase
        .from('areas')
        .update({ name: input.name })
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return toArea(data as DbArea)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] })
    },
  })
}

export function useDeleteArea() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
