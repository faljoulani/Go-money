'use client';

import { useEffect, useRef } from 'react';

type Options = {
  /** When this becomes true, we scroll & focus */
  ready: boolean;
  /** Extra deps that should also trigger scroll+focus (e.g. key/language) */
  deps?: any[];
  /** 'auto' | 'smooth' | 'instant' (default) */
  behavior?: ScrollBehavior | 'instant';
  /** Return a custom scroll container (defaults to window) */
  container?: () => Window | HTMLElement | null | undefined;
  /** Optional ARIA label to set on the focus target */
  label?: string;
};

/**
 * Scroll to top and move keyboard focus to a hidden anchor when `ready` flips true,
 * or when any of the `deps` change.
 *
 * Returns a ref you attach to any element at the top of your content.
 */
export function useScrollFocus({
  ready,
  deps = [],
  behavior = 'instant',
  container,
  label,
}: Options) {
  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!ready) return;

    const scroller = container?.() ?? window;

    // Scroll to top (prefer non-animated to avoid layout jumps after data load)
    try {
      (scroller as any).scrollTo?.({ top: 0, behavior: behavior as ScrollBehavior });
    } catch {
      // Fallback for environments without ScrollToOptions
      (scroller as any).scrollTo?.(0, 0);
    }

    // Ensure the focus target is focusable, then focus it without re-scrolling
    const node = focusRef.current;
    if (node) {
      const prevTabIndex = node.getAttribute('tabindex');
      if (prevTabIndex == null) node.setAttribute('tabindex', '-1');
      if (label && !node.getAttribute('aria-label')) node.setAttribute('aria-label', label);

      node.focus({ preventScroll: true });

      // Cleanup: restore tabindex if we temporarily added it
      return () => {
        if (prevTabIndex == null) node.removeAttribute('tabindex');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, behavior, container, ...deps]);

  return focusRef;
}

