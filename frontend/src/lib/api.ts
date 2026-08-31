const API_BASE = import.meta.env.DEV
  ? '/api'
  : `${import.meta.env.VITE_API_URL ?? 'https://shelflife-api-o62g.onrender.com'}/api`;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Network error' }));
    throw new ApiError(body.error || `HTTP ${res.status}`, res.status);
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: import('@/types').User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: import('@/types').User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => request<{ user: import('@/types').User }>('/auth/me'),

  // Products
  getProducts: (params?: Record<string, string | number>) => {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return request<{
      products: import('@/types').Product[];
      pagination: import('@/types').Pagination;
    }>(`/products${qs}`);
  },

  getProduct: (id: string) =>
    request<{ product: import('@/types').Product }>(`/products/${id}`),

  getCategories: () =>
    request<{ categories: import('@/types').Category[] }>('/products/categories'),

  // Orders
  createOrder: (data: {
    items: { productId: string; quantity: number }[];
    shipping: import('@/types').ShippingAddress;
  }) =>
    request<{ order: import('@/types').Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrders: () => request<{ orders: import('@/types').Order[] }>('/orders'),

  getOrder: (id: string) => request<{ order: import('@/types').Order }>(`/orders/${id}`),
};
