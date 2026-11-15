import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function ProtectedRoute({ children }) {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <div className="min-h-screen bg-ink px-5 pt-40 text-center text-mist">Checking your session…</div>
  if (!user) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  return children
}
