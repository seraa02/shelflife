import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-lg font-bold text-brand-700">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
            ShelfLife
          </div>
          <nav className="flex gap-6 text-sm text-gray-500" aria-label="Footer navigation">
            <Link to="/products" className="hover:text-gray-900 transition-colors">Shop</Link>
            <Link to="/cart" className="hover:text-gray-900 transition-colors">Cart</Link>
            <Link to="/orders" className="hover:text-gray-900 transition-colors">Orders</Link>
          </nav>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ShelfLife. Portfolio project.
          </p>
        </div>
      </div>
    </footer>
  );
}
