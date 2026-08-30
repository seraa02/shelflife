import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Product, Pagination, Category } from '@/types';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category?: string | null;
  search?: string;
}

interface UseProductsReturn {
  products: Product[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { page = 1, limit = 12, category, search } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (category) params.category = category;
      if (search) params.search = search;
      const data = await api.getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, category, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, pagination, isLoading, error, refetch: fetchProducts };
}

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getCategories()
      .then(data => setCategories(data.categories))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load categories'))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading, error };
}
