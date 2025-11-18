import { Metadata } from "next";
import { getTodayPrices, getYesterdayPrices } from "@/lib/api/necc-prices";
import { formatDateDisplay, getTodayDate } from "@/lib/utils/necc-date";

export const metadata: Metadata = {
  title: "Today's NECC Egg Prices | PoultryCo",
  description: "Today's NECC egg prices for all zones. Compare with yesterday's rates and get expert insights.",
  openGraph: {
    title: "Today's NECC Egg Prices",
    description: "Today's NECC egg prices for all zones with yesterday comparison.",
    url: "https://poultryco.net/necc/today",
  },
  alternates: {
    canonical: "https://poultryco.net/necc/today",
  },
};

export default async function TodayPage() {
  const today = getTodayDate();
  const todayStr = formatDateDisplay(today);
  
  const [todayPrices, yesterdayPrices] = await Promise.all([
    getTodayPrices(),
    getYesterdayPrices(),
  ]);

  // Create a map of yesterday's prices for comparison
  const yesterdayMap = new Map(
    yesterdayPrices.map((p) => [p.zone_id, p.suggested_price])
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Today's Egg Prices
          </h1>
          <p className="text-gray-600">{todayStr}</p>
        </div>

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
                    Today (₹)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yesterday (₹)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayPrices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No price data available for today
                    </td>
                  </tr>
                ) : (
                  todayPrices.map((price) => {
                    const yesterdayPrice = yesterdayMap.get(price.zone_id);
                    const change = price.suggested_price && yesterdayPrice
                      ? price.suggested_price - yesterdayPrice
                      : null;
                    const changePercent = change && yesterdayPrice
                      ? ((change / yesterdayPrice) * 100).toFixed(1)
                      : null;

                    return (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {price.zone?.name || 'Unknown'}
                          </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {price.suggested_price ? `₹${price.suggested_price}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {yesterdayPrice ? `₹${yesterdayPrice}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {change !== null && changePercent ? (
                            <span className={`font-medium ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {change >= 0 ? '+' : ''}₹{change} ({changePercent}%)
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

