import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getOrder(id)
      .then(data => setOrder(data.order))
      .catch(err => setError(err instanceof Error ? err.message : 'Order not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <ErrorMessage title="Order not found" message={error || 'This order does not exist.'} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Confirmation banner */}
      {isConfirmed && (
        <div
          role="alert"
          className="mb-8 rounded-xl bg-green-50 border border-green-200 p-6 text-center"
        >
          <p className="text-3xl mb-2" aria-hidden="true">🎉</p>
          <h1 className="text-xl font-bold text-green-800 mb-1">Order confirmed!</h1>
          <p className="text-sm text-green-700">
            Thanks for your order. We've received it and will begin processing it shortly.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant[order.status]} className="text-sm px-3 py-1">
          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <section className="card p-6" aria-labelledby="order-items">
            <h2 id="order-items" className="text-base font-semibold text-gray-900 mb-4">
              Items ordered
            </h2>
            <ul className="divide-y divide-gray-100">
              {order.items.map(item => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="h-16 w-16 rounded object-contain border border-gray-100 bg-gray-50 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Shipping */}
          <section className="card p-6" aria-labelledby="shipping-address">
            <h2 id="shipping-address" className="text-base font-semibold text-gray-900 mb-3">
              Shipping address
            </h2>
            <address className="not-italic text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
              <p>{order.shippingCountry}</p>
            </address>
          </section>
        </div>

        {/* Summary */}
        <aside className="card p-6 h-fit" aria-labelledby="order-total">
          <h2 id="order-total" className="text-base font-semibold text-gray-900 mb-4">
            Order total
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shipping</dt>
              <dd>{order.shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-8 flex gap-4">
        <Link to="/orders" className="btn btn-secondary">← Back to orders</Link>
        <Link to="/products" className="btn btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
