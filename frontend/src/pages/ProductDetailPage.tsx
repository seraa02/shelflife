import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Badge } from '@/components/ui/Badge';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .getProduct(id)
      .then(data => setProduct(data.product))
      .catch(err => setError(err instanceof Error ? err.message : 'Product not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <ErrorMessage
          title="Product not found"
          message={error || 'This product does not exist.'}
        />
        <div className="text-center mt-4">
          <Link to="/products" className="btn btn-secondary btn-sm">← Back to products</Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link to="/" className="hover:text-gray-900">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/products" className="hover:text-gray-900">Products</Link></li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-gray-900">
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="card flex items-center justify-center p-8 bg-gray-50 min-h-[400px]">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-80 max-w-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <Link
              to={`/products?category=${product.category.slug}`}
              className="text-sm font-medium text-brand-600 uppercase tracking-wide hover:text-brand-800 transition-colors"
            >
              {product.category.name}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2" aria-label={`Rating: ${product.rating} out of 5`}>
            <div className="flex text-amber-400 text-lg" aria-hidden="true">
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}
            </div>
            <span className="text-sm text-gray-500">
              {product.rating.toFixed(1)} ({product.ratingCount.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.price > 50 && (
              <span className="badge bg-green-100 text-green-700">Free shipping</span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div>
            {isOutOfStock ? (
              <Badge variant="danger">Out of stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning">Only {product.stock} left in stock</Badge>
            ) : (
              <Badge variant="success">In stock</Badge>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center rounded-lg border border-gray-200 overflow-hidden"
              role="group"
              aria-label="Quantity selector"
            >
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 text-lg font-medium disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="flex h-10 min-w-[3rem] items-center justify-center px-3 text-base font-medium"
                aria-live="polite"
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="flex h-10 w-10 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 text-lg font-medium disabled:opacity-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <Button
              variant={addedToCart ? 'secondary' : 'primary'}
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1"
              aria-live="polite"
            >
              {addedToCart ? '✓ Added to cart!' : isOutOfStock ? 'Out of stock' : 'Add to cart'}
            </Button>
          </div>

          <Link to="/cart" className="btn btn-ghost text-sm text-center text-brand-700 hover:text-brand-800">
            View cart →
          </Link>
        </div>
      </div>
    </div>
  );
}
