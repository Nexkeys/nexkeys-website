import type { Metadata } from 'next';
import { InternshipPortal } from '@/components/sections/internship-portal';
import { TRACKS } from '@/lib/data/tracks';

export const metadata: Metadata = {
  title: 'Internship Programme',
  description: `Join the NexKeys Talent Accelerator. ${TRACKS.length} specialized tracks across engineering, design, AI, cloud, data and growth — mentorship, real projects, real shipping.`,
  openGraph: {
    title: 'NexKeys Talent Accelerator — Internship Programme',
    description: `${TRACKS.length} specialized tracks. Real projects. Real mentorship.`,
  },
};

export default function InternshipPage() {
  return <InternshipPortal />;
}
