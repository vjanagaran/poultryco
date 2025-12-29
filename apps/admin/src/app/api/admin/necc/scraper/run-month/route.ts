import { NextRequest, NextResponse } from 'next/server';
import { runScraper } from '@/lib/api/necc';

export const maxDuration = 60; // 60 seconds timeout

// POST /api/admin/necc/scraper/run-month
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year } = body;

    // Validate input
    if (!month || !year) {
      return NextResponse.json(
        { success: false, message: 'Month and year are required' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, message: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { success: false, message: 'Year must be between 2020 and current year' },
        { status: 400 }
      );
    }

    // Run scraper via API
    const result = await runScraper(month, year);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[API] Scraper error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred while scraping';
    return NextResponse.json(
      {
        success: false,
        message,
        stats: {
          zonesFound: 0,
          zonesValidated: 0,
          zonesMissing: 0,
          pricesInserted: 0,
          pricesSkipped: 0,
          errors: [message],
        },
      },
      { status: 500 }
    );
  }
}

