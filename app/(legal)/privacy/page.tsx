import type { Metadata } from 'next';
import { PRIVACY } from '@/lib/data/legal/privacy';
import { SITE } from '@/lib/data/team';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How NexKeys Agency collects, uses, stores and protects your personal data. NDPR 2019 compliant.',
  alternates: { canonical: `${SITE.url}/privacy` },
};

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
