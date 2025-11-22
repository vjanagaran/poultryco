import { NECCPrice } from '@/lib/api/necc-prices';

interface YoYDataPoint {
  dayOfYear: number;
  dayLabel: string;
  [year: string]: number | string;
}

/**
 * Transform daily price data into Year-over-Year comparison format
 * Groups prices by day-of-year (1-365) and creates columns for each year
 */
export function transformToYearOverYear(prices: NECCPrice[]): {
  data: YoYDataPoint[];
  years: number[];
} {
  if (prices.length === 0) {
    return { data: [], years: [] };
  }

  // Group by day of year
  const dayOfYearMap = new Map<number, Map<number, number>>();
  const yearsSet = new Set<number>();

  prices.forEach(price => {
    if (!price.suggested_price) return;

    const date = new Date(price.date);
    const year = date.getFullYear();
    const dayOfYear = getDayOfYear(date);

    yearsSet.add(year);

    if (!dayOfYearMap.has(dayOfYear)) {
      dayOfYearMap.set(dayOfYear, new Map());
    }

    const yearMap = dayOfYearMap.get(dayOfYear)!;
    
    // Average if multiple prices for same day (shouldn't happen, but just in case)
    if (yearMap.has(year)) {
      const existing = yearMap.get(year)!;
      yearMap.set(year, Math.round((existing + price.suggested_price) / 2));
    } else {
      yearMap.set(year, price.suggested_price);
    }
  });

  // Convert to array format for Recharts
  const years = Array.from(yearsSet).sort();
  const data: YoYDataPoint[] = [];

  // Create data points for each day of year
  for (let day = 1; day <= 365; day++) {
    const yearData = dayOfYearMap.get(day);
    if (!yearData || yearData.size === 0) continue;

    const dataPoint: YoYDataPoint = {
      dayOfYear: day,
      dayLabel: getDayLabel(day),
    };

    years.forEach(year => {
      const price = yearData.get(year);
      if (price !== undefined) {
        dataPoint[year.toString()] = price;
      }
    });

    // Only include days that have at least 2 years of data for meaningful comparison
    const yearsWithData = years.filter(y => dataPoint[y.toString()] !== undefined);
    if (yearsWithData.length >= 2) {
      data.push(dataPoint);
    }
  }

  return { data, years };
}

/**
 * Calculate day of year (1-365/366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Convert day of year to readable label
 * Returns format like "Jan 1", "Feb 15", "Dec 31"
 */
function getDayLabel(dayOfYear: number): string {
  // Use 2024 as reference year (leap year to handle Feb 29)
  const date = new Date(2024, 0, dayOfYear);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

/**
 * Calculate YoY statistics for insights
 */
export function calculateYoYStats(data: YoYDataPoint[], years: number[]): {
  avgPriceByYear: Record<number, number>;
  highestPriceDay: { day: string; year: number; price: number } | null;
  lowestPriceDay: { day: string; year: number; price: number } | null;
  mostVolatileMonth: string | null;
} {
  if (data.length === 0 || years.length === 0) {
    return {
      avgPriceByYear: {},
      highestPriceDay: null,
      lowestPriceDay: null,
      mostVolatileMonth: null,
    };
  }

  // Calculate average price per year
  const avgPriceByYear: Record<number, number> = {};
  years.forEach(year => {
    const yearPrices = data
      .map(d => d[year.toString()] as number)
      .filter(p => p !== undefined && p !== null);
    
    if (yearPrices.length > 0) {
      avgPriceByYear[year] = Math.round(
        yearPrices.reduce((a, b) => a + b, 0) / yearPrices.length
      );
    }
  });

  // Find highest and lowest price days
  let highestPriceDay: { day: string; year: number; price: number } | null = null;
  let lowestPriceDay: { day: string; year: number; price: number } | null = null;

  data.forEach(point => {
    years.forEach(year => {
      const price = point[year.toString()] as number;
      if (price !== undefined && price !== null) {
        if (!highestPriceDay || price > highestPriceDay.price) {
          highestPriceDay = { day: point.dayLabel, year, price };
        }
        if (!lowestPriceDay || price < lowestPriceDay.price) {
          lowestPriceDay = { day: point.dayLabel, year, price };
        }
      }
    });
  });

  // Calculate most volatile month
  const monthVolatility: Record<string, number> = {};
  data.forEach(point => {
    const month = point.dayLabel.split(' ')[0]; // Extract month name
    const prices = years
      .map(y => point[y.toString()] as number)
      .filter(p => p !== undefined && p !== null);
    
    if (prices.length >= 2) {
      const volatility = Math.max(...prices) - Math.min(...prices);
      monthVolatility[month] = (monthVolatility[month] || 0) + volatility;
    }
  });

  const mostVolatileMonth = Object.entries(monthVolatility).length > 0
    ? Object.entries(monthVolatility).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return {
    avgPriceByYear,
    highestPriceDay,
    lowestPriceDay,
    mostVolatileMonth,
  };
}

