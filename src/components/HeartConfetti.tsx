import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Heart {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export default function HeartConfetti({ show }: { show: boolean }) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!show || prefersReducedMotion) return;

    const newHearts: Heart[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      delay: Math.random() * 0.5,
    }));

    setHearts(newHearts);
  }, [show, prefersReducedMotion]);

  if (!show || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ y: heart.y, x: `${heart.x}%`, opacity: 1 }}
            animate={{
              y: window.innerHeight + 50,
              x: `${heart.x + (Math.random() - 0.5) * 20}%`,
              opacity: [1, 1, 0],
              rotate: [0, Math.random() * 360],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: heart.delay,
              ease: 'easeOut',
            }}
            className="text-2xl absolute"
            style={{ left: `${heart.x}%` }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
