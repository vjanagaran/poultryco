import { Metadata } from "next";
import Link from "next/link";
import { getYearPrices, getPriceStats } from "@/lib/api/necc-prices";
import { getAllZones } from "@/lib/api/necc-zones";
import { getYearDateRange, getTodayDate } from "@/lib/utils/necc-date";

export const metadata: Metadata = {
  title: "NECC Egg Price Analysis - Trends, Insights & Expert Reviews | PoultryCo",
  description: "Comprehensive NECC egg price analysis with interactive charts, expert insights, and AI-powered predictions.",
  openGraph: {
    title: "NECC Egg Price Analysis",
    description: "Comprehensive NECC egg price analysis with interactive charts and expert insights.",
    url: "https://poultryco.net/necc/analysis",
  },
  alternates: {
    canonical: "https://poultryco.net/necc/analysis",
  },
};

export default async function AnalysisPage() {
  const currentYear = new Date().getFullYear();
  const { start, end } = getYearDateRange(currentYear);
  const today = getTodayDate();

  // Fetch data for analysis
  const [yearPrices, yearStats, zones] = await Promise.all([
    getYearPrices(currentYear),
    getPriceStats(start, today),
    getAllZones(),
  ]);

  // Group prices by month for trend analysis
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthPrices = yearPrices.filter(p => p.month === month && p.suggested_price !== null);
    if (monthPrices.length === 0) return { month, average: null, min: null, max: null, count: 0 };
    
    const prices = monthPrices.map(p => p.suggested_price!);
    return {
      month,
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: prices.length,
    };
  });

  // Calculate zone-wise averages
  const zoneAverages = zones.map(zone => {
    const zonePrices = yearPrices.filter(
      p => p.zone_id === zone.id && p.suggested_price !== null
    );
    if (zonePrices.length === 0) return { zone, average: null };
    
    const prices = zonePrices.map(p => p.suggested_price!);
    return {
      zone,
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };
  }).filter(z => z.average !== null).sort((a, b) => (b.average || 0) - (a.average || 0));

  // Calculate weekly trend (last 4 weeks)
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    
    const weekPrices = yearPrices.filter(
      p => {
        const priceDate = new Date(p.date);
        return priceDate >= weekStart && priceDate <= weekEnd && p.suggested_price !== null;
      }
    );
    
    if (weekPrices.length === 0) return { week: i + 1, average: null, label: `Week ${4 - i}` };
    
    const prices = weekPrices.map(p => p.suggested_price!);
    return {
      week: i + 1,
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      label: `Week ${4 - i}`,
    };
  }).reverse();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Price Analysis
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of NECC egg prices with trends and insights
          </p>
        </div>

        {/* Year Overview Stats */}
        {yearStats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Year Average</h3>
              <p className="text-3xl font-bold text-primary">₹{yearStats.average}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Year Low</h3>
              <p className="text-3xl font-bold text-green-600">₹{yearStats.min}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Year High</h3>
              <p className="text-3xl font-bold text-red-600">₹{yearStats.max}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Data Points</h3>
              <p className="text-3xl font-bold text-gray-700">{yearStats.count}</p>
            </div>
          </div>
        )}

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend ({currentYear})</h2>
          <div className="h-80 flex items-end gap-2">
            {monthlyData.map(({ month, average, min, max }) => {
              const maxPrice = Math.max(...monthlyData.map(m => m.average || 0));
              const height = average ? (average / maxPrice) * 100 : 0;
              
              return (
                <div key={month} className="flex-1 flex flex-col items-center group relative">
                  <div className="w-full flex flex-col items-center">
                    {average && (
                      <>
                        <div className="w-full flex flex-col items-end mb-1">
                          <div
                            className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                            title={`${monthNames[month - 1]}: ₹${average} (Min: ₹${min}, Max: ₹${max})`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{monthNames[month - 1]}</span>
                        <span className="text-xs font-medium text-primary mt-1">₹{average}</span>
                      </>
                    )}
                    {!average && (
                      <span className="text-xs text-gray-400 mt-2">{monthNames[month - 1]}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 4 Weeks Trend</h2>
          <div className="h-64 flex items-end gap-4">
            {weeklyData.map(({ week, average, label }) => {
              const maxPrice = Math.max(...weeklyData.map(w => w.average || 0));
              const height = average ? (average / maxPrice) * 100 : 0;
              
              return (
                <div key={week} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    {average ? (
                      <>
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                          title={`${label}: ₹${average}`}
                        />
                        <span className="text-xs text-gray-500 mt-2">{label}</span>
                        <span className="text-xs font-medium text-blue-600 mt-1">₹{average}</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 mt-2">{label}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Comparison */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Zone-wise Average Prices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneAverages.slice(0, 12).map(({ zone, average }) => (
              <Link
                key={zone.id}
                href={`/necc/zones/${zone.slug}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{zone.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    zone.zone_type === 'consumption_center'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {zone.zone_type === 'consumption_center' ? 'CC' : 'PC'}
                  </span>
                </div>
                <p className="text-xl font-bold text-primary">₹{average}</p>
              </Link>
            ))}
          </div>
          {zoneAverages.length > 12 && (
            <div className="mt-4 text-center">
              <Link
                href="/necc/zones"
                className="text-sm text-primary hover:underline"
              >
                View all {zoneAverages.length} zones →
              </Link>
            </div>
          )}
        </div>

        {/* Price Range Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Range Distribution</h2>
          <div className="space-y-4">
            {monthlyData.filter(m => m.average).map(({ month, min, max, average }) => {
              const range = max - min;
              const rangePercent = range / max * 100;
              
              return (
                <div key={month} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-gray-700">
                    {monthNames[month - 1]}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-gray-100 rounded relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        style={{ width: `${rangePercent}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-900">
                        ₹{min} - ₹{max} (Avg: ₹{average})
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
