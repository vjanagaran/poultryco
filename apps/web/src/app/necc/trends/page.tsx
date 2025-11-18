import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NECC Egg Price Trends - Patterns & Predictions | PoultryCo",
  description: "Analyze NECC egg price trends, patterns, and predictions. Expert insights and AI-powered forecasts.",
};

export default function TrendsPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Price Trends & Insights
          </h1>
          <p className="text-gray-600">
            Expert analysis, predictions, and user-generated insights about NECC egg prices
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Trends & Expert Insights
            </h2>
            <p className="text-gray-600 mb-6">
              This section will feature expert annotations, AI-powered predictions, and user-generated content about NECC egg price trends.
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Expert Annotations</h3>
                  <p className="text-sm text-gray-600">
                    Industry experts can add annotations to specific dates and zones to explain price spikes, trends, and market events.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">AI Predictions</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered forecasts and trend analysis based on historical data patterns.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">User Discussions</h3>
                  <p className="text-sm text-gray-600">
                    Community discussions and insights about price movements and market trends.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                This feature will be available in Phase 2 of development.
              </p>
              <Link
                href="/necc/analysis"
                className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Price Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <h3 className="font-semibold text-lg mb-2">Price Analysis</h3>
            <p className="text-gray-600 text-sm">Interactive charts and comprehensive analysis</p>
          </Link>
          <Link
            href="/necc/zones"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Zone Details</h3>
            <p className="text-gray-600 text-sm">Zone-wise prices and trends</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
