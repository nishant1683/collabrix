import { supabase } from '../supabase.js'

export async function loadDeal(request, response, next) {
  if (!supabase) return response.status(503).json({ error: 'Deal service is not configured yet.' })
  const { data: deal, error } = await supabase
    .from('deals')
    .select('id, client_id, assigned_team, status, title, requirement')
    .eq('id', request.params.dealId)
    .maybeSingle()
  if (error) return next(error)
  if (!deal) return response.status(404).json({ error: 'Deal not found.' })

  const allowed = request.userRole === 'owner'
    || request.userRole === 'admin'
    || deal.client_id === request.user.id
    || deal.assigned_team === request.userRole
  if (!allowed) return response.status(403).json({ error: 'You do not have access to this deal.' })
  request.deal = deal
  next()
}

export function requireDealAdmin(request, response, next) {
  if (request.userRole !== 'owner' && request.userRole !== 'admin') {
    return response.status(403).json({ error: 'Only owners and admins can perform this action.' })
  }
  next()
}
