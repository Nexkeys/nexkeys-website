import type { TeamMember } from '@/lib/types';

/**
 * The team — Ernest is the active primary team member on the site.
 * Obediah's legacy profile and assets have been removed entirely.
 */
export const TEAM: TeamMember[] = [
  {
    id: 'ernest-uwaoma',
    name: 'Ernest Uwaoma',
    role: 'Founder & CEO',
    photo: '/images/team/ernest.jpg',
    bio: 'Ernest blends technical mastery with visionary architecture and leadership. His expertise in front-end, full-stack, and DevOps engineering allows NexKeys to deliver robust, scalable, and secure software systems. Passionate about innovation and efficiency, He ensures that every project not only meets industry standards but exceeds client expectations. His background in Computer and Software Engineering from Middlesex University equips him to navigate complex challenges with precision and creativity, turning ambitious ideas into polished digital products that drive real business results, as well as leading the entire NexKeys team.',
    skills: ['Full-Stack', 'Architecture', 'DevOps', 'Leadership', 'Innovation'],
    links: [
      {
        label: 'Connect on LinkedIn',
        href: 'https://www.linkedin.com/in/ernest-uwaoma-446846409',
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
