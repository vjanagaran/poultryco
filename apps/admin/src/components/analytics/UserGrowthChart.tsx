'use client';

import { DailyUserGrowth } from '@/lib/api/analytics';

interface UserGrowthChartProps {
  data: DailyUserGrowth[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.new_users, d.active_users)));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth (Last 30 Days)</h3>
      
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue / 2)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-8 h-full flex items-end gap-1">
          {data.map((day, index) => {
            const newUsersHeight = (day.new_users / maxValue) * chartHeight;
            const activeUsersHeight = (day.active_users / maxValue) * chartHeight;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div>{new Date(day.date).toLocaleDateString()}</div>
                  <div>New: {day.new_users}</div>
                  <div>Active: {day.active_users}</div>
                </div>
                
                {/* Bars */}
                <div className="w-full flex gap-0.5">
                  <div
                    className="flex-1 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                    style={{ height: `${newUsersHeight}px` }}
                    title={`New users: ${day.new_users}`}
                  />
                  <div
                    className="flex-1 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${activeUsersHeight}px` }}
                    title={`Active users: ${day.active_users}`}
                  />
                </div>
                
                {/* X-axis label (show every 5 days) */}
                {index % 5 === 0 && (
                  <span className="text-xs text-gray-500 mt-1 absolute -bottom-4">
                    {new Date(day.date).getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">New Users</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Active Users</span>
        </div>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
        <div>
          <span className="text-gray-600">Total New:</span>
          <span className="ml-2 font-semibold">
            {data.reduce((sum, d) => sum + d.new_users, 0)}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Avg Daily:</span>
          <span className="ml-2 font-semibold">
            {Math.round(data.reduce((sum, d) => sum + d.new_users, 0) / data.length)}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Peak Day:</span>
          <span className="ml-2 font-semibold">
            {Math.max(...data.map(d => d.new_users))}
          </span>
        </div>
      </div>
    </div>
  );
}
