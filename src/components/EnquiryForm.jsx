import React, { useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from 'lucide-react'
import { services } from '../data/services'
import { createEnquiry } from '../lib/api'

const initialForm = { name: '', phoneCountry: '+91', phone: '', email: '', personType: '', services: [], instagram: '', message: '', website: '' }

export function EnquiryForm({ selectedService = '' }) {
  const [form, setForm] = useState({ ...initialForm, services: selectedService ? [selectedService] : [] })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function update(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Please add your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.personType) next.personType = 'Choose who you are.'
    if (form.services.length === 0) next.services = 'Choose at least one service.'
    if (form.message.trim().length < 20) next.message = 'Please share at least 20 characters about your project.'
    return next
  }

  async function submit(event) {
    event.preventDefault()
    const next = validate()
    if (Object.keys(next).length > 0) {
      setErrors(next)
      setStatus('idle')
      return
    }
    if (form.website) {
      setStatus('blocked')
      return
    }
    setStatus('loading')
    try {
      await createEnquiry({ ...form, service: form.services[0] })
      setStatus('success')
    } catch (error) {
      setStatus(error.status === 503 ? 'not-connected' : 'error')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" value={form.name} onChange={update} error={errors.name} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={update} error={errors.email} required />
      </div>
      <div className="grid gap-5 sm:grid-cols-[110px_1fr]"><label className="field-label" htmlFor="phoneCountry">Code<select id="phoneCountry" name="phoneCountry" value={form.phoneCountry} onChange={update} className="field-input"><option value="+91">+91</option><option value="+1">+1</option><option value="+44">+44</option></select></label><Field label="Phone" name="phone" value={form.phone} onChange={update} /></div>
      <fieldset><legend className="field-label">Aap kaun ho? <span className="text-orange">*</span></legend><div className="mt-3 flex flex-wrap gap-2">{['Creator', 'Brand', 'Other'].map((type) => <button type="button" key={type} onClick={() => setForm((current) => ({ ...current, personType: type.toLowerCase() }))} className={`choice-chip ${form.personType === type.toLowerCase() ? 'choice-chip-active' : ''}`}>{type}</button>)}</div>{errors.personType && <ErrorText text={errors.personType} />}</fieldset>
      <fieldset><legend className="field-label">What do you need? <span className="text-orange">*</span></legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{services.map((service) => <button type="button" key={service.id} onClick={() => setForm((current) => ({ ...current, services: current.services.includes(service.id) ? current.services.filter((item) => item !== service.id) : [...current.services, service.id] }))} className={`choice-chip text-left ${form.services.includes(service.id) ? 'choice-chip-active' : ''}`}>{service.title}</button>)}</div>{errors.services && <ErrorText text={errors.services} />}</fieldset>
      <Field label="Instagram handle (optional)" name="instagram" value={form.instagram} onChange={update} />
      <label className="field-label" htmlFor="message">Tell us about the project <span className="text-orange">*</span>
        <textarea id="message" name="message" value={form.message} onChange={update} rows="5" className="field-input resize-y" placeholder="A little context is a great place to start." />
      </label>
      {errors.message && <ErrorText text={errors.message} />}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" />
      </div>
      <p className="text-sm leading-6 text-mist">Requirement ke hisaab se quote milega.</p>
      <button type="submit" className="button-primary w-full sm:w-auto" disabled={status === 'loading'}>
        {status === 'loading' ? <><LoaderCircle size={17} className="animate-spin" /> Checking enquiry</> : <><Send size={16} /> Send enquiry</>}
      </button>
      {status === 'success' && <StatusBox icon={<CheckCircle2 size={18} />} tone="success">Your enquiry was delivered to COLLABRIX.</StatusBox>}
      {status === 'not-connected' && <StatusBox icon={<AlertCircle size={18} />} tone="warning">Your enquiry has <strong>NOT</strong> been delivered because the backend or database is not configured yet.</StatusBox>}
      {status === 'error' && <StatusBox icon={<AlertCircle size={18} />} tone="warning">Your enquiry could not be delivered. Please try again later.</StatusBox>}
      {status === 'blocked' && <StatusBox icon={<AlertCircle size={18} />} tone="warning">This enquiry could not be submitted.</StatusBox>}
    </form>
  )
}

function Field({ label, name, type = 'text', value, onChange, error, required }) {
  return <label className="field-label" htmlFor={name}>{label} {required && <span className="text-orange">*</span>}
    <input id={name} name={name} type={type} value={value} onChange={onChange} className="field-input" />
    {error && <ErrorText text={error} />}
  </label>
}

function ErrorText({ text }) {
  return <span className="mt-2 flex items-center gap-1 text-xs text-orange"><AlertCircle size={13} />{text}</span>
}

function StatusBox({ children, icon, tone }) {
  return <div className={`flex items-start gap-2 rounded-xl border p-4 text-sm leading-6 ${tone === 'warning' ? 'border-orange/30 bg-orange/10 text-orangeSoft' : 'border-violet/30 bg-violet/10'}`}><span className="mt-0.5">{icon}</span><span>{children}</span></div>
}
