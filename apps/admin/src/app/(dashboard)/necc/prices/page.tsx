import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceTable } from "@/components/necc/prices/PriceTable";
import { getPrices, getAllZones } from "@/lib/api/necc";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchParams {
  date?: string;
  zone?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function PricesPage({ searchParams }: Props) {
  const params = await searchParams;
  
  let prices = [];
  let zones = [];
  
  try {
    [prices, zones] = await Promise.all([
      getPrices({
        date: params.date,
        zoneId: params.zone,
        limit: 100,
      }),
      getAllZones(),
    ]);
    
    // Sort prices by date descending
    prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Sort zones by name
    zones.sort((a, b) => a.name.localeCompare(b.name));
    
    // Transform prices to match expected format
    prices = prices.map(p => ({
      ...p,
      necc_zones: p.zone ? {
        name: p.zone.name,
        slug: p.zone.slug,
      } : null,
    }));
  } catch (error) {
    console.error('Error fetching prices:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Price Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage NECC egg prices
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/necc/prices/daily">
            <Button variant="outline">📅 Daily Grid</Button>
          </Link>
          <Link href="/necc/prices/new">
            <Button>➕ Add Manual Price</Button>
          </Link>
        </div>
      </div>

      {/* Price Table */}
      <PriceTable 
        prices={prices || []} 
        zones={zones || []}
      />
    </div>
  );
}

