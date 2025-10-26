'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BusinessProfile } from '../BusinessProfileView';
import { AddProductModal } from '../modals/AddProductModal';
import { EditProductModal } from '../modals/EditProductModal';

interface BusinessProductsSectionProps {
  business: BusinessProfile;
  isOwner: boolean;
}

export function BusinessProductsSection({ business, isOwner }: BusinessProductsSectionProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleInquire = (productId: string, productName: string) => {
    const primaryContact = business.contact_persons?.find(cp => cp.is_primary);
    const contactPersonId = primaryContact?.profile.id || business.owner_id;
    
    router.push(`/messages?start_with=${contactPersonId}&context=product_inquiry&business_id=${business.id}&product_id=${productId}&product_name=${encodeURIComponent(productName)}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Products & Services</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              ➕ Add Product
            </button>
          )}
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {business.products?.map((product) => {
          const primaryImage = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url;
          
          return (
            <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              {primaryImage ? (
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={primaryImage}
                    alt={product.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-6xl text-white opacity-50">📦</span>
                </div>
              )}

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 flex-1">{product.product_name}</h3>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setShowEditModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                {product.category && (
                  <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>
                )}
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                )}
                {product.price_range && (
                  <p className="text-sm font-medium text-green-600 mb-3">
                    {product.price_range}
                  </p>
                )}
                <button
                  onClick={() => handleInquire(product.id, product.product_name)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  💬 Inquire
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        businessId={business.id}
        onProductAdded={() => router.refresh()}
      />

      {/* Edit Product Modal */}
      {selectedProduct && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          businessId={business.id}
          onProductUpdated={() => router.refresh()}
        />
      )}
    </>
  );
}

