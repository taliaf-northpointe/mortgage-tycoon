import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Info, Pin, PinOff, X } from 'lucide-react';
import { JOURNEY_DISPLAY } from '../../engine/constants';
import { getEntry } from '../../engine/content/glossary';
import { useGameStore } from '../../store/gameStore';
import styles from './GlossaryTerm.module.css';

const TOOLTIP_WIDTH = 300;
const TOOLTIP_MARGIN = 8;

type OpenMode = 'closed' | 'hover' | 'clicked';

/**
 * A glossary-linked mortgage term (GDD §4.1): renders **bold** + a ⓘ button.
 * Hover opens the cozy tooltip; click keeps it open; it can be pinned.
 * Escape and outside-click close it. Position is fixed (viewport-relative)
 * so it never gets clipped by scrolling boards or modals.
 */
export function GlossaryTerm({ termKey, children }: { termKey: string; children?: ReactNode }) {
  const entry = getEntry(termKey);
  const [mode, setMode] = useState<OpenMode>('closed');
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({});
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const hoverOutTimer = useRef<number | null>(null);
  const open = mode !== 'closed';

  // Progressive learning: appearing in the UI unlocks the term (GDD §4.1).
  useEffect(() => {
    if (entry) useGameStore.getState().unlockTerm(termKey);
  }, [termKey, entry !== undefined]);

  // A term counts as Learned once its tooltip has actually been read —
  // open for a beat (or click-opened) — not on a stray mouse pass.
  useEffect(() => {
    if (!open) return;
    const delay = mode === 'clicked' ? 0 : 500;
    const timer = window.setTimeout(() => useGameStore.getState().learnTerm(termKey), delay);
    return () => window.clearTimeout(timer);
  }, [open, mode, termKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode('closed');
        setPinned(false);
      }
    };
    const onPointerDown = (e: MouseEvent) => {
      if (pinned) return;
      const target = e.target as Node;
      const insideTrigger = wrapperRef.current?.contains(target) ?? false;
      const insideTooltip = tooltipRef.current?.contains(target) ?? false;
      if (!insideTrigger && !insideTooltip) setMode('closed');
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open, pinned]);

  if (!entry) return <>{children}</>;

  const show = (nextMode: Exclude<OpenMode, 'closed'>) => {
    if (hoverOutTimer.current !== null) {
      window.clearTimeout(hoverOutTimer.current);
      hoverOutTimer.current = null;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.max(
        TOOLTIP_MARGIN,
        Math.min(rect.left, window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_MARGIN),
      );
      // flush against the button so hover never crosses a dead zone
      setPosition({ top: rect.bottom, left });
    }
    setMode((current) => (current === 'clicked' ? current : nextMode));
  };

  // Grace period so the pointer can travel from the ⓘ into the tooltip.
  const hoverOut = () => {
    if (pinned) return;
    if (hoverOutTimer.current !== null) window.clearTimeout(hoverOutTimer.current);
    hoverOutTimer.current = window.setTimeout(() => {
      setMode((current) => (current === 'hover' ? 'closed' : current));
    }, 250);
  };

  return (
    <span className={styles.wrapper} ref={wrapperRef}>
      <strong>{children ?? entry.term}</strong>
      <button
        ref={buttonRef}
        type="button"
        className={styles.infoButton}
        aria-label={`What is ${entry.term}?`}
        aria-expanded={open}
        onClick={() => {
          if (mode === 'clicked' && !pinned) {
            setMode('closed');
          } else {
            show('hover');
            setMode('clicked');
          }
        }}
        onMouseEnter={() => show('hover')}
        onMouseLeave={hoverOut}
      >
        <Info size={12} aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <span
            ref={tooltipRef}
            className={styles.tooltip}
            style={position}
            role="dialog"
            aria-label={`Glossary: ${entry.term}`}
            onMouseEnter={() => show('hover')}
            onMouseLeave={hoverOut}
          >
          <span className={styles.tooltipHeader}>
            <strong>{entry.term}</strong>
            <button
              type="button"
              className={styles.tooltipTool}
              aria-label={pinned ? 'Unpin' : 'Pin open'}
              aria-pressed={pinned}
              onClick={() => {
                setMode('clicked');
                setPinned((p) => !p);
              }}
            >
              {pinned ? <PinOff size={12} /> : <Pin size={12} />}
            </button>
            <button
              type="button"
              className={styles.tooltipTool}
              aria-label="Close"
              onClick={() => {
                setMode('closed');
                setPinned(false);
              }}
            >
              <X size={12} />
            </button>
          </span>

          <span className={styles.tooltipBody}>{entry.definition}</span>

          <span className={styles.tooltipLabel}>Why it matters</span>
          <span className={styles.tooltipBody}>{entry.whyItMatters}</span>

          {entry.whereInProcess && (
            <>
              <span className={styles.tooltipLabel}>Where you are</span>
              <span className={styles.journey}>
                {JOURNEY_DISPLAY.map((step) => {
                  const here = step.stage === entry.whereInProcess;
                  return (
                    <span key={step.label} className={here ? styles.journeyHere : styles.journeyStep}>
                      {here ? '➡ ' : ''}
                      {step.label}
                    </span>
                  );
                })}
              </span>
            </>
          )}

            {entry.funFact && (
              <>
                <span className={styles.tooltipLabel}>Fun fact</span>
                <span className={styles.tooltipBody}>{entry.funFact}</span>
              </>
            )}
          </span>,
          document.body,
        )}
    </span>
  );
}
