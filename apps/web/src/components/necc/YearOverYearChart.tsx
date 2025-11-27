'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface YoYDataPoint {
  dayOfYear: number;
  dayLabel: string; // "Jan 1", "Feb 15", etc.
  [year: string]: number | string; // "2023": 450, "2024": 475, etc.
}

interface YearOverYearChartProps {
  data: YoYDataPoint[];
  years: number[];
  title?: string;
}

// Generate distinct colors for each year
const generateYearColors = (years: number[]) => {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16', // lime
  ];
  
  return years.reduce((acc, year, index) => {
    acc[year] = colors[index % colors.length];
    return acc;
  }, {} as Record<number, string>);
};

export function YearOverYearChart({ data, years, title = 'Year-over-Year Price Comparison' }: YearOverYearChartProps) {
  const yearColors = generateYearColors(years);
  const currentYear = new Date().getFullYear();
  
  // State to track which years are visible
  const [visibleYears, setVisibleYears] = useState<Set<number>>(new Set(years));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any) => (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
                <span style={{ color: entry.color }} className="font-medium">
                  {entry.dataKey}:
                </span>
                <span className="font-semibold">₹{entry.value}</span>
              </div>
            ))}
        </div>
      );
    }
    return null;
  };

  // Toggle year visibility
  const toggleYear = (year: number) => {
    setVisibleYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        // Don't allow hiding all years
        if (newSet.size > 1) {
          newSet.delete(year);
        }
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  // Custom legend with click to toggle
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any) => {
          const year = parseInt(entry.value);
          const isCurrent = year === currentYear;
          const isVisible = visibleYears.has(year);
          return (
            <button
              key={entry.value}
              onClick={() => toggleYear(year)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:bg-gray-100 ${
                !isVisible ? 'opacity-40' : ''
              }`}
            >
              <div 
                className={`w-3 h-3 rounded-full transition-all ${!isVisible ? 'opacity-30' : ''}`}
                style={{ backgroundColor: entry.color }}
              />
              <span className={`text-sm ${isCurrent ? 'font-bold text-primary' : 'text-gray-600'} ${!isVisible ? 'line-through' : ''}`}>
                {entry.value}
                {isCurrent && ' (Current)'}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">
        Compare daily prices across years to identify seasonal patterns and trends
      </p>
      
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="dayLabel" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          
          {years.map(year => {
            const isVisible = visibleYears.has(year);
            return (
              <Line
                key={year}
                type="monotone"
                dataKey={year.toString()}
                stroke={yearColors[year]}
                strokeWidth={year === currentYear ? 3 : 2}
                dot={false}
                opacity={isVisible ? (year === currentYear ? 1 : 0.7) : 0}
                activeDot={{ r: 6 }}
                hide={!isVisible}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">💡 How to Read This Chart:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Each line represents a different year's price pattern</li>
          <li>• <strong>Click on any year in the legend to show/hide it</strong></li>
          <li>• Compare same dates across years to see price changes</li>
          <li>• Identify seasonal peaks and troughs</li>
          <li>• The current year ({currentYear}) is highlighted with a thicker line</li>
        </ul>
      </div>
    </div>
  );
}

