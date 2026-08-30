import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore(state => state.itemCount());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-brand-700 hover:text-brand-800 transition-colors"
          >
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
            ShelfLife
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'}`
              }
            >
              Shop
            </NavLink>
            {user && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Orders
              </NavLink>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <Link
              to="/cart"
              className="relative btn btn-ghost p-2"
              aria-label={`Shopping cart, ${itemCount} items`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white"
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="btn btn-ghost flex items-center gap-2 text-sm"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50 animate-fade-in"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <p className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">{user.email}</p>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary text-sm">Register</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="btn btn-ghost p-2 md:hidden"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle mobile menu"
              aria-expanded={menuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 animate-slide-up" role="navigation" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1">
              <NavLink to="/products" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Shop</NavLink>
              {user ? (
                <>
                  <NavLink to="/orders" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>My Orders</NavLink>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>Sign in</Link>
                  <Link to="/register" className="px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 rounded-lg" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
