import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireRole, requireUser } from '../middleware/auth.js'
import { loadDeal, requireDealAdmin } from '../middleware/dealAccess.js'
import { dealSchema, dealStatusSchema, messageSchema, proposalSchema, revisionSchema, uploadSchema } from '../validation.js'
import { notifyRoles, notifyUsers } from '../notifications.js'

const statuses = [
  'requirement_received',
  'under_review',
  'proposal_sent',
  'negotiation',
  'awaiting_approval',
  'approved',
  'work_in_progress',
  'review_and_revision',
  'completed'
]

export const dealsRouter = Router()
dealsRouter.use(requireUser)

dealsRouter.get('/', async (request, response, next) => {
  const query = supabase.from('deals').select('id, client_id, title, requirement, assigned_team, status, created_at, updated_at').order('updated_at', { ascending: false })
  const { data: deals, error } = request.userRole === 'owner' || request.userRole === 'admin'
    ? await query
    : await query.or(`client_id.eq.${request.user.id},assigned_team.eq.${request.userRole}`)
  if (error) return next(error)
  return response.json({ deals })
})

dealsRouter.post('/', requireRole('owner', 'admin'), async (request, response, next) => {
  const parsed = dealSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Please check the deal fields and try again.' })
  const { clientId, title, requirement, assignedTeam, negotiatedAmount, currency } = parsed.data
  const { data: deal, error } = await supabase.from('deals').insert({
    client_id: clientId,
    title,
    requirement,
    assigned_team: assignedTeam || null
  }).select('id, title, status, client_id, assigned_team, created_at').single()
  if (error) return next(error)
  if (negotiatedAmount !== undefined) {
    const { error: financialError } = await supabase.from('deal_financials').insert({ deal_id: deal.id, negotiated_amount: negotiatedAmount, currency })
    if (financialError) return next(financialError)
  }
  return response.status(201).json({ deal })
})

dealsRouter.patch('/:dealId/status', loadDeal, async (request, response, next) => {
  const parsed = dealStatusSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Invalid deal status.' })
  const currentIndex = statuses.indexOf(request.deal.status)
  const nextIndex = statuses.indexOf(parsed.data.status)
  const canUpdate = request.userRole === 'owner' || request.userRole === 'admin' || (request.userRole === request.deal.assigned_team && nextIndex >= currentIndex)
  if (!canUpdate || nextIndex < currentIndex || nextIndex > currentIndex + 1) return response.status(403).json({ error: 'This role cannot make that lifecycle transition.' })
  const { data, error } = await supabase.from('deals').update({ status: parsed.data.status, updated_at: new Date().toISOString() }).eq('id', request.deal.id).select('id, status, updated_at').single()
  if (error) return next(error)
  try {
    await notifyUsers({
      userIds: [request.deal.client_id],
      type: 'deal_status',
      title: 'Deal status updated',
      body: `${request.deal.title} moved to ${parsed.data.status.replaceAll('_', ' ')}.`,
      resourceType: 'deal',
      resourceId: request.deal.id
    })
  } catch (notificationError) {
    console.error('Deal status notification failed:', notificationError)
  }
  return response.json({ deal: data })
})

dealsRouter.get('/:dealId/proposals', loadDeal, async (request, response, next) => {
  const { data, error } = await supabase.from('proposals').select('id, deal_id, version, title, scope, amount, status, created_at').eq('deal_id', request.deal.id).order('version', { ascending: false })
  if (error) return next(error)
  return response.json({ proposals: data })
})

dealsRouter.post('/:dealId/proposals', loadDeal, requireDealAdmin, async (request, response, next) => {
  const parsed = proposalSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Please check the proposal fields and try again.' })
  const { data: latest } = await supabase.from('proposals').select('version').eq('deal_id', request.deal.id).order('version', { ascending: false }).limit(1).maybeSingle()
  const { data, error } = await supabase.from('proposals').insert({ deal_id: request.deal.id, version: (latest?.version || 0) + 1, created_by: request.user.id, ...parsed.data }).select('id, deal_id, version, title, scope, amount, status, created_at').single()
  if (error) return next(error)
  return response.status(201).json({ proposal: data })
})

dealsRouter.get('/:dealId/messages', loadDeal, async (request, response, next) => {
  const { data, error } = await supabase.from('deal_messages').select('id, sender_id, body, created_at').eq('deal_id', request.deal.id).order('created_at')
  if (error) return next(error)
  return response.json({ messages: data })
})

dealsRouter.post('/:dealId/messages', loadDeal, async (request, response, next) => {
  const parsed = messageSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Message cannot be empty.' })
  const { data, error } = await supabase.from('deal_messages').insert({ deal_id: request.deal.id, sender_id: request.user.id, body: parsed.data.body }).select('id, sender_id, body, created_at').single()
  if (error) return next(error)
  try {
    await notifyRoles({ roles: ['owner', 'admin'], type: 'message', title: 'New deal message', body: `A new message was added to ${request.deal.title}.`, resourceType: 'deal', resourceId: request.deal.id })
  } catch (notificationError) {
    console.error('Message notification failed:', notificationError)
  }
  return response.status(201).json({ message: data })
})

dealsRouter.get('/:dealId/revisions', loadDeal, async (request, response, next) => {
  const { data, error } = await supabase.from('deal_revisions').select('id, requested_by, description, status, created_at').eq('deal_id', request.deal.id).order('created_at', { ascending: false })
  if (error) return next(error)
  return response.json({ revisions: data })
})

dealsRouter.post('/:dealId/revisions', loadDeal, async (request, response, next) => {
  const parsed = revisionSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Please describe the requested revision.' })
  const { data, error } = await supabase.from('deal_revisions').insert({ deal_id: request.deal.id, requested_by: request.user.id, description: parsed.data.description }).select('id, requested_by, description, status, created_at').single()
  if (error) return next(error)
  try {
    await notifyRoles({ roles: ['owner', 'admin'], type: 'revision', title: 'New revision request', body: `A revision request was added to ${request.deal.title}.`, resourceType: 'deal', resourceId: request.deal.id })
  } catch (notificationError) {
    console.error('Revision notification failed:', notificationError)
  }
  return response.status(201).json({ revision: data })
})

dealsRouter.post('/:dealId/files/sign', loadDeal, async (request, response, next) => {
  const parsed = uploadSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Unsupported or oversized file metadata.' })
  const safeName = parsed.data.fileName.replace(/\s+/g, '-')
  const path = `${request.deal.id}/${crypto.randomUUID()}-${safeName}`
  const { data, error } = await supabase.storage.from('deal-files').createSignedUploadUrl(path)
  if (error) return next(error)
  const { error: recordError } = await supabase.from('deal_files').insert({ deal_id: request.deal.id, uploaded_by: request.user.id, storage_path: path, file_name: parsed.data.fileName, mime_type: parsed.data.mimeType, file_size: parsed.data.fileSize })
  if (recordError) return next(recordError)
  return response.status(201).json({ path, token: data.token, signedUrl: data.signedUrl })
})
