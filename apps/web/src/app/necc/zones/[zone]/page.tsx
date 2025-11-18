import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getZoneBySlug } from "@/lib/api/necc-zones";
import { getZonePrices, getPricesByDate, getPriceStats } from "@/lib/api/necc-prices";
import { getTodayDate, getYearDateRange } from "@/lib/utils/necc-date";

interface PageProps {
  params: Promise<{ zone: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { zone } = await params;
  const zoneSlug = decodeURIComponent(zone);
  
  try {
    const zoneData = await getZoneBySlug(zoneSlug);
    
    if (!zoneData) {
      return {
        title: "Zone Not Found | PoultryCo",
      };
    }
    
    return {
      title: `NECC Egg Prices ${zoneData.name} - Rates, Trends & Analysis | PoultryCo`,
      description: `NECC egg prices for ${zoneData.name}. Historical data, expert insights, and market analysis.`,
      openGraph: {
        title: `NECC Egg Prices ${zoneData.name}`,
        description: `NECC egg prices for ${zoneData.name} with historical data and trends.`,
        url: `https://poultryco.net/necc/zones/${zoneSlug}`,
      },
      alternates: {
        canonical: `https://poultryco.net/necc/zones/${zoneSlug}`,
      },
    };
  } catch (error) {
    return {
      title: "Zone Not Found | PoultryCo",
    };
  }
}

export default async function ZonePage({ params }: PageProps) {
  const { zone } = await params;
  const zoneSlug = decodeURIComponent(zone);
  
  const zoneData = await getZoneBySlug(zoneSlug);
  if (!zoneData) {
    notFound();
  }

  const today = getTodayDate();
  const currentYear = new Date().getFullYear();
  const { start: yearStart } = getYearDateRange(currentYear);

  // Fetch zone data - optimized to only get this zone's data
  const [todayZonePrices, recentPrices, yearStats] = await Promise.all([
    getPricesByDate(today).then(prices => prices.filter(p => p.zone_id === zoneData.id)),
    getZonePrices(zoneData.id, undefined, today, 30), // Last 30 days
    getPriceStats(yearStart, today, zoneData.id),
  ]);

  const todayPrice = todayZonePrices[0] || null;
  const avgPrice = recentPrices.length > 0
    ? Math.round(recentPrices.reduce((sum, p) => sum + (p.suggested_price || 0), 0) / recentPrices.length)
    : null;
  const minPrice = recentPrices.length > 0
    ? Math.min(...recentPrices.map(p => p.suggested_price!).filter(p => p !== null))
    : null;
  const maxPrice = recentPrices.length > 0
    ? Math.max(...recentPrices.map(p => p.suggested_price!).filter(p => p !== null))
    : null;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/necc" className="hover:text-primary">NECC</Link>
            {" > "}
            <Link href="/necc/zones" className="hover:text-primary">Zones</Link>
            {" > "}
            <span>{zoneData.name}</span>
          </nav>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {zoneData.name}
                </h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  zoneData.zone_type === 'consumption_center'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {zoneData.zone_type === 'consumption_center' ? 'Consumption Center' : 'Production Center'}
                </span>
              </div>
              {zoneData.city && zoneData.state && (
                <p className="text-gray-600">{zoneData.city}, {zoneData.state}</p>
              )}
            </div>
          </div>
        </div>

        {/* Today's Price */}
        {todayPrice && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Price</h2>
            <div className="text-4xl font-bold text-primary">
              ₹{todayPrice.suggested_price}
            </div>
            {todayPrice.prevailing_price && (
              <p className="text-sm text-gray-500 mt-2">
                Prevailing: ₹{todayPrice.prevailing_price}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        {avgPrice && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">30-Day Average</h3>
              <p className="text-3xl font-bold text-primary">₹{avgPrice}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">30-Day Low</h3>
              <p className="text-3xl font-bold text-green-600">₹{minPrice}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">30-Day High</h3>
              <p className="text-3xl font-bold text-red-600">₹{maxPrice}</p>
            </div>
          </div>
        )}

        {/* Recent Prices Chart */}
        {recentPrices.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 30 Days Trend</h2>
            <div className="h-64 flex items-end gap-1">
              {recentPrices.slice(0, 30).reverse().map((price) => {
                const maxPrice = Math.max(...recentPrices.map(p => p.suggested_price || 0));
                const height = price.suggested_price ? (price.suggested_price / maxPrice) * 100 : 0;
                const date = new Date(price.date);
                
                return (
                  <Link
                    key={price.id}
                    href={`/necc/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`}
                    className="flex-1 group relative"
                    title={`${price.date}: ₹${price.suggested_price || 'N/A'}`}
                  >
                    <div className="w-full flex flex-col items-center">
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          price.suggested_price
                            ? 'bg-primary hover:bg-primary/80'
                            : 'bg-gray-200'
                        }`}
                        style={{ height: `${height}%`, minHeight: price.suggested_price ? '4px' : '2px' }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Year Stats */}
        {yearStats.count > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Year {currentYear} Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Year Average</h3>
                <p className="text-2xl font-bold text-primary">₹{yearStats.average}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Year Low</h3>
                <p className="text-2xl font-bold text-green-600">₹{yearStats.min}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Year High</h3>
                <p className="text-2xl font-bold text-red-600">₹{yearStats.max}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

