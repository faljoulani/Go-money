export default function NotFound() {
  try { console.log('[BUILD-LOG] Rendering not-found.tsx'); } catch {}
  return (
    <section className="mx-auto max-w-3xl py-16 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
    </section>
  );
}
