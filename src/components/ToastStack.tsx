import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
}

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastStack({ toasts }: ToastStackProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto glass-card px-4 py-2 rounded-lg cyber-glow text-sm text-white"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
