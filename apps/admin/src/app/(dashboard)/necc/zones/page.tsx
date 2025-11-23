import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ZoneTable } from "@/components/necc/zones/ZoneTable";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ZonesPage() {
  const supabase = await createClient();

  const { data: zones, error } = await supabase
    .from('necc_zones')
    .select('*')
    .order('sorting', { ascending: true });

  if (error) {
    console.error('Error fetching zones:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Zone Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all NECC zones ({zones?.length || 0} total)
          </p>
        </div>
        <Link href="/necc/zones/new">
          <Button>➕ Add New Zone</Button>
        </Link>
      </div>

      {/* Zone Table */}
      <ZoneTable zones={zones || []} />
    </div>
  );
}

