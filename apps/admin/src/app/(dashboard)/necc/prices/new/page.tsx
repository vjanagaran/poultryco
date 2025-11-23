import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceForm } from "@/components/necc/prices/PriceForm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewPricePage() {
  const supabase = await createClient();

  const { data: zones } = await supabase
    .from('necc_zones')
    .select('id, name')
    .eq('status', true)
    .order('name');

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

