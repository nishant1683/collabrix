import React, { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, MoveUpRight } from 'lucide-react'
import { services } from './data/services'
import { EnquiryForm } from './components/EnquiryForm'

function Shell({ eyebrow, title, intro, children }) {
  return <section className="section-shell"><div className="mx-auto max-w-7xl"><p className="eyebrow">{eyebrow}</p><h1 className="display mt-5 max-w-5xl">{title}</h1>{intro && <p className="body-copy mt-6 max-w-2xl">{intro}</p>}{children}</div></section>
}

export function Home() {
  const [selected, setSelected] = useState('')
  return <><section className="relative overflow-hidden px-5 pb-24 pt-40 sm:px-8 sm:pt-52"><div className="hero-glow" /><div className="mx-auto max-w-7xl"><p className="eyebrow">+ Collabrix</p><h1 className="display mt-6 max-w-5xl">Collaboration, <span className="gradient-text">branding,</span> design & pamphlet — all in one place.</h1><p className="body-copy mt-7 max-w-xl">Tell us what you’re trying to make. We’ll bring the right creative energy, structure, and people around it.</p><div className="mt-10 flex flex-col gap-4 sm:flex-row"><Link to="/contact" className="button-primary">Choose your work <ArrowRight size={17} /></Link><Link to="/work" className="button-secondary">See our work <ChevronRight size={16} /></Link></div></div></section><section className="border-y border-white/10 bg-panel/50 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><p className="eyebrow">+ Services</p><h2 className="heading mt-4 max-w-xl">What do you need?</h2></div><p className="max-w-sm text-sm leading-6 text-mist">Choose a starting point and we’ll take it from there. Details available on enquiry.</p></div><div className="mt-12 grid gap-4 md:grid-cols-4">{services.map((service) => { const Icon = service.icon; return <button type="button" key={service.id} onClick={() => setSelected(service.id)} className={`service-picker text-left ${selected === service.id ? 'ring-2 ring-orange' : ''}`}><span className={`icon-wrap bg-gradient-to-br ${service.accent}`}><Icon size={20} /></span><span className="mt-8 block font-medium">{service.title}</span><span className="mt-2 block text-sm leading-6 text-mist">{service.short}</span></button> })}</div>{selected && <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl border border-orange/30 bg-orange/10 p-5 sm:flex-row sm:items-center"><p className="text-sm text-white">You selected <strong>{services.find((service) => service.id === selected)?.title}</strong>.</p><Link to={`/services/${selected}`} className="button-secondary whitespace-nowrap">Explore this service <ArrowRight size={15} /></Link></div>}</div></section><section className="px-5 py-24 sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-end"><div><p className="eyebrow">+ Why Collabrix</p><h2 className="heading mt-4">Good work starts with a good conversation.</h2></div><div><p className="body-copy">A clear enquiry-to-delivery process, thoughtful collaboration, and honest empty states while the public portfolio grows.</p><Link to="/how-it-works" className="link-arrow mt-7">See how it works <MoveUpRight size={16} /></Link></div></div></section></>
}

export function Services() {
  return <Shell eyebrow="+ Services" title="Four ways to move your work forward." intro="Every project is different. Requirement ke hisaab se quote milega. Service inclusions are details available on enquiry."><div className="mt-14 grid gap-5 md:grid-cols-2">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div></Shell>
}

function ServiceCard({ service }) {
  const Icon = service.icon
  return <article className="card group"><div className={`icon-wrap bg-gradient-to-br ${service.accent}`}><Icon size={21} /></div><h2 className="mt-8 text-2xl font-medium">{service.title}</h2><p className="mt-4 leading-7 text-mist">{service.description}</p><p className="mt-6 text-sm text-orange">Details available on enquiry.</p><Link to={`/services/${service.id}`} className="link-arrow mt-8">View service <ArrowRight size={15} /></Link></article>
}

