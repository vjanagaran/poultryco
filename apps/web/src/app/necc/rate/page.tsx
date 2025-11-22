'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NECCQuickLinks } from "@/components/necc/NECCQuickLinks";

interface Zone {
  id: string;
  name: string;
  slug: string;
  zone_type: string;
}

interface Price {
  zone_id: string;
  day_of_month: number;
  suggested_price: number | null;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function RatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentDate = new Date();
  
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get('month') ? parseInt(searchParams.get('month')!) : currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get('year') ? parseInt(searchParams.get('year')!) : currentDate.getFullYear()
  );
  const [sheetType, setSheetType] = useState(searchParams.get('type') || 'daily');
  const [zones, setZones] = useState<Zone[]>([]);
  const [monthPrices, setMonthPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [zonesRes, pricesRes] = await Promise.all([
        fetch('/api/necc/zones'),
        fetch(`/api/necc/prices/month?year=${selectedYear}&month=${selectedMonth}`)
      ]);
      
      const zonesData = await zonesRes.json();
      const pricesData = await pricesRes.json();
      
      setZones(zonesData);
      setMonthPrices(pricesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group prices by zone and day
  const pricesByZoneAndDay = new Map<string, Map<number, number | null>>();
  
  monthPrices.forEach(price => {
    if (!pricesByZoneAndDay.has(price.zone_id)) {
      pricesByZoneAndDay.set(price.zone_id, new Map());
    }
    const dayPrices = pricesByZoneAndDay.get(price.zone_id)!;
    dayPrices.set(price.day_of_month, price.suggested_price);
  });

  // Calculate monthly averages for each zone
  const zoneAverages = zones.map(zone => {
    const zonePrices = monthPrices.filter(p => p.zone_id === zone.id && p.suggested_price !== null);
    const avg = zonePrices.length > 0
      ? Math.round(zonePrices.reduce((sum, p) => sum + (p.suggested_price || 0), 0) / zonePrices.length)
      : null;
    return { zone, average: avg };
  });

  // Filter out zones with no prices at all
  const zonesWithPrices = zones.filter(zone => {
    if (sheetType === 'monthly') {
      const avg = zoneAverages.find(z => z.zone.id === zone.id)?.average;
      return avg !== null;
    } else {
      const zonePrices = monthPrices.filter(p => p.zone_id === zone.id && p.suggested_price !== null);
      return zonePrices.length > 0;
    }
  });

  const monthName = MONTH_NAMES[selectedMonth - 1];
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: MONTH_NAMES[i] }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            NATIONAL EGG CO-ORDINATION COMMITTEE
          </h1>
          <p className="text-xs md:text-sm text-gray-600 max-w-5xl mx-auto leading-relaxed">
            ("The daily egg prices suggested by NECC, at its official website or through any other medium (including verbal, print and digital media), are only suggestive and not mandatory. The suggested prices are published solely for the reference and information of the trade and industry. NECC does not by itself or through any person enforce compliance or adherence with such suggested egg prices in any manner whatsoever. If any person not authorized by NECC chooses to disseminate NECC suggested prices through any medium, such person must also include the above clarification while disseminating NECC suggested prices of eggs.")
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month:</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year:</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Type Of Sheet:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sheetType"
                    value="daily"
                    checked={sheetType === 'daily'}
                    onChange={(e) => setSheetType('daily')}
                    className="mr-2"
                  />
                  Daily Rate Sheet
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sheetType"
                    value="monthly"
                    checked={sheetType === 'monthly'}
                    onChange={(e) => setSheetType('monthly')}
                    className="mr-2"
                  />
                  Monthly Avg. Sheet
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Print Sheet
              </button>
              <Link
                href="/necc/analysis"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                View Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* Rate Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="border border-gray-300 px-2 py-2 bg-gray-100 text-left font-bold sticky left-0 z-10">
                  Name Of Zone / Day
                </th>
                {sheetType === 'daily' ? (
                  <>
                    {days.map(day => (
                      <th key={day} className="border border-gray-300 px-1 py-2 bg-gray-100 text-center font-bold min-w-[40px]">
                        {day}
                      </th>
                    ))}
                    <th className="border border-gray-300 px-2 py-2 bg-gray-100 text-center font-bold min-w-[60px]">
                      Average
                    </th>
                  </>
                ) : (
                  <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-center font-bold">
                    Average
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {zonesWithPrices.map(zone => {
                const dayPrices = pricesByZoneAndDay.get(zone.id) || new Map();
                const zoneAvg = zoneAverages.find(z => z.zone.id === zone.id)?.average;
                
                return (
                  <tr key={zone.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 font-medium sticky left-0 bg-white z-10">
                      <Link
                        href={`/necc/zones/${zone.slug}`}
                        className="text-primary hover:underline"
                      >
                        {zone.name}
                      </Link>
                    </td>
                    {sheetType === 'daily' ? (
                      <>
                        {days.map(day => {
                          const price = dayPrices.get(day);
                          return (
                            <td
                              key={day}
                              className="border border-gray-300 px-1 py-2 text-center"
                            >
                              {price !== null && price !== undefined ? price : '-'}
                            </td>
                          );
                        })}
                        <td className="border border-gray-300 px-2 py-2 text-center font-semibold bg-gray-50">
                          {zoneAvg !== null ? zoneAvg.toFixed(2) : '-'}
                        </td>
                      </>
                    ) : (
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                        {zoneAvg !== null ? zoneAvg.toFixed(2) : '-'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/necc"
            className="text-primary hover:underline text-sm"
          >
            ← Back to NECC Home
          </Link>
        </div>
      </div>

      {/* NECC Quick Links */}
      <div className="mt-12">
        <NECCQuickLinks />
      </div>
    </div>
  );
}

export default function RatePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rate sheet...</p>
        </div>
      </div>
    }>
      <RatePageContent />
    </Suspense>
  );
}
