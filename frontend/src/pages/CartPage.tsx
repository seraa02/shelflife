import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { formatPrice } from '@/lib/utils';

export function CartPage() {
  const { items, clearCart, subtotal } = useCartStore();
  const sub = subtotal();
  const shipping = sub > 50 ? 0 : items.length > 0 ? 9.99 : 0;
  const total = sub + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl" aria-hidden="true">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-500">Add some products to get started.</p>
          <Link to="/products" className="btn btn-primary">Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="card divide-y divide-gray-100 px-4">
            <ul aria-label="Cart items">
              {items.map(item => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </ul>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Link to="/products" className="btn btn-ghost text-sm">
              ← Continue shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
              aria-label="Clear all items from cart"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Order summary */}
        <aside className="card p-6 h-fit" aria-labelledby="order-summary-heading">
          <h2 id="order-summary-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Order summary
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium">{formatPrice(sub)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shipping</dt>
              <dd className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : formatPrice(shipping)}
              </dd>
            </div>
            {sub > 0 && sub <= 50 && (
              <div className="text-xs text-gray-500 bg-brand-50 rounded-lg p-2">
                Add {formatPrice(50 - sub)} more for free shipping!
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="btn btn-primary w-full mt-6 text-base">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
