import { z } from 'zod'

export const serviceIds = ['collaboration', 'branding', 'design', 'pamphlet']

export const enquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  phoneCountry: z.string().regex(/^\+\d{1,4}$/).default('+91'),
  phone: z.string().trim().max(30).optional().default(''),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).optional().default(''),
  personType: z.enum(['creator', 'brand', 'other']),
  services: z.array(z.enum(serviceIds)).min(1).max(4),
  service: z.enum(serviceIds).optional(),
  instagram: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(20).max(5000),
  website: z.string().max(200).optional().default('')
}).strict()

export const dealStatusSchema = z.object({
  status: z.enum([
    'requirement_received',
    'under_review',
    'proposal_sent',
    'negotiation',
    'awaiting_approval',
    'approved',
    'work_in_progress',
    'review_and_revision',
    'completed'
  ])
}).strict()

export const dealSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  requirement: z.string().trim().min(20).max(5000),
  assignedTeam: z.enum(['collaboration', 'branding']).nullable().optional(),
  negotiatedAmount: z.number().finite().nonnegative().optional(),
  currency: z.string().length(3).toUpperCase().default('INR')
}).strict()

export const proposalSchema = z.object({
  title: z.string().trim().min(1).max(160),
  scope: z.string().trim().min(20).max(5000),
  amount: z.number().finite().nonnegative().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'declined']).default('draft')
}).strict()

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(5000)
}).strict()

export const revisionSchema = z.object({
  description: z.string().trim().min(10).max(3000)
}).strict()

export const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255).regex(/^[^\\/:*?"<>|]+$/),
  mimeType: z.string().trim().max(120),
  fileSize: z.number().int().positive().max(52428800)
}).strict()
