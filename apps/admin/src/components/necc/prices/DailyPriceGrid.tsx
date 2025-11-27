'use client';

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
}

interface Price {
  id: string;
  zone_id: string;
  suggested_price: number | null;
  prevailing_price: number | null;
  source: string;
}

interface Props {
  zones: Zone[];
  prices: Price[];
  selectedDate: string;
}

export function DailyPriceGrid({ zones, prices, selectedDate }: Props) {
  const router = useRouter();

  // Create a map of zone_id -> price
  const priceMap = new Map(prices.map(p => [p.zone_id, p]));

  const handleDateChange = (newDate: string) => {
    router.push(`/necc/prices/daily?date=${newDate}`);
  };

  const getPrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const getNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => handleDateChange(getPrevDay())}>
          ← Previous
        </Button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button variant="outline" onClick={() => handleDateChange(getToday())}>
          Today
        </Button>
        <Button variant="outline" onClick={() => handleDateChange(getNextDay())}>
          Next →
        </Button>
      </div>

      {/* Grid */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone</TableHead>
              <TableHead className="text-right">Suggested</TableHead>
              <TableHead className="text-right">Prevailing</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => {
              const price = priceMap.get(zone.id);
              const hasPriceData = price && (price.suggested_price || price.prevailing_price);

              return (
                <TableRow key={zone.id} className={!hasPriceData ? 'bg-yellow-50' : ''}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell className="text-right">
                    {price?.suggested_price ? `₹${price.suggested_price}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {price?.prevailing_price ? `₹${price.prevailing_price}` : '-'}
                  </TableCell>
                  <TableCell>
                    {price ? (
                      <Badge variant={price.source === 'scraped' ? 'default' : 'secondary'}>
                        {price.source}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {hasPriceData ? (
                      <Badge variant="default">✓ Has Data</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Missing</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600">
        {prices.length} of {zones.length} zones have price data for this date
      </div>
    </div>
  );
}

