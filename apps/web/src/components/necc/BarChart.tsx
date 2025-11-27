'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarDataPoint[];
  title?: string;
  height?: number;
  color?: string;
  dataKey?: string;
  xAxisKey?: string;
}

export function BarChart({ 
  data, 
  title, 
  height = 300,
  color = '#3b82f6',
  dataKey = 'value',
  xAxisKey = 'name'
}: BarChartProps) {
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
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xAxisKey}
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
          <Bar 
            dataKey={dataKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

