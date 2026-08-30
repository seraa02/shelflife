import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center">
        <p className="text-8xl font-black text-brand-200 mb-4" aria-hidden="true">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  );
}
