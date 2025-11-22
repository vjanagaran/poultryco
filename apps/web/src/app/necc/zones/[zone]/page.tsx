import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getZoneBySlug, getAllZones, getZonesCount } from "@/lib/api/necc-zones";
import { getZonePrices, getPricesByDate, getPriceStats, getPricesByDateRange, getZoneMonthlyAverages, getMonthlyAverageStats, getZoneYoYData, getZoneYoYStats } from "@/lib/api/necc-prices";
import { getTodayDate, getYearDateRange } from "@/lib/utils/necc-date";
import { ShareableInfographicCard } from "@/components/necc/ShareableInfographicCard";
import { PriceTrendChart } from "@/components/necc/PriceTrendChart";
import { CrossLinkSection } from "@/components/necc/CrossLinkSection";
import { ZoneTimePeriodSelector, TimePeriod } from "@/components/necc/ZoneTimePeriodSelector";
import { ZoneActionToolbar } from "@/components/necc/ZoneActionToolbar";
import { AllTimeViewWrapper } from "@/components/necc/AllTimeViewWrapper";
import { NECCQuickLinks } from "@/components/necc/NECCQuickLinks";

interface PageProps {
  params: Promise<{ zone: string }>;
  searchParams: Promise<{ period?: string; year?: string; month?: string; type?: string }>;
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

export default async function ZonePage({ params, searchParams }: PageProps) {
  const { zone } = await params;
  const { period: periodParam, year: yearParam, month: monthParam, type: typeParam } = await searchParams;
  const zoneSlug = decodeURIComponent(zone);
  const period = (periodParam as TimePeriod) || '30d';
  const allTimeType = typeParam || 'historical'; // 'historical' or 'yoy'
  
  const zoneData = await getZoneBySlug(zoneSlug);
  if (!zoneData) {
    notFound();
  }

  const today = getTodayDate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Parse year and month from params
  const selectedYear = yearParam ? parseInt(yearParam) : currentYear;
  const selectedMonth = monthParam || `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const [selectedMonthYear, selectedMonthNum] = selectedMonth.split('-');

  // Calculate date ranges based on selected period
  let startDate: string;
  let endDate: string;
  let periodLabel: string;
  let showMonthlyAggregation = false;
  
  switch (period) {
    case '7d':
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      startDate = sevenDaysAgo.toISOString().split('T')[0];
      endDate = today;
      periodLabel = '7-Day';
      break;
    case 'month':
      // Use selected month
      const monthYear = parseInt(selectedMonthYear);
      const monthNum = parseInt(selectedMonthNum);
      startDate = `${monthYear}-${String(monthNum).padStart(2, '0')}-01`;
      // Calculate last day of the month
      const lastDay = new Date(monthYear, monthNum, 0).getDate();
      endDate = `${monthYear}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      periodLabel = `${new Date(monthYear, monthNum - 1).toLocaleString('default', { month: 'long' })} ${monthYear}`;
      break;
    case 'year':
      // Use selected year
      startDate = `${selectedYear}-01-01`;
      endDate = `${selectedYear}-12-31`;
      periodLabel = `${selectedYear}`;
      break;
    case 'all':
      startDate = '2009-01-01'; // Earliest NECC data date
      endDate = today;
      periodLabel = 'All Time';
      showMonthlyAggregation = true;
      break;
    case '30d':
    default:
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = today;
      periodLabel = '30-Day';
      break;
  }

  // Fetch zone data
  // For "All Time", use monthly averages view for better performance
  // For other periods, fetch daily data with appropriate limits
  const recordLimit = period === 'year' ? 365 : undefined;
  
  // Year stats - always for current year
  const { start: currentYearStart } = getYearDateRange(currentYear);
  
