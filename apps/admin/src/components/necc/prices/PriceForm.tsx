'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Zone {
  id: string;
  name: string;
}

interface Props {
  zones: Zone[];
}

export function PriceForm({ zones }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    zone_id: '',
    date: new Date().toISOString().split('T')[0],
    suggested_price: '',
    prevailing_price: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/necc/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_id: formData.zone_id,
          date: formData.date,
          suggested_price: formData.suggested_price ? parseInt(formData.suggested_price) : null,
          prevailing_price: formData.prevailing_price ? parseInt(formData.prevailing_price) : null,
        }),
      });

      if (response.ok) {
        router.push('/necc/prices');
        router.refresh();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to save price');
      }
    } catch (_err) {
      setError('An error occurred while saving the price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Manual Price</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Zone & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone <span className="text-red-500">*</span>
              </label>
              <select
                name="zone_id"
                value={formData.zone_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Price (₹)
              </label>
              <input
                type="number"
                name="suggested_price"
                value={formData.suggested_price}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 550"
              />
              <p className="text-xs text-gray-500 mt-1">Per 100 eggs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prevailing Price (₹)
              </label>
              <input
                type="number"
                name="prevailing_price"
                value={formData.prevailing_price}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 555"
              />
              <p className="text-xs text-gray-500 mt-1">Per 100 eggs</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
            ℹ️ This price will be marked as <strong>source: manual</strong> and <strong>mode: MANUAL</strong>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Price'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/necc/prices')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

