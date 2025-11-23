import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceTable } from "@/components/necc/prices/PriceTable";

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
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('necc_prices')
    .select('*, necc_zones(name, slug)')
    .order('date', { ascending: false })
    .limit(100);

  if (params.date) {
    query = query.eq('date', params.date);
  }

  if (params.zone) {
    query = query.eq('zone_id', params.zone);
  }

  const [pricesResult, zonesResult] = await Promise.all([
    query,
    supabase.from('necc_zones').select('id, name').order('name'),
  ]);

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
        prices={pricesResult.data || []} 
        zones={zonesResult.data || []}
      />
    </div>
  );
}

