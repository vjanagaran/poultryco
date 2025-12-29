'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Price {
  id: string;
  date: string;
  suggested_price: number | null;
  prevailing_price: number | null;
  source: string;
  mode: string | null;
  necc_zones: {
    name: string;
    slug: string;
  };
}

interface Zone {
  id: string;
  name: string;
}

interface Props {
  prices: Price[];
  zones: Zone[];
}

export function PriceTable({ prices, zones }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');
  const [zoneFilter, setZoneFilter] = useState(searchParams.get('zone') || 'all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (dateFilter) params.set('date', dateFilter);
    if (zoneFilter !== 'all') params.set('zone', zoneFilter);
    router.push(`/necc/prices?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price entry?')) {
      return;
    }

    setDeleting(id);
    try {
      const { deletePrice } = await import('@/lib/api/necc');
      await deletePrice(id);
      router.refresh();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message || 'Unknown error'}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Zones</option>
          {zones.map(zone => (
            <option key={zone.id} value={zone.id}>{zone.name}</option>
          ))}
        </select>
        <Button onClick={handleFilterChange}>Apply Filters</Button>
        {(dateFilter || zoneFilter !== 'all') && (
          <Button 
            variant="outline" 
            onClick={() => {
              setDateFilter('');
              setZoneFilter('all');
              router.push('/necc/prices');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead className="text-right">Suggested</TableHead>
              <TableHead className="text-right">Prevailing</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No prices found
                </TableCell>
              </TableRow>
            ) : (
              prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">
                    {new Date(price.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{price.necc_zones?.name}</TableCell>
                  <TableCell className="text-right">
                    {price.suggested_price ? `₹${price.suggested_price}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {price.prevailing_price ? `₹${price.prevailing_price}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={price.source === 'scraped' ? 'default' : 'secondary'}>
                      {price.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {price.mode || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/necc/prices/${price.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(price.id)}
                        disabled={deleting === price.id}
                      >
                        {deleting === price.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600">
        Showing {prices.length} price records (limited to 100)
      </div>
    </div>
  );
}

