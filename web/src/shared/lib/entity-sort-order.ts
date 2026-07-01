import type { SupabaseClient } from '@supabase/supabase-js'

export type SortOrderTable = 'areas' | 'categories' | 'units' | 'todo_lists'

export async function persistEntitySortOrder(
  client: SupabaseClient,
  table: SortOrderTable,
  orderedIds: string[],
): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      client.from(table).update({ sort_order: index }).eq('id', id),
    ),
  )

  const error = results.find((result) => result.error)?.error
  if (error) throw error
}

export async function nextEntitySortOrder(
  client: SupabaseClient,
  table: Exclude<SortOrderTable, 'todo_lists'>,
): Promise<number> {
  const { data, error } = await client
    .from(table)
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)

  if (error) throw error

  return data && data.length > 0
    ? (data[0] as { sort_order: number }).sort_order + 1
    : 0
}
