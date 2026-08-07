'use client';

import dynamic from 'next/dynamic';
import { useCapabilities } from '@/hooks/use-capabilities';

/**
 * Load gate for the cinematic footer storm.
 *
 * `SiteFooter` is a server component, so importing `FooterStorm` from it
 * directly pushed the whole canvas renderer into the client bundle of every
 * single route — on phones too, where the effect is gated off and never draws
 * a frame. Paying for it there is pure waste.
 *
 * This wrapper does two things:
 *   1. Code-splits the storm into its own async chunk (`ssr: false` — it is
 *      canvas-only and has nothing to contribute to the HTML).
 *   2. Only requests that chunk once `useCapabilities` confirms the device
 *      can actually run it. A low-power or reduced-motion visitor never
 *      downloads the code at all.
 */
const FooterStorm = dynamic(
  () => import('@/components/shared/footer-storm').then((m) => m.FooterStorm),
  { ssr: false }
);

export function FooterStormMount() {
  const { canHeavy, reduced, ready } = useCapabilities();

  if (!ready || reduced || !canHeavy) return null;

  return <FooterStorm />;
}
