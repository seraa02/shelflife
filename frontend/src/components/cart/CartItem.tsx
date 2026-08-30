import type { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;

  return (
    <li className="flex gap-4 py-4">
      <img
        src={product.image}
        alt={product.title}
        className="h-20 w-20 flex-shrink-0 rounded-lg object-contain border border-gray-100 bg-gray-50 p-1"
      />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
            {product.title}
          </p>
          <button
            onClick={() => removeItem(product.id)}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
            aria-label={`Remove ${product.title} from cart`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500">{product.category.name}</p>
        <div className="flex items-center justify-between mt-auto">
          <div
            className="flex items-center rounded-lg border border-gray-200 overflow-hidden"
            role="group"
            aria-label={`Quantity for ${product.title}`}
          >
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex h-7 w-7 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="flex h-7 min-w-[2rem] items-center justify-center px-2 text-sm font-medium text-gray-900" aria-live="polite">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="flex h-7 w-7 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}
