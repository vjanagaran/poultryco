'use client';

import { AllTimeViewSelector, AllTimeView } from './AllTimeViewSelector';
import { PriceTrendChart } from './PriceTrendChart';
import { YearOverYearChart } from './YearOverYearChart';
import { YoYDataPoint, YoYStats } from '@/lib/api/necc-prices';

interface MonthlyAverage {
  month: string;
  avg_price: number;
  min_price: number;
  max_price: number;
}

interface AllTimeViewWrapperProps {
  monthlyData: MonthlyAverage[];
  yoyData: YoYDataPoint[];
  yoyStats: YoYStats;
  zoneName: string;
  currentView: AllTimeView;
  zoneSlug: string;
}

export function AllTimeViewWrapper({ monthlyData, yoyData, yoyStats, zoneName, currentView, zoneSlug }: AllTimeViewWrapperProps) {
  const view = currentView;

  // Transform monthly data for historical chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const historicalTrendData = monthlyData.map(m => {
    const [year, month] = m.month.split('-');
    return {
      date: m.month,
      price: m.avg_price,
      label: `${monthNames[parseInt(month) - 1]} ${year}`,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));

  // Transform YoY data for chart
  const yoyChartData = yoyData.map(d => ({
    dayOfYear: d.day_of_year,
    dayLabel: d.day_label,
    ...d.year_data
  }));

  const years = yoyStats.years;

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex items-center justify-between">
        <AllTimeViewSelector currentView={view} zoneSlug={zoneSlug} />
        
        <div className="text-sm text-gray-600">
          {view === 'historical' && (
            <span>{monthlyData.length} months of data</span>
          )}
          {view === 'yoy' && (
            <span>{years.length} years • {yoyData.length} days compared</span>
          )}
        </div>
      </div>

      {/* Historical Trend View */}
      {view === 'historical' && (
        <div>
          <PriceTrendChart
            data={historicalTrendData}
            title="All Time Price Trend (Monthly Averages)"
            height={500}
          />
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📊 About This View:</h4>
            <p className="text-sm text-gray-700">
              This chart shows monthly average prices from the earliest available data to present.
              It helps visualize long-term trends and overall market direction for {zoneName}.
            </p>
          </div>
        </div>
      )}

      {/* Year-over-Year View */}
      {view === 'yoy' && (
        <div className="space-y-6">
          <YearOverYearChart
            data={yoyChartData}
            years={years}
            title="Year-over-Year Price Comparison (Day 1-365)"
          />

          {/* YoY Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Highest Price Day */}
            {yoyStats.highest_price_day && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">🔺 Highest Price Day</h4>
                <p className="text-2xl font-bold text-red-600">₹{yoyStats.highest_price_day.price}</p>
                <p className="text-sm text-red-700 mt-1">
                  {yoyStats.highest_price_day.day_label}, {yoyStats.highest_price_day.year}
                </p>
              </div>
            )}

            {/* Lowest Price Day */}
            {yoyStats.lowest_price_day && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🔻 Lowest Price Day</h4>
                <p className="text-2xl font-bold text-green-600">₹{yoyStats.lowest_price_day.price}</p>
                <p className="text-sm text-green-700 mt-1">
                  {yoyStats.lowest_price_day.day_label}, {yoyStats.lowest_price_day.year}
                </p>
              </div>
            )}

            {/* Data Coverage */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Data Coverage</h4>
              <p className="text-2xl font-bold text-blue-600">{years.length} Years</p>
              <p className="text-sm text-blue-700 mt-1">
                {yoyData.length} days compared
              </p>
            </div>
          </div>

          {/* Year Average Comparison */}
          {Object.keys(yoyStats.avg_by_year).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">📅 Average Price by Year</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {years.map(year => {
                  const avg = yoyStats.avg_by_year[year.toString()];
                  const isCurrent = year === new Date().getFullYear();
                  return (
                    <div 
                      key={year}
                      className={`text-center p-3 rounded-lg ${
                        isCurrent 
                          ? 'bg-primary/10 border-2 border-primary' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-gray-600'}`}>
                        {year}
                      </div>
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        ₹{avg}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

