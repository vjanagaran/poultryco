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


  // Find all table rows - try multiple table selectors in case structure changed
  let rows = $('table tr');
  
  // If no rows found, try alternative table structures
  if (rows.length === 0) {
    rows = $('tbody tr');
    if (rows.length === 0) {
      rows = $('tr');
    }
  }
  
  
  // Parse day number header to map column index to actual day
  const dayColumnMap: Map<number, number> = new Map();
  let headerParsed = false;
  let headerRowIndex = -1;

  // First pass: Check for <th> header row which contains day numbers
  rows.each((rowIndex: number, row: cheerio.Element) => {
    const thCells = $(row).find('th');
    if (thCells.length > 5 && !headerParsed) {
      // Check if this looks like a day header row (first cell contains "zone" or "day")
      const firstThText = $(thCells[0]).text().trim().toLowerCase();
      if (firstThText.includes('zone') || firstThText.includes('day') || firstThText.includes('name')) {
        // Parse day numbers from <th> cells (skip first cell which is "Name Of Zone / Day")
        dayColumnMap.clear();
        for (let cellIdx = 1; cellIdx < thCells.length; cellIdx++) {
          const cellText = $(thCells[cellIdx]).text().trim();
          const dayNum = parseInt(cellText);
          if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
            // Map column index to day number (accounting for zone name column at index 0)
            dayColumnMap.set(cellIdx, dayNum);
          } else if (cellText.toLowerCase().includes('average')) {
            break;
          }
        }
        if (dayColumnMap.size > 0) {
          headerRowIndex = rowIndex;
          headerParsed = true;
        }
      }
    }
  });

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
      // After this header, the next rows should be zone data rows
      // Reset header parsing state to look for zone rows
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
    // Try multiple strategies to detect the header row
    if (!headerParsed) {
      // Strategy 1: First cell is empty or very short, and other cells contain day numbers
      const firstCellEmpty = !firstCellText || firstCellText.length < 3;
      let dayCountInRow = 0;
      
      if (firstCellEmpty && cells.length > 5) {
        // Check if other cells contain day numbers
        for (let cellIdx = 1; cellIdx < Math.min(cells.length, 32); cellIdx++) {
          const cellText = $(cells[cellIdx]).text().trim();
          const dayNum = parseInt(cellText);
          if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
            dayCountInRow++;
          }
        }
      }
      
      // Strategy 2: Pattern matching (original)
      const isDayHeaderPattern = /^(\d+\s*)+$/.test(firstCellText) || 
                                 lowerText.includes('day') ||
                                 /^\s*(\d+\s+){2,}/.test(firstCellText);
      
      // Strategy 3: Row with many numeric cells (likely day header)
      const isDayHeaderByCount = firstCellEmpty && dayCountInRow >= 5;
      
      if (isDayHeaderPattern || isDayHeaderByCount) {
        dayColumnMap.clear();
        
        // Parse each cell to get the day number
        // Start from cell 0 if first cell is empty, otherwise from cell 1
        const startIdx = firstCellEmpty ? 0 : 1;
        
        for (let cellIdx = startIdx; cellIdx < cells.length; cellIdx++) {
          const cellText = $(cells[cellIdx]).text().trim();
          const dayNum = parseInt(cellText);
          
          if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
            dayColumnMap.set(cellIdx, dayNum);
          } else if (cellText.toLowerCase().includes('average')) {
            break;
          }
        }
        
        if (dayColumnMap.size > 0) {
          headerRowIndex = rowIndex;
          headerParsed = true;
          return;
        }
      }
      
    }

    // Skip if it's just numbers or contains multiple numbers (header rows we might have missed)
    // BUT only if we've already parsed the header (to avoid skipping the actual header)
    if (headerParsed && (/^\d+$/.test(firstCellText) || /^(\d+\s+){2,}/.test(firstCellText))) {
      return;
    }

    // Skip if it's very short (< 3 chars) AND we've parsed the header
    // This allows us to catch header rows that have empty first cells
    if (headerParsed && firstCellText.length < 3 && rowIndex > headerRowIndex + 2) {
      // Only skip if we're well past the header row
      return;
    }
    
    // Skip rows that are clearly not zone rows (but only after header is found)
    if (headerParsed && firstCellText.length < 3 && rowIndex <= headerRowIndex + 1) {
      // This might be a sub-header or separator, skip it
      return;
    }

    // Skip if it contains "Average"
    if (firstCellText.toLowerCase().includes('average')) {
      return;
    }

    // Skip if first cell is a day number header row (contains pattern like "01 02 03..." or "1 2 3...")
    const dayNumberPattern = /^(\d{1,2}\s+){3,}/.test(firstCellText);
    if (dayNumberPattern) {
      return;
    }

    // Skip if first cell contains only numbers separated by spaces (another header pattern)
    const onlyNumbersPattern = /^[\d\s]+$/.test(firstCellText) && firstCellText.trim().split(/\s+/).length >= 3;
    if (onlyNumbersPattern) {
      return;
    }

    // This should be a zone row
    // Normalize zone name: remove extra spaces, normalize case variations
    let zoneName = firstCellText
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
    
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
    let pricesFoundForZone = 0;
    
    if (dayColumnMap.size > 0) {
      // Use the mapped columns (explicit day header found)
      for (const [cellIdx, day] of dayColumnMap.entries()) {
        if (cellIdx >= cells.length) continue;
        
        const cellText = $(cells[cellIdx]).text().trim();

        // Skip if empty or just a dash
        if (!cellText || cellText === '-' || cellText === '') continue;

        // Create date string
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const mapKey = `${zoneName}|${date}`;

        // Parse price - be more flexible with price formats
        const priceValue = parseInt(cellText.replace(/[^\d]/g, ''));
        if (isNaN(priceValue) || priceValue === 0) continue;
        
        // Validate price is reasonable (between 100 and 1000 rupees per 100 eggs)
        if (priceValue < 100 || priceValue > 1000) {
          continue;
        }

        // Create price entry (only suggested_price, prevailing_price stays null)
        if (!priceMap.has(mapKey)) {
          priceMap.set(mapKey, {
            zone_name: zoneName,
            date,
            suggested_price: priceValue,
            prevailing_price: null, // Not captured by scraper
          });
          pricesFoundForZone++;
        }
      }
    } else {
      // No explicit day header found - assume columns 1+ are days 1+ (sequential)
      // This handles the case where HTML doesn't have a day header row
      const totalCells = cells.length;
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let cellIdx = 1; cellIdx < totalCells; cellIdx++) {
        const cellText = $(cells[cellIdx]).text().trim();
        
        // Stop if we hit "Average" column
        if (cellText.toLowerCase().includes('average')) break;
        
        // Day is the column index (cell 1 = day 1, cell 2 = day 2, etc.)
        const day = cellIdx;
        
        // Skip if day exceeds days in month
        if (day > daysInMonth) continue;

        // Skip if empty or just a dash
        if (!cellText || cellText === '-' || cellText === '') continue;

        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const mapKey = `${zoneName}|${date}`;

        const priceValue = parseInt(cellText.replace(/[^\d]/g, ''));
        if (isNaN(priceValue) || priceValue === 0) continue;
        
        // Validate price is reasonable
        if (priceValue < 100 || priceValue > 1000) {
          continue;
        }

        if (!priceMap.has(mapKey)) {
          priceMap.set(mapKey, {
            zone_name: zoneName,
            date,
            suggested_price: priceValue,
            prevailing_price: null, // Not captured by scraper
          });
          pricesFoundForZone++;
        }
      }
    }
    
  });

  // Convert Map to Array
  const prices = Array.from(priceMap.values());


  return { zones, prices };
}

