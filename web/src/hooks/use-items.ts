import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  toDbItem,
  toItem,
  type DbItemRow,
  type Item,
  type ItemInsert,
  type ItemUpdateInput,
} from '../lib/types'
import { supabase } from '../lib/supabase'
import { useAuth } from './use-auth'

export type ItemFilters = {
  areaId?: string
  categoryId?: string
}

const ITEM_SELECT = '*, area:areas(*), category:categories(*)'

export function useItems(filters: ItemFilters = {}) {
  const { session } = useAuth()
  const userId = session?.user?.id
  const { areaId, categoryId } = filters

  return useQuery({
    queryKey: ['items', userId, areaId, categoryId],
    enabled: Boolean(userId && supabase),
    queryFn: async (): Promise<Item[]> => {
      if (!supabase || !userId) return []

      let query = supabase
        .from('items')
        .select(ITEM_SELECT)
        .eq('user_id', userId)
        .order('name')

      if (areaId) query = query.eq('area_id', areaId)
      if (categoryId) query = query.eq('category_id', categoryId)

      const { data, error } = await query
      if (error) throw error
      return (data as DbItemRow[]).map(toItem)
    },
    staleTime: 1000 * 60,
  })
}

export function useItem(id: string | undefined) {
  const { session } = useAuth()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ['items', userId, id],
    enabled: Boolean(userId && supabase && id),
    queryFn: async (): Promise<Item | null> => {
      if (!supabase || !userId || !id) return null

      const { data, error } = await supabase
        .from('items')
        .select(ITEM_SELECT)
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      return data ? toItem(data as DbItemRow) : null
    },
    staleTime: 1000 * 60,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: Omit<ItemInsert, 'userId'>) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { data, error } = await supabase
        .from('items')
        .insert(toDbItem(input, userId))
        .select(ITEM_SELECT)
        .single()

      if (error) throw error
      return toItem(data as DbItemRow)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: { id: string } & ItemUpdateInput) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('items')
        .update(toDbItem(updates, userId))
        .eq('id', id)
        .eq('user_id', userId)
        .select(ITEM_SELECT)
        .single()

      if (error) throw error
      return toItem(data as DbItemRow)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', userId, variables.id] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }

      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useBatchUpdateItemsArea() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: { itemIds: string[]; areaId: string }) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }
      if (input.itemIds.length === 0) return

      const { error } = await supabase
        .from('items')
        .update({ area_id: input.areaId })
        .in('id', input.itemIds)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useBatchUpdateItemsCategory() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (input: { itemIds: string[]; categoryId: string }) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }
      if (input.itemIds.length === 0) return

      const { error } = await supabase
        .from('items')
        .update({ category_id: input.categoryId })
        .in('id', input.itemIds)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useBatchDeleteItems() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  return useMutation({
    mutationFn: async (itemIds: string[]) => {
      if (!supabase || !userId) {
        throw new Error('未登录或未配置 Supabase')
      }
      if (itemIds.length === 0) return

      const { error } = await supabase
        .from('items')
        .delete()
        .in('id', itemIds)
        .eq('user_id', userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
