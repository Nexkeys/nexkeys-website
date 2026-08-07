import type { Track } from '@/lib/types';

/**
 * The 10 internship tracks.
 *
 * `name` is the exact string written to Firestore `internshipApplications.track`
 * and matched by the admin filter. Changing any `name` orphans existing
 * applications — see plan §17.4 before touching these.
 */
export const TRACKS: Track[] = [
  {
    id: 'frontend',
    name: 'Frontend Engineering',
    icon: '💻',
    blurb: 'Interfaces people actually enjoy using.',
    question:
      'What feature or component have you enjoyed building the most while learning frontend web development?',
  },
  {
    id: 'backend',
    name: 'Backend Engineering',
    icon: '⚙️',
    blurb: 'The engine room — APIs, data, logic.',
    question:
      'In your own words, what is the difference between a GET request and a POST request?',
  },
  {
    id: 'mobile',
    name: 'Mobile App Development',
    icon: '📱',
    blurb: 'iOS and Android that feel genuinely native.',
    image: '/images/tracks/mobile.png',
    question:
      'Which mobile framework (React Native, Flutter, or Native) do you prefer, and what cross-platform app have you attempted to build?',
  },
  {
    id: 'devops',
    name: 'Cloud & DevOps Engineering',
    icon: '☁️',
    blurb: 'Ship safely, scale calmly.',
    image: '/images/tracks/cloud-ops.jpg',
    question:
      'In your own words, why is automated code deployment (CI/CD) or containerization (Docker) important when building scalable digital products?',
  },
  {
    id: 'uiux',
    name: 'UI/UX & Product Design',
    icon: '🎨',
    blurb: 'Research, systems, and taste.',
    image: '/images/tracks/ui-ux.jpg',
    question:
      'Name one app or website you use daily that has an amazing user experience, and tell us why you like it.',
  },
  {
    id: 'prompt',
    name: 'AI Prompt Engineering',
    icon: '🤖',
    blurb: 'Getting exact output from generative models.',
    image: '/images/tracks/ai.jpg',
    question:
      'If an AI tool like ChatGPT gives you a generic or inaccurate response, how do you rephrase your prompt to get what you want?',
  },
  {
    id: 'automation',
    name: 'Workflow & Process Automation',
    icon: '⚡',
    blurb: 'Delete the repetitive work entirely.',
    image: '/images/tracks/ai-automation.jpg',
    question:
      'What is one repetitive task in your daily life or work that you wish a computer script could do for you automatically?',
  },
  {
    id: 'datascience',
    name: 'Data Science & Analytics',
    icon: '📊',
    blurb: 'Turning raw numbers into decisions.',
    image: '/images/tracks/data-science.jpg',
    question:
      'What tool or skill (SQL, Excel, Python, PowerBI) are you most eager to master during this program?',
  },
  {
    id: 'growth',
    name: 'Growth & Digital Marketing',
    icon: '📈',
    blurb: 'Traffic that turns into revenue.',
    question:
      'If an online store is getting website traffic but zero sales, what is the first thing you would investigate?',
  },
  {
    id: 'copywriting',
    name: 'Brand Copywriting & Content Creation',
    icon: '✍️',
    blurb: 'Words that carry the brand.',
    question:
      'Write a quick 1-sentence caption promoting a free tech internship at NexKeys Agency.',
  },
];

export const TRACK_BY_ID = Object.fromEntries(
  TRACKS.map((t) => [t.id, t])
) as Record<Track['id'], Track>;

/** Legacy documents store the display name — this resolves them back to an id. */
export const TRACK_NAME_TO_ID = Object.fromEntries(
  TRACKS.map((t) => [t.name, t.id])
) as Record<string, Track['id']>;

export const TRACK_NAMES = TRACKS.map((t) => t.name);

/** Short labels for the admin filter chips. */
export const TRACK_SHORT_LABEL: Record<string, string> = {
  'Frontend Engineering': 'Frontend',
  'Backend Engineering': 'Backend',
  'Mobile App Development': 'Mobile Apps',
  'Cloud & DevOps Engineering': 'Cloud & DevOps',
  'UI/UX & Product Design': 'UI/UX',
  'AI Prompt Engineering': 'AI Prompting',
  'Workflow & Process Automation': 'Automation',
  'Data Science & Analytics': 'Data Science',
  'Growth & Digital Marketing': 'Growth',
  'Brand Copywriting & Content Creation': 'Copywriting',
};

export const PREFERRED_SCHEDULES = [
  'Morning (8am - 12pm)',
  'Afternoon (12pm - 4pm)',
  'Evening/Night (5pm - 9pm+)',
] as const;

export const SYNC_HOURS = [
  '9:00 AM',
  '10:00 AM',
  '1:00 PM',
  '2:00 PM',
  '6:00 PM',
  '8:00 PM',
  '9:00 PM',
] as const;
