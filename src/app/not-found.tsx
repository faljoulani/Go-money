export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-default mb-8">The page you are looking for does not exist.</p>
      <a 
        href="/" 
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryAlt transition"
      >
        Go Home
      </a>
    </div>
  );
}

