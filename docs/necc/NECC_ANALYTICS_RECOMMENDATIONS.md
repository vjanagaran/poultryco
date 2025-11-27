# 📊 NECC Analytics - Data Analyst Recommendations

**Role:** Data Analyst with Layer Segment Expertise  
**Date:** January 2025  
**Purpose:** Analytics tool selection, event tracking, and dashboard recommendations

---

## 🎯 ANALYTICS TOOL RECOMMENDATION

### Recommendation: **Vercel Analytics + Custom Supabase Analytics**

**Why This Stack:**

1. **Vercel Analytics** (Free tier)
   - ✅ Already in use (Vercel hosting)
   - ✅ Zero configuration
   - ✅ Page views, performance metrics
   - ✅ Real-time data
   - ✅ Privacy-friendly

2. **Custom Supabase Analytics** (Database-based)
   - ✅ Full control over data
   - ✅ Custom events
   - ✅ User behavior tracking
   - ✅ No external dependencies
   - ✅ Cost-effective

3. **Future: Google Analytics 4** (Optional)
   - Add later if needed for advanced features
   - Not required for MVP

**Implementation:**
```typescript
// Vercel Analytics (automatic)
// Custom events in Supabase
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT, -- 'necc_annotation', 'necc_price', etc.
  entity_id UUID,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📈 EVENTS TO TRACK

### Core Events (Phase 1)

**1. Page Views**
```typescript
trackEvent('page_view', {
  page: '/necc/today',
  date: '2025-01-17',
  zone: 'namakkal',
});
```

**2. Price Views**
```typescript
trackEvent('price_view', {
  zone: 'namakkal',
  date: '2025-01-17',
  price_type: 'suggested', // or 'prevailing'
});
```

**3. Chart Interactions**
```typescript
trackEvent('chart_interaction', {
  chart_type: 'price_trend',
  action: 'zoom', // or 'pan', 'filter'
  date_range: '7d',
  zones: ['namakkal', 'mumbai'],
});
```

**4. Zone Comparisons**
```typescript
trackEvent('zone_compare', {
  zones: ['namakkal', 'mumbai', 'chennai'],
  date_range: '30d',
});
```

**5. Engagement Events**
```typescript
trackEvent('entity_like', {
  entity_type: 'necc_annotation',
  entity_id: '...',
});

trackEvent('entity_comment', {
  entity_type: 'necc_annotation',
  entity_id: '...',
});

trackEvent('entity_share', {
  entity_type: 'necc_annotation',
  entity_id: '...',
  platform: 'whatsapp',
});
```

### Advanced Events (Phase 2+)

**6. Annotation Views**
```typescript
trackEvent('annotation_view', {
  annotation_id: '...',
  annotation_type: 'spike',
  expert_id: '...',
});
```

**7. Prediction Views**
```typescript
trackEvent('prediction_view', {
  prediction_type: 'ai', // or 'expert'
  zone: 'namakkal',
  days_ahead: 7,
});
```

**8. Infographic Generation**
```typescript
trackEvent('infographic_generate', {
  template_type: 'daily_price',
  zones: ['namakkal'],
  custom_message: true,
});
```

**9. Infographic Shares**
```typescript
trackEvent('infographic_share', {
  infographic_id: '...',
  platform: 'whatsapp',
  share_count: 1,
});
```

**10. Price Alerts**
```typescript
trackEvent('price_alert_set', {
  zone: 'namakkal',
  condition: 'price >= 650',
  notification_type: 'email',
});

