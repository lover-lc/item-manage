import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../shared/lib/supabase'
import {
  toContainer,
  toDbContainer,
  type DbContainer,
  type Container,
  type ContainerInsert,
  type Position3D,
} from '../types/scene-types'

const CONTAINER_SELECT = '*'

export function useContainers() {
  return useQuery({
    queryKey: ['containers'],
    enabled: Boolean(supabase),
    queryFn: async (): Promise<Container[]> => {
      if (!supabase) return []

      const { data, error } = await supabase
        .from('containers')
        .select(CONTAINER_SELECT)
        .order('name')

      if (error) throw error
      return (data as DbContainer[]).map(toContainer)
    },
    staleTime: 1000 * 60,
  })
}

export function useContainer(id: string | undefined) {
  return useQuery({
    queryKey: ['containers', id],
    enabled: Boolean(supabase && id),
    queryFn: async (): Promise<Container | null> => {
      if (!supabase || !id) return null

      const { data, error } = await supabase
        .from('containers')
        .select(CONTAINER_SELECT)
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      return data ? toContainer(data as DbContainer) : null
    },
    staleTime: 1000 * 60,
  })
}

export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ContainerInsert) => {
      if (!supabase) throw new Error('未配置 Supabase')

      const { data, error } = await supabase
        .from('containers')
        .insert(toDbContainer(input))
        .select(CONTAINER_SELECT)
        .single()

      if (error) throw error
      return toContainer(data as DbContainer)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}

export function useCreateContainersBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inputs: ContainerInsert[]) => {
      if (!supabase) throw new Error('未配置 Supabase')

      const dbContainers = inputs.map(toDbContainer)
      const { data, error } = await supabase
        .from('containers')
        .insert(dbContainers)
        .select(CONTAINER_SELECT)

      if (error) throw error
      return (data as DbContainer[]).map(toContainer)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}

export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('未配置 Supabase')

      const { error } = await supabase.from('containers').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}

export function useDeleteAllContainers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('未配置 Supabase')

      const { error } = await supabase
        .from('containers')
        .delete()
        .not('id', 'is', null)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}

export function useDeleteContainersBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!supabase) throw new Error('未配置 Supabase')
      if (ids.length === 0) return

      const { error } = await supabase.from('containers').delete().in('id', ids)

      if (error) throw error
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['containers'] })
      const previous = queryClient.getQueryData<Container[]>(['containers'])
      if (previous) {
        queryClient.setQueryData<Container[]>(
          ['containers'],
          previous.filter((c) => !ids.includes(c.id)),
        )
      }
      return { previous }
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['containers'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}

export function useUpdateContainersBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updates: Array<{ id: string; position_3d: Position3D }>,
    ): Promise<void> => {
      if (!supabase) throw new Error('未配置 Supabase')

      for (const u of updates) {
        const { error } = await supabase
          .from('containers')
          .update({ position_3d: u.position_3d })
          .eq('id', u.id)
        if (error) throw error
      }
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['containers'] })
      const previous = queryClient.getQueryData<Container[]>(['containers'])
      if (previous) {
        const byId = new Map(updates.map((u) => [u.id, u.position_3d]))
        queryClient.setQueryData<Container[]>(
          ['containers'],
          previous.map((c) => {
            const nextPosition = byId.get(c.id)
            if (!nextPosition) return c
            return { ...c, position: nextPosition }
          }),
        )
      }
      return { previous }
    },
    onError: (_err, _updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['containers'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}
