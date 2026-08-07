import type { Metadata } from 'next';
import { TERMS } from '@/lib/data/legal/terms';
import { SITE } from '@/lib/data/team';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The legal agreement governing your use of NexKeys Agency services — project terms, intellectual property, payment schedules and liability.',
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
