'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('[BUILD-LOG] error.tsx boundary caught error:', error?.message, error?.stack, 'digest=', (error as any)?.digest);
  return (
    <div className="mx-auto max-w-3xl py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-slate-600">Please try again.</p>
      <button className="mt-4 rounded border px-4 py-2" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}

