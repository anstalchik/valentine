import { useState, useEffect } from 'react';
import Typewriter from './Typewriter';

interface TerminalOverlayProps {
  messages: string[];
  duration?: number;
  onComplete: () => void;
  show: boolean;
}

export default function TerminalOverlay({
  messages,
  duration = 500,
  onComplete,
  show,
}: TerminalOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!show) {
      setIsVisible(false);
      setTypewriterComplete(false);
      return;
    }

    setIsVisible(true);
    setTypewriterComplete(false);

    if (prefersReducedMotion) {
      setTimeout(onComplete, 100);
      return;
    }

    // Wait for typewriter to complete, then show for a bit longer
    const checkComplete = setInterval(() => {
      if (typewriterComplete) {
        clearInterval(checkComplete);
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 200);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, 100);

    // Fallback timeout
    const fallbackTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 200);
    }, duration + 2000);

    return () => {
      clearInterval(checkComplete);
      clearTimeout(fallbackTimer);
    };
  }, [show, duration, onComplete, prefersReducedMotion, typewriterComplete]);

  if (!show && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center">
      <div className="font-mono text-green-400 text-sm space-y-1">
        {prefersReducedMotion ? (
          <div>{messages.join('\n')}</div>
        ) : (
          <Typewriter 
            text={messages} 
            speed={50} 
            instant={prefersReducedMotion}
            onComplete={() => setTypewriterComplete(true)}
          />
        )}
      </div>
    </div>
  );
}
