import * as cheerio from 'cheerio';

interface ZoneData {
  name: string;
  slug: string;
  zone_type: 'production_center' | 'consumption_center';
}

interface PriceData {
  zone_name: string;
  date: string;
  suggested_price: number | null;
  prevailing_price: number | null;
}

export async function parseNECCTable(
  html: string,
  month: number,
  year: number
): Promise<{ zones: ZoneData[]; prices: PriceData[] }> {
  const $ = cheerio.load(html);
  const zones: ZoneData[] = [];
  const priceMap = new Map<string, PriceData>();

  // Find all table rows
  const rows = $('table tr');
  
  // Parse day number header to map column index to actual day
  const dayColumnMap: Map<number, number> = new Map();
  let headerParsed = false;

  rows.each((rowIndex: number, row: cheerio.Element) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    // First cell is the zone name or section header
    let firstCellText = $(cells[0]).text();
    
    // Clean and normalize text: trim, collapse multiple spaces, normalize whitespace
    firstCellText = firstCellText
      .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
      .trim(); // Trim start and end
    
    // Skip section headers
    if (firstCellText.includes('NECC SUGGESTED EGG PRICES') || 
        firstCellText.includes('Prevailing Prices')) {
      return;
    }

    // Skip invalid rows
    if (!firstCellText) return;

    // Skip header rows
    const lowerText = firstCellText.toLowerCase();
    if (lowerText.includes('name of') || 
        lowerText.includes('zone') || 
        lowerText.includes('select type') ||
        lowerText.includes('daily rate') ||
        lowerText.includes('monthly avg')) {
      return;
    }

    // Parse day number header row ONCE (contains numbers like "1 2 3 4 5...")
    if (!headerParsed) {
      if (/^(\d+\s*)+$/.test(firstCellText) || lowerText.includes('day')) {
        dayColumnMap.clear();
        
        // Parse each cell to get the day number
        for (let cellIdx = 1; cellIdx < cells.length; cellIdx++) {
          const cellText = $(cells[cellIdx]).text().trim();
          const dayNum = parseInt(cellText);
          
          if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
            dayColumnMap.set(cellIdx, dayNum);
          } else if (cellText.toLowerCase().includes('average')) {
            break;
          }
        }
        
        headerParsed = true;
        return;
      }
    }

    // Skip if it's just numbers or contains multiple numbers (header rows we might have missed)
    if (/^\d+$/.test(firstCellText) || /^(\d+\s+){2,}/.test(firstCellText)) {
      return;
    }

    // Skip if it's very short (< 3 chars)
    if (firstCellText.length < 3) {
      return;
    }

    // Skip if it contains "Average"
    if (firstCellText.toLowerCase().includes('average')) {
      return;
    }

    // This should be a zone row
    const zoneName = firstCellText;
    let zone_type: 'production_center' | 'consumption_center' = 'production_center';

    // Determine zone type based on (CC) suffix
    if (zoneName.includes('(CC)')) {
      zone_type = 'consumption_center';
    }

    // Generate slug from the full name
    const slug = zoneName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Add zone (if not already added)
    const existingZone = zones.find(z => z.name === zoneName);
    if (!existingZone) {
      zones.push({ name: zoneName, slug, zone_type });
    }

    // Parse prices for each day using the day column map
    if (dayColumnMap.size > 0) {
      // Use the mapped columns
      for (const [cellIdx, day] of dayColumnMap.entries()) {
        if (cellIdx >= cells.length) continue;
        
        const cellText = $(cells[cellIdx]).text().trim();

        // Skip if empty or just a dash
        if (!cellText || cellText === '-') continue;

        // Create date string
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const mapKey = `${zoneName}|${date}`;

        // Parse price
        const priceValue = parseInt(cellText.replace(/[^\d]/g, ''));
        if (isNaN(priceValue) || priceValue === 0) continue;

        // Create price entry (only suggested_price, prevailing_price stays null)
        if (!priceMap.has(mapKey)) {
          priceMap.set(mapKey, {
            zone_name: zoneName,
            date,
            suggested_price: priceValue,
            prevailing_price: null, // Not captured by scraper
          });
        }
      }
    } else {
      // Fallback: assume columns 1 onwards are days 1 onwards until we hit "Average" or end
      const totalCells = cells.length;
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let cellIdx = 1; cellIdx < totalCells; cellIdx++) {
        const cellText = $(cells[cellIdx]).text().trim();
        
        // Stop if we hit "Average" column
        if (cellText.toLowerCase().includes('average')) break;
        
        const day = cellIdx;
        
        // Skip if day exceeds days in month
        if (day > daysInMonth) continue;

        // Skip if empty or just a dash
        if (!cellText || cellText === '-') continue;

        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const mapKey = `${zoneName}|${date}`;

        const priceValue = parseInt(cellText.replace(/[^\d]/g, ''));
        if (isNaN(priceValue) || priceValue === 0) continue;

        if (!priceMap.has(mapKey)) {
          priceMap.set(mapKey, {
            zone_name: zoneName,
            date,
            suggested_price: priceValue,
            prevailing_price: null, // Not captured by scraper
          });
        }
      }
    }
  });

  // Convert Map to Array
  const prices = Array.from(priceMap.values());

  console.log(`[Parser] Parsed ${zones.length} zones and ${prices.length} price entries`);

  return { zones, prices };
}

