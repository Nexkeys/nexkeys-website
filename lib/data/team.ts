import type { TeamMember } from '@/lib/types';

/**
 * The team — two members, confirmed 2026-08-06 (plan §15 D2).
 * `team/aleksa.jpg` and `team/kristiyan.jpg` from the legacy assets are stale
 * and are deliberately NOT carried over.
 *
 * Bios are verbatim from legacy about.html, with ONE correction (plan §15 D3):
 * Obediah's bio said "His background in secure web development" while using
 * she/her elsewhere. Corrected to "Her background".
 */
export const TEAM: TeamMember[] = [
  {
    id: 'ernest-uwaoma',
    name: 'Ernest Uwaoma',
    role: 'Founder & CEO',
    photo: '/images/team/ernest.jpg',
    bio: 'Ernest blends technical mastery with visionary architecture. His expertise in front-end, full-stack, and DevOps engineering allows NexKeys to deliver robust, scalable, and secure software systems. Passionate about innovation and efficiency, Ernest ensures that every project not only meets industry standards but exceeds client expectations. His background in Computer and Software Engineering from Middlesex University equips him to navigate complex challenges with precision and creativity, turning ambitious ideas into polished digital products that drive real business results.',
    skills: ['Full-Stack', 'Architecture', 'DevOps', 'Frontend'],
    links: [
      {
        label: 'Connect on LinkedIn',
        href: 'https://www.linkedin.com/in/ernest-uwaoma-446846409',
        kind: 'linkedin',
      },
      {
        label: 'View Portfolio',
        href: 'https://ernestuwaomaportfolio.netlify.app',
        kind: 'portfolio',
      },
    ],
  },
  {
    id: 'obediah-miracle',
    name: 'Obediah Miracle',
    role: 'Co-Founder & Chief Security Officer',
    photo: '/images/team/obediah.jpg',
    bio: 'Obediah is a distinguished cybersecurity professional and ethical hacker who brings a rare combination of offensive and defensive security expertise to NexKeys. With deep proficiency in penetration testing and vulnerability assessments, she proactively identifies and eliminates critical weaknesses before adversaries can exploit them. As an ISO/IEC 27001:2022 Lead Auditor, Obediah designs and enforces information security management frameworks that keep client systems resilient, compliant, and audit-ready. Her background in secure web development ensures that every product NexKeys ships is built on a hardened foundation — security is never an afterthought but an integral part of the architecture from day one.',
    skills: [
      'Ethical Hacking',
      'Cybersecurity',
      'Penetration Testing',
      'ISO 27001',
      'Secure Development',
    ],
    links: [
      {
        label: 'Connect on LinkedIn',
        href: 'https://www.linkedin.com/in/obediah-miracle-ba0b08343',
        kind: 'linkedin',
      },
    ],
  },
];

/** Site-wide contact + social — legacy footer. */
export const SITE = {
  name: 'NexKeys',
  legalName: 'NexKeys Agency',
  domain: 'nexkeysagency.com.ng',
  url: 'https://nexkeysagency.com.ng',
  email: 'nexkeysagency@gmail.com',
  phone: '+234 803 300 4474',
  phoneHref: 'tel:+2348033004474',
  tagline: 'Your reliable outsourced IT partner.',
  description:
    'From new digital projects to process optimization and support, NexKeys partners with businesses to deliver impactful, measurable results.',
  socials: [
    { label: 'Facebook', href: 'https://web.facebook.com/profile.php?id=61583154317887' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/groups/15539052/' },
    { label: 'Instagram', href: 'https://www.instagram.com/nexkeysagency' },
    { label: 'X', href: 'https://x.com/nexkeysagency' },
  ],
} as const;

/**
 * Nav links now derive from the route manifest rather than being maintained
 * separately — that duplication is exactly what left the navbar pointing at
 * three routes that did not exist. See lib/data/routes.ts.
 */
export { NAV_ROUTES as NAV_LINKS } from '@/lib/data/routes';
