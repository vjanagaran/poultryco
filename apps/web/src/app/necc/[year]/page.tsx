import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getYearPrices, getPriceStats } from "@/lib/api/necc-prices";
import { getYearDateRange, getMonthName } from "@/lib/utils/necc-date";

interface PageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  
  // Check if it's a date format (YYYY-MM-DD)
  const dateMatch = year.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    return {
      title: `NECC Egg Prices ${y}-${m}-${d} - All Zones & Expert Analysis | PoultryCo`,
      description: `NECC egg prices for ${y}-${m}-${d}. Zone-wise rates, expert insights, and market analysis.`,
    };
  }
  
  return {
    title: `NECC Egg Prices ${year} - Complete Year Analysis | PoultryCo`,
    description: `Complete NECC egg price analysis for ${year}. Monthly trends, key events, and expert insights.`,
  };
}

export default async function YearPage({ params }: PageProps) {
  const { year } = await params;
  
  // Check if it's a date format (YYYY-MM-DD) - redirect to canonical format
  const dateMatch = year.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    // Remove leading zeros from month and day
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    redirect(`/necc/${y}/${month}/${day}`, 301);
  }
  
  const yearNum = parseInt(year, 10);

  if (isNaN(yearNum) || yearNum < 2010 || yearNum > 2030) {
    notFound();
  }

  const { start, end } = getYearDateRange(yearNum);

  // Fetch year prices and stats
  const [yearPrices, stats] = await Promise.all([
    getYearPrices(yearNum),
    getPriceStats(start, end),
  ]);

  // Group prices by month
  const pricesByMonth = new Map<number, typeof yearPrices>();
  yearPrices.forEach((price) => {
    const month = price.month;
    if (!pricesByMonth.has(month)) {
      pricesByMonth.set(month, []);
    }
    pricesByMonth.get(month)!.push(price);
  });

  // Calculate average price per month
  const monthlyAverages = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthPrices = pricesByMonth.get(month) || [];
    const pricesWithData = monthPrices.filter(p => p.suggested_price !== null);
    const avg = pricesWithData.length > 0
      ? Math.round(pricesWithData.reduce((sum, p) => sum + (p.suggested_price || 0), 0) / pricesWithData.length)
      : null;
    const monthStats = pricesWithData.length > 0
      ? {
          min: Math.min(...pricesWithData.map(p => p.suggested_price!)),
          max: Math.max(...pricesWithData.map(p => p.suggested_price!)),
        }
      : null;
    return { month, average: avg, stats: monthStats, count: pricesWithData.length };
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/necc" className="hover:text-primary">NECC</Link>
            {" > "}
            <span>{year}</span>
          </nav>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                NECC Egg Prices {year}
              </h1>
              <p className="text-gray-600">Complete year analysis</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/necc/${yearNum - 1}`}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Previous
              </Link>
              <Link
                href={`/necc/${yearNum + 1}`}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next →
              </Link>
            </div>
          </div>
        </div>

        {/* Year Stats */}
        {stats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Year Average</h3>
              <p className="text-3xl font-bold text-primary">₹{stats.average}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Lowest</h3>
              <p className="text-3xl font-bold text-green-600">₹{stats.min}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Highest</h3>
              <p className="text-3xl font-bold text-red-600">₹{stats.max}</p>
            </div>
          </div>
        )}

        {/* Monthly Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Average Prices</h2>
          <div className="h-64 flex items-end gap-2">
            {monthlyAverages.map(({ month, average, stats: monthStats }) => {
              const maxPrice = Math.max(...monthlyAverages.map(m => m.average || 0));
              const height = average ? (average / maxPrice) * 100 : 0;
              const monthName = getMonthName(month);
              
              return (
                <Link
                  key={month}
                  href={`/necc/${yearNum}/${month}`}
                  className="flex-1 group relative"
                  title={average ? `${monthName}: ₹${average} (Min: ₹${monthStats?.min}, Max: ₹${monthStats?.max})` : `${monthName}: No data`}
                >
                  <div className="w-full flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        average
                          ? 'bg-primary hover:bg-primary/80'
                          : 'bg-gray-200'
                      }`}
                      style={{ height: `${height}%`, minHeight: average ? '4px' : '2px' }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{monthName.slice(0, 3)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Month Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyAverages.map(({ month, average, stats: monthStats, count }) => {
            const monthName = getMonthName(month);
            
            return (
              <Link
                key={month}
                href={`/necc/${yearNum}/${month}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
                  <span className="text-sm text-gray-500">{count} records</span>
                </div>
                {average ? (
                  <div>
                    <p className="text-2xl font-bold text-primary mb-2">₹{average}</p>
                    {monthStats && (
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Min: ₹{monthStats.min}</span>
                        <span>Max: ₹{monthStats.max}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">No data available</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

