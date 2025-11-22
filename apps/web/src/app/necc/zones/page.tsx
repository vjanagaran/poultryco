import { Metadata } from "next";
import Link from "next/link";
import { getAllZones, getZonesByType } from "@/lib/api/necc-zones";
import { getTodayPrices } from "@/lib/api/necc-prices";
import { NECCQuickLinks } from "@/components/necc/NECCQuickLinks";

export const metadata: Metadata = {
  title: "NECC Zones - All Production & Consumption Centers | PoultryCo",
  description: "View all NECC zones with current prices, trends, and analysis.",
};

export default async function ZonesPage() {
  const [allZones, productionZones, consumptionZones, todayPrices] = await Promise.all([
    getAllZones(),
    getZonesByType('production_center'),
    getZonesByType('consumption_center'),
    getTodayPrices(),
  ]);

  // Create a map of today's prices by zone
  const todayPriceMap = new Map(
    todayPrices.map((p) => [p.zone_id, p.suggested_price])
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          NECC Zones
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Zones</h3>
            <p className="text-3xl font-bold text-primary">{allZones.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Production Centers</h3>
            <p className="text-3xl font-bold text-green-600">{productionZones.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Consumption Centers</h3>
            <p className="text-3xl font-bold text-blue-600">{consumptionZones.length}</p>
          </div>
        </div>

        {/* Production Centers */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Production Centers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productionZones.map((zone) => {
              const todayPrice = todayPriceMap.get(zone.id);
              return (
                <Link
                  key={zone.id}
                  href={`/necc/zones/${zone.slug}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      PC
                    </span>
                  </div>
                  {zone.city && (
                    <p className="text-sm text-gray-500 mb-3">{zone.city}, {zone.state}</p>
                  )}
                  {todayPrice ? (
                    <p className="text-2xl font-bold text-primary">₹{todayPrice}</p>
                  ) : (
                    <p className="text-sm text-gray-400">No data for today</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Consumption Centers */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Consumption Centers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consumptionZones.map((zone) => {
              const todayPrice = todayPriceMap.get(zone.id);
              return (
                <Link
                  key={zone.id}
                  href={`/necc/zones/${zone.slug}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      CC
                    </span>
                  </div>
                  {zone.city && (
                    <p className="text-sm text-gray-500 mb-3">{zone.city}, {zone.state}</p>
                  )}
                  {todayPrice ? (
                    <p className="text-2xl font-bold text-primary">₹{todayPrice}</p>
                  ) : (
                    <p className="text-sm text-gray-400">No data for today</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* NECC Quick Links */}
        <div className="mt-12">
          <NECCQuickLinks />
        </div>
      </div>
    </div>
  );
}

