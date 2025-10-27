'use client';

import { ProfileCompletionSegment } from '@/lib/api/analytics';

interface ProfileSegmentChartProps {
  segments: ProfileCompletionSegment[];
  onSegmentClick?: (segment: ProfileCompletionSegment) => void;
}

export function ProfileSegmentChart({ segments, onSegmentClick }: ProfileSegmentChartProps) {
  const maxCount = Math.max(...segments.map(s => s.count));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Completion Distribution</h3>
      
      <div className="space-y-4">
        {segments.map((segment) => (
          <div 
            key={segment.range}
            className={`cursor-pointer transition-all ${onSegmentClick ? 'hover:bg-gray-50' : ''} p-3 rounded-lg`}
            onClick={() => onSegmentClick?.(segment)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{segment.range}</span>
              <span className="text-sm text-gray-600">
                {segment.count} users ({segment.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(segment.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Users:</span>
            <span className="ml-2 font-semibold">{segments.reduce((sum, s) => sum + s.count, 0)}</span>
          </div>
          <div>
            <span className="text-gray-600">Avg Completion:</span>
            <span className="ml-2 font-semibold">
              {(segments.reduce((sum, s, i) => {
                const midpoint = i === 0 ? 10 : i === 1 ? 35 : i === 2 ? 65 : 90;
                return sum + (s.count * midpoint);
              }, 0) / segments.reduce((sum, s) => sum + s.count, 0) || 0).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
