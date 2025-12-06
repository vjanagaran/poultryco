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
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

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

export function MonthScraperForm() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);

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

        <Button
          onClick={handleScrape}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? '⏳ Scraping...' : '🚀 Scrape Month'}
        </Button>

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
      </CardContent>
    </Card>
  );
}

