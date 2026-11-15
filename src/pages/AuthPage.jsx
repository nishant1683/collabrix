import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

export function AuthPage() {
  const { configured, signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [status, setStatus] = useState('idle')
  const [authError, setAuthError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    setStatus('loading')
    setAuthError('')
    try {
      await signIn(form.email, form.password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (reason) {
      setStatus('error')
      setAuthError(getAuthError(reason))
    }
  }

  return <div className="min-h-screen bg-ink px-5 py-12 text-white sm:px-8"><div className="mx-auto max-w-md"><Link to="/" className="text-sm font-bold tracking-[0.32em]">COLLABRIX<span className="text-pink">.</span></Link><div className="mt-20 rounded-2xl border border-white/10 bg-panel p-6 sm:p-8"><LockKeyhole className="text-lilac" size={22} /><h1 className="mt-6 text-3xl font-medium">Sign in to your workspace.</h1><p className="mt-3 text-sm leading-6 text-mist">Use the Supabase Auth account provided for your COLLABRIX role.</p>{!configured && <Notice>Authentication is not configured. Add the public Supabase URL and anon key to the frontend environment.</Notice>}<form onSubmit={submit} className="mt-8 space-y-5"><label className="field-label" htmlFor="auth-email">Email<input id="auth-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field-input" /></label><label className="field-label" htmlFor="auth-password">Password<input id="auth-password" type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field-input" /></label>  <button type="submit" disabled={!configured || status === 'loading'} className="button-primary w-full">{status === 'loading' ? <><LoaderCircle size={16} className="animate-spin" /> Signing in</> : 'Sign in'}</button></form>{status === 'error' && <Notice>{authError}</Notice>}</div></div></div>
}

function getAuthError(error) {
  const message = error?.message?.toLowerCase() || ''
  if (message.includes('email not confirmed')) return 'Your email address has not been confirmed in Supabase Auth.'
  if (message.includes('invalid login credentials')) return 'The email or password is incorrect.'
  if (message.includes('failed to fetch')) return 'Supabase could not be reached. Check the project URL and network connection.'
  return 'Supabase could not sign you in. Check your account and try again.'
}

function Notice({ children }) {
  return <div className="mt-5 flex items-start gap-2 rounded-xl border border-pink/30 bg-pink/10 p-3 text-sm leading-6 text-pink-100"><AlertCircle size={16} className="mt-1 shrink-0 text-pink" />{children}</div>
}
