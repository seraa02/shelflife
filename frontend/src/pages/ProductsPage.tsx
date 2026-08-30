import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SearchBar } from '@/components/product/SearchBar';
import { CategoryFilter } from '@/components/product/CategoryFilter';
import { Pagination } from '@/components/product/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useDebounce } from '@/hooks/useDebounce';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const category = searchParams.get('category') || null;

  const { products, pagination, isLoading, error, refetch } = useProducts({
    page,
    category,
    search: debouncedSearch,
  });

  const { categories } = useCategories();

  // Sync search + reset page on search change
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      next.set('page', '1');
      return next;
    }, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  const handleCategorySelect = (slug: string | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (slug) next.set('category', slug); else next.delete('category');
      next.set('page', '1');
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        {pagination && !isLoading && (
          <p className="text-sm text-gray-500">
            {pagination.total} product{pagination.total !== 1 ? 's' : ''}
            {debouncedSearch && ` matching "${debouncedSearch}"`}
            {category && ` in ${categories.find(c => c.slug === category)?.name || category}`}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selected={category}
            onSelect={handleCategorySelect}
          />
        )}
      </div>

      {error ? (
        <ErrorMessage
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          {!isLoading && products.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No products found</h2>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
          <ProductGrid products={products} isLoading={isLoading} />
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
