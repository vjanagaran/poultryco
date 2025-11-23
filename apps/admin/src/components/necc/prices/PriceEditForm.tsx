'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Zone {
  id: string;
  name: string;
}

interface Price {
  id: string;
  zone_id: string;
  date: string;
  suggested_price: number | null;
  prevailing_price: number | null;
  source: string;
}

interface Props {
  price: Price;
  zones: Zone[];
}

export function PriceEditForm({ price, zones }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    zone_id: price.zone_id,
    date: price.date,
    suggested_price: price.suggested_price?.toString() || '',
    prevailing_price: price.prevailing_price?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/necc/prices/${price.id}`, {
        method: 'PUT',
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
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to update price'}`);
      }
    } catch (_error) {
      alert('Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>
              <select
                value={formData.zone_id}
                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Price (₹ per 100 eggs)
              </label>
              <input
                type="number"
                value={formData.suggested_price}
                onChange={(e) => setFormData({ ...formData, suggested_price: e.target.value })}
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prevailing Price (₹ per 100 eggs)
              </label>
              <input
                type="number"
                value={formData.prevailing_price}
                onChange={(e) => setFormData({ ...formData, prevailing_price: e.target.value })}
                placeholder="505"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/necc/prices')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Price'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

