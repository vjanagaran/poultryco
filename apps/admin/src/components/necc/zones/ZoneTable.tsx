'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Zone {
  id: string;
  name: string;
  slug: string;
  zone_type: string;
  state: string | null;
  city: string | null;
  status: boolean;
  sorting: number;
}

interface Props {
  zones: Zone[];
}

export function ZoneTable({ zones }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(filter.toLowerCase()) ||
      zone.slug.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === 'all' || zone.zone_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(id);
    try {
      const { deleteZone } = await import('@/lib/api/necc');
      await deleteZone(id);
      router.refresh();
    } catch (error: any) {
      alert(`Failed to delete zone: ${error.message || 'Unknown error'}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search zones..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="production_center">Production Center (PC)</option>
          <option value="consumption_center">Consumption Center (CC)</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>State</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sorting</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredZones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No zones found
                </TableCell>
              </TableRow>
            ) : (
              filteredZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell className="text-gray-600">{zone.slug}</TableCell>
                  <TableCell>
                    <Badge variant={zone.zone_type === 'production_center' ? 'default' : 'secondary'}>
                      {zone.zone_type === 'production_center' ? 'PC' : 'CC'}
                    </Badge>
                  </TableCell>
                  <TableCell>{zone.state || '-'}</TableCell>
                  <TableCell>{zone.city || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={zone.status ? 'default' : 'outline'}>
                      {zone.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{zone.sorting}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/necc/zones/${zone.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(zone.id, zone.name)}
                      disabled={deleting === zone.id}
                    >
                      {deleting === zone.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredZones.length} of {zones.length} zones
      </div>
    </div>
  );
}

