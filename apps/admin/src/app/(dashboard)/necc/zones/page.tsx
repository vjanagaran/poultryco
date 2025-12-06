import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ZoneTable } from "@/components/necc/zones/ZoneTable";
import { getAllZones } from "@/lib/api/necc";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ZonesPage() {
  let zones = [];
  try {
    zones = await getAllZones();
    // Sort by sort_order
    zones.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  } catch (error) {
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

