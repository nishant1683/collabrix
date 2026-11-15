import React, { useEffect, useState } from 'react'
import { ArrowUpRight, BriefcaseBusiness, FileText, FolderKanban, Users } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { DashboardBadge } from '../components/DashboardLayout'
import { getDashboard } from '../lib/api'

const roleLabels = { owner: 'Owner', admin: 'Admin', collaboration: 'Collaboration team', branding: 'Branding team', client: 'Client' }

export function DashboardPage() {
  const { session } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard(session?.access_token).then(setData).catch(() => setError('Dashboard data is not available. Check the API and Supabase configuration.'))
  }, [session?.access_token])

  const role = data?.profile?.role || 'client'
  const isAdmin = role === 'owner' || role === 'admin'
  const cards = isAdmin
    ? [['Enquiries', data?.summary?.enquiries ?? '—', FileText], ['Clients', '—', Users], ['Projects', '—', FolderKanban], ['Deals', '—', BriefcaseBusiness]]
    : [['Active projects', '—', FolderKanban], ['Files', '—', FileText], ['Messages', '—', ArrowUpRight]]

  return <div className="mx-auto max-w-7xl"><DashboardBadge /><div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">{roleLabels[role] || 'Workspace'}</p><h1 className="heading mt-3">Good to see you.</h1><p className="mt-4 max-w-xl text-mist">Your secure COLLABRIX workspace, with access limited to your role.</p></div></div>{error && <div className="mt-8 rounded-xl border border-pink/30 bg-pink/10 p-4 text-sm text-pink-100">{error}</div>}<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="card"><Icon size={18} className="text-lilac" /><p className="mt-8 text-sm text-mist">{label}</p><p className="mt-2 text-3xl font-medium">{value}</p></div>)}</div><section className="mt-10 rounded-2xl border border-white/10 bg-panel p-6 sm:p-8"><h2 className="text-xl font-medium">{isAdmin ? 'Recent enquiries' : 'Your workspace'}</h2>{isAdmin && data?.recentEnquiries?.length > 0 ? <div className="mt-6 divide-y divide-white/10">{data.recentEnquiries.map((enquiry) => <div key={enquiry.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{enquiry.name}</p><p className="text-sm text-mist">{enquiry.service} · {enquiry.company || 'No company provided'}</p></div><span className="text-xs uppercase tracking-wider text-lilac">{enquiry.status}</span></div>)}</div> : <div className="mt-6 rounded-xl border border-dashed border-white/15 p-8 text-center text-sm leading-6 text-mist">{isAdmin ? 'No enquiries have been received yet.' : 'No workspace records are available yet.'}</div>}</section></div>
}

export function DashboardSection({ title, description }) {
  return <div className="mx-auto max-w-7xl"><DashboardBadge /><p className="eyebrow mt-6">Workspace</p><h1 className="heading mt-3">{title}</h1><p className="mt-4 max-w-xl text-mist">{description}</p><div className="mt-10 rounded-2xl border border-dashed border-white/15 bg-panel p-10 text-center text-sm leading-6 text-mist">This section is ready for Phase 4 data workflows and permissions.</div></div>
}
