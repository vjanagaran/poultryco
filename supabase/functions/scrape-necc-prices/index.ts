import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NECCPrice {
  zone: string
  date: string
  suggested_price: number | null
  prevailing_price: number | null
}

interface ScrapeResult {
  success: boolean
  zones_scraped: number
  zones_successful: number
  zones_failed: number
  prices_inserted: number
  errors: string[]
}

// Parse HTML and extract price data (based on PoultryCare implementation)
async function parseNECCPrices(html: string, year: number, month: number): Promise<NECCPrice[]> {
  const prices: NECCPrice[] = []
  const today = new Date()
  const currentDay = today.getDate()
  
  try {
    // Extract year and month from dropdowns (if needed for validation)
    // Extract table with id="pan2" (based on PoultryCare)
    
    // Parse HTML using regex (Deno doesn't have cheerio, so we use regex)
    // Find table with id="pan2"
    const tableMatch = html.match(/<table[^>]*id=["']pan2["'][^>]*>([\s\S]*?)<\/table>/i)
    if (!tableMatch) {
      throw new Error('Price table not found')
    }
    
    const tableHtml = tableMatch[1]
    
    // Extract all rows
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let rowMatch
    
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1]
      
      // Extract all cells in the row
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
      const cells: string[] = []
      let cellMatch
      
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // Extract text content, remove HTML tags
        const cellText = cellMatch[1]
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ')
          .trim()
        cells.push(cellText)
      }
      
      if (cells.length < 2) continue // Skip rows with less than 2 cells
      
      const zoneName = normalizeZoneName(cells[0])
      if (!zoneName) continue // Skip if no zone name
      
      // Process each day column (starting from index 1)
      for (let dayIndex = 1; dayIndex < cells.length && dayIndex <= 31; dayIndex++) {
        const day = dayIndex
        const rateText = cells[dayIndex]
        
        // Skip if empty, "-", or invalid
        if (!rateText || rateText === '-' || rateText.trim() === '') {
          continue
        }
        
        // Extract numeric value
        const rateMatch = rateText.match(/\d+/)
        if (!rateMatch) {
          continue
        }
        
        const rate = parseInt(rateMatch[0], 10)
        if (isNaN(rate) || rate <= 0) {
          continue
        }
        
        // Only process current day for daily scraping
        // For historical scraping, process all days
        if (day === currentDay || day <= new Date(year, month, 0).getDate()) {
          const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          
          prices.push({
            zone: zoneName,
            date: date,
            suggested_price: rate, // NECC shows suggested price in main table
            prevailing_price: null, // Prevailing prices are in separate section
          })
        }
      }
    }
    
    return prices
  } catch (error) {
    console.error('Error parsing HTML:', error)
    throw error
  }
}

// Normalize zone name to match database
function normalizeZoneName(zoneName: string): string {
  // Remove extra spaces, trim
  return zoneName.trim().replace(/\s+/g, ' ')
}

// Scrape NECC prices for a specific month/year
async function scrapeNECCPrices(
  supabase: any,
  year: number,
  month: number
): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    success: false,
    zones_scraped: 0,
    zones_successful: 0,
    zones_failed: 0,
    prices_inserted: 0,
    errors: [],
  }

  try {
    // Build URL with month and year parameters
    const url = `https://e2necc.com/home/eggprice?month=${month}&year=${year}`
    
    // Fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PoultryCo/1.0; +https://poultryco.net)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // Parse HTML to extract prices
    const prices = await parseNECCPrices(html, year, month)
    
    result.zones_scraped = prices.length

    // Get all zones from database
    const { data: zones, error: zonesError } = await supabase
      .from('necc_zones')
      .select('id, name')
      .eq('status', true)

    if (zonesError) {
      throw zonesError
    }

    const zoneMap = new Map(zones.map((z: any) => [normalizeZoneName(z.name), z.id]))
    const today = new Date()
    const currentDate = `${year}-${String(month).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // Process each price
    for (const price of prices) {
      try {
        const normalizedZoneName = normalizeZoneName(price.zone)
        const zoneId = zoneMap.get(normalizedZoneName)

        if (!zoneId) {
          result.zones_failed++
          result.errors.push(`Zone not found: ${price.zone}`)
          continue
        }

        // Check if price already exists
        const { data: existing } = await supabase
          .from('necc_prices')
          .select('id')
          .eq('zone_id', zoneId)
          .eq('date', price.date)
          .single()

        if (existing) {
          // Update existing price
          const { error: updateError } = await supabase
            .from('necc_prices')
            .update({
              suggested_price: price.suggested_price,
              prevailing_price: price.prevailing_price,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

          if (updateError) {
            result.zones_failed++
            result.errors.push(`Failed to update price for ${price.zone}: ${updateError.message}`)
          } else {
            result.zones_successful++
            result.prices_inserted++
          }
        } else {
          // Insert new price
          const dateObj = new Date(price.date)
          const { error: insertError } = await supabase
            .from('necc_prices')
            .insert({
              zone_id: zoneId,
              date: price.date,
              year: dateObj.getFullYear(),
              month: dateObj.getMonth() + 1,
              day_of_month: dateObj.getDate(),
              suggested_price: price.suggested_price,
              prevailing_price: price.prevailing_price,
              source: 'scraped',
              mode: 'CRON',
            })

          if (insertError) {
            result.zones_failed++
            result.errors.push(`Failed to insert price for ${price.zone}: ${insertError.message}`)
          } else {
            result.zones_successful++
            result.prices_inserted++
          }
        }
      } catch (error) {
        result.zones_failed++
        result.errors.push(`Error processing ${price.zone}: ${error.message}`)
      }
    }

    result.success = result.zones_successful > 0

    // Log scrape result
    await supabase.from('necc_scraper_logs').insert({
      scrape_date: currentDate,
      status: result.success ? (result.zones_failed > 0 ? 'partial' : 'success') : 'failure',
      zones_scraped: result.zones_scraped,
      zones_successful: result.zones_successful,
      zones_failed: result.zones_failed,
      prices_inserted: result.prices_inserted,
      error_details: result.errors.length > 0 ? { errors: result.errors } : null,
    })

    return result
  } catch (error) {
    result.errors.push(`Scrape failed: ${error.message}`)
    
    // Log failure
    await supabase.from('necc_scraper_logs').insert({
      scrape_date: new Date().toISOString().split('T')[0],
      status: 'failure',
      error_message: error.message,
      error_details: { error: error.toString() },
    })

    return result
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization (only allow from cron or service role)
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Note: Feature flags removed - scraper runs by default
    // Can be controlled via environment variable if needed
    const scraperEnabled = Deno.env.get('NECC_SCRAPER_ENABLED') !== 'false'
    
    if (!scraperEnabled) {
      return new Response(
        JSON.stringify({ message: 'Scraper is disabled via environment variable', skipped: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get current date
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Scrape current month
    const result = await scrapeNECCPrices(supabase, year, month)

    return new Response(
      JSON.stringify({
        success: result.success,
        message: `Scraped ${result.zones_successful}/${result.zones_scraped} zones`,
        result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Scraper error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

