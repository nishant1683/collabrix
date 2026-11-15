import React, { useEffect, useState } from 'react'
import { BarChart3, Clock3 } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { DashboardBadge } from '../components/DashboardLayout'
import { getReports } from '../lib/api'

export function ReportsPage() {
  const { session } = useAuth()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getReports(session.access_token).then(setReport).catch((reason) => setError(reason.message))
  }, [session.access_token])

  return <div className="mx-auto max-w-7xl"><DashboardBadge /><p className="eyebrow mt-6">Reports</p><h1 className="heading mt-3">A clearer view of the work.</h1><p className="mt-4 max-w-xl text-mist">Reports are restricted to owner and admin roles. Financial amounts are intentionally excluded from this summary.</p>{error && <div className="mt-8 rounded-xl border border-pink/30 bg-pink/10 p-4 text-sm text-pink-100">{error}</div>}{report && <><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(report.counts).map(([label, value]) => <div key={label} className="card"><BarChart3 size={18} className="text-lilac" /><p className="mt-8 text-sm capitalize text-mist">{label}</p><p className="mt-2 text-3xl font-medium">{value}</p></div>)}</div><div className="mt-10 grid gap-5 lg:grid-cols-3"><ReportGroup title="Deals by status" values={report.dealsByStatus} /><ReportGroup title="Enquiries by status" values={report.enquiriesByStatus} /><ReportGroup title="Users by role" values={report.profilesByRole} /></div><p className="mt-6 flex items-center gap-2 text-xs text-mist"><Clock3 size={13} /> Generated {new Date(report.generatedAt).toLocaleString()}</p></>}</div>
}

function ReportGroup({ title, values }) {
  return <section className="card"><h2 className="font-medium">{title}</h2><div className="mt-5 space-y-3">{Object.entries(values).length ? Object.entries(values).map(([label, value]) => <div key={label} className="flex items-center justify-between text-sm"><span className="text-mist">{label.replaceAll('_', ' ')}</span><span className="text-white">{value}</span></div>) : <p className="text-sm text-mist">No records yet.</p>}</div></section>
}
