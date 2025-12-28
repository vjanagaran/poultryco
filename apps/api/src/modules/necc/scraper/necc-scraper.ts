import { eq, and, sql } from 'drizzle-orm';
import { necZones, necPrices } from '@/database/schema';
import { parseNECCTable } from './necc-parser';

/**
 * Fetch HTML using Puppeteer (headless browser) - handles JavaScript-rendered content
 */
async function fetchWithPuppeteer(month: number, year: number): Promise<string> {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set a realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to the page
    await page.goto('https://e2necc.com/home/eggprice', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for the form to be ready
    await page.waitForSelector('select[name="ddlMonth"]', { timeout: 10000 });

    // Fill in the form
    await page.select('select[name="ddlMonth"]', month.toString().padStart(2, '0'));
    await page.select('select[name="ddlYear"]', year.toString());
    await page.click('input[value="DailyReport"]');
    
    // Wait for navigation after form submission
    // The page will reload after clicking the submit button
    const navigationPromise = page.waitForNavigation({ 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Click the submit button
    await page.click('input[name="btnReport"]');
    
    // Wait for navigation to complete
    await navigationPromise;
    
    // Wait for the table to load on the new page
    try {
      await page.waitForSelector('table tr td', { timeout: 15000 });
      // Additional wait to ensure all data is loaded (JavaScript might still be rendering)
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      // Timeout waiting for table, continue anyway
    }

    // Get the HTML content
    const html = await page.content();
    
    await browser.close();
    return html;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

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
    // 1. First, GET the page to establish a session and get cookies
    // This mimics a real browser visit
    const getResponse = await fetch('https://e2necc.com/home/eggprice', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to GET NECC website: ${getResponse.statusText}`);
    }

    // Extract cookies from the GET response
    const cookies = getResponse.headers.get('set-cookie') || '';
    const cookieString = cookies.split(',').map(c => c.split(';')[0].trim()).join('; ');

    // 2. Now POST with the form data, including cookies
    const formData = new URLSearchParams();
    formData.append('ddlMonth', month.toString());
    formData.append('ddlYear', year.toString());
    formData.append('rblReportType', 'DailyReport');
    formData.append('btnReport', 'Get Sheet');

    const response = await fetch('https://e2necc.com/home/eggprice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://e2necc.com/home/eggprice',
        'Origin': 'https://e2necc.com',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        ...(cookieString ? { 'Cookie': cookieString } : {}),
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NECC website: ${response.statusText}`);
    }

    let html = await response.text();
    
    // Check if we got actual data (not just dashes) - if not, try Puppeteer
    let hasData = false;
    const namakkalRow = html.match(/<td[^>]*>Namakkal<\/td>([\s\S]{0,500})/i);
    if (namakkalRow) {
      hasData = /\d{3,}/.test(namakkalRow[1]);
    }
    
    // If fetch method returned empty data (all dashes), try Puppeteer
    if (!hasData) {
      try {
        html = await fetchWithPuppeteer(month, year);
      } catch (puppeteerError) {
        const errorMsg = puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error';
        stats.errors.push(`Puppeteer fallback failed: ${errorMsg}`);
        // Continue with the original HTML from fetch
      }
    }

    // Parse HTML table
    const { zones, prices } = await parseNECCTable(html, month, year);
    stats.zonesFound = zones.length;

    // 3. Validate zones exist and create missing ones
    const missingZones: string[] = [];
    const zoneMap = new Map<string, string>();

    // Get all existing zones first (including slug for matching)
    const allZones = await db
      .select({
        id: necZones.id,
        name: necZones.name,
        slug: necZones.slug,
      })
      .from(necZones);

    // Create maps for both exact name and normalized name matching
    const zoneSlugMap = new Map<string, string>(); // slug -> zone id
    
    allZones.forEach((z: any) => {
      zoneMap.set(z.name, z.id);
      zoneSlugMap.set(z.slug.toLowerCase(), z.id); // For slug-based matching
    });

    // Check each zone from scraped data
    for (const zoneData of zones) {
      // First try exact name match
      let zoneId = zoneMap.get(zoneData.name);
      
      // If not found, try slug-based matching (handles case variations)
      if (!zoneId) {
        const normalizedSlug = zoneData.slug.toLowerCase();
        zoneId = zoneSlugMap.get(normalizedSlug);
        
        if (zoneId) {
          // Found by slug, update the name mapping for this scrape
          zoneMap.set(zoneData.name, zoneId);
        }
      }
      
      if (!zoneId) {
        // Zone doesn't exist, try to create it
        missingZones.push(zoneData.name);
        
        // Check if slug already exists (case-insensitive)
        const normalizedSlug = zoneData.slug.toLowerCase();
        const existingZoneBySlug = zoneSlugMap.get(normalizedSlug);
        
        if (existingZoneBySlug) {
          // Slug exists, use existing zone (probably a name variation)
          zoneMap.set(zoneData.name, existingZoneBySlug);
          stats.zonesValidated++;
        } else {
          // Create new zone
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
              zoneSlugMap.set(normalizedSlug, newZone.id);
              stats.zonesValidated++;
            }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            // If it's a duplicate slug error, try to find existing zone
            if (message.includes('slug') && message.includes('unique')) {
              // Try to find existing zone with this slug
              const existingZone = await db
                .select({ id: necZones.id, name: necZones.name, slug: necZones.slug })
                .from(necZones)
                .where(sql`LOWER(${necZones.slug}) = LOWER(${zoneData.slug})`)
                .limit(1);
              
              if (existingZone.length > 0) {
                const existing = existingZone[0];
                zoneMap.set(zoneData.name, existing.id);
                zoneSlugMap.set(normalizedSlug, existing.id);
                stats.zonesValidated++;
              } else {
                const errorMsg = `Failed to create zone "${zoneData.name}": ${message}`;
                stats.errors.push(errorMsg);
              }
            } else {
              const errorMsg = `Failed to create zone "${zoneData.name}": ${message}`;
              stats.errors.push(errorMsg);
            }
          }
        }
      } else {
        stats.zonesValidated++;
      }
    }

    stats.zonesMissing = missingZones.length;
    

    // 4. Insert missing prices
    let namakkalPricesProcessed = 0;
    let namakkalPricesSkipped = 0;
    let namakkalPricesInserted = 0;
    
    for (const priceData of prices) {
      try {
        let zone_id = zoneMap.get(priceData.zone_name);
        
        // If exact match not found, try fuzzy matching for ALL zone names
        // This handles cases where zone name might have slight variations (case, spacing, etc.)
        if (!zone_id) {
          // Normalize the scraped zone name for comparison
          const normalizedScraped = priceData.zone_name.toLowerCase().replace(/\s+/g, ' ').trim();
          
          // Extract key words from zone name (remove common suffixes like (CC), (OD), etc.)
          const keyWords = normalizedScraped
            .replace(/\s*\([^)]*\)\s*/g, '') // Remove parenthetical codes
            .replace(/\s+/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(w => w.length > 2); // Filter out very short words
          
          // Try to find zone by partial match
          for (const [dbZoneName, dbZoneId] of zoneMap.entries()) {
            const normalizedDb = dbZoneName.toLowerCase().replace(/\s+/g, ' ').trim();
            
            // Strategy 1: Exact match after normalization
            if (normalizedScraped === normalizedDb) {
              zone_id = dbZoneId;
              zoneMap.set(priceData.zone_name, dbZoneId); // Cache for future lookups
              break;
            }
            
            // Strategy 2: One contains the other (for cases like "Namakkal" vs "Namakkal Production Center")
            if (normalizedScraped.includes(normalizedDb) || normalizedDb.includes(normalizedScraped)) {
              zone_id = dbZoneId;
              zoneMap.set(priceData.zone_name, dbZoneId); // Cache for future lookups
              break;
            }
            
            // Strategy 3: Key word matching (for cases with different formatting)
            if (keyWords.length > 0) {
              const dbKeyWords = normalizedDb
                .replace(/\s*\([^)]*\)\s*/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .split(/\s+/)
                .filter(w => w.length > 2);
              
              // Check if key words match
              const matchingWords = keyWords.filter(w => dbKeyWords.includes(w));
              if (matchingWords.length > 0 && matchingWords.length === Math.min(keyWords.length, dbKeyWords.length)) {
                zone_id = dbZoneId;
                zoneMap.set(priceData.zone_name, dbZoneId); // Cache for future lookups
                break;
              }
            }
          }
        }
        
        if (!zone_id) {
          // Log warning for problematic period or if it's a common zone
          const isCommonZone = ['namakkal', 'ahmedabad', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'kolkata', 'bengaluru']
            .some(zone => priceData.zone_name.toLowerCase().includes(zone));
          
          continue;
        }
        
        // Track Namakkal prices for debugging
        if (priceData.zone_name.toLowerCase().includes('namakkal')) {
          namakkalPricesProcessed++;
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
          if (priceData.zone_name.toLowerCase().includes('namakkal')) {
            namakkalPricesSkipped++;
          }
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
          if (priceData.zone_name.toLowerCase().includes('namakkal')) {
            namakkalPricesInserted++;
          }
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

    // Debug: Log Namakkal-specific stats for 2020
    if (year === 2020 && namakkalPricesProcessed > 0) {
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

