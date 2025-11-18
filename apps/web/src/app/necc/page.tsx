import { Metadata } from "next";
import Link from "next/link";
import { getTodayAverage, getYesterdayAverage } from "@/lib/api/necc-prices";
import { getZonesCount } from "@/lib/api/necc-zones";

export const metadata: Metadata = {
  title: "NECC Egg Prices - Daily Rates, Trends & Expert Analysis | PoultryCo",
  description: "Get daily NECC egg prices, expert insights, and market analysis. Compare zones, track trends, and make informed decisions.",
  openGraph: {
    title: "NECC Egg Prices - Daily Rates & Analysis",
    description: "Get daily NECC egg prices, expert insights, and market analysis.",
    url: "https://poultryco.net/necc",
  },
  alternates: {
    canonical: "https://poultryco.net/necc",
  },
};

export default async function NECCHomePage() {
  // Fetch data in parallel
  const [todayAvg, yesterdayAvg, zonesCount] = await Promise.all([
    getTodayAverage(),
    getYesterdayAverage(),
    getZonesCount(),
  ]);

  const change = todayAvg && yesterdayAvg ? todayAvg - yesterdayAvg : null;
  const changePercent = change && yesterdayAvg ? ((change / yesterdayAvg) * 100).toFixed(1) : null;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            NECC Egg Prices
          </h1>
          <p className="text-xl text-gray-600">
            Daily rates, trends, and expert analysis for the Indian poultry industry
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Average</h3>
            <p className="text-3xl font-bold text-primary">
              {todayAvg ? `₹${todayAvg}` : 'N/A'}
            </p>
            {change !== null && changePercent && (
              <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}₹{change} ({changePercent}%) vs Yesterday
              </p>
            )}
            {change === null && (
              <p className="text-sm text-gray-500 mt-2">vs Yesterday</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Zones Tracked</h3>
            <p className="text-3xl font-bold text-primary">{zonesCount}</p>
            <p className="text-sm text-gray-500 mt-2">Production & Consumption Centers</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Expert Insights</h3>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-gray-500 mt-2">Annotations Available</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Link
            href="/necc/today"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Today's Rates</h3>
            <p className="text-gray-600 text-sm">View today's prices with yesterday comparison</p>
          </Link>
          <Link
            href="/necc/analysis"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Analysis</h3>
            <p className="text-gray-600 text-sm">Interactive charts and expert insights</p>
          </Link>
          <Link
            href="/necc/trends"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Trends</h3>
            <p className="text-gray-600 text-sm">Pattern analysis and predictions</p>
          </Link>
          <Link
            href="/necc/zones"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Zones</h3>
            <p className="text-gray-600 text-sm">Zone-wise prices and analysis</p>
          </Link>
        </div>

        {/* Source Credit */}
        <div className="bg-primary/5 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Data sourced from <strong>NECC (National Egg Coordination Committee)</strong>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Prices are suggested rates and prevailing market prices as published by NECC
          </p>
        </div>
      </div>
    </div>
  );
}

