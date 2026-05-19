'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface RevealProps {
  children: ReactNode;
  /** Verzögerung in ms. */
  delay?: number;
  /** Distanz von der die Komponente eingeblendet wird. */
  y?: number;
  className?: string;
}

/**
 * Gestaffelte Reveal-Animation. Briefing §7 — 200–300 ms Stagger, nicht überanimieren.
 */
export function Reveal({ children, delay = 0, y = 12, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.2, 0.65, 0.3, 1], delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