export function ServiceDetail() {
  const { serviceId } = useParams()
  const service = services.find((item) => item.id === serviceId)
  if (!service) return <Shell eyebrow="+ Services" title="Service not found." intro="Choose one of the four Collabrix services."><Link to="/services" className="button-primary mt-8">Back to services</Link></Shell>
  const Icon = service.icon
  return <Shell eyebrow={`+ ${service.title}`} title={service.description} intro="Requirement ke hisaab se quote milega. Final details are shaped on enquiry."><div className="mt-12 grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div className="card"><div className={`icon-wrap bg-gradient-to-br ${service.accent}`}><Icon size={21} /></div><h2 className="mt-8 text-2xl font-medium">What this can include</h2><ul className="mt-6 space-y-4 text-sm leading-6 text-mist">{['Details available on enquiry', 'Scope shaped around your requirements', 'Revisions and delivery discussed privately'].map((item) => <li className="flex items-start gap-3" key={item}><Check size={16} className="mt-1 shrink-0 text-orange" />{item}</li>)}</ul><div className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm text-mist"><p>Team: <span className="text-white">{service.team}</span></p><p>Expected timing: <span className="text-white">Confirmed after requirements are reviewed.</span></p></div></div><div className="rounded-2xl border border-dashed border-white/15 bg-panel p-8 text-center"><p className="eyebrow">+ Sample work</p><h2 className="mt-5 text-2xl font-medium">Work will be added soon.</h2><p className="mt-4 text-sm leading-6 text-mist">Only permission-approved work will appear here.</p><Link to={`/contact?service=${service.id}`} className="button-primary mt-8">Work with this team <ArrowRight size={16} /></Link></div></div></Shell>
}

export function About() {
  return <Shell eyebrow="+ About" title="A place for good ideas to meet." intro="Collabrix is a service business for collaboration, branding, design, and pamphlet work. We’ll add the owner-approved story here as it is ready."><div className="mt-16 grid gap-5 md:grid-cols-3">{['Listen closely.', 'Think expansively.', 'Make it matter.'].map((item, index) => <div className="border-t border-white/20 pt-5" key={item}><span className="text-sm text-orange">0{index + 1}</span><h2 className="mt-12 text-2xl font-medium">{item}</h2><p className="mt-4 leading-7 text-mist">Details available on enquiry.</p></div>)}</div></Shell>
}

export function Work() {
  return <Shell eyebrow="+ Work" title="Good work will live here." intro="Only real, permission-approved Collabrix work will be published. No invented projects or placeholder clients."><div className="mt-14 rounded-2xl border border-dashed border-white/15 bg-panel p-10 text-center"><p className="text-lg font-medium">Our recent projects will be added soon.</p><p className="mt-3 text-sm text-mist">Come back when there is work we can share.</p></div></Shell>
}

export function Creators() {
  return <Shell eyebrow="+ Creators" title="The people behind the work." intro="Creator profiles will only appear with written permission. Private contacts will never be made public."><div className="mt-14 rounded-2xl border border-dashed border-white/15 bg-panel p-10 text-center"><p className="text-lg font-medium">Our creators will be here soon.</p><p className="mt-3 text-sm text-mist">Profiles will be added only after consent.</p></div></Shell>
}

export function HowItWorks() {
  const steps = [['01', 'Start with context', 'Tell us what you’re working on, what matters, and where you want to go.'], ['02', 'Shape the direction', 'We’ll align on the opportunity, the approach, and what good looks like.'], ['03', 'Make the work', 'The right people come together to build, refine, and move the idea forward.']]
  return <Shell eyebrow="+ How it works" title="A simple process, thoughtfully held." intro="The details flex around the project. The principle stays the same: clarity first, collaboration throughout."><div className="mt-16 space-y-5">{steps.map(([number, title, copy]) => <div className="grid gap-6 border-t border-white/15 py-8 md:grid-cols-[100px_1fr_1fr] md:items-start" key={number}><span className="text-sm text-orange">{number}</span><h2 className="text-2xl font-medium">{title}</h2><p className="leading-7 text-mist">{copy}</p></div>)}</div></Shell>
}

export function Contact() {
  const location = useLocation()
  const service = new URLSearchParams(location.search).get('service') || ''
  return <Shell eyebrow="+ Contact" title="Let’s make room for a good conversation." intro="Share a little about what you’re building. Your enquiry will only be marked as delivered after the backend confirms it has been stored."><div className="mt-12 grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border border-white/10 bg-panel p-6 sm:p-8"><h2 className="text-xl font-medium">Start with the brief you have.</h2><p className="mt-4 leading-7 text-mist">You do not need to have everything figured out. Contact details will be added when the owner provides them.</p></div><div className="rounded-2xl border border-white/10 bg-panel p-6 sm:p-8"><EnquiryForm selectedService={service} /></div></div></Shell>
}
