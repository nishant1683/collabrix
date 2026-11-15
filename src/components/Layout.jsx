import React, { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowUpRight, Instagram, Menu, X } from 'lucide-react'

const links = [['/', 'Home'], ['/about', 'About'], ['/work', 'Work'], ['/creators', 'Creators'], ['/contact', 'Contact']]

export function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="text-sm font-bold tracking-[0.32em]" onClick={() => setOpen(false)}>
            COLLABRIX<span className="text-orange">.</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/sign-in" className="whitespace-nowrap text-sm text-mist transition hover:text-white">Sign in</Link>
            <Link to="/contact" className="button-primary whitespace-nowrap !px-4 !py-2 text-sm">Get started <ArrowUpRight size={15} /></Link>
          </nav>
          <button type="button" className="rounded-lg p-2 text-mist hover:text-white" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="fixed inset-x-0 bottom-0 top-[65px] z-40 overflow-y-auto border-t border-white/10 bg-ink px-5 py-5 sm:px-8">
            <div className="flex min-h-[60vh] flex-col justify-center gap-6">
              {links.map(([to, label]) => (
                <NavLink key={to} to={to} onClick={() => setOpen(false)} className="text-4xl font-medium text-mist hover:text-white">{label}</NavLink>
              ))}
              <Link to="/contact" onClick={() => setOpen(false)} className="button-primary mt-4 w-fit">Get started <ArrowUpRight size={16} /></Link>
              <a href="#" className="mt-6 inline-flex items-center gap-2 text-sm text-mist"><Instagram size={16} /> Socials coming soon</a>
            </div>
          </nav>
        )}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-white/10 px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-bold tracking-[0.32em]">COLLABRIX<span className="text-orange">.</span></div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-mist">Connect. Collaborate. Create.</p>
          </div>
          <div className="text-left text-sm text-mist sm:text-right">
            <p>Contact details coming soon.</p>
            <p className="mt-2 text-xs text-mist/60">© {new Date().getFullYear()} COLLABRIX. Placeholder site.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
