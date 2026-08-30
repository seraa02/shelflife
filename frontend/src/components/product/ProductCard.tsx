import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { formatPrice, truncate } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
  };

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        to={`/products/${product.id}`}
        className="relative block overflow-hidden bg-gray-50"
        aria-label={`View ${product.title}`}
      >
        <img
          src={product.image}
          alt={product.title}
          className="h-56 w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 badge bg-orange-100 text-orange-700">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 badge bg-red-100 text-red-700">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-brand-600 uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
          <Link to={`/products/${product.id}`} className="hover:text-brand-700 transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">
              {truncate(product.title, 60)}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-1 text-xs text-amber-500" aria-label={`Rating: ${product.rating} out of 5`}>
          {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
          <span className="text-gray-400 ml-1">({product.ratingCount})</span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Add ${product.title} to cart`}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
}
