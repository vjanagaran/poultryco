import { Metadata } from "next";
import Link from "next/link";
import { getTodayAverage, getYesterdayAverage } from "@/lib/api/necc-prices";
import { getZonesCount } from "@/lib/api/necc-zones";
import { TrendingUp, MapPin, BarChart3, Calendar, Table, Zap, Users, Bell } from "lucide-react";
import { NECCQuickLinks } from "@/components/necc/NECCQuickLinks";

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

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
  // Fetch data in parallel - handle build-time failures gracefully
  let todayAvg: number | null = null;
  let yesterdayAvg: number | null = null;
  let zonesCount: number = 0;

  try {
    const results = await Promise.allSettled([
      getTodayAverage(),
      getYesterdayAverage(),
      getZonesCount(),
    ]);
    
    todayAvg = results[0].status === 'fulfilled' ? results[0].value : null;
    yesterdayAvg = results[1].status === 'fulfilled' ? results[1].value : null;
    zonesCount = results[2].status === 'fulfilled' ? results[2].value : 0;
  } catch (error) {
    // During build time, API might not be available - use defaults
    console.warn('Error fetching NECC data during build:', error);
  }

  const change = todayAvg && yesterdayAvg ? todayAvg - yesterdayAvg : null;
  const changePercent = change && yesterdayAvg ? ((change / yesterdayAvg) * 100).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section with CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-orange-600 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
              🥚 NECC Price Analytics Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Smart Egg Price Analytics
          </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Make data-driven decisions with real-time NECC prices, trends, and expert insights
            </p>
            
            {/* Today's Price Highlight */}
            {todayAvg && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
                <p className="text-sm font-medium text-white/80 mb-2">Today's National Average</p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-5xl md:text-6xl font-bold">₹{todayAvg}</p>
            {change !== null && changePercent && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      change >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      <span className="text-2xl">{change >= 0 ? '↑' : '↓'}</span>
                      <span className="font-semibold">{changePercent}%</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/70 mt-2">Per 100 eggs • {zonesCount} zones tracked</p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Users className="h-5 w-5" />
                Join PoultryCo Free
              </Link>
              <Link
                href="/necc/today"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all border-2 border-white/30 flex items-center gap-2"
              >
                <TrendingUp className="h-5 w-5" />
                View Today's Prices
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Why PoultryCo for NECC Prices?
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              Beyond just prices - get the insights and tools you need to thrive in the poultry business
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Real-Time Updates</h3>
                <p className="text-gray-600 text-sm">
                  Get NECC prices as soon as they're published
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 text-sm">
                  Interactive charts, trends, and year-over-year comparisons
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">All Zones Covered</h3>
                <p className="text-gray-600 text-sm">
                  {zonesCount} production and consumption centers tracked
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Smart Alerts</h3>
                <p className="text-gray-600 text-sm">
                  Get notified of significant price changes (Coming Soon)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Access Tools */}
          <div className="mb-16">
            <NECCQuickLinks />
        </div>

          {/* Social Proof / Trust Section */}
          <div className="bg-gradient-to-br from-primary/5 to-orange-50 rounded-2xl p-8 md:p-12 mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Join India's Leading Poultry Professional Network
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Get access to NECC prices, connect with fellow farmers and traders, share insights, and grow your business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
                href="/register"
                className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
          >
                Create Free Account
          </Link>
          <Link
                href="/about"
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 inline-flex items-center justify-center"
              >
                Learn More About Us
          </Link>
            </div>
        </div>

          {/* Source Credit */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Data sourced from{' '}
              <a 
                href="https://e2necc.com/home/eggprice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                NECC (National Egg Coordination Committee)
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Prices are suggested rates and prevailing market prices as published by NECC. 
              PoultryCo provides additional analytics, insights, and tools on top of NECC's raw data.
            </p>
            <p className="text-xs text-gray-400 mt-2 italic">
              Disclaimer: We are not affiliated with or endorsed by NECC. All price data is sourced from their official website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

