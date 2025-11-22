'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export type TimePeriod = '7d' | '30d' | 'month' | 'year' | 'all';

interface ZoneTimePeriodSelectorProps {
  zoneslug: string;
  currentPeriod: TimePeriod;
  selectedYear?: number;
  selectedMonth?: string;
}

export function ZoneTimePeriodSelector({ 
  zoneslug, 
  currentPeriod,
  selectedYear,
  selectedMonth 
}: ZoneTimePeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  // Generate year options (2009 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 + 1 }, (_, i) => currentYear - i);

  // Generate month options
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const handlePeriodChange = (period: TimePeriod) => {
    const params = new URLSearchParams();
    if (period !== '30d') {
      params.set('period', period);
    }
    
    // Set default year/month when switching to those periods
    if (period === 'year') {
      params.set('year', currentYear.toString());
    } else if (period === 'month') {
      const currentMonth = new Date().getMonth() + 1;
      params.set('month', `${currentYear}-${String(currentMonth).padStart(2, '0')}`);
    }
    
    router.push(`/necc/zones/${zoneslug}?${params.toString()}`);
  };

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', 'year');
    params.set('year', year);
    router.push(`/necc/zones/${zoneslug}?${params.toString()}`);
  };

  const handleMonthChange = (monthValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', 'month');
    
    // monthValue is in format "YYYY-MM"
    const [year, month] = monthValue.split('-');
    params.set('month', monthValue);
    
    router.push(`/necc/zones/${zoneslug}?${params.toString()}`);
  };

  // Parse selected month for display
  const selectedMonthObj = selectedMonth 
    ? { 
        year: selectedMonth.split('-')[0], 
        month: selectedMonth.split('-')[1] 
      }
    : { year: currentYear.toString(), month: String(new Date().getMonth() + 1).padStart(2, '0') };

  return (
    <div className="space-y-3">
      {/* Period Tabs */}
      <div className="flex gap-2 flex-wrap">
        {periods.map(p => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPeriod === p.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      
      {/* Period-Specific Controls - Shown below tabs */}
      {currentPeriod === 'year' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Select Year:</span>
          <div className="relative">
            <select
              value={selectedYear || currentYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="appearance-none pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer min-w-[120px]"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      )}
      
      {currentPeriod === 'month' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Select Month:</span>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedMonthObj.month}
                onChange={(e) => handleMonthChange(`${selectedMonthObj.year}-${e.target.value}`)}
                className="appearance-none pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer min-w-[140px]"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedMonthObj.year}
                onChange={(e) => handleMonthChange(`${e.target.value}-${selectedMonthObj.month}`)}
                className="appearance-none pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer min-w-[120px]"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

