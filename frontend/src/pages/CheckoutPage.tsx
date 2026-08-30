import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { ShippingAddress } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Step = 'shipping' | 'review';

const initialAddress: ShippingAddress = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
};

export function CheckoutPage() {
  const [step, setStep] = useState<Step>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialAddress);
  const [fieldErrors, setFieldErrors] = useState<Partial<ShippingAddress>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items, clearCart, subtotal } = useCartStore();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const sub = subtotal();
  const shipping = sub > 50 ? 0 : 9.99;
  const total = sub + shipping;

  const validateShipping = () => {
    const errors: Partial<ShippingAddress> = {};
    if (!shippingAddress.name.trim()) errors.name = 'Name is required';
    if (!shippingAddress.address.trim()) errors.address = 'Address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.zip.trim()) errors.zip = 'ZIP code is required';
    return errors;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateShipping();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { order } = await api.createOrder({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        shipping: shippingAddress,
      });
      clearCart();
      navigate(`/orders/${order.id}?confirmed=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link to="/products" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Step indicator */}
      <nav aria-label="Checkout steps" className="mb-8">
        <ol className="flex items-center gap-4">
          {(['shipping', 'review'] as Step[]).map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300" aria-hidden="true">—</span>}
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === s ? 'bg-brand-600 text-white' :
                  (step === 'review' && s === 'shipping') ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}
                aria-current={step === s ? 'step' : undefined}
              >
                {(step === 'review' && s === 'shipping') ? '✓' : i + 1}
              </span>
              <span className={`text-sm font-medium capitalize ${step === s ? 'text-brand-700' : 'text-gray-500'}`}>
                {s}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form / Review */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <div className="card p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-6">Shipping information</h1>
              <form onSubmit={handleShippingSubmit} noValidate>
                <div className="space-y-4">
                  <Input
                    label="Full name"
                    value={shippingAddress.name}
                    onChange={e => setShippingAddress(a => ({ ...a, name: e.target.value }))}
                    error={fieldErrors.name}
                    autoComplete="name"
                    required
                  />
                  <Input
                    label="Street address"
                    value={shippingAddress.address}
                    onChange={e => setShippingAddress(a => ({ ...a, address: e.target.value }))}
                    error={fieldErrors.address}
                    autoComplete="street-address"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={shippingAddress.city}
                      onChange={e => setShippingAddress(a => ({ ...a, city: e.target.value }))}
                      error={fieldErrors.city}
                      autoComplete="address-level2"
                      required
                    />
                    <Input
                      label="State"
                      value={shippingAddress.state}
                      onChange={e => setShippingAddress(a => ({ ...a, state: e.target.value }))}
                      error={fieldErrors.state}
                      autoComplete="address-level1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ZIP code"
                      value={shippingAddress.zip}
                      onChange={e => setShippingAddress(a => ({ ...a, zip: e.target.value }))}
                      error={fieldErrors.zip}
                      autoComplete="postal-code"
                      required
                    />
                    <div>
                      <label htmlFor="country" className="label">Country</label>
                      <select
                        id="country"
                        value={shippingAddress.country}
                        onChange={e => setShippingAddress(a => ({ ...a, country: e.target.value }))}
                        className="input"
                        autoComplete="country"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                    Continue to review →
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 'review' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-900">Order review</h1>
                <button
                  onClick={() => setStep('shipping')}
                  className="text-sm text-brand-700 hover:text-brand-800"
                >
                  Edit shipping
                </button>
              </div>

              {/* Shipping summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-900 mb-1">Shipping to:</p>
                <p className="text-gray-600">{shippingAddress.name}</p>
                <p className="text-gray-600">{shippingAddress.address}</p>
                <p className="text-gray-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                <p className="text-gray-600">{shippingAddress.country}</p>
              </div>

              {/* Items */}
              <ul className="divide-y divide-gray-100 mb-6">
                {items.map(item => (
                  <li key={item.product.id} className="flex items-center gap-3 py-3">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="h-12 w-12 rounded object-contain bg-gray-50 border border-gray-100 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              {/* Payment note */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                <span aria-hidden="true">ℹ️</span>
                This is a demo — no real payment is processed.
              </div>

              {error && (
                <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                className="w-full"
              >
                Place order — {formatPrice(total)}
              </Button>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="card p-6 h-fit" aria-labelledby="checkout-summary">
          <h2 id="checkout-summary" className="text-lg font-semibold text-gray-900 mb-4">
            Summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</dt>
              <dd>{formatPrice(sub)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shipping</dt>
              <dd>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-base">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          {user && (
            <p className="mt-4 text-xs text-gray-500">
              Ordering as <span className="font-medium">{user.email}</span>
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
