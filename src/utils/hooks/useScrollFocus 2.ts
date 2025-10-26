'use client';

import { useEffect, useRef } from 'react';

type Options = {
  ready: boolean;
  deps?: any[];
  behavior?: ScrollBehavior | 'instant';
  container?: () => Window | HTMLElement | null | undefined;
  target?: () => HTMLElement | null | undefined;
  offset?: number;
  label?: string;
};

function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
  if (!el || typeof window === 'undefined') return window;
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    const canScroll =
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight;
    if (canScroll) return node;
    node = node.parentElement;
  }
  return window;
}

export function useScrollFocus({
  ready,
  deps = [],
  behavior = 'instant',
  container,
  target,
  offset = 0,
  label,
}: Options) {
  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ready) return;

    const tgt = target?.() ?? focusRef.current;
    if (!tgt) return;

    const scroller = container?.() ?? getScrollParent(tgt);

    try {
      if (scroller === window) {
        const rect = tgt.getBoundingClientRect();
        const to = window.pageYOffset + rect.top - offset;
        window.scrollTo({ top: Math.max(0, to), behavior: behavior as ScrollBehavior });
      } else {
        const s = scroller as HTMLElement;
        const sRect = s.getBoundingClientRect();
        const tRect = tgt.getBoundingClientRect();
        const delta = tRect.top - sRect.top;
        const to = s.scrollTop + delta - offset;
        s.scrollTo({ top: Math.max(0, to), behavior: behavior as ScrollBehavior });
      }
    } catch {
      (scroller as any).scrollTo?.(0, 0);
    }
    const node = focusRef.current ?? tgt;
    if (node) {
      const prevTabIndex = node.getAttribute('tabindex');
      if (prevTabIndex == null) node.setAttribute('tabindex', '-1');
      if (label && !node.getAttribute('aria-label')) node.setAttribute('aria-label', label);
      node.focus({ preventScroll: true });
      return () => {
        if (prevTabIndex == null) node.removeAttribute('tabindex');
      };
    }
  }, [ready, behavior, container, target, offset, label, ...deps]);

  return focusRef;
}

