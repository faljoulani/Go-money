'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('[BUILD-LOG] global-error.tsx boundary caught error:', error?.message, error?.stack, 'digest=', (error as any)?.digest);
  return (
    <html>
      <body>
        <div className="mx-auto max-w-3xl py-16 text-center">
          <h1 className="text-2xl font-semibold">Global Error</h1>
          <p className="mt-2 text-slate-600">An unexpected error occurred.</p>
          <button className="mt-4 rounded border px-4 py-2" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

