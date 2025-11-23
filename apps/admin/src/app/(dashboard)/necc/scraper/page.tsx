import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MonthScraperForm } from "@/components/necc/scraper/MonthScraperForm";

export default function ScraperPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 NECC Month Scraper</h1>
          <p className="text-gray-600 mt-2">
            Scrape NECC prices for any month/year from the official website
          </p>
        </div>
        <Link href="/necc">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Scraper Form */}
      <MonthScraperForm />

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <h3 className="font-semibold mb-2">ℹ️ How it works:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Fetches price data from NECC official website (e2necc.com)</li>
          <li>Automatically creates missing zones if they don&apos;t exist</li>
          <li>Only inserts prices that don&apos;t already exist (skips duplicates)</li>
          <li>Marks scraped prices with source: &quot;scraped&quot; and mode: &quot;MANUAL&quot;</li>
          <li>Safe to run multiple times - won&apos;t duplicate data</li>
        </ul>
      </div>
    </div>
  );
}

