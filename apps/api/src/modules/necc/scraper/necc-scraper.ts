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

    // 3. Validate zones exist and create missing ones
    const missingZones: string[] = [];
    const zoneMap = new Map<string, string>();

    // Get all existing zones first
    const allZones = await db
      .select({
        id: necZones.id,
        name: necZones.name,
      })
      .from(necZones);

    allZones.forEach((z: any) => {
      zoneMap.set(z.name, z.id);
    });

    // Check each zone from scraped data
    for (const zoneData of zones) {
      if (!zoneMap.has(zoneData.name)) {
        missingZones.push(zoneData.name);
        
        // Automatically create missing zone
        try {
          const [newZone] = await db
            .insert(necZones)
            .values({
              name: zoneData.name,
              slug: zoneData.slug,
              zoneType: zoneData.zone_type,
              isActive: true,
              sortOrder: 0,
            })
            .returning();

          if (newZone) {
            zoneMap.set(zoneData.name, newZone.id);
            stats.zonesValidated++;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          const errorMsg = `Failed to create zone "${zoneData.name}": ${message}`;
          stats.errors.push(errorMsg);
        }
      } else {
        stats.zonesValidated++;
      }
    }

    stats.zonesMissing = missingZones.length;
    
    if (missingZones.length > 0) {
      const infoMsg = `Automatically created ${missingZones.length} new zone(s): ${missingZones.join(', ')}`;
      // Don't add as error, just log it
      console.log(`[Scraper] ${infoMsg}`);
    }

    // 4. Insert missing prices
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

    // Build success message
    const parts: string[] = [];
    if (stats.pricesInserted > 0) {
      parts.push(`${stats.pricesInserted} price(s) inserted`);
    }
    if (stats.pricesSkipped > 0) {
      parts.push(`${stats.pricesSkipped} price(s) skipped (already exist)`);
    }
    if (stats.zonesMissing > 0) {
      parts.push(`${stats.zonesMissing} zone(s) created`);
    }

    const message = parts.length > 0
      ? `Successfully scraped ${month}/${year}. ${parts.join(', ')}.`
      : `Successfully scraped ${month}/${year}`;

    return {
      success: true,
      message,
      stats,
    };
  } catch (error: unknown) {
    console.error('[Scraper] Error:', error);
    const message = error instanceof Error ? error.message : 'Scraping failed';
    stats.errors.push(message);
    return {
      success: false,
      message: `Failed to scrape ${month}/${year}: ${message}`,
      stats,
    };
  }
}

