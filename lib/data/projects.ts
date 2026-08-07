import type { Project } from '@/lib/types';

/**
 * 16 projects, ported verbatim from legacy work.html (L432–780).
 * URLs, names, categories, labels and live badges are unchanged.
 *
 * `thumbnail` points at a local asset where one exists — this replaces the
 * runtime thum.io dependency for those cards (plan §3.3). Cards without a
 * local asset fall back to thum.io via `screenshotUrl()`.
 */

export function screenshotUrl(url: string): string {
  return `https://image.thum.io/get/width/720/crop/500/${url}`;
}

export const PROJECTS: Project[] = [
  {
    id: 'arobix',
    name: 'Arobix',
    title: 'Arobix — Finance Business Website',
    category: 'Web Design · Branding',
    categories: ['web', 'design'],
    url: 'https://arobix.netlify.app/',
    label: 'AR',
    isLive: false,
    thumbnail: '/images/projects/arobix.png',
    gradient: 'linear-gradient(135deg,#0e0900 0%,#2e1e00 100%)',
  },
  {
    id: 'currencyx',
    name: 'CurrencyX',
    title: 'CurrencyX — Real-time Exchange Calculator',
    category: 'Fintech · Web App',
    categories: ['web', 'fintech', 'design'],
    url: 'https://currencyexchange101.netlify.app/',
    label: 'FX',
    isLive: false,
    thumbnail: '/images/projects/currency-exchange.png',
    gradient: 'linear-gradient(135deg,#060504 0%,#1a1200 100%)',
  },
  {
    id: 'edulearn',
    name: 'EduLearn',
    title: 'EduLearn — E-Learning Platform',
    category: 'EdTech · UI/UX',
    categories: ['web', 'design'],
    url: 'https://edulearningfreeplatform.netlify.app/',
    label: 'EL',
    isLive: false,
    thumbnail: '/images/projects/edu-learning.png',
    gradient: 'linear-gradient(135deg,#0e0900 0%,#3a2600 100%)',
  },
  {
    id: 'kinkart',
    name: 'Kin-Kart',
    title: 'Kin-Kart — Mini E-Commerce Storefront',
    category: 'E-Commerce · Web Dev',
    categories: ['web', 'design', 'ecommerce'],
    url: 'https://kinkart.netlify.app/',
    label: 'KK',
    isLive: false,
    thumbnail: '/images/projects/kin-kart.png',
    gradient: 'linear-gradient(135deg,#050505 0%,#1a1400 100%)',
  },
  {
    id: 'valor-perks',
    name: 'Valor Perks',
    title: 'Valor Perks — Token Earning Platform',
    category: 'Fintech · Web App',
    categories: ['web', 'fintech', 'design'],
    url: 'https://valor-perks.web.app/',
    label: 'VP',
    isLive: false,
    gradient: 'linear-gradient(135deg,#060408 0%,#0e0520 100%)',
  },
  {
    id: 'gamevault',
    name: 'GameVault',
    title: 'GameVault — Secure Game Account Escrow',
    category: 'Fintech · Escrow Platform',
    categories: ['web', 'fintech'],
    url: 'https://gameplugvault.netlify.app/',
    label: 'GV',
    isLive: true,
    gradient: 'linear-gradient(135deg,#020508 0%,#04111e 100%)',
  },
  {
    id: 'zapcash',
    name: 'ZapCash Lite',
    title: 'ZapCash Lite — Earn Real Naira Online',
    category: 'Fintech · Micro-Earning App',
    categories: ['web', 'fintech'],
    url: 'https://zapcash-lite.netlify.app/',
    label: 'ZC',
    isLive: false,
    gradient: 'linear-gradient(135deg,#020804 0%,#051409 100%)',
  },
  {
    id: 'gombay',
    name: 'Gombay',
    title: 'Gombay — Premium Gaming Hub & Store',
    category: 'Gaming · Web Design',
    categories: ['web', 'design', 'gaming'],
    url: 'https://gombay.netlify.app/',
    label: 'GB',
    isLive: false,
    gradient: 'linear-gradient(135deg,#030307 0%,#08061c 100%)',
  },
  {
    id: 'goodfood',
    name: 'GoodFood',
    title: 'GoodFood — Premium Restaurant & Delivery Site',
    category: 'Restaurant · Editorial Web Design',
    categories: ['web', 'design', 'ecommerce'],
    url: 'https://goodfoodsite.netlify.app/',
    label: 'GF',
    isLive: false,
    thumbnail: '/images/projects/coffee-shop.jpg',
    gradient: 'linear-gradient(135deg,#0e0800 0%,#1c0e02 100%)',
  },
  {
    id: 'nitec',
    name: 'Nitec',
    title: 'Nitec — Underground Brand Storefront',
    category: 'E-Commerce · Full Storefront',
    categories: ['web', 'ecommerce', 'design'],
    url: 'https://nitec-ecommerce.netlify.app/',
    label: 'NT',
    isLive: false,
    gradient: 'linear-gradient(135deg,#050505 0%,#0a0c0c 100%)',
  },
  {
    id: 'stakex',
    name: 'StakeX',
    title: 'StakeX — Immersive Sports Betting Dashboard',
    category: 'Gaming · Betting Dashboard UI',
    categories: ['web', 'design', 'gaming'],
    url: 'https://stakexcasino.netlify.app/',
    label: 'SX',
    isLive: false,
    gradient: 'linear-gradient(135deg,#080400 0%,#180900 100%)',
  },
  {
    id: 'nexplay',
    name: 'NexPlay',
    title: 'NexPlay — Multiplayer 1v1 Gaming Arena',
    category: 'Gaming · Real-time 1v1 Platform',
    categories: ['web', 'gaming'],
    url: 'https://nexplays.netlify.app/',
    label: 'NP',
    isLive: true,
    gradient: 'linear-gradient(135deg,#030307 0%,#07081c 100%)',
  },
  {
    id: 'jenny-wines',
    name: 'Jenny Wines',
    title: 'Jenny Wines — Premium Wine Store & Delivery',
    category: 'E-Commerce · Wine Retail',
    categories: ['web', 'ecommerce', 'design'],
    url: 'https://jennywines.netlify.app/',
    label: 'JW',
    isLive: true,
    gradient: 'linear-gradient(135deg,#0e0204 0%,#1c0407 100%)',
  },
  {
    id: 'vrkids',
    name: 'VRKids',
    title: 'VRKids — Educational VR Platform for Children',
    category: 'EdTech · VR Experience Design',
    categories: ['web', 'design'],
    url: 'https://vr-kids.netlify.app/',
    label: 'VR',
    isLive: false,
    gradient: 'linear-gradient(135deg,#020508 0%,#040d18 100%)',
  },
  {
    id: 'sellapage',
    name: 'Sellapage',
    title: 'Sellapage — SaaS Digital Storefront Builder',
    category: 'Web · SaaS · E-Commerce Platform',
    categories: ['web', 'saas', 'ecommerce'],
    url: 'https://sellapage.com.ng/',
    label: 'SP',
    isLive: true,
    gradient: 'linear-gradient(135deg,#020608 0%,#041018 100%)',
  },
  {
    id: 'gameplug-hq',
    name: 'Game Plug HQ',
    title: 'Game Plug HQ — Tournament Organizer',
    category: 'Gaming · Tournament Platform',
    categories: ['web', 'gaming'],
    url: 'https://gameplug-efootball-tournament.netlify.app/',
    label: 'GP',
    isLive: false,
    gradient: 'linear-gradient(135deg,#030407 0%,#090514 100%)',
  },
];

/** The four featured on the home page. */
export const FEATURED_PROJECT_IDS = ['arobix', 'currencyx', 'edulearn', 'kinkart'];

export const FEATURED_PROJECTS = PROJECTS.filter((p) =>
  FEATURED_PROJECT_IDS.includes(p.id)
);

export const WORK_FILTERS = [
  { id: 'all', label: 'All Projects' },
  { id: 'web', label: 'Web' },
  { id: 'design', label: 'Design' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'saas', label: 'SaaS' },
] as const;

