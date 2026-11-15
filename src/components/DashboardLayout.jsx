import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, LogOut, PanelLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { getNotifications, markNotificationRead } from '../lib/api'

const dashboardLinks = [
  ['/', 'Overview'],
  ['/dashboard/enquiries', 'Enquiries'],
  ['/dashboard/clients', 'Clients'],
  ['/dashboard/creators', 'Creators'],
  ['/dashboard/brands', 'Brands'],
  ['/dashboard/deals', 'Deals'],
  ['/dashboard/proposals', 'Proposals'],
  ['/dashboard/projects', 'Projects'],
  ['/dashboard/team', 'Team management'],
  ['/dashboard/files', 'Files'],
  ['/dashboard/reports', 'Reports'],
  ['/dashboard/settings', 'Settings']
]

export function DashboardLayout() {
  const { user, session, signOut } = useAuth()
  const navigate = useNavigate()

  async function logout() {
    await signOut()
    navigate('/')
  }

  return <div className="min-h-screen bg-ink text-white">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-panel px-5 py-6 lg:block">
      <NavLink to="/" className="text-sm font-bold tracking-[0.32em]">COLLABRIX<span className="text-pink">.</span></NavLink>
      <p className="mt-12 px-3 text-[.68rem] font-bold uppercase tracking-[.2em] text-mist">Workspace</p>
      <nav className="mt-4 space-y-1">
        {dashboardLinks.map(([to, label]) => <NavLink key={to} to={to === '/' ? '/dashboard' : to} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-violet/20 text-white' : 'text-mist hover:bg-white/5 hover:text-white'}`}>{label}</NavLink>)}
      </nav>
      <div className="absolute inset-x-5 bottom-6 border-t border-white/10 pt-5">
        <p className="truncate px-3 text-xs text-mist">{user?.email}</p>
        <button type="button" onClick={logout} className="mt-3 flex items-center gap-2 px-3 text-sm text-mist hover:text-white"><LogOut size={15} /> Sign out</button>
      </div>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink/90 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3"><PanelLeft size={18} className="text-lilac" /><span className="text-sm text-mist">COLLABRIX workspace</span></div>
        <div className="flex items-center gap-4"><NotificationBell token={session?.access_token} /><span className="hidden text-xs text-mist sm:block">{user?.email}</span><button type="button" onClick={logout} aria-label="Sign out" className="text-mist hover:text-white"><LogOut size={17} /></button></div>
      </header>
      <main className="px-5 py-10 sm:px-8"><Outlet /></main>
    </div>
  </div>
}

function NotificationBell({ token }) {
  const [notifications, setNotifications] = React.useState([])

  React.useEffect(() => {
    if (token) getNotifications(token).then((body) => setNotifications(body.notifications)).catch(() => {})
  }, [token])

  async function readLatest() {
    const unread = notifications.find((notification) => !notification.read_at)
    if (unread) {
      await markNotificationRead(token, unread.id).catch(() => {})
      setNotifications((current) => current.map((item) => item.id === unread.id ? { ...item, read_at: new Date().toISOString() } : item))
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read_at).length
  return <button type="button" onClick={readLatest} aria-label={`${unreadCount} unread notifications`} className="relative text-mist hover:text-white"><Bell size={17} />{unreadCount > 0 && <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-pink px-1 text-center text-[10px] text-white">{unreadCount}</span>}</button>
}

export function DashboardBadge() {
  return <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs text-lilac"><ShieldCheck size={13} /> Protected workspace</span>
}

export function BackToSite() {
  return <NavLink to="/" className="link-arrow"><ArrowLeft size={15} /> Back to site</NavLink>
}
