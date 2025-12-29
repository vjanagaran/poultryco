import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getZonesCount, getPricesCount, getLatestPriceDate } from "@/lib/api/necc";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NECCDashboardPage() {
  // Get stats from API
  const [totalZones, totalPrices, latestPriceDate] = await Promise.all([
    getZonesCount(),
    getPricesCount(),
    getLatestPriceDate(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🥚 NECC System</h1>
        <p className="text-gray-600 mt-2">
          Manage NECC zones, prices, and scraper
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalZones}</div>
            <p className="text-sm text-gray-500 mt-1">NECC price zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {totalPrices.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">Price records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Latest Price Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {latestPriceDate 
                ? new Date(latestPriceDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  })
                : 'N/A'
              }
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {latestPriceDate && new Date(latestPriceDate).toLocaleDateString('en-IN', { year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/necc/scraper">
              <Button className="w-full" size="lg">
                🤖 Run Scraper
              </Button>
            </Link>
            <Link href="/necc/zones">
              <Button className="w-full" variant="outline" size="lg">
                🗺️ Manage Zones
              </Button>
            </Link>
            <Link href="/necc/prices">
              <Button className="w-full" variant="outline" size="lg">
                💰 View Prices
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/necc/zones">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗺️ Zone Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View, add, edit, and delete NECC zones (Namakkal, Mumbai, etc.)
              </p>
              <div className="mt-4 text-sm font-medium text-blue-600">
                Manage {totalZones} zones →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/necc/prices">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Price Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View prices, daily grid, and manually add/edit prices
              </p>
              <div className="mt-4 text-sm font-medium text-blue-600">
                View prices →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/necc/scraper">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Scraper
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Scrape NECC prices for any month/year from official website
              </p>
              <div className="mt-4 text-sm font-medium text-blue-600">
                Run scraper →
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

