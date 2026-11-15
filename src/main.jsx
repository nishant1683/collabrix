import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/DashboardLayout'
import { AuthProvider } from './auth/AuthProvider'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage, DashboardSection } from './pages/DashboardPage'
import { DealsPage } from './pages/DealsPage'
import { ReportsPage } from './pages/ReportsPage'
import { About, Contact, Creators, Home, HowItWorks, ServiceDetail, Services, Work } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/work" element={<Work />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/sign-in" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="enquiries" element={<DashboardSection title="Enquiries" description="Review incoming project conversations with access controlled by your role." />} />
            <Route path="clients" element={<DashboardSection title="Clients" description="Client records will be available to authorized workspace roles." />} />
            <Route path="creators" element={<DashboardSection title="Creators" description="Creator collaboration records will be available to authorized workspace roles." />} />
            <Route path="brands" element={<DashboardSection title="Brands" description="Brand records will be available to authorized workspace roles." />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="proposals" element={<DashboardSection title="Proposals" description="Proposal records are intentionally deferred to Phase 4." />} />
            <Route path="projects" element={<DashboardSection title="Projects" description="Project records are intentionally deferred to Phase 4." />} />
            <Route path="team" element={<DashboardSection title="Team management" description="Team management is limited to authorized roles." />} />
            <Route path="files" element={<DashboardSection title="Files" description="Secure file workflows are intentionally deferred to Phase 4." />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<DashboardSection title="Settings" description="Workspace settings will be added in a later phase." />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
