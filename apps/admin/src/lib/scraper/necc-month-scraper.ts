import { createClient } from '@/lib/supabase/server';
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
  year: number
): Promise<ScrapeResult> {
  const supabase = await createClient();

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

    // Use exact parameter names from NECC website form
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

    // 3. Validate zones exist (DO NOT create new zones - manage manually)
    const missingZones: string[] = [];
    for (const zoneData of zones) {
      const { data: existingZone } = await supabase
        .from('necc_zones')
        .select('id, name')
        .eq('name', zoneData.name)
        .maybeSingle();

      if (!existingZone) {
        missingZones.push(zoneData.name);
      }
    }

    // Report missing zones but don't create them
    stats.zonesValidated = zones.length - missingZones.length;
    stats.zonesMissing = missingZones.length;
    
    if (missingZones.length > 0) {
      const warningMsg = `Found ${missingZones.length} new zones in NECC data. Please add manually: ${missingZones.join(', ')}`;
      stats.errors.push(warningMsg);
    }

    // 4. Get all zones with IDs
    const { data: allZones } = await supabase
      .from('necc_zones')
      .select('id, name');

    const zoneMap = new Map(allZones?.map((z) => [z.name, z.id]) || []);

    // 5. Insert missing prices
    for (const priceData of prices) {
      try {
        const zone_id = zoneMap.get(priceData.zone_name);
        if (!zone_id) {
          // Skip prices for zones that don't exist in DB (already warned above)
          continue;
        }

        // Check if price exists
        const { data: existing } = await supabase
          .from('necc_prices')
          .select('id')
          .eq('zone_id', zone_id)
          .eq('date', priceData.date)
          .maybeSingle();

        if (existing) {
          stats.pricesSkipped++;
        } else {
          // Extract date components
          const date = new Date(priceData.date);
          const dateYear = date.getFullYear();
          const dateMonth = date.getMonth() + 1;
          const day_of_month = date.getDate();

          const { error } = await supabase
            .from('necc_prices')
            .insert({
              zone_id,
              date: priceData.date,
              year: dateYear,
              month: dateMonth,
              day_of_month,
              suggested_price: priceData.suggested_price,
              prevailing_price: priceData.prevailing_price,
              source: 'scraped',
              mode: 'MANUAL',
            });

          if (!error) {
            stats.pricesInserted++;
          } else {
            const errorMsg = `Failed to insert price for "${priceData.zone_name}" on ${priceData.date}: ${error.message}`;
            stats.errors.push(errorMsg);
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg = `Error processing price for "${priceData.zone_name}" on ${priceData.date}: ${message}`;
        stats.errors.push(errorMsg);
      }
    }

    console.log(`[Scraper] Completed: ${stats.pricesInserted} inserted, ${stats.pricesSkipped} skipped${stats.errors.length > 0 ? `, ${stats.errors.length} errors` : ''}`);

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

