import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DailyPriceGrid } from "@/components/necc/prices/DailyPriceGrid";
import { getAllZones } from "@/lib/api/necc";
import { getPricesByDate } from "@/lib/api/necc";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchParams {
  date?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function DailyPriceGridPage({ searchParams }: Props) {
  const params = await searchParams;

  // Default to today
  const selectedDate = params.date || new Date().toISOString().split('T')[0];

  // Get all zones and prices for selected date
  const [zones, prices] = await Promise.all([
    getAllZones().then(zones => zones.filter(z => z.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))),
    getPricesByDate(selectedDate),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Daily Price Grid</h1>
          <p className="text-gray-600 mt-2">
            View all zones for {new Date(selectedDate).toLocaleDateString('en-IN')}
          </p>
        </div>
        <Link href="/necc/prices">
          <Button variant="outline">← Back to Prices</Button>
        </Link>
      </div>

      {/* Daily Grid */}
      <DailyPriceGrid 
        zones={zones} 
        prices={prices}
        selectedDate={selectedDate}
      />
    </div>
  );
}

