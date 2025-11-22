'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ZoneComparisonChart } from "@/components/necc/ZoneComparisonChart";
import { ShareableInfographicCard } from "@/components/necc/ShareableInfographicCard";
import { NECCQuickLinks } from "@/components/necc/NECCQuickLinks";

interface Zone {
  id: string;
  name: string;
  slug: string;
  zone_type: string;
}

interface PriceData {
  date: string;
  [zoneName: string]: string | number;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

export default function ComparePage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<PriceData[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '3m' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (selectedZones.length > 0) {
      fetchComparisonData();
    }
  }, [selectedZones, period]);

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/necc/zones');
      const data = await response.json();
      setZones(data);
      // Pre-select first 3 zones
      if (data.length >= 3) {
        setSelectedZones([data[0].id, data[1].id, data[2].id]);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const response = await fetch(`/api/necc/compare?zones=${selectedZones.join(',')}&start=${startStr}&end=${endStr}`);
      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    }
  };

  const toggleZone = (zoneId: string) => {
    setSelectedZones(prev => {
      if (prev.includes(zoneId)) {
        return prev.filter(id => id !== zoneId);
      } else if (prev.length < 6) {
        return [...prev, zoneId];
      }
      return prev;
    });
  };

  const selectedZoneDetails = zones.filter(z => selectedZones.includes(z.id));
  const chartZones = selectedZoneDetails.map((zone, index) => ({
    name: zone.name,
    color: COLORS[index % COLORS.length],
  }));

  // Calculate comparison stats
  const stats = selectedZoneDetails.map(zone => {
    const zonePrices = comparisonData
      .map(d => d[zone.name])
      .filter(p => typeof p === 'number') as number[];
    
    if (zonePrices.length === 0) return { zone, avg: null, min: null, max: null };
    
    return {
      zone,
      avg: Math.round(zonePrices.reduce((a, b) => a + b, 0) / zonePrices.length),
      min: Math.min(...zonePrices),
      max: Math.max(...zonePrices),
    };
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/necc" className="hover:text-primary">NECC</Link>
            {" > "}
            <span>Zone Comparison</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compare Zones
          </h1>
          <p className="text-gray-600">
            Select up to 6 zones to compare prices and trends
          </p>
        </div>

        {/* Zone Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Zones to Compare (max 6)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                disabled={!selectedZones.includes(zone.id) && selectedZones.length >= 6}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedZones.includes(zone.id)
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {zone.name}
                <span className="text-xs block mt-1">
                  {zone.zone_type === 'consumption_center' ? 'CC' : 'PC'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Time Period
          </h2>
          <div className="flex gap-3">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '3m', label: '3 Months' },
              { value: '1y', label: '1 Year' },
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value as typeof period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Chart */}
        {selectedZones.length > 0 && comparisonData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <ZoneComparisonChart
              data={comparisonData}
              zones={chartZones}
              title={`Price Comparison - Last ${period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '3m' ? '3 Months' : 'Year'}`}
              height={400}
            />
          </div>
        )}

        {/* Stats Grid */}
        {stats.length > 0 && stats.some(s => s.avg !== null) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map(({ zone, avg, min, max }) => (
              <div key={zone.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{zone.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-bold text-primary">₹{avg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Highest:</span>
                    <span className="font-bold text-red-600">₹{max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lowest:</span>
                    <span className="font-bold text-green-600">₹{min}</span>
                  </div>
                </div>
                <Link
                  href={`/necc/zones/${zone.slug}`}
                  className="block mt-4 text-sm text-primary hover:underline"
                >
                  View zone details →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Table */}
        {selectedZones.length > 0 && comparisonData.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  {selectedZoneDetails.map(zone => (
                    <th key={zone.id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {zone.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonData.slice(0, 30).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    {selectedZoneDetails.map(zone => (
                      <td key={zone.id} className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {row[zone.name] ? `₹${row[zone.name]}` : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {selectedZones.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              Select at least one zone to start comparing
            </p>
          </div>
        )}

        {/* NECC Quick Links */}
        <div className="mt-12">
          <NECCQuickLinks />
        </div>
      </div>
    </div>
  );
}

