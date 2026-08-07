import type { Service, ProcessStep } from '@/lib/types';

/**
 * Six services, copy ported verbatim from legacy index.html (L166–211).
 * Emoji icons are replaced by real imagery on the feature tiles — plan §8.1.
 */
export const SERVICES: Service[] = [
  {
    id: 'web',
    title: 'Web Apps & Business Websites',
    description:
      'From complex SaaS applications to bespoke business platforms we build high-performance systems aligned with your goals and built to fuel growth.',
    tags: ['React', 'Next.js', 'TypeScript', 'NestJS'],
    icon: 'Layers',
    image: '/images/services/web-apps.jpg',
    span: 'feature',
  },
  {
    id: 'mobile',
    title: 'Mobile Apps',
    description:
      'Cross-platform iOS & Android experiences with React Native that feel genuinely native and perform brilliantly.',
    tags: ['iOS & Android'],
    icon: 'Smartphone',
    image: '/images/services/mobile-apps.png',
  },
  {
    id: 'design',
    title: 'UI/UX Design',
    description:
      'Award-quality design systems, interactive prototypes, and user experience strategy grounded in research and data.',
    tags: ['Design-First'],
    icon: 'Sparkles',
    image: '/images/services/ui-ux.jpg',
  },
  {
    id: 'landing',
    title: 'Landing Pages',
    description:
      'High-conversion product and marketing pages with A/B testing, SEO best practices, and Framer / Webflow delivery.',
    tags: ['Conversion-Focused'],
    icon: 'TrendingUp',
    image: '/images/services/landing-pages.jpg',
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    description:
      'Process automation, AI integrations, and smart workflows that save your team hundreds of hours per month.',
    tags: ['Next-Gen'],
    icon: 'Bot',
    image: '/images/services/ai-automation.jpg',
    span: 'wide',
  },
  {
    id: 'team',
    title: 'Technical Team as a Service',
    description:
      'Flexible, professional technical extension to your team with on-demand development, PM, and ongoing engineering support.',
    tags: ['Flexible'],
    icon: 'Users',
    image: '/images/services/team-as-a-service.jpg',
  },
];

/** Four-step process — copy from legacy index.html (L237–258). */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    num: '01',
    title: 'Discovery',
    description:
      'We dive deep into your goals, audience, and technical needs to define a clear, actionable roadmap.',
  },
  {
    num: '02',
    title: 'Design',
    description:
      'High-fidelity prototypes, design systems, and UX blueprints reviewed and iterated collaboratively with you.',
  },
  {
    num: '03',
    title: 'Build',
    description:
      'Agile development with weekly sprints, transparent progress updates, and continuous quality assurance.',
  },
  {
    num: '04',
    title: 'Launch & Scale',
    description:
      'Production deployment, Lighthouse audits, and ongoing support as your product scales and grows.',
  },
];

/** Home-page counters — legacy index.html (L137–154). */
export const STATS = [
  { value: 57, suffix: '+', label: 'Projects Delivered' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
  { value: 5, suffix: '+', label: 'Years of Expertise' },
  { value: 6, suffix: '+', label: 'Industries Served' },
] as const;

/** Marquee strip — legacy index.html (L107–130). */
export const TECH_MARQUEE = [
  'React',
  'Next.js',
  'Firebase',
  'Node.js',
  'TypeScript',
  'React Native',
  'Figma',
  'Tailwind CSS',
  'Framer',
  'Webflow',
  'AWS',
  'Supabase',
] as const;

/** Values bento — legacy about.html (L147–170). */
export const VALUES = [
  {
    id: 'client-first',
    title: 'Client-First Approach',
    description:
      'Every decision is made with your goals in mind. We measure success by your outcomes, not just deliverables.',
    icon: 'Target',
  },
  {
    id: 'innovate',
    title: 'Innovate Through IT',
    description:
      'We embrace emerging technologies — AI, automation, and modern frameworks — to keep your product ahead of the curve.',
    icon: 'Zap',
  },
  {
    id: 'honesty',
    title: 'Honesty & Integrity',
    description:
      'Transparent pricing, honest timelines, and direct communication — always. No surprises, ever.',
    icon: 'Handshake',
  },
  {
    id: 'simplicity',
    title: 'Simplicity & Accountability',
    description:
      'Complex problems deserve elegant solutions. We focus on clarity, ownership, and shipping things that actually work.',
    icon: 'Rocket',
  },
] as const;

export const CTA_METRICS = [
  { value: '48hr', label: 'Response Time' },
  { value: '100%', label: 'Transparent Pricing' },
  { value: 'NDA', label: 'On Request' },
] as const;
