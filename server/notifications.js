import { supabase } from './supabase.js'

export async function notifyUsers({ userIds, type, title, body, resourceType, resourceId }) {
  if (!supabase || userIds.length === 0) return
  const rows = [...new Set(userIds)].map((userId) => ({
    user_id: userId,
    type,
    title,
    body,
    resource_type: resourceType || null,
    resource_id: resourceId || null
  }))
  const { error } = await supabase.from('notifications').insert(rows)
  if (error) throw error
}

export async function notifyRoles({ roles, type, title, body, resourceType, resourceId }) {
  if (!supabase) return
  const { data: profiles, error } = await supabase.from('profiles').select('id').in('role', roles)
  if (error) throw error
  await notifyUsers({ userIds: profiles.map((profile) => profile.id), type, title, body, resourceType, resourceId })
}
