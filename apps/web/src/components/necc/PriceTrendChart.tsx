'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PriceDataPoint {
  date: string;
  price: number;
  label?: string;
}

interface PriceTrendChartProps {
  data: PriceDataPoint[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  color?: string;
}

export function PriceTrendChart({ 
  data, 
  title, 
  height = 300,
  showGrid = true,
  color = '#3b82f6' 
}: PriceTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey="label" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}
            formatter={(value: number) => [`₹${value}`, 'Price']}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

