import React, { useEffect, useState } from 'react'
import { ArrowRight, LoaderCircle, MessageSquare, RefreshCcw } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { DashboardBadge } from '../components/DashboardLayout'
import { getDeals, getDealMessages, getDealRevisions, requestDealRevision, sendDealMessage, updateDealStatus } from '../lib/api'

const statuses = [
  ['requirement_received', 'Requirement received'],
  ['under_review', 'Under review'],
  ['proposal_sent', 'Proposal sent'],
  ['negotiation', 'Negotiation'],
  ['awaiting_approval', 'Awaiting approval'],
  ['approved', 'Approved'],
  ['work_in_progress', 'Work in progress'],
  ['review_and_revision', 'Review and revision'],
  ['completed', 'Completed']
]

export function DealsPage() {
  const { session } = useAuth()
  const [deals, setDeals] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDeals(session.access_token).then((body) => setDeals(body.deals)).catch((reason) => setError(reason.message))
  }, [session.access_token])

  return <div className="mx-auto max-w-7xl"><DashboardBadge /><p className="eyebrow mt-6">Deal management</p><h1 className="heading mt-3">Move the work forward.</h1><p className="mt-4 max-w-xl text-mist">Every deal is scoped to the signed-in user’s permitted client or team relationship. Negotiated amounts are never shown in this view.</p>{error && <div className="mt-8 rounded-xl border border-pink/30 bg-pink/10 p-4 text-sm text-pink-100">{error}</div>}<div className="mt-10 grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div className="space-y-3">{deals.length === 0 ? <div className="card text-sm leading-6 text-mist">No deals are available for this account yet.</div> : deals.map((deal) => <button type="button" key={deal.id} onClick={() => setSelected(deal)} className={`card w-full text-left ${selected?.id === deal.id ? 'ring-2 ring-pink' : ''}`}><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{deal.title}</p><p className="mt-2 text-sm text-mist">{deal.requirement.slice(0, 100)}{deal.requirement.length > 100 ? '…' : ''}</p></div><ArrowRight size={17} className="shrink-0 text-lilac" /></div><p className="mt-5 text-xs uppercase tracking-wider text-lilac">{statuses.find(([key]) => key === deal.status)?.[1] || deal.status}</p></button>)}</div>{selected ? <DealDetail deal={selected} token={session.access_token} onUpdated={(next) => { setSelected(next); setDeals((current) => current.map((deal) => deal.id === next.id ? next : deal)) }} /> : <div className="card flex min-h-64 items-center justify-center text-center text-sm text-mist">Select a deal to view its lifecycle, messages, and revisions.</div>}</div></div>
}

function DealDetail({ deal, token, onUpdated }) {
  const [messages, setMessages] = useState([])
  const [revisions, setRevisions] = useState([])
  const [message, setMessage] = useState('')
  const [revision, setRevision] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const currentIndex = statuses.findIndex(([key]) => key === deal.status)

  useEffect(() => {
    Promise.all([getDealMessages(token, deal.id), getDealRevisions(token, deal.id)]).then(([messageData, revisionData]) => {
      setMessages(messageData.messages)
      setRevisions(revisionData.revisions)
    }).catch((reason) => setError(reason.message))
  }, [deal.id, token])

  async function advance() {
    if (currentIndex >= statuses.length - 1) return
    setBusy(true)
    try {
      const body = await updateDealStatus(token, deal.id, statuses[currentIndex + 1][0])
      onUpdated({ ...deal, ...body.deal })
    } catch (reason) {
      setError(reason.message)
    } finally {
      setBusy(false)
    }
  }

  async function submitMessage(event) {
    event.preventDefault()
    if (!message.trim()) return
    try {
      const body = await sendDealMessage(token, deal.id, message)
      setMessages((current) => [...current, body.message])
      setMessage('')
    } catch (reason) {
      setError(reason.message)
    }
  }

  async function submitRevision(event) {
    event.preventDefault()
    if (!revision.trim()) return
    try {
      const body = await requestDealRevision(token, deal.id, revision)
      setRevisions((current) => [body.revision, ...current])
      setRevision('')
    } catch (reason) {
      setError(reason.message)
    }
  }

  return <section className="card"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xl font-medium">{deal.title}</p><p className="mt-2 text-sm leading-6 text-mist">{deal.requirement}</p></div><button type="button" className="button-primary !px-3 !py-2 text-sm" disabled={busy || currentIndex >= statuses.length - 1} onClick={advance}>{busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCcw size={15} />} Advance</button></div>{error && <p className="mt-5 rounded-lg bg-pink/10 p-3 text-sm text-pink-100">{error}</p>}<div className="mt-8 grid gap-2 sm:grid-cols-3">{statuses.map(([key, label], index) => <div key={key} className={`rounded-lg border p-3 text-xs ${index <= currentIndex ? 'border-violet/50 bg-violet/15 text-white' : 'border-white/10 text-mist'}`}><span className="block text-[.65rem] text-lilac">0{index + 1}</span><span className="mt-2 block">{label}</span></div>)}</div><div className="mt-8 grid gap-8 xl:grid-cols-2"><div><h2 className="flex items-center gap-2 text-lg font-medium"><MessageSquare size={17} className="text-lilac" /> Messages</h2><div className="mt-4 max-h-56 space-y-3 overflow-y-auto">{messages.length ? messages.map((item) => <p key={item.id} className="rounded-lg bg-ink p-3 text-sm leading-6 text-mist">{item.body}</p>) : <p className="text-sm text-mist">No messages yet.</p>}</div><form onSubmit={submitMessage} className="mt-4 flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} className="field-input !mt-0" placeholder="Write a message" aria-label="Message" /><button className="button-secondary !px-3" type="submit" aria-label="Send message"><ArrowRight size={16} /></button></form></div><div><h2 className="flex items-center gap-2 text-lg font-medium"><RefreshCcw size={17} className="text-lilac" /> Revisions</h2><div className="mt-4 max-h-56 space-y-3 overflow-y-auto">{revisions.length ? revisions.map((item) => <p key={item.id} className="rounded-lg bg-ink p-3 text-sm leading-6 text-mist">{item.description}</p>) : <p className="text-sm text-mist">No revision requests yet.</p>}</div><form onSubmit={submitRevision} className="mt-4 space-y-2"><textarea value={revision} onChange={(event) => setRevision(event.target.value)} className="field-input !mt-0" rows="3" placeholder="Describe a revision request" aria-label="Revision request" /><button className="button-secondary" type="submit">Request revision</button></form></div></div></section>
}
