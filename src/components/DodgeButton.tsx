import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, ButtonProps } from '@heroui/react';

const COOLDOWN_MS = 160;
const DODGE_TRIGGER_RADIUS = 70;

const STEP_MIN = 70;
const STEP_MAX = 150;

const VIEWPORT_PAD = 18;
const TRANSITION_MS = 140;

const MAX_OFFSET_X = 520;
const MAX_OFFSET_Y = 240;

const FORBIDDEN_PAD = 16;

type Rect = { x: number; y: number; width: number; height: number };

interface DodgeButtonProps extends Omit<ButtonProps, 'onClick'> {
  mode?: 'dodge' | 'normal';
  onDodgeAttempt?: () => void;
  forbiddenAreas?: Rect[];
}

const rectsOverlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const expandRect = (r: Rect, pad: number) => ({
  x: r.x - pad,
  y: r.y - pad,
  w: r.width + pad * 2,
  h: r.height + pad * 2,
});

const isPointInside = (mx: number, my: number, r: Rect, pad = 0) =>
  mx >= r.x - pad && mx <= r.x + r.width + pad && my >= r.y - pad && my <= r.y + r.height + pad;

const DodgeButton = forwardRef<HTMLButtonElement, DodgeButtonProps>(({
  mode = 'normal',
  children,
  onDodgeAttempt,
  forbiddenAreas = [],
  className,
  ...buttonProps
}, ref) => {
  const placeholderBoxRef = useRef<HTMLDivElement | null>(null);
  const visualButtonRef = useRef<HTMLButtonElement | null>(null);
  const shieldRef = useRef<HTMLDivElement | null>(null);

  const lastJumpTime = useRef(0);
  const anchorRef = useRef<{ x: number; y: number } | null>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Anchor from placeholder slot in the card layout
  useEffect(() => {
    if (mode !== 'dodge') return;
    if (!placeholderBoxRef.current) return;

    const r = placeholderBoxRef.current.getBoundingClientRect();
    const anchor = { x: r.left, y: r.top };
    anchorRef.current = anchor;
    setPos(anchor);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'dodge') return;

    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastJumpTime.current < COOLDOWN_MS) return;
      if (!posRef.current) return;
      if (!shieldRef.current) return;

      const br = shieldRef.current.getBoundingClientRect();

      const centerX = br.left + br.width / 2;
      const centerY = br.top + br.height / 2;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      if (dist >= DODGE_TRIGGER_RADIUS) return;

      // Only suppress dodge if the cursor is actually on YES (small padding)
      // We assume the first forbidden area is YES (App.tsx builds areas starting with YES)
      const yesArea = forbiddenAreas[0];
      if (yesArea && isPointInside(e.clientX, e.clientY, yesArea, 18)) {
        return;
      }
      onDodgeAttempt?.();

      const anchor = anchorRef.current ?? posRef.current;

      const step = STEP_MIN + Math.random() * (STEP_MAX - STEP_MIN);
      const dx = step * (Math.random() < 0.5 ? -1 : 1) + (Math.random() - 0.5) * 24;
      const dy = (Math.random() - 0.5) * 70;

      let nextX = anchor.x + Math.max(-MAX_OFFSET_X, Math.min(MAX_OFFSET_X, (posRef.current!.x - anchor.x) + dx));
      let nextY = anchor.y + Math.max(-MAX_OFFSET_Y, Math.min(MAX_OFFSET_Y, (posRef.current!.y - anchor.y) + dy));

      nextX = Math.max(VIEWPORT_PAD, Math.min(nextX, window.innerWidth - br.width - VIEWPORT_PAD));
      nextY = Math.max(VIEWPORT_PAD, Math.min(nextY, window.innerHeight - br.height - VIEWPORT_PAD));

      const expanded = forbiddenAreas.map((r) => expandRect(r, FORBIDDEN_PAD));

      const isValid = (x: number, y: number) => {
        const noRect = { x, y, w: br.width, h: br.height };
        return expanded.every((fr) => !rectsOverlap(noRect, fr));
      };

      if (!isValid(nextX, nextY)) {
        let found = false;
        for (let i = 0; i < 12; i++) {
          const altStep = STEP_MIN + Math.random() * (STEP_MAX - STEP_MIN);
          const altDx = altStep * (Math.random() < 0.5 ? -1 : 1) + (Math.random() - 0.5) * 34;
          const altDy = (Math.random() - 0.5) * 110;

          let x = posRef.current!.x + altDx;
          let y = posRef.current!.y + altDy;

          x = Math.max(VIEWPORT_PAD, Math.min(x, window.innerWidth - br.width - VIEWPORT_PAD));
          y = Math.max(VIEWPORT_PAD, Math.min(y, window.innerHeight - br.height - VIEWPORT_PAD));

          if (isValid(x, y)) {
            nextX = x;
            nextY = y;
            found = true;
            break;
          }
        }

        if (!found) {
          const dir = Math.random() < 0.5 ? -1 : 1;
          nextX = Math.max(VIEWPORT_PAD, Math.min(posRef.current!.x + dir * STEP_MAX, window.innerWidth - br.width - VIEWPORT_PAD));
          nextY = posRef.current!.y;
        }
      }

      const next = { x: nextX, y: nextY };
      posRef.current = next;
      setPos(next);
      lastJumpTime.current = now;
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [mode, forbiddenAreas, onDodgeAttempt]);

  // Completely block click on the shield (so NO is never clickable)
  const block = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (mode !== 'dodge') {
    return (
      <Button
        ref={ref as any}
        {...buttonProps}
        className={className}
      >
        {children}
      </Button>
    );
  }

  // Match placeholder size to your lg button
  const PLACEHOLDER_W = 120;
  const PLACEHOLDER_H = 48;

  return (
    <>
      <div
        ref={placeholderBoxRef}
        className={className}
        style={{ width: PLACEHOLDER_W, height: PLACEHOLDER_H }}
      />

      {pos && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: PLACEHOLDER_W,
            height: PLACEHOLDER_H,
            zIndex: 50,
          }}
        >
          <Button
            ref={(node: HTMLButtonElement | null) => {
              if (typeof ref === 'function') ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
              visualButtonRef.current = node;
            }}
            {...buttonProps}
            className={className}
            style={{
              width: '100%',
              height: '100%',
              transition: prefersReducedMotion ? 'none' : `transform ${TRANSITION_MS}ms ease-out`,
              pointerEvents: 'none', // visual only, never clickable
            }}
          >
            {children}
          </Button>

          <div
            ref={shieldRef}
            onPointerDown={block}
            onPointerUp={block}
            onClick={block}
            onDoubleClick={block}
            onContextMenu={block}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              pointerEvents: 'auto', // catches hover and blocks clicks
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
});

DodgeButton.displayName = 'DodgeButton';
export default DodgeButton;
