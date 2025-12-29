'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Container } from '@/components/ui';
import Image from 'next/image';
import { uploadToStorage } from '@/lib/storageUtils';

interface BusinessEditContentProps {
  business: any;
}

const BUSINESS_TYPES = [
  { value: 'farm', label: 'Farm' },
  { value: 'feed_mill', label: 'Feed Mill' },
  { value: 'hatchery', label: 'Hatchery' },
  { value: 'processing_plant', label: 'Processing Plant' },
  { value: 'medicine_company', label: 'Medicine Company' },
  { value: 'equipment_supplier', label: 'Equipment Supplier' },
  { value: 'chick_supplier', label: 'Chick Supplier' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'retail', label: 'Retail' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'integrator', label: 'Integrator' },
  { value: 'other', label: 'Other' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export function BusinessEditContent({ business }: BusinessEditContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Info
    business_name: business.business_name || '',
    display_name: business.display_name || '',
    tagline: business.tagline || '',
    about: business.about || '',
    business_type: business.business_type || '',
    company_size: business.company_size || '',
    founded_year: business.founded_year || new Date().getFullYear(),
    website_url: business.website_url || '',
    logo_url: business.logo_url || null,
    cover_photo_url: business.cover_photo_url || null,
    
    // Contact Info
    headquarters_address: business.contact?.headquarters_address || '',
    headquarters_state: business.contact?.headquarters_state || '',
    headquarters_city: business.contact?.headquarters_city || '',
    phone: business.contact?.phone || '',
    email: business.contact?.email || '',
    whatsapp_business: business.contact?.whatsapp_business || '',
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const result = await uploadToStorage(file, 'business-logos', business.id);
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, logo_url: result.url }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const result = await uploadToStorage(file, 'business-covers', business.id);
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, cover_photo_url: result.url }));
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update business profile via API
      await apiClient.put(`/businesses/${business.id}`, {
        name: formData.business_name,
        displayName: formData.display_name || null,
        tagline: formData.tagline || null,
        about: formData.about || null,
        businessTypeId: formData.business_type,
        companySize: formData.company_size || null,
        foundedYear: formData.founded_year || null,
        websiteUrl: formData.website_url || null,
        logoUrl: formData.logo_url,
        coverPhotoUrl: formData.cover_photo_url,
        // Contact info should be included in the update
        contact: {
          headquartersAddress: formData.headquarters_address || null,
          headquartersState: formData.headquarters_state,
          headquartersCity: formData.headquarters_city || null,
          phone: formData.phone || null,
          email: formData.email || null,
          whatsappBusiness: formData.whatsapp_business || null,
        },
      });

      // Success!
      router.push(`/com/${business.business_slug}`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating business:', error);
      alert(error.message || 'Failed to update business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Business Profile</h1>
          <p className="text-gray-600">Update your business information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
            
            <div className="space-y-6">
              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cover Photo
                </label>
                <div className="relative h-48 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 overflow-hidden">
                  {formData.cover_photo_url && (
                    <Image
                      src={formData.cover_photo_url}
                      alt="Cover photo"
                      fill
                      className="object-cover"
                    />
                  )}
                  <label className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 hover:bg-white rounded-lg cursor-pointer transition-colors backdrop-blur-sm">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {uploadingCover ? '⏳ Uploading...' : '📷 Change Cover'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Logo
                </label>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                    {formData.logo_url ? (
                      <Image
                        src={formData.logo_url}
                        alt="Business logo"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        🏢
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                      <span className="font-medium text-gray-700">
                        {uploadingLogo ? 'Uploading...' : formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="If different from business name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  maxLength={150}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.tagline.length}/150 characters</p>
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Your Business
                </label>
                <textarea
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.about.length}/500 characters</p>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Size & Founded Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => setFormData({ ...formData, founded_year: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://www.yourwebsite.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headquarters State <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.headquarters_state}
                  onChange={(e) => setFormData({ ...formData, headquarters_state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.headquarters_city}
                  onChange={(e) => setFormData({ ...formData, headquarters_city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.headquarters_address}
                  onChange={(e) => setFormData({ ...formData, headquarters_address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Business Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp_business}
                  onChange={(e) => setFormData({ ...formData, whatsapp_business: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/com/${business.business_slug}`)}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}

