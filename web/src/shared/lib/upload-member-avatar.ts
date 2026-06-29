import { supabase } from '../lib/supabase'

export async function uploadMemberAvatar(
  userId: string,
  memberId: string,
  blob: Blob,
): Promise<string> {
  if (!supabase) throw new Error('未配置 Supabase')

  const path = `${userId}/${memberId}.jpg`
  const { error: uploadError } = await supabase.storage
    .from('todo-avatars')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('todo-avatars').getPublicUrl(path)
  const url = `${data.publicUrl}?t=${Date.now()}`
  return url
}

export async function removeMemberAvatar(userId: string, memberId: string): Promise<void> {
  if (!supabase) throw new Error('未配置 Supabase')
  await supabase.storage.from('todo-avatars').remove([`${userId}/${memberId}.jpg`])
}
