import { supabase } from '../supabase.js'

export async function requireUser(request, response, next) {
  if (!supabase) {
    return response.status(503).json({ error: 'Authentication is not configured.' })
  }

  const header = request.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return response.status(401).json({ error: 'Authentication required.' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return response.status(401).json({ error: 'Invalid authentication token.' })

  request.user = data.user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .maybeSingle()
  if (profileError) return next(profileError)
  request.userRole = profile?.role || 'client'
  request.profile = profile
  next()
}

export function requireRole(...roles) {
  return async (request, response, next) => {
    const role = request.userRole
    if (!roles.includes(role)) return response.status(403).json({ error: 'You do not have permission to access this resource.' })
    next()
  }
}
