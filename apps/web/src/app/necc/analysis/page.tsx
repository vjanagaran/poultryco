import { Metadata } from "next";
import Link from "next/link";
import { getYearPrices, getPriceStats, getPricesByDateRange, getMonthPrices } from "@/lib/api/necc-prices";
import { getAllZones } from "@/lib/api/necc-zones";
import { getYearDateRange, getTodayDate } from "@/lib/utils/necc-date";
import { BarChart } from "@/components/necc/BarChart";
import { PriceTrendChart } from "@/components/necc/PriceTrendChart";
import { ShareableInfographicCard } from "@/components/necc/ShareableInfographicCard";
import { AnalysisFilters } from "@/components/necc/AnalysisFilters";
import { NECCQuickLinks } from "@/components/necc/NECCQuickLinks";

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

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; zone?: string }>;
}) {
  const params = await searchParams;
  const view = params.view || 'year'; // 'year', 'month', '30days'
  const selectedZone = params.zone;
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const { start: yearStart, end: yearEnd } = getYearDateRange(currentYear);
  const today = getTodayDate();

  // Calculate date ranges
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  // Fetch data based on view
  const fetchPromises = [
    getAllZones(),
  ];

  if (view === 'year') {
    fetchPromises.push(
      getYearPrices(currentYear),
      getPriceStats(yearStart, today, selectedZone),
      getPricesByDateRange(fourWeeksAgo.toISOString().split('T')[0], today)
    );
  } else if (view === 'month') {
    fetchPromises.push(
      getMonthPrices(currentYear, currentMonth),
      getPriceStats(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, today, selectedZone),
      getPricesByDateRange(fourWeeksAgo.toISOString().split('T')[0], today)
    );
  } else if (view === '30days') {
    fetchPromises.push(
      getPricesByDateRange(thirtyDaysAgoStr, today),
      getPriceStats(thirtyDaysAgoStr, today, selectedZone),
      getPricesByDateRange(thirtyDaysAgoStr, today)
    );
  }

  const [zones, yearPrices = [], yearStats = { average: 0, min: 0, max: 0, count: 0 }, weeklyPrices = []] = await Promise.all(fetchPromises);

  // Group prices by month for trend analysis
  // Use date field to extract month if month field is not populated
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthPrices = yearPrices.filter(p => {
      // Use month field if available, otherwise extract from date
      const priceMonth = p.month || new Date(p.date).getMonth() + 1;
      return priceMonth === month && p.suggested_price !== null;
    });
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

  // Calculate weekly trend (last 4 weeks) - use weeklyPrices instead of yearPrices
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    weekEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekPrices = weeklyPrices.filter(
      p => {
        const priceDate = new Date(p.date);
        priceDate.setHours(0, 0, 0, 0);
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

          <AnalysisFilters zones={zones} currentView={view} />
        </div>

        {/* Overview Stats */}
        {yearStats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {view === 'year' ? 'Year' : view === 'month' ? 'Month' : '30-Day'} Average
              </h3>
              <p className="text-3xl font-bold text-primary">₹{yearStats.average}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Period Low</h3>
              <p className="text-3xl font-bold text-green-600">₹{yearStats.min}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Period High</h3>
              <p className="text-3xl font-bold text-red-600">₹{yearStats.max}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Data Points</h3>
              <p className="text-3xl font-bold text-gray-700">{yearStats.count}</p>
            </div>
          </div>
        )}

        {/* Shareable Year Summary Card */}
        {yearStats.count > 0 && (
          <div className="mb-8">
            <ShareableInfographicCard
              title={`NECC Egg Prices ${currentYear} Summary`}
              subtitle="Year Overview"
              data={[
                { label: 'Year Average', value: `₹${yearStats.average}` },
                { label: 'Year High', value: `₹${yearStats.max}` },
                { label: 'Year Low', value: `₹${yearStats.min}` },
                { label: 'Data Points', value: yearStats.count.toLocaleString() },
              ]}
              shareUrl={`https://poultryco.net/necc/${currentYear}`}
              shareTitle={`NECC Egg Prices ${currentYear} - Average: ₹${yearStats.average}`}
              shareDescription={`${currentYear} NECC egg prices: Average ₹${yearStats.average}, High ₹${yearStats.max}, Low ₹${yearStats.min}`}
            />
          </div>
        )}

        {/* Monthly Trend Chart - Interactive */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <BarChart
            data={monthlyData
              .filter(m => m.average !== null)
              .map(({ month, average }) => ({
                name: monthNames[month - 1],
                value: average!,
              }))}
            title={`Monthly Trend (${currentYear})`}
            height={350}
            color="#3b82f6"
          />
        </div>

        {/* Weekly Trend - Interactive */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <PriceTrendChart
            data={weeklyData
              .filter(w => w.average !== null)
              .map(({ label, average }) => ({
                date: label,
                price: average!,
                label: label,
              }))}
            title="Last 4 Weeks Trend"
            height={300}
            color="#10b981"
          />
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

        {/* NECC Quick Links */}
        <div className="mt-12">
          <NECCQuickLinks />
        </div>
      </div>
    </div>
  );
}
