import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPricesByDateWithPrevious, getPricesByDateRange, getPricesByDate } from "@/lib/api/necc-prices";
import { getAllZones } from "@/lib/api/necc-zones";
import { formatDateDisplay, getMonthName, getPreviousDate, getNextDate, isValidDateString } from "@/lib/utils/necc-date";
import { ShareableInfographicCard } from "@/components/necc/ShareableInfographicCard";
import { PriceTrendChart } from "@/components/necc/PriceTrendChart";
import { CrossLinkSection } from "@/components/necc/CrossLinkSection";

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ year: string; month: string; day: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month, day } = await params;
  const monthNum = parseInt(month, 10);
  const monthName = getMonthName(monthNum);
  const dayNum = parseInt(day, 10);
  
  return {
    title: `NECC Egg Prices ${monthName} ${dayNum}, ${year} - All Zones & Expert Analysis | PoultryCo`,
    description: `NECC egg prices for ${monthName} ${dayNum}, ${year}. Zone-wise rates, expert insights, and market analysis.`,
  };
}

export default async function DayPage({ params }: PageProps) {
  const { year, month, day } = await params;
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  // Validate date
  if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
    notFound();
  }

  const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  
  if (!isValidDateString(dateStr)) {
    notFound();
  }

  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
    notFound();
  }

  const monthName = getMonthName(monthNum);
  const formattedDate = formatDateDisplay(dateStr);
  const previousDate = getPreviousDate(dateStr);
  const nextDate = getNextDate(dateStr);

  // Calculate date range for 7-day trend
  const sevenDaysAgo = new Date(dateStr);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  // Fetch prices with previous day data (for missing data handling)
  const [prices, weekPrices, yesterdayPrices, allZones] = await Promise.all([
    getPricesByDateWithPrevious(dateStr),
    getPricesByDateRange(sevenDaysAgoStr, dateStr),
    getPricesByDate(previousDate),
    getAllZones(),
  ]);

  // Calculate stats
  const pricesWithData = prices.filter(p => p.suggested_price !== null || p.prevailing_price !== null);
  const avgPrice = pricesWithData.length > 0
    ? Math.round(pricesWithData.reduce((sum, p) => sum + (p.suggested_price || 0), 0) / pricesWithData.length)
    : null;
  const minPrice = pricesWithData.length > 0
    ? Math.min(...pricesWithData.map(p => p.suggested_price!).filter(p => p !== null))
    : null;
  const maxPrice = pricesWithData.length > 0
    ? Math.max(...pricesWithData.map(p => p.suggested_price!).filter(p => p !== null))
    : null;

  // Calculate yesterday average for comparison
  const yesterdayAvg = yesterdayPrices.length > 0
    ? Math.round(yesterdayPrices.reduce((sum, p) => sum + (p.suggested_price || 0), 0) / yesterdayPrices.length)
    : null;
  const priceChange = avgPrice && yesterdayAvg ? avgPrice - yesterdayAvg : null;
  const priceChangePercent = priceChange && yesterdayAvg ? ((priceChange / yesterdayAvg) * 100).toFixed(1) : null;

  // Prepare 7-day trend data (average per day)
  const dailyAverages = new Map<string, number[]>();
  weekPrices.forEach(price => {
    if (price.suggested_price !== null) {
      if (!dailyAverages.has(price.date)) {
        dailyAverages.set(price.date, []);
      }
      dailyAverages.get(price.date)!.push(price.suggested_price);
    }
  });

  const trendData = Array.from(dailyAverages.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, prices]) => {
      const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const dateObj = new Date(date);
      return {
        date,
        price: avg,
        label: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
      };
    });

  // Get top zones by price (for cross-linking)
  const topZones = prices
    .filter(p => p.suggested_price !== null && p.zone)
    .sort((a, b) => (b.suggested_price || 0) - (a.suggested_price || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.zone?.name || 'Unknown',
      slug: p.zone?.slug || '',
      price: p.suggested_price || 0,
    }));

  // Prepare cross-links
  const sameDayLastYear = `${yearNum - 1}/${monthNum}/${dayNum}`;
  const weekStart = new Date(dateStr);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = `${weekStart.getFullYear()}/${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
  
  const crossLinks = [
    {
      title: `Same Day Last Year (${yearNum - 1})`,
      href: `/necc/${sameDayLastYear}`,
      description: `Compare with ${monthName} ${dayNum}, ${yearNum - 1}`,
      icon: 'calendar' as const,
    },
    {
      title: `View This Week`,
      href: `/necc/analysis?start=${sevenDaysAgoStr}&end=${dateStr}`,
      description: 'See 7-day trend analysis',
      icon: 'trend' as const,
    },
    {
      title: `View This Month`,
      href: `/necc/${yearNum}/${monthNum}`,
      description: `See all days in ${monthName} ${yearNum}`,
      icon: 'calendar' as const,
    },
    ...topZones.slice(0, 3).map(zone => ({
      title: `${zone.name} Zone`,
      href: `/necc/zones/${zone.slug}`,
      description: `₹${zone.price} - View zone details`,
      icon: 'location' as const,
    })),
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/necc" className="hover:text-primary">NECC</Link>
            {" > "}
            <Link href={`/necc/${year}`} className="hover:text-primary">{year}</Link>
            {" > "}
            <Link href={`/necc/${year}/${month}`} className="hover:text-primary">{monthName}</Link>
            {" > "}
            <span>{dayNum}</span>
          </nav>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formattedDate}
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/necc/${previousDate.replace(/-/g, '/').split('/').slice(0, 3).join('/')}`}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Previous
              </Link>
              <Link
                href={`/necc/${nextDate.replace(/-/g, '/').split('/').slice(0, 3).join('/')}`}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next →
              </Link>
            </div>
          </div>
        </div>

        {/* Shareable Infographic Card */}
        {avgPrice && (
          <div className="mb-8">
            <ShareableInfographicCard
              title={`NECC Egg Prices - ${formattedDate}`}
              subtitle="All Zones Average"
              data={[
                {
                  label: 'Average Price',
                  value: `₹${avgPrice}`,
                  change: priceChangePercent ? parseFloat(priceChangePercent) : undefined,
                  changeType: priceChange && priceChange > 0 ? 'increase' : priceChange && priceChange < 0 ? 'decrease' : 'neutral',
                },
                { label: 'Highest Zone', value: `₹${maxPrice}` },
                { label: 'Lowest Zone', value: `₹${minPrice}` },
                { label: 'Zones Tracked', value: pricesWithData.length },
              ]}
              shareUrl={`https://poultryco.net/necc/${yearNum}/${monthNum}/${dayNum}`}
              shareTitle={`NECC Egg Prices ${formattedDate} - Average: ₹${avgPrice}`}
              shareDescription={`Today's NECC egg prices: Average ₹${avgPrice}, High ₹${maxPrice}, Low ₹${minPrice}`}
            />
          </div>
        )}

        {/* Stats Cards */}
        {avgPrice && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Price</h3>
              <p className="text-3xl font-bold text-primary">₹{avgPrice}</p>
              {priceChange !== null && priceChangePercent && (
                <p className={`text-sm mt-2 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? '+' : ''}₹{priceChange} ({priceChangePercent}%) vs Yesterday
                </p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Lowest</h3>
              <p className="text-3xl font-bold text-green-600">₹{minPrice}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Highest</h3>
              <p className="text-3xl font-bold text-red-600">₹{maxPrice}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Zones</h3>
              <p className="text-3xl font-bold text-gray-700">{pricesWithData.length}</p>
              <p className="text-sm text-gray-500 mt-2">With data</p>
            </div>
          </div>
        )}

        {/* 7-Day Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <PriceTrendChart
              data={trendData}
              title="7-Day Price Trend"
              height={300}
            />
          </div>
        )}

        {/* Price Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Price (₹)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prevailing Price (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No price data available for this date
                    </td>
                  </tr>
                ) : (
                  prices.map((price) => {
                    const isMissing = price.suggested_price === null && price.prevailing_price === null;
                    const showPrevious = isMissing && price.previous_price;

                    return (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {price.zone?.slug ? (
                            <Link
                              href={`/necc/zones/${price.zone.slug}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {price.zone.name}
                            </Link>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {price.zone?.name || 'Unknown'}
                            </div>
                          )}
                          {price.zone?.city && (
                            <div className="text-sm text-gray-500">{price.zone.city}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            price.zone?.zone_type === 'consumption_center'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {price.zone?.zone_type === 'consumption_center' ? 'CC' : 'PC'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {showPrevious ? (
                            <div>
                              <span className="font-medium text-gray-400 line-through">
                                ₹{price.previous_price?.suggested_price}
                              </span>
                              <span className="ml-2 text-xs text-amber-600">*</span>
                            </div>
                          ) : (
                            <span className="font-medium text-gray-900">
                              {price.suggested_price ? `₹${price.suggested_price}` : '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {price.prevailing_price ? `₹${price.prevailing_price}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Missing Data Note */}
          {prices.some(p => p.previous_price) && (
            <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
              <p className="text-sm text-amber-800">
                <span className="font-medium">*</span> Not updated for current date. Showing previous day rate.
              </p>
            </div>
          )}
        </div>

        {/* Cross-Links Section */}
        <div className="mt-8">
          <CrossLinkSection
            title="Related Pages & Insights"
            links={crossLinks}
          />
        </div>
      </div>
    </div>
  );
}

