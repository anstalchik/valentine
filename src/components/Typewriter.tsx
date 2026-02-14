import { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string | string[];
  speed?: number;
  onComplete?: () => void;
  className?: string;
  skipOnEnter?: boolean;
  instant?: boolean;
}

export default function Typewriter({
  text,
  speed = 30,
  onComplete,
  className = '',
  skipOnEnter = true,
  instant = false,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [textArray, setTextArray] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // Convert text to array if it's a string
    const lines = Array.isArray(text) ? text : [text];
    setTextArray(lines);
    setDisplayedText('');
    setCurrentIndex(0);
    setLineIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (instant || prefersReducedMotion) {
      const allText = textArray.join('\n');
      setDisplayedText(allText);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    if (lineIndex >= textArray.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const currentLine = textArray[lineIndex];
    
    if (currentIndex < currentLine.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText((prev) => {
          const lines = prev.split('\n');
          lines[lineIndex] = currentLine.slice(0, currentIndex + 1);
          return lines.join('\n');
        });
        setCurrentIndex((prev) => prev + 1);
      }, speed);
    } else {
      // Move to next line
      if (lineIndex < textArray.length - 1) {
        setDisplayedText((prev) => prev + '\n');
        setLineIndex((prev) => prev + 1);
        setCurrentIndex(0);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, lineIndex, textArray, speed, instant, prefersReducedMotion, onComplete]);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!skipOnEnter || e.key !== 'Enter') return;
    
    if (!isComplete) {
      // Skip to end of ALL lines
      const allText = textArray.join('\n');
      setDisplayedText(allText);
      setCurrentIndex(textArray[textArray.length - 1]?.length ?? 0);
      setLineIndex(textArray.length);
      setIsComplete(true);
      onComplete?.();
    }    
  };

  useEffect(() => {
    if (skipOnEnter) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [skipOnEnter, isComplete, lineIndex, textArray]);

  return (
    <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {displayedText}
      {!isComplete && !prefersReducedMotion && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
}
