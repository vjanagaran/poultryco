'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
// Years from 2009 to 2026
const YEARS = Array.from({ length: 2026 - 2009 + 1 }, (_, i) => 2009 + i).reverse();

interface ScrapeResult {
  success: boolean;
  message: string;
  stats: {
    zonesFound: number;
    zonesValidated: number;
    zonesMissing: number;
    pricesInserted: number;
    pricesSkipped: number;
    errors: string[];
  };
}

interface YearScrapeResult {
  success: boolean;
  message: string;
  year: number;
  monthsCompleted: number;
  monthsFailed: number;
  totalStats: {
    zonesFound: number;
    zonesValidated: number;
    zonesMissing: number;
    pricesInserted: number;
    pricesSkipped: number;
    errors: string[];
  };
  monthlyResults: Array<{
    month: number;
    success: boolean;
    message: string;
    stats: {
      zonesFound: number;
      zonesValidated: number;
      zonesMissing: number;
      pricesInserted: number;
      pricesSkipped: number;
      errors: string[];
    };
  }>;
}

export function MonthScraperForm() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [yearLoading, setYearLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [yearResult, setYearResult] = useState<YearScrapeResult | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    setYearResult(null);

    try {
      const { runScraper } = await import('@/lib/api/necc');
      const data = await runScraper(month, year);
      setResult(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to scrape data';
      setResult({
        success: false,
        message,
        stats: {
          zonesFound: 0,
          zonesValidated: 0,
          zonesMissing: 0,
          pricesInserted: 0,
          pricesSkipped: 0,
          errors: [message],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeYear = async () => {
    setYearLoading(true);
    setYearResult(null);
    setResult(null);

    try {
      const { runYearScraper } = await import('@/lib/api/necc');
      const data = await runYearScraper(year);
      setYearResult(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to scrape year';
      setYearResult({
        success: false,
        message,
        year,
        monthsCompleted: 0,
        monthsFailed: 12,
        totalStats: {
          zonesFound: 0,
          zonesValidated: 0,
          zonesMissing: 0,
          pricesInserted: 0,
          pricesSkipped: 0,
          errors: [message],
        },
        monthlyResults: [],
      });
    } finally {
      setYearLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Month & Year</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleScrape}
            disabled={loading || yearLoading}
            className="w-full"
            size="lg"
          >
            {loading ? '⏳ Scraping...' : '🚀 Scrape Month'}
          </Button>
          
          <Button
            onClick={handleScrapeYear}
            disabled={loading || yearLoading}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {yearLoading ? '⏳ Scraping Year...' : '📅 Scrape Entire Year'}
          </Button>
        </div>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className={`font-semibold mb-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.success ? '✅ ' : '❌ '}
              {result.message}
            </p>

            {result.stats && (
              <div className="space-y-2 text-sm text-gray-700 mt-3">
                <div className="flex justify-between">
                  <span>Zones Found:</span>
                  <span className="font-semibold">{result.stats.zonesFound}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zones Validated:</span>
                  <span className="font-semibold text-green-600">{result.stats.zonesValidated}</span>
                </div>
                {result.stats.zonesMissing > 0 && (
                  <div className="flex justify-between">
                    <span>Missing Zones:</span>
                    <span className="font-semibold text-orange-600">{result.stats.zonesMissing}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Prices Inserted:</span>
                  <span className="font-semibold text-blue-600">{result.stats.pricesInserted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prices Skipped (existing):</span>
                  <span className="font-semibold text-gray-600">{result.stats.pricesSkipped}</span>
                </div>

                {result.stats.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="font-semibold text-red-700 mb-1">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {result.stats.errors.slice(0, 5).map((error, index) => (
                        <li key={index} className="text-xs">{error}</li>
                      ))}
                      {result.stats.errors.length > 5 && (
                        <li className="text-xs">... and {result.stats.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {yearResult && (
          <div
            className={`p-4 rounded-lg ${
              yearResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <p className={`font-semibold mb-2 ${yearResult.success ? 'text-green-700' : 'text-yellow-700'}`}>
              {yearResult.success ? '✅ ' : '⚠️ '}
              {yearResult.message}
            </p>

            <div className="space-y-2 text-sm text-gray-700 mt-3">
              <div className="flex justify-between">
                <span>Months Completed:</span>
                <span className="font-semibold text-green-600">{yearResult.monthsCompleted}/12</span>
              </div>
              {yearResult.monthsFailed > 0 && (
                <div className="flex justify-between">
                  <span>Months Failed:</span>
                  <span className="font-semibold text-red-600">{yearResult.monthsFailed}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Prices Inserted:</span>
                <span className="font-semibold text-blue-600">{yearResult.totalStats.pricesInserted}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Prices Skipped:</span>
                <span className="font-semibold text-gray-600">{yearResult.totalStats.pricesSkipped}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Zones Found:</span>
                <span className="font-semibold">{yearResult.totalStats.zonesFound}</span>
              </div>

              {yearResult.monthlyResults.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="font-semibold mb-2">Monthly Breakdown:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs max-h-48 overflow-y-auto">
                    {yearResult.monthlyResults.map((monthResult) => (
                      <div
                        key={monthResult.month}
                        className={`p-2 rounded ${
                          monthResult.success ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        <div className="font-semibold">
                          {MONTHS.find(m => m.value === monthResult.month)?.label || `Month ${monthResult.month}`}
                        </div>
                        <div className="text-xs mt-1">
                          {monthResult.success ? '✅' : '❌'} {monthResult.stats.pricesInserted} inserted
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {yearResult.totalStats.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="font-semibold text-red-700 mb-1">Errors ({yearResult.totalStats.errors.length}):</p>
                  <ul className="list-disc list-inside text-red-600 text-xs max-h-32 overflow-y-auto">
                    {yearResult.totalStats.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {yearResult.totalStats.errors.length > 10 && (
                      <li>... and {yearResult.totalStats.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

