import { Router } from 'express'
import { requireRole, requireUser } from '../middleware/auth.js'
import { supabase } from '../supabase.js'

export const reportsRouter = Router()
reportsRouter.get('/summary', requireUser, requireRole('owner', 'admin'), async (_request, response, next) => {
  const [enquiries, deals, proposals, profiles] = await Promise.all([
    supabase.from('enquiries').select('id, status, created_at'),
    supabase.from('deals').select('id, status, created_at'),
    supabase.from('proposals').select('id, status, created_at'),
    supabase.from('profiles').select('id, role')
  ])
  const failed = [enquiries, deals, proposals, profiles].find((result) => result.error)
  if (failed) return next(failed.error)
  return response.json({
    generatedAt: new Date().toISOString(),
    counts: {
      enquiries: enquiries.data.length,
      deals: deals.data.length,
      proposals: proposals.data.length,
      profiles: profiles.data.length
    },
    enquiriesByStatus: groupByStatus(enquiries.data),
    dealsByStatus: groupByStatus(deals.data),
    proposalsByStatus: groupByStatus(proposals.data),
    profilesByRole: groupByStatus(profiles.data, 'role')
  })
})

function groupByStatus(rows, key = 'status') {
  return rows.reduce((counts, row) => {
    counts[row[key]] = (counts[row[key]] || 0) + 1
    return counts
  }, {})
}
