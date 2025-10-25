'use client';

import { useState } from 'react';

interface Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  isFirst: boolean;
  loading: boolean;
}

export default function BasicInfoStep({ data, onNext, onBack, isFirst, loading }: Props) {
  const [formData, setFormData] = useState({
    full_name: data.full_name || '',
    location_state: data.location_state || '',
    location_district: data.location_district || '',
    location_city: data.location_city || '',
    phone: data.phone || '',
    email: data.email || '',
    whatsapp_number: data.whatsapp_number || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const isValid = formData.full_name && formData.location_state && formData.phone && formData.email;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with the essentials</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Rajesh Kumar"
          />
          <p className="mt-1 text-xs text-gray-500">Your professional name as it will appear on your profile</p>
        </div>

        <div>
          <label htmlFor="location_state" className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            id="location_state"
            name="location_state"
            type="text"
            required
            value={formData.location_state}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tamil Nadu"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location_district" className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <input
              id="location_district"
              name="location_district"
              type="text"
              value={formData.location_district}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Namakkal"
            />
          </div>

          <div>
            <label htmlFor="location_city" className="block text-sm font-medium text-gray-700 mb-1">
              City/Town
            </label>
            <input
              id="location_city"
              name="location_city"
              type="text"
              value={formData.location_city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Namakkal"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
            placeholder="you@example.com"
            disabled
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Same as phone"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </form>
  );
}

