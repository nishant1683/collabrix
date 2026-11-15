import { Router } from 'express'
import { enquirySchema } from '../validation.js'
import { supabase } from '../supabase.js'
import { requireRole, requireUser } from '../middleware/auth.js'
import { notifyRoles } from '../notifications.js'

export const enquiryRouter = Router()

enquiryRouter.post('/', async (request, response, next) => {
  const parsed = enquirySchema.safeParse(request.body)
  if (!parsed.success) {
    return response.status(400).json({ error: 'Please check the enquiry fields and try again.', fields: parsed.error.flatten().fieldErrors })
  }
  if (parsed.data.website) return response.status(400).json({ error: 'The enquiry could not be submitted.' })
  if (!supabase) return response.status(503).json({ error: 'The enquiry service is not configured yet.' })

  const { name, phoneCountry, phone, email, company, personType, services, instagram, message } = parsed.data
  const { data, error } = await supabase
    .from('enquiries')
    .insert({ name, phone_country: phoneCountry, phone, email, company, person_type: personType, services, service: services[0], instagram, message, status: 'new', source: 'public-website' })
    .select('id, created_at')
    .single()

  if (error) return next(error)
  try {
    await notifyRoles({
      roles: ['owner', 'admin'],
      type: 'new_enquiry',
      title: 'New enquiry received',
      body: `${name} sent a new ${services[0]} enquiry.`,
      resourceType: 'enquiry',
      resourceId: data.id
    })
  } catch (notificationError) {
    console.error('Notification creation failed after enquiry insert:', notificationError)
  }
  return response.status(201).json({ enquiry: data })
})

enquiryRouter.get('/admin', requireUser, requireRole('owner', 'admin'), async (_request, response, next) => {
  if (!supabase) return response.status(503).json({ error: 'The enquiry service is not configured yet.' })
  const { data, error } = await supabase
    .from('enquiries')
    .select('id, name, email, company, service, message, status, created_at')
    .order('created_at', { ascending: false })
  if (error) return next(error)
  return response.json({ enquiries: data })
})
