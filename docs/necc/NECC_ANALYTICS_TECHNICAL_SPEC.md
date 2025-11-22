# 🛠️ NECC Analytics - Technical Specification

**Date:** January 2025  
**Status:** Ready for Development  
**Based on:** Brainstorming decisions and tech stack analysis

---

## ✅ DECISIONS MADE

### 1. Data Source
**Decision:** ✅ **Web Scraping** (NECC doesn't have API)
- **Implementation:** Robust scraper with error handling
- **Rate Limiting:** Implement delays, user-agent rotation, retry logic
- **Fallback:** Manual data entry option for critical days

### 2. Expert System
**Decision:** ✅ **Profile System Scoring + Manual NECC Access**
- Use existing profile scoring system
- Manual selection for NECC annotation access
- Experts get special badge/permissions
- Integration with existing profile system

### 3. AI Model
**Decision:** ✅ **OpenAI/Anthropic API** (Start with API, can build custom later)
- **Primary:** OpenAI GPT-4 for analysis and predictions
- **Fallback:** Anthropic Claude for complex analysis
- **Cost Management:** Cache responses, batch requests
- **Future:** Can build custom models if needed

### 4. Charting Library
**Decision:** ✅ **Recharts (Web) + Victory Native (Mobile)** - See detailed analysis below

### 5. Infographic Generation
**Decision:** ✅ **Server-Side** (Node.js + Canvas/Puppeteer)
- Collect customization details
- Log usage for analytics
- Review and improve based on customer usage
- Generate on-demand, cache results

### 6. Mobile Strategy
**Decision:** ✅ **All 3: Responsive + PWA + Native**
- **Responsive Web:** Detailed interactions for analysts
- **PWA:** App-like experience, offline support
- **Native (React Native/Expo):** Best UX, push notifications

---

## 📊 CHARTING LIBRARY RECOMMENDATION (CTO Analysis)

### Current Tech Stack Analysis

**Web Stack:**
- Next.js 15 (React 18.3.1)
- TypeScript
- Tailwind CSS
- **Recharts already installed** in admin app (`recharts@2.12.7`)
- Existing chart components: `UserGrowthChart`, `ProfileSegmentChart`

**Mobile Stack:**
- React Native 0.81.4
- Expo ~54.0.13
- TypeScript
- NativeWind (Tailwind for React Native)

**Deployment:**
- Vercel (web)
- Supabase (database, edge functions)

### Recommendation: **Recharts (Web) + Victory Native (Mobile)**

#### ✅ Why Recharts for Web?

**1. Already in Use**
- ✅ Already installed in admin app
- ✅ Team familiar with it
- ✅ Existing components can be reused
- ✅ No new learning curve

**2. Perfect Fit for Stack**
- ✅ React-native (works with React 18.3.1)
- ✅ TypeScript support
- ✅ Server Components compatible (Next.js 15)
- ✅ Small bundle size (~200KB gzipped)

**3. Resource Availability**
- ✅ Well-documented
- ✅ Active maintenance (regular updates)
- ✅ Large community
- ✅ Easy to find examples/solutions

**4. Timeline & Maintenance**
- ✅ Quick to implement (team already knows it)
- ✅ Low maintenance overhead
- ✅ Good performance for our use case
- ✅ Can handle 10+ years of data efficiently

**5. Feature Suitability**
- ✅ Line charts (price trends) - Excellent
- ✅ Multi-line charts (zone comparison) - Excellent
- ✅ Area charts (trends with fill) - Excellent
- ✅ Bar charts (monthly averages) - Excellent
- ✅ Responsive design - Built-in
- ✅ Interactive tooltips - Built-in
- ✅ Zoom/pan - Available via plugins

**6. Limitations & Solutions**
- ⚠️ Limited customization (but sufficient for our needs)
- ✅ Can use D3.js for advanced customizations if needed
- ⚠️ Performance with 10k+ data points (but we can aggregate)
- ✅ Solution: Aggregate daily data, show monthly/yearly views

#### ✅ Why Victory Native for Mobile?

**1. React Native Native**
- ✅ Built specifically for React Native
- ✅ No web view wrapper
- ✅ Native performance
- ✅ Works with Expo

**2. Feature Parity**
- ✅ Same chart types as Recharts
- ✅ Interactive tooltips
- ✅ Responsive design
- ✅ Animations

**3. Maintenance**
- ✅ Active development
- ✅ Good documentation
- ✅ TypeScript support
- ✅ Community support

**Alternative Considered:** React Native Chart Kit
- ❌ Less maintained
- ❌ Fewer features
- ❌ Smaller community

### Implementation Strategy

**Phase 1: Web (Recharts)**
```typescript
// Reuse existing chart components
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Create NECC-specific chart components
- PriceTrendChart (7 days, 30 days, 1 year, 5 years, 10 years)
- ZoneComparisonChart (multi-line)
- PriceHeatmap (zone × day of month)
- VolatilityChart (bar chart)
```

**Phase 2: Mobile (Victory Native)**
```typescript
// Install: npm install victory-native
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';

// Create mobile-optimized versions
- MobilePriceChart (simplified, touch-optimized)
- MobileZoneComparison (swipeable)
```

**Phase 3: Advanced (D3.js - if needed)**
```typescript
// Only for custom visualizations
// Example: Correlation matrix, custom heatmaps
import * as d3 from 'd3';
```

### Bundle Size Impact

**Recharts:**
- ~200KB gzipped
- Tree-shakeable (import only what you need)
- Acceptable for web app

**Victory Native:**
- ~150KB gzipped
- Acceptable for mobile app

**Total Impact:** Minimal (already using Recharts in admin)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Data Pipeline

```
┌─────────────────────────────────────────────────────────┐
│ 1. NECC Website Scraper (Daily Cron)                     │
│    - Scrapes e2necc.com/home/eggprice                   │
│    - Parses HTML tables                                  │
│    - Extracts: zone, date, suggested_price, prevailing    │
│    - Validates data                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Data Processor                                       │
│    - Normalizes zone names                               │
│    - Calculates monthly averages                         │
│    - Detects anomalies (spikes/drops)                   │
│    - Stores in database                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Database (Supabase PostgreSQL)                        │
│    - necc_prices table                                   │
│    - necc_annotations table                              │
│    - necc_ai_predictions table                           │
│    - Indexes for fast queries                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. API Layer (Next.js API Routes / Supabase Edge)       │
│    - GET /api/necc/prices                                │
│    - GET /api/necc/analytics                             │
│    - POST /api/necc/annotations                          │
│    - POST /api/necc/generate-card                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Frontend (Next.js + React Native)                    │
│    - Web: Recharts visualizations                        │
│    - Mobile: Victory Native visualizations               │
│    - Shared: Business logic, API calls                   │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- NECC Daily Prices
CREATE TABLE necc_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone TEXT NOT NULL, -- 'Namakkal', 'Mumbai', etc.
  date DATE NOT NULL,
  suggested_price DECIMAL(10, 2),
  prevailing_price DECIMAL(10, 2),
  price_type TEXT CHECK (price_type IN ('suggested', 'prevailing')),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  day_of_month INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zone, date, price_type)
);

-- Expert Annotations
CREATE TABLE necc_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id UUID REFERENCES necc_prices(id),
  expert_id UUID REFERENCES profiles(id),
  annotation_type TEXT CHECK (annotation_type IN ('spike', 'trend', 'anomaly', 'prediction')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Predictions
CREATE TABLE necc_ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone TEXT NOT NULL,
  prediction_date DATE NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_price DECIMAL(10, 2),
  confidence DECIMAL(5, 2), -- 0-100
  model_version TEXT,
  assumptions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infographic Generation Logs (for analytics)
CREATE TABLE necc_infographic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  template_type TEXT, -- 'daily_price', 'spike_alert', 'zone_comparison', etc.
  zones TEXT[],
  date_range JSONB,
  custom_message TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  shared_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_necc_prices_zone_date ON necc_prices(zone, date DESC);
CREATE INDEX idx_necc_prices_year_month ON necc_prices(year, month);
CREATE INDEX idx_necc_annotations_price ON necc_annotations(price_id);
CREATE INDEX idx_necc_annotations_expert ON necc_annotations(expert_id);
CREATE INDEX idx_necc_ai_predictions_zone_date ON necc_ai_predictions(zone, prediction_date DESC);
```

### API Endpoints

```typescript
// Price Data
GET /api/necc/prices
  Query: zone?, start_date?, end_date?, type? (suggested/prevailing)
  Returns: Price data with trends

GET /api/necc/zones
  Returns: All zones with current prices

// Analytics
GET /api/necc/analytics
  Query: zone?, period? (7d/30d/1y/5y/10y), metric? (trend/volatility/correlation)
  Returns: Analytics data

// Annotations
GET /api/necc/annotations
  Query: zone?, date?, expert_id?, type?
  Returns: Expert annotations

POST /api/necc/annotations
  Body: { price_id, annotation_type, title, content, tags }
  Auth: Expert only

// Predictions
GET /api/necc/predictions
  Query: zone?, days_ahead? (7/30)
  Returns: AI + Expert predictions

// Infographics
POST /api/necc/generate-card
  Body: { template_type, zones, date_range, custom_message }
  Returns: Infographic URL
  Logs: Usage data for analytics
```

---

## 🕷️ WEB SCRAPER IMPLEMENTATION

### Scraper Architecture

```typescript
// supabase/functions/scrape-necc-prices/index.ts

import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

interface NECCPrice {
  zone: string;
  date: Date;
  suggested_price: number | null;
  prevailing_price: number | null;
}

async function scrapeNECCPrices(date: Date): Promise<NECCPrice[]> {
  // 1. Fetch HTML from NECC website
  const url = `https://e2necc.com/home/eggprice?month=${date.getMonth() + 1}&year=${date.getFullYear()}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PoultryCo/1.0)',
    },
  });
  
  // 2. Parse HTML
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // 3. Extract price data from tables
  const prices: NECCPrice[] = [];
  
  // Parse suggested prices table
  $('table tr').each((i, row) => {
    const zone = $(row).find('td:first-child').text().trim();
    // Extract prices for each day...
    // Store in prices array
  });
  
  // 4. Return parsed data
  return prices;
}

