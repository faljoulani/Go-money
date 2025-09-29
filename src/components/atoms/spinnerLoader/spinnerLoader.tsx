import React from 'react';

/**
 * SpinnerLoader — widget-scoped loader.
 *
 * This version guarantees the overlay is confined to the widget by
 * rendering a `relative` wrapper around your content.
 *
 * Usage:
 * <SpinnerLoader show={isLoading}>
 *   <YourWidget />
 * </SpinnerLoader>
 */

export default function SpinnerLoader({
  show = false,
  children,
  message,
}: {
  show?: boolean;
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div className="relative">
      {children}
      {show && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          {message ? <span className="ml-3 text-sm text-neutral-700">{message}</span> : null}
        </div>
      )}
    </div>
  );
}

