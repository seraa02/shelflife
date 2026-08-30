import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Badge } from '@/components/ui/Badge';

const statusVariant: Record<Order['status'], 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = () => {
    setIsLoading(true);
    api
      .getOrders()
      .then(data => setOrders(data.orders))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load orders'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <ErrorMessage message={error} onRetry={fetchOrders} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order history</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-5xl mb-4" aria-hidden="true">📦</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Your orders will appear here after you check out.</p>
          <Link to="/products" className="btn btn-primary">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <article key={order.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h2>
                    <Badge variant={statusVariant[order.status]}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-gray-900">{formatPrice(order.total)}</span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="btn btn-secondary text-sm"
                  >
                    View details
                  </Link>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {order.items.slice(0, 4).map(item => (
                  <img
                    key={item.id}
                    src={item.product.image}
                    alt={item.product.title}
                    className="h-12 w-12 flex-shrink-0 rounded object-contain border border-gray-100 bg-gray-50 p-1"
                  />
                ))}
                {order.items.length > 4 && (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