  const [todayZonePrices, recentPrices, monthlyData, yoyData, yoyStats, periodStats, yearStats, allZones, yesterdayPrice, allZonePrices] = await Promise.all([
    getPricesByDate(today).then(prices => prices.filter(p => p.zone_id === zoneData.id)),
    // For "All Time", we'll use monthlyData instead, so fetch empty array
    period === 'all' ? Promise.resolve([]) : getZonePrices(zoneData.id, startDate, endDate, recordLimit),
    // For "All Time" historical view, fetch from monthly averages materialized view
    (period === 'all' && allTimeType === 'historical') ? getZoneMonthlyAverages(zoneData.id, startDate, endDate) : Promise.resolve([]),
    // For "All Time" YoY view, use optimized database function
    (period === 'all' && allTimeType === 'yoy') ? getZoneYoYData(zoneData.id) : Promise.resolve([]),
    // For "All Time" YoY statistics (only when yoy view)
    (period === 'all' && allTimeType === 'yoy') ? getZoneYoYStats(zoneData.id) : Promise.resolve({ highest_price_day: null, lowest_price_day: null, avg_by_year: {}, years: [] }),
    // For "All Time", use appropriate stats based on view type
    (period === 'all' && allTimeType === 'historical') ? getMonthlyAverageStats(zoneData.id, startDate, endDate) : 
    (period === 'all' && allTimeType === 'yoy') ? Promise.resolve({ average: 0, min: 0, max: 0, count: 0 }) :
    getPriceStats(startDate, endDate, zoneData.id),
    getPriceStats(currentYearStart, today, zoneData.id),
    getAllZones(),
    getZonePrices(zoneData.id, undefined, today, 1).then(prices => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return prices.find(p => p.date === yesterdayStr);
    }),
    // Get all zones' latest prices for comparison
    getPricesByDate(today),
  ]);

  const todayPrice = todayZonePrices[0] || null;
  
  // Calculate stats for selected period
  // Stats are already calculated correctly from the appropriate source
  const avgPrice = periodStats.average;
  const minPrice = periodStats.min;
  const maxPrice = periodStats.max;
  const volatility = maxPrice && minPrice ? maxPrice - minPrice : null;
  const volatilityPercent = volatility && avgPrice ? ((volatility / avgPrice) * 100).toFixed(1) : null;

  // Calculate price change vs yesterday
  const priceChange = todayPrice?.suggested_price && yesterdayPrice?.suggested_price
    ? todayPrice.suggested_price - yesterdayPrice.suggested_price
    : null;
  const priceChangePercent = priceChange && yesterdayPrice?.suggested_price
    ? ((priceChange / yesterdayPrice.suggested_price) * 100).toFixed(1)
    : null;

  // Prepare trend data for selected period
  let trendData;
  
  if (showMonthlyAggregation) {
    // For "All Time", use pre-aggregated monthly data from materialized view
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    trendData = monthlyData
      .map(m => {
        const [year, month] = m.month.split('-');
        return {
          date: m.month,
          price: m.avg_price,
          label: `${monthNames[parseInt(month) - 1]} ${year}`,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  } else {
    // For other periods, show daily data
    trendData = recentPrices
      .filter(p => p.suggested_price !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(price => {
        const dateObj = new Date(price.date);
        return {
          date: price.date,
          price: price.suggested_price!,
          label: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
        };
      });
  }

  // Calculate same day last year price
  const lastYearDate = new Date();
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  const lastYearDateStr = lastYearDate.toISOString().split('T')[0];
  // For "All Time", we don't have daily data, so skip this
  const lastYearPrice = period === 'all' ? null : recentPrices.find(p => p.date === lastYearDateStr);
  const yearOverYearChange = todayPrice?.suggested_price && lastYearPrice?.suggested_price
    ? todayPrice.suggested_price - lastYearPrice.suggested_price
    : null;

  // Calculate zone comparison insights
  const sameTypeZones = allZones.filter(z => z.zone_type === zoneData.zone_type && z.id !== zoneData.id);
  const sameTypeAvgPrice = sameTypeZones.length > 0 ? (() => {
    const sameTypePrices = allZonePrices
      .filter(p => sameTypeZones.some(z => z.id === p.zone_id) && p.suggested_price !== null)
      .map(p => p.suggested_price!);
    return sameTypePrices.length > 0 
      ? Math.round(sameTypePrices.reduce((a, b) => a + b, 0) / sameTypePrices.length)
      : null;
  })() : null;

  const priceVsAverage = todayPrice?.suggested_price && sameTypeAvgPrice
    ? todayPrice.suggested_price - sameTypeAvgPrice
    : null;

  // Get 7-day trend for quick insight
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDayPrices = recentPrices.filter(p => {
    const priceDate = new Date(p.date);
    return priceDate >= sevenDaysAgo && p.suggested_price !== null;
  });
  const sevenDayChange = sevenDayPrices.length >= 2
    ? (sevenDayPrices[sevenDayPrices.length - 1].suggested_price || 0) - (sevenDayPrices[0].suggested_price || 0)
    : null;
  const sevenDayChangePercent = sevenDayChange && sevenDayPrices[0]?.suggested_price
    ? ((sevenDayChange / sevenDayPrices[0].suggested_price) * 100).toFixed(1)
    : null;

  // Get related zones with prices
  const relatedZonesWithPrices = sameTypeZones
    .slice(0, 4)
    .map(z => {
      const zonePrice = allZonePrices.find(p => p.zone_id === z.id);
      return {
        zone: z,
        price: zonePrice?.suggested_price || null,
      };
    })
    .filter(z => z.price !== null);

  const relatedZones = allZones
    .filter(z => z.id !== zoneData.id)
    .filter(z => 
      z.zone_type === zoneData.zone_type || 
      z.state === zoneData.state ||
      z.city === zoneData.city
    )
    .slice(0, 5)
    .map(z => ({
      title: `${z.name} Zone`,
      href: `/necc/zones/${z.slug}`,
      description: `${z.zone_type === 'consumption_center' ? 'CC' : 'PC'} - ${z.city || z.state || ''}`,
      icon: 'location' as const,
    }));

  // Prepare cross-links
  const crossLinks = [
    {
      title: 'View Today\'s Prices',
      href: '/necc/today',
      description: 'See all zones for today',
      icon: 'calendar' as const,
    },
    {
      title: 'Price Analysis',
      href: '/necc/analysis',
      description: 'Interactive charts and trends',
      icon: 'trend' as const,
    },
    ...relatedZones,
  ];

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
          
          {/* Page Header */}
          <div className="mb-6">
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

          {/* Action Toolbar */}
          <div className="mb-6">
            <ZoneActionToolbar 
              currentZone={zoneData}
              allZones={allZones}
              zoneName={zoneData.name}
              periodLabel={periodLabel}
            />
          </div>

          {/* Time Period Selector */}
          <div className="mb-8">
            <ZoneTimePeriodSelector 
              zoneslug={zoneData.slug} 
              currentPeriod={period}
              selectedYear={period === 'year' ? selectedYear : undefined}
              selectedMonth={period === 'month' ? selectedMonth : undefined}
            />
          </div>
        </div>

        {/* Price Trend Chart - Hero Element */}
        {showMonthlyAggregation ? (
          // All Time view with Historical vs YoY toggle
          <div className="mb-8">
            <AllTimeViewWrapper
              monthlyData={monthlyData}
              yoyData={yoyData}
              yoyStats={yoyStats}
              zoneName={zoneData.name}
              currentView={allTimeType as 'historical' | 'yoy'}
              zoneSlug={zoneSlug}
            />
          </div>
        ) : (
          // Other periods show regular trend chart
          trendData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {`${periodLabel} Price Trend`}
                </h2>
              </div>
              <PriceTrendChart
                data={trendData}
                title=""
                height={350}
                color="#3b82f6"
              />
            </div>
          )
        )}

        {/* Key Metrics Cards - Supporting Data (Below Graph) */}
        {showMonthlyAggregation && allTimeType === 'historical' && periodStats && (
          // All Time Historical View Stats
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">All Time Low</h3>
              <p className="text-3xl font-bold text-green-600">₹{periodStats.min}</p>
              {todayPrice?.suggested_price && (
                <p className="text-xs text-gray-500 mt-1">
                  Current is ₹{todayPrice.suggested_price - periodStats.min} above all-time low
                </p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">All Time Average</h3>
              <p className="text-3xl font-bold text-primary">₹{periodStats.average}</p>
              {todayPrice?.suggested_price && (
                <p className="text-xs text-gray-500 mt-1">
                  Current is {todayPrice.suggested_price >= periodStats.average ? 'above' : 'below'} average by ₹{Math.abs(todayPrice.suggested_price - periodStats.average)}
                </p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">All Time High</h3>
              <p className="text-3xl font-bold text-red-600">₹{periodStats.max}</p>
              {todayPrice?.suggested_price && (
                <p className="text-xs text-gray-500 mt-1">
                  Current is ₹{periodStats.max - todayPrice.suggested_price} below all-time high
                </p>
              )}
            </div>
          </div>
        )}

        {todayPrice && !showMonthlyAggregation && (
          // Other periods (7D, 30D, Month, Year) stats
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Price</h3>
              <p className="text-4xl font-bold text-primary">₹{todayPrice.suggested_price}</p>
              {priceChange !== null && priceChangePercent && (
                <p className={`text-sm mt-2 font-medium ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? '↑' : '↓'} ₹{Math.abs(priceChange)} ({priceChangePercent}%)
                  <span className="text-gray-500 font-normal"> vs Yesterday</span>
                </p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{periodLabel} Change</h3>
              <p className="text-4xl font-bold text-gray-900">
                {sevenDayChange !== null ? (
                  <span className={sevenDayChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {sevenDayChange >= 0 ? '+' : ''}₹{sevenDayChange}
                  </span>
                ) : 'N/A'}
              </p>
              {sevenDayChangePercent && (
                <p className="text-sm mt-2 text-gray-600">
                  {sevenDayChangePercent}% {period === '7d' ? '7-day' : period} trend
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{periodLabel} Average</h3>
              <p className="text-4xl font-bold text-primary">₹{avgPrice}</p>
              {volatilityPercent && (
                <p className="text-sm mt-2 text-gray-600">
                  Volatility: {volatilityPercent}%
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Year Average</h3>
              <p className="text-4xl font-bold text-gray-700">₹{yearStats.average}</p>
              <p className="text-sm mt-2 text-gray-600">
                {currentYear} overall
              </p>
            </div>
          </div>
        )}

        {/* Actionable Insights */}
        {todayPrice && (
          <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Market Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priceVsAverage !== null && sameTypeAvgPrice && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">vs {zoneData.zone_type === 'consumption_center' ? 'CC' : 'PC'} Average</p>
                  <p className={`text-2xl font-bold ${priceVsAverage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {priceVsAverage >= 0 ? '+' : ''}₹{priceVsAverage}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.abs(priceVsAverage) === 0 ? 'At average' : 
                      priceVsAverage > 0 ? `₹${Math.abs(priceVsAverage)} above average` : 
                      `₹${Math.abs(priceVsAverage)} below average`}
                  </p>
                </div>
              )}
              
              {yearOverYearChange !== null && lastYearPrice && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">vs Same Day Last Year</p>
                  <p className={`text-2xl font-bold ${yearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {yearOverYearChange >= 0 ? '+' : ''}₹{yearOverYearChange}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Was ₹{lastYearPrice.suggested_price} on {new Date(lastYearPrice.date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {volatility !== null && volatilityPercent && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">{periodLabel} Volatility</p>
                  <p className={`text-2xl font-bold ${
                    parseFloat(volatilityPercent) < 5 ? 'text-green-600' : 
                    parseFloat(volatilityPercent) < 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {volatilityPercent}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(volatilityPercent) < 5 ? 'Low - Stable prices' :
                     parseFloat(volatilityPercent) < 10 ? 'Medium - Some fluctuation' :
                     'High - Significant swings'}
                  </p>
                </div>
              )}

              {sevenDayChangePercent && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">7-Day Trend</p>
                  <p className={`text-2xl font-bold ${
                    parseFloat(sevenDayChangePercent) > 2 ? 'text-green-600' : 
                    parseFloat(sevenDayChangePercent) < -2 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {parseFloat(sevenDayChangePercent) > 0 ? '↑' : parseFloat(sevenDayChangePercent) < 0 ? '↓' : '→'} 
                    {Math.abs(parseFloat(sevenDayChangePercent))}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(sevenDayChangePercent) > 2 ? 'Rising trend' :
                     parseFloat(sevenDayChangePercent) < -2 ? 'Declining trend' :
                     'Relatively stable'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Range Stats - Only for non-All Time periods */}
        {avgPrice && !showMonthlyAggregation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{periodLabel} Low</h3>
              <p className="text-3xl font-bold text-green-600">₹{minPrice}</p>
              {todayPrice?.suggested_price && (
                <p className="text-xs text-gray-500 mt-1">
                  Current is ₹{todayPrice.suggested_price - minPrice} above low
                </p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{periodLabel} Average</h3>
              <p className="text-3xl font-bold text-primary">₹{avgPrice}</p>
              {todayPrice?.suggested_price && (
                <p className="text-xs text-gray-500 mt-1">
                  {todayPrice.suggested_price >= avgPrice ? 'Above' : 'Below'} average by ₹{Math.abs(todayPrice.suggested_price - avgPrice)}
                </p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{periodLabel} High</h3>
              <p className="text-3xl font-bold text-red-600">₹{maxPrice}</p>
              {todayPrice?.suggested_price && (
                <p className="text-xs text-gray-500 mt-1">
                  Current is ₹{maxPrice - todayPrice.suggested_price} below high
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shareable Infographic */}
        {todayPrice && (
          <div className="mb-8">
            <ShareableInfographicCard
              title={`${zoneData.name} Price Summary`}
              subtitle={`${periodLabel} Analysis`}
              data={[
                { label: 'Current', value: `₹${todayPrice.suggested_price}` },
                { label: `${periodLabel} Avg`, value: `₹${avgPrice}` },
                { label: `${periodLabel} High`, value: `₹${maxPrice}` },
                { label: `${periodLabel} Low`, value: `₹${minPrice}` },
              ]}
              shareUrl={`https://poultryco.net/necc/zones/${zoneData.slug}`}
              shareTitle={`${zoneData.name} NECC Price - ₹${todayPrice.suggested_price}`}
              shareDescription={`${zoneData.name}: Current ₹${todayPrice.suggested_price}, ${periodLabel} avg ₹${avgPrice}`}
            />
          </div>
        )}


        {/* Similar Zones Comparison */}
        {relatedZonesWithPrices.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Similar {zoneData.zone_type === 'consumption_center' ? 'Consumption Centers' : 'Production Centers'}
              </h2>
              <Link
                href={`/necc/compare?zones=${zoneData.id},${relatedZonesWithPrices.map(z => z.zone.id).join(',')}`}
                className="text-sm text-primary hover:underline"
              >
                Compare all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedZonesWithPrices.map(({ zone, price }) => {
                const priceDiff = todayPrice?.suggested_price && price 
                  ? todayPrice.suggested_price - price 
                  : null;
                return (
                  <Link
                    key={zone.id}
                    href={`/necc/zones/${zone.slug}`}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{zone.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-1">₹{price}</p>
                    {priceDiff !== null && (
                      <p className={`text-xs font-medium ${
                        priceDiff > 0 ? 'text-red-600' : priceDiff < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {priceDiff === 0 ? 'Same price' :
                         priceDiff > 0 ? `₹${priceDiff} cheaper` :
                         `₹${Math.abs(priceDiff)} costlier`}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Year Stats */}
        {yearStats.count > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Year {currentYear} Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Data Points</h3>
                <p className="text-2xl font-bold text-gray-700">{yearStats.count}</p>
              </div>
            </div>
          </div>
        )}

        {/* NECC Quick Links Section */}
        <div className="mt-8">
          <NECCQuickLinks />
        </div>
      </div>
    </div>
  );
}

