import { Brush, Handshake, LayoutTemplate, Megaphone } from 'lucide-react'

export const services = [
  {
    id: 'collaboration',
    title: 'Collaboration',
    short: 'Bring the right people and opportunities together.',
    description: 'From outreach and coordination to campaign delivery, we help shape collaborations clearly.',
    icon: Handshake,
    accent: 'from-orange to-orangeDeep',
    team: 'Collaboration team'
  },
  {
    id: 'branding',
    title: 'Branding',
    short: 'Make your profile, page, or presence feel intentional.',
    description: 'A practical, distinctive brand direction built around how you want to be understood.',
    icon: Megaphone,
    accent: 'from-orangeDeep to-orange',
    team: 'Branding team'
  },
  {
    id: 'design',
    title: 'Design',
    short: 'Create scroll-stopping posts, thumbnails, and banners.',
    description: 'Ready-to-post creative direction with your brand colours, fonts, and point of view.',
    icon: Brush,
    accent: 'from-orange to-orangeSoft',
    team: 'Branding team'
  },
  {
    id: 'pamphlet',
    title: 'Pamphlet',
    short: 'Turn information into a clear print or digital piece.',
    description: 'Copy, layout, and a polished print-ready or digital pamphlet shaped around your need.',
    icon: LayoutTemplate,
    accent: 'from-orangeSoft to-orangeDeep',
    team: 'Branding team'
  }
]
