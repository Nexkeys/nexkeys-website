'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setVisible(y > 600));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="fixed bottom-8 right-6 z-[90] grid h-12 w-12 place-items-center rounded-full bg-gradient-gold text-bg shadow-gold sm:right-8"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
