import { Router } from 'express'
import { requireUser } from '../middleware/auth.js'
import { supabase } from '../supabase.js'

export const dashboardRouter = Router()

dashboardRouter.get('/', requireUser, async (request, response, next) => {
  if (!supabase) return response.status(503).json({ error: 'Dashboard service is not configured yet.' })

  const role = request.userRole
  const result = {
    profile: { id: request.user.id, email: request.user.email, full_name: request.profile?.full_name || '', role },
    summary: {},
    recentEnquiries: []
  }

  if (role === 'owner' || role === 'admin') {
    const { data: enquiries, error } = await supabase
      .from('enquiries')
      .select('id, name, company, service, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    if (error) return next(error)
    result.summary.enquiries = enquiries.length
    result.recentEnquiries = enquiries
  }

  return response.json(result)
})
