import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMonthPrices, getPriceStats } from "@/lib/api/necc-prices";
import { getMonthName, getDaysInMonth, getMonthDateRange, formatDateShort } from "@/lib/utils/necc-date";

interface PageProps {
  params: Promise<{ year: string; month: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month } = await params;
  const monthNum = parseInt(month, 10);
  const monthName = getMonthName(monthNum);
  
  return {
    title: `NECC Egg Prices ${monthName} ${year} - Daily Rates & Analysis | PoultryCo`,
    description: `Daily NECC egg prices for ${monthName} ${year}. Complete month analysis with expert insights.`,
  };
}

export default async function MonthPage({ params }: PageProps) {
  const { year, month } = await params;
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    notFound();
  }

  const monthName = getMonthName(monthNum);
  const daysInMonth = getDaysInMonth(yearNum, monthNum);
  const { start, end } = getMonthDateRange(yearNum, monthNum);

  // Fetch month prices and stats
  const [monthPrices, stats] = await Promise.all([
    getMonthPrices(yearNum, monthNum),
    getPriceStats(start, end),
  ]);

  // Group prices by day
  const pricesByDay = new Map<number, typeof monthPrices>();
  monthPrices.forEach((price) => {
    const day = price.day_of_month;
    if (!pricesByDay.has(day)) {
      pricesByDay.set(day, []);
    }
    pricesByDay.get(day)!.push(price);
  });

  // Calculate average price per day
  const dailyAverages = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayPrices = pricesByDay.get(day) || [];
    const pricesWithData = dayPrices.filter(p => p.suggested_price !== null);
    const avg = pricesWithData.length > 0
      ? Math.round(pricesWithData.reduce((sum, p) => sum + (p.suggested_price || 0), 0) / pricesWithData.length)
      : null;
    return { day, average: avg, count: pricesWithData.length };
  });

  // Previous/Next month navigation
  const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
  const prevYear = monthNum === 1 ? yearNum - 1 : yearNum;
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? yearNum + 1 : yearNum;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/necc" className="hover:text-primary">NECC</Link>
            {" > "}
            <Link href={`/necc/${year}`} className="hover:text-primary">{year}</Link>
            {" > "}
            <span>{monthName}</span>
          </nav>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {monthName} {year}
              </h1>
              <p className="text-gray-600">Daily prices and analysis</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/necc/${prevYear}/${prevMonth}`}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Previous
              </Link>
              <Link
                href={`/necc/${nextYear}/${nextMonth}`}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next →
              </Link>
            </div>
          </div>
        </div>

        {/* Month Stats */}
        {stats.count > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Month Average</h3>
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

        {/* Daily Chart (Simple bar chart) */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Average Prices</h2>
          <div className="h-64 flex items-end gap-1">
            {dailyAverages.map(({ day, average, count }) => {
              const maxPrice = Math.max(...dailyAverages.map(d => d.average || 0));
              const height = average ? (average / maxPrice) * 100 : 0;
              const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              return (
                <Link
                  key={day}
                  href={`/necc/${yearNum}/${monthNum}/${day}`}
                  className="flex-1 group relative"
                  title={average ? `Day ${day}: ₹${average}` : `Day ${day}: No data`}
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
                    {day % 5 === 0 && (
                      <span className="text-xs text-gray-500 mt-1">{day}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Day Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h2>
          <div className="grid grid-cols-7 gap-2">
            {dailyAverages.map(({ day, average, count }) => {
              const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasData = average !== null;
              
              return (
                <Link
                  key={day}
                  href={`/necc/${yearNum}/${monthNum}/${day}`}
                  className={`p-3 border rounded-lg text-center hover:bg-gray-50 transition-colors ${
                    hasData ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                  <div className={`text-xs ${
                    hasData ? 'text-primary font-semibold' : 'text-gray-400'
                  }`}>
                    {hasData ? `₹${average}` : '-'}
                  </div>
                  {count > 0 && (
                    <div className="text-xs text-gray-400 mt-1">{count} zones</div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

