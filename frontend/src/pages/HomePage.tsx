import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';

export function HomePage() {
  const { categories, isLoading } = useCategories();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Find your next{' '}
            <span className="text-brand-300">favourite thing</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-200 max-w-2xl mx-auto mb-10">
            Curated products across electronics, fashion, and jewellery — all in one place.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 px-8 py-4 text-base font-semibold shadow-lg hover:bg-brand-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Shop now
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100" aria-label="Store features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🚚', title: 'Free shipping over $50', desc: 'On all orders above fifty dollars.' },
              { icon: '🔒', title: 'Secure checkout', desc: 'JWT-backed authentication, httpOnly cookies.' },
              { icon: '↩️', title: 'Easy returns', desc: '30-day return policy, no questions asked.' },
            ].map(f => (
              <div key={f.title} className="flex flex-col items-center gap-3">
                <span className="text-3xl" aria-hidden="true">{f.icon}</span>
                <h2 className="text-sm font-semibold text-gray-900">{f.title}</h2>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-bold text-gray-900 mb-8">
          Shop by category
        </h2>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="card p-6 text-center hover:shadow-md transition-shadow group"
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {cat.slug === 'electronics' ? '💻' :
                   cat.slug === 'jewelry' ? '💎' :
                   cat.slug === 'mens-clothing' ? '👔' : '👗'}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
                {cat._count && (
                  <p className="text-xs text-gray-500 mt-1">{cat._count.products} items</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
