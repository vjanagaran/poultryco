'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadToStorage } from '@/lib/storageUtils';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  businessId: string;
  onProductUpdated: () => void;
}

const PRODUCT_CATEGORIES = [
  'Feed & Nutrition',
  'Medicines & Vaccines',
  'Equipment & Machinery',
  'Chicks & DOCs',
  'Supplements',
  'Disinfectants',
  'Packaging',
  'Lab Supplies',
  'Services',
  'Other',
];

export function EditProductModal({ isOpen, onClose, product, businessId, onProductUpdated }: EditProductModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category: '',
    sub_category: '',
    price_range: '',
    unit: '',
    min_order_quantity: '',
    availability_status: 'in_stock' as string,
    is_featured: false,
  });

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        product_name: product.product_name || '',
        description: product.description || '',
        category: product.category || '',
        sub_category: product.sub_category || '',
        price_range: product.price_range || '',
        unit: product.unit || '',
        min_order_quantity: product.min_order_quantity || '',
        availability_status: product.availability_status || 'in_stock',
        is_featured: product.is_featured || false,
      });
      setExistingImages(product.images || []);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = existingImages.length + newImages.length;
    const remainingSlots = 5 - totalImages;
    const filesToAdd = files.slice(0, remainingSlots);

    setNewImages([...newImages, ...filesToAdd]);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (!confirm('Remove this image?')) return;

    try {
      const supabase = createClient();
      await supabase.from('product_images').delete().eq('id', imageId);
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image');
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const supabase = createClient();
      
      // Set all images to non-primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', product.id);
      
      // Set selected image as primary
      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);
      
      setExistingImages(
        existingImages.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Failed to set primary image');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const supabase = createClient();

      // Delete product (images will cascade delete)
      const { error } = await supabase
        .from('business_products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      onProductUpdated();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Update product
      const { error: productError } = await supabase
        .from('business_products')
        .update({
          product_name: formData.product_name,
          description: formData.description || null,
          category: formData.category || null,
          sub_category: formData.sub_category || null,
          price_range: formData.price_range || null,
          unit: formData.unit || null,
          min_order_quantity: formData.min_order_quantity || null,
          availability_status: formData.availability_status,
          is_featured: formData.is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (productError) throw productError;

      // Upload new images
      if (newImages.length > 0) {
        const currentMaxOrder = Math.max(...existingImages.map((img) => img.sort_order || 0), -1);
        
        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i];
          const result = await uploadToStorage(file, `products/${businessId}`, product.id);

          if (result.success && result.url) {
            const isFirstImage = existingImages.length === 0 && i === 0;
            
            await supabase.from('product_images').insert({
              product_id: product.id,
              image_url: result.url,
              is_primary: isFirstImage,
              sort_order: currentMaxOrder + i + 1,
            });
          }
        }
      }

      onProductUpdated();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Category & Sub-category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub-category</label>
              <input
                type="text"
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Price & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <input
                type="text"
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                placeholder="e.g., ₹2,500 - ₹3,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., per 50kg bag"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Min Order & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Quantity</label>
              <input
                type="text"
                value={formData.min_order_quantity}
                onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={formData.availability_status}
                onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          {/* Featured */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Feature this product</span>
            </label>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Images ({existingImages.length + newImages.length}/5)
            </label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative aspect-square group">
                    <Image
                      src={image.image_url}
                      alt="Product"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-1">
                      {!image.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(image.id)}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(image.id)}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    {image.is_primary && (
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New Images Preview */}
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image src={preview} alt={`New ${index + 1}`} fill className="object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {(existingImages.length + newImages.length) < 5 && (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                  <span className="text-sm text-gray-600">+ Add more images</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </button>
            <div className="flex-1"></div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading || deleting}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || deleting || !formData.product_name}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

