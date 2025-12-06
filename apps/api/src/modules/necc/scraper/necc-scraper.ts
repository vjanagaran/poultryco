import { eq, and } from 'drizzle-orm';
import { necZones, necPrices } from '@/database/schema';
import { parseNECCTable } from './necc-parser';

export interface ScrapeResult {
  success: boolean;
  message: string;
  stats: {
    zonesFound: number;
    zonesValidated: number;
    zonesMissing: number;
    pricesInserted: number;
    pricesSkipped: number;
    errors: string[];
  };
}

export async function scrapeNECCMonth(
  month: number,
  year: number,
  db: any
): Promise<ScrapeResult> {
  const stats = {
    zonesFound: 0,
    zonesValidated: 0,
    zonesMissing: 0,
    pricesInserted: 0,
    pricesSkipped: 0,
    errors: [] as string[],
  };

  try {
    // 1. Fetch NECC website with month/year parameters
    const formData = new URLSearchParams();
    formData.append('ddlMonth', month.toString());
    formData.append('ddlYear', year.toString());
    formData.append('rblReportType', 'DailyReport');
    formData.append('btnReport', 'Get Sheet');

    const response = await fetch('https://e2necc.com/home/eggprice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NECC website: ${response.statusText}`);
    }

    const html = await response.text();

    // 2. Parse HTML table
    const { zones, prices } = await parseNECCTable(html, month, year);
    stats.zonesFound = zones.length;

    // 3. Validate zones exist
    const missingZones: string[] = [];
    for (const zoneData of zones) {
      const [existingZone] = await db
        .select()
        .from(necZones)
        .where(eq(necZones.name, zoneData.name))
        .limit(1);

      if (!existingZone) {
        missingZones.push(zoneData.name);
      }
    }

    stats.zonesValidated = zones.length - missingZones.length;
    stats.zonesMissing = missingZones.length;
    
    if (missingZones.length > 0) {
      const warningMsg = `Found ${missingZones.length} new zones in NECC data. Please add manually: ${missingZones.join(', ')}`;
      stats.errors.push(warningMsg);
    }

    // 4. Get all zones with IDs
    const allZones = await db
      .select({
        id: necZones.id,
        name: necZones.name,
      })
      .from(necZones);

    const zoneMap = new Map(allZones.map((z: any) => [z.name, z.id]));

    // 5. Insert missing prices
    for (const priceData of prices) {
      try {
        const zone_id = zoneMap.get(priceData.zone_name);
        if (!zone_id) {
          continue;
        }

        // Check if price exists
        const [existing] = await db
          .select()
          .from(necPrices)
          .where(
            and(
              eq(necPrices.zoneId, zone_id as string),
              eq(necPrices.date, priceData.date)
            )
          )
          .limit(1);

        if (existing) {
          stats.pricesSkipped++;
        } else {
          // Extract date components
          const date = new Date(priceData.date);
          const dateYear = date.getFullYear();
          const dateMonth = date.getMonth() + 1;
          const day_of_month = date.getDate();

          await db
            .insert(necPrices)
            .values({
              zoneId: zone_id as string,
              date: priceData.date,
              year: dateYear,
              month: dateMonth,
              dayOfMonth: day_of_month,
              suggestedPrice: priceData.suggested_price,
              prevailingPrice: priceData.prevailing_price,
              source: 'scraped',
              scraperMode: 'MANUAL',
            });

          stats.pricesInserted++;
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg = `Error processing price for "${priceData.zone_name}" on ${priceData.date}: ${message}`;
        stats.errors.push(errorMsg);
      }
    }

    return {
      success: true,
      message: `Successfully scraped ${month}/${year}`,
      stats,
    };
  } catch (error: unknown) {
    console.error('[Scraper] Error:', error);
    const message = error instanceof Error ? error.message : 'Scraping failed';
    return {
      success: false,
      message,
      stats,
    };
  }
}