// Daily cron job
Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const today = new Date();
  const prices = await scrapeNECCPrices(today);
  
  // Store in database
  for (const price of prices) {
    await supabase.from('necc_prices').upsert({
      zone: price.zone,
      date: price.date.toISOString().split('T')[0],
      suggested_price: price.suggested_price,
      prevailing_price: price.prevailing_price,
      price_type: 'suggested',
      month: price.date.getMonth() + 1,
      year: price.date.getFullYear(),
      day_of_month: price.date.getDate(),
    });
  }
  
  return new Response(JSON.stringify({ success: true, count: prices.length }));
});
```

### Historical Data Scraper

```typescript
// One-time script to scrape 10+ years of historical data
// Run manually or as background job

async function scrapeHistoricalData(startYear: number, endYear: number) {
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const date = new Date(year, month - 1, 1);
      const prices = await scrapeNECCPrices(date);
      
      // Store with delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

### Error Handling & Rate Limiting

```typescript
// Retry logic
async function scrapeWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.text();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
await delay(2000); // 2 second delay between requests
```

---

## 🤖 AI INTEGRATION

### OpenAI Integration

```typescript
// packages/api/src/services/ai-service.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PriceData {
  zone: string;
  date: string;
  price: number;
}

async function analyzePriceTrend(
  prices: PriceData[],
  zone: string
): Promise<string> {
  const prompt = `Analyze this egg price data for ${zone}:
${JSON.stringify(prices, null, 2)}

Provide:
1. Trend direction (up/down/stable)
2. Trend strength (strong/moderate/weak)
3. Key factors driving the trend
4. Historical context (similar patterns)
5. 7-day forecast with confidence level

Format as JSON.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
}