trackEvent('price_alert_triggered', {
  alert_id: '...',
  zone: 'namakkal',
  price: 650,
});
```

---

## 📊 DASHBOARD RECOMMENDATIONS

### Admin Dashboard (Phase 1)

**1. Scraper Health**
- Success rate (last 24h, 7d, 30d)
- Failure count by zone
- Last successful scrape time
- Failure logs (recent)

**2. Data Quality**
- Missing data count by zone
- Outlier count
- Data completeness %
- Recent outliers log

**3. User Engagement**
- Daily active users
- Page views (today, 7d, 30d)
- Most viewed pages
- Engagement rate

**4. Zone Performance**
- Most viewed zones
- Zone comparison usage
- Zone-specific engagement

### Admin Dashboard (Phase 2)

**5. Expert Activity**
- Expert annotations count
- Most active experts
- Annotation engagement
- Expert reputation scores

**6. Content Performance**
- Most viewed annotations
- Most helpful annotations
- Most shared content
- Trending topics

**7. Predictions**
- Prediction views
- AI vs Expert comparison
- Prediction accuracy (if tracked)

**8. Sharing Analytics**
- Infographic generation count
- Share count by platform
- Viral content identification

### Public Dashboard (Future)

**9. Market Insights**
- Price trends (aggregated)
- Zone correlations
- Seasonal patterns
- Market volatility

**10. Community Stats**
- Total annotations
- Active experts
- Community engagement
- Growth metrics

---

## 🎯 KEY METRICS TO TRACK

### Business Metrics

**1. User Growth**
- Daily active users (DAU)
- Weekly active users (WAU)
- Monthly active users (MAU)
- New users per day

**2. Engagement**
- Average session duration
- Pages per session
- Return rate
- Engagement rate (likes/comments/shares per user)

**3. Content**
- Annotations created
- Annotations viewed
- Helpful votes
- Shares

**4. Viral Growth**
- Infographics generated
- Shares per infographic
- Click-through from shares
- Sign-ups from shares

### Technical Metrics

**5. Performance**
- Page load time
- API response time
- Error rate
- Uptime

**6. Data Quality**
- Scraper success rate
- Data completeness
- Outlier rate
- Data accuracy

### Product Metrics

**7. Feature Usage**
- Zone comparison usage
- Chart interaction rate
- Price alert adoption
- Prediction views

**8. Expert Metrics**
- Expert annotations per week
- Expert engagement rate
- Expert reputation growth
- Expert follower count

---

## 📈 ANALYTICS IMPLEMENTATION PLAN

### Phase 1: Basic Tracking

**Week 1-2:**
- Set up Vercel Analytics
- Create `analytics_events` table
- Implement basic event tracking (page views, price views)
- Basic admin dashboard (scraper health, data quality)

**Week 3-4:**
- Add engagement tracking (likes, comments, shares)
- Add chart interaction tracking
- Enhance admin dashboard

### Phase 2: Advanced Tracking

**Week 5-6:**
- Add annotation tracking
- Add prediction tracking
- Add infographic tracking
- Expert activity dashboard

**Week 7-8:**
- Add sharing analytics
- Add viral growth tracking
- Enhanced analytics dashboard

### Phase 3: Intelligence

**Week 9-10:**
- Add AI prediction tracking
- Add accuracy metrics
- Add trend analysis
- Public dashboard (if needed)

---

## 🎯 DASHBOARD COMPONENTS

### Admin Dashboard Structure

```
┌─────────────────────────────────────────┐
│  NECC Analytics Dashboard               │
├─────────────────────────────────────────┤
│  [Scraper Health] [Data Quality]        │
│  [User Engagement] [Zone Performance]   │
│  [Expert Activity] [Content Performance] │
│  [Predictions] [Sharing Analytics]      │
└─────────────────────────────────────────┘
```

### Key Widgets

**1. Scraper Health Widget**
- Success rate: 95% (last 24h)
- Failures: 3 (last 24h)
- Last scrape: 2 hours ago
- [View Logs]

**2. Data Quality Widget**
- Completeness: 98%
- Missing data: 12 zones
- Outliers: 5 (last 7d)
- [View Details]

**3. User Engagement Widget**
- DAU: 1,234
- Page views: 5,678 (today)
- Engagement rate: 45%
- [View Details]

**4. Zone Performance Widget**
- Top zones: Namakkal, Mumbai, Chennai
- Most compared: Namakkal vs Mumbai
- [View Details]

---

## ✅ RECOMMENDATIONS SUMMARY

**Analytics Tool:** Vercel Analytics + Custom Supabase Analytics

**Events to Track:** 10 core events (expandable)

**Dashboard:** Admin dashboard with 8 key sections

**Implementation:** Phased approach (basic → advanced → intelligence)

**Approach:** Agile - Start basic, improve iteratively

---

**Status:** ✅ Recommendations Complete  
**Next:** Implement in Phase 1

