import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceForm } from "@/components/necc/prices/PriceForm";
import { getAllZones } from "@/lib/api/necc";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewPricePage() {
  const zones = await getAllZones().then(zones => 
    zones
      .filter(z => z.is_active)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(z => ({ id: z.id, name: z.name }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">➕ Add Manual Price</h1>
          <p className="text-gray-600 mt-2">Enter price data manually</p>
        </div>
        <Link href="/necc/prices">
          <Button variant="outline">← Back to Prices</Button>
        </Link>
      </div>

      {/* Form */}
      <PriceForm zones={zones || []} />
    </div>
  );
}

