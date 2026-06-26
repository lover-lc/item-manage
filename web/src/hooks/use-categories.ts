import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toCategory, type Category, type DbCategory } from '../lib/types'
import { supabase } from '../lib/supabase'
import { useAuth } from './use-auth'

export function useCategories() {
  const { session } = useAuth()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['categories', userId],
    enabled: Boolean(userId && supabase),
    queryFn: async (): Promise<Category[]> => {
      if (!supabase || !userId) return []

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) throw error
      return (data as DbCategory[]).map(toCategory)
    },
    staleTime: 1000 * 60,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: { name: string; isSystemReserved?: boolean }) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: input.name,
          is_system_reserved: input.isSystemReserved ?? false,
        })
        .select()
        .single()

      if (error) throw error
      return toCategory(data as DbCategory)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { data, error } = await supabase
        .from('categories')
        .update({ name: input.name })
        .eq('id', input.id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return toCategory(data as DbCategory)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
