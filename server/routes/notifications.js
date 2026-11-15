import { Router } from 'express'
import { requireUser } from '../middleware/auth.js'
import { supabase } from '../supabase.js'

export const notificationsRouter = Router()
notificationsRouter.use(requireUser)

notificationsRouter.get('/', async (request, response, next) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, resource_type, resource_id, read_at, created_at')
    .eq('user_id', request.user.id)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) return next(error)
  return response.json({ notifications: data })
})

notificationsRouter.patch('/:notificationId/read', async (request, response, next) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', request.params.notificationId)
    .eq('user_id', request.user.id)
    .select('id, read_at')
    .maybeSingle()
  if (error) return next(error)
  if (!data) return response.status(404).json({ error: 'Notification not found.' })
  return response.json({ notification: data })
})
