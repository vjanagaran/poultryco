'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProductResult } from '@/lib/api/discovery';
import { RatingDisplay } from '../RatingDisplay';
import { TrustBadge } from '../TrustBadge';

interface ProductCardProps {
  product: ProductResult;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number | null, unit: string | null) => {
    if (!price) return null;
    return `₹${price.toLocaleString()}${unit ? `/${unit}` : ''}`;
  };
  
  const price = formatPrice(product.price, product.price_unit);
  
  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      {/* Product Image */}
      <Link href={`/com/${product.business.business_slug}`} className="block relative h-48 bg-gray-100">
        {product.featured_image_url ? (
          <Image
            src={product.featured_image_url}
            alt={product.product_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
            📦
          </div>
        )}
        {product.is_available && (
          <div className="absolute top-2 right-2">
            <TrustBadge type="certified" label="In Stock" size="sm" />
          </div>
        )}
      </Link>
      
      <div className="p-4">
        {/* Product Info */}
        <Link 
          href={`/com/${product.business.business_slug}`}
          className="hover:text-green-600 transition-colors"
        >
          <h3 className="font-semibold text-base text-gray-900 line-clamp-2 mb-1">
            {product.product_name}
          </h3>
        </Link>
        
        {product.category?.name && (
          <p className="text-xs text-gray-500 mb-2">
            {product.category.name}
          </p>
        )}
        
        {product.short_description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.short_description}
          </p>
        )}
        
        {/* Trust Indicators */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
          {product.rating && product.rating > 0 && (
            <RatingDisplay 
              rating={product.rating} 
              reviewCount={product.review_count}
              size="sm"
            />
          )}
          {!product.is_available && (
            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
          )}
        </div>
        
        {/* Price */}
        {price && (
          <div className="mb-3">
            <p className="text-lg font-bold text-green-600">{price}</p>
          </div>
        )}
        
        {/* Seller Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <Link 
            href={`/com/${product.business.business_slug}`}
            className="hover:text-green-600 truncate flex-1"
          >
            {product.business.business_name}
          </Link>
          {product.business.location_city && (
            <span className="text-xs text-gray-500 ml-2">
              📍 {product.business.location_city}
            </span>
          )}
        </div>
        
        {/* Actions */}
        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
          Inquire Now
        </button>
      </div>
    </article>
  );
}