async function predictPrice(
  historicalData: PriceData[],
  zone: string,
  daysAhead: number
): Promise<{ price: number; confidence: number }> {
  const prompt = `Based on this historical egg price data for ${zone}:
${JSON.stringify(historicalData.slice(-90), null, 2)}

Predict the price ${daysAhead} days from now.
Consider:
- Seasonal patterns
- Recent trends
- Historical averages
- Volatility

Return JSON: { "price": number, "confidence": number (0-100) }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5, // Lower temperature for predictions
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
```

### Cost Management

```typescript
// Cache AI responses
const cache = new Map<string, { data: any; expires: number }>();

async function getCachedOrFetch(key: string, fetchFn: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const data = await fetchFn();
  cache.set(key, {
    data,
    expires: Date.now() + 3600000, // 1 hour cache
  });
  
  return data;
}
```

---

## 🎨 INFOGRAPHIC GENERATION

### Server-Side Generation

```typescript
// supabase/functions/generate-infographic/index.ts

import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

interface InfographicOptions {
  template_type: 'daily_price' | 'spike_alert' | 'zone_comparison' | 'trend_analysis';
  zones: string[];
  date_range?: { start: string; end: string };
  custom_message?: string;
  user_id?: string;
}

async function generateInfographic(options: InfographicOptions): Promise<string> {
  // 1. Fetch data
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: prices } = await supabase
    .from('necc_prices')
    .select('*')
    .in('zone', options.zones)
    .gte('date', options.date_range?.start)
    .lte('date', options.date_range?.end);
  
  // 2. Generate HTML template
  const html = generateHTMLTemplate(options.template_type, prices, options);
  
  // 3. Use Puppeteer to render and screenshot
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.setViewport({ width: 1200, height: 630 }); // Social media size
  
  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: false,
  });
  
  await browser.close();
  
  // 4. Upload to Supabase Storage
  const fileName = `infographic-${Date.now()}.png`;
  const { data: uploadData } = await supabase.storage
    .from('infographics')
    .upload(fileName, screenshot, {
      contentType: 'image/png',
      upsert: false,
    });
  
  // 5. Log usage for analytics
  if (options.user_id) {
    await supabase.from('necc_infographic_logs').insert({
      user_id: options.user_id,
      template_type: options.template_type,
      zones: options.zones,
      date_range: options.date_range,
      custom_message: options.custom_message,
    });
  }
  
  // 6. Return public URL
  const { data: { publicUrl } } = supabase.storage
    .from('infographics')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### HTML Template Generator

```typescript
function generateHTMLTemplate(
  type: string,
  prices: any[],
  options: InfographicOptions
): string {
  switch (type) {
    case 'daily_price':
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .card { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
              h1 { color: #333; font-size: 32px; margin-bottom: 20px; }
              .price { font-size: 48px; font-weight: bold; color: #667eea; }
              .trend { font-size: 24px; color: #666; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🥚 Today's Egg Prices</h1>
              <div class="price">₹${prices[0]?.suggested_price || 'N/A'}</div>
              <div class="trend">${options.custom_message || ''}</div>
            </div>
          </body>
        </html>
      `;
    // ... other templates
  }
}
```

---

## 📱 MOBILE IMPLEMENTATION

### React Native Components

```typescript
// apps/mobile/src/components/necc/PriceChart.tsx

import { VictoryLine, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory-native';

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
  zone: string;
}

export function PriceChart({ data, zone }: PriceChartProps) {
  return (
    <VictoryChart
      width={350}
      height={200}
      padding={{ left: 50, right: 20, top: 20, bottom: 50 }}
    >
      <VictoryAxis
        tickFormat={(t) => new Date(t).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
      />
      <VictoryAxis dependentAxis tickFormat={(t) => `₹${t}`} />
      <VictoryLine
        data={data}
        x="date"
        y="price"
        style={{
          data: { stroke: '#667eea', strokeWidth: 2 },
        }}
      />
    </VictoryChart>
  );
}
```

### PWA Configuration

```typescript
// apps/web/next.config.mjs

const nextConfig = {
  // ... existing config
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },
};
```

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: MVP (Weeks 1-4)
1. Database schema setup
2. Basic scraper (daily prices)
3. Historical data scraper (one-time)
4. Basic price display (web)
5. Simple annotation system

### Phase 2: Analytics (Weeks 5-8)
1. Interactive charts (Recharts)
2. Zone comparison
3. Anomaly detection
4. Expert dashboard

### Phase 3: AI & Mobile (Weeks 9-12)
1. AI integration (OpenAI)
2. Mobile charts (Victory Native)
3. PWA setup
4. Predictions

### Phase 4: Sharing (Weeks 13-16)
1. Infographic generator
2. Usage analytics
3. Social sharing
4. Optimization

---

## 📊 SUCCESS METRICS

### Technical Metrics
- Crawler success rate: >95%
- API response time: <200ms
- Chart render time: <500ms
- Infographic generation: <3 seconds

### Business Metrics
- Daily price page views: 1000+
- Expert annotations: 50+/week
- Infographic shares: 500+/day
- User engagement: 70%+ return rate

---

**Next:** Start Phase 1 development with database schema and scraper

