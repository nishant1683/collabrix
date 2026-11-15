import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config, hasSupabaseConfig } from './config.js'
import { enquiryRouter } from './routes/enquiries.js'
import { dashboardRouter } from './routes/dashboard.js'
import { dealsRouter } from './routes/deals.js'
import { notificationsRouter } from './routes/notifications.js'
import { reportsRouter } from './routes/reports.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: config.clientOrigin, methods: ['GET', 'POST', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }))
app.use(express.json({ limit: '32kb' }))
app.use(rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
}))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, supabaseConfigured: hasSupabaseConfig() })
})
app.use('/api/enquiries', enquiryRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/deals', dealsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/reports', reportsRouter)
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`COLLABRIX API listening on http://localhost:${config.port}`)
  if (!hasSupabaseConfig()) console.warn('Supabase is not configured. Enquiries will not be stored.')
})
