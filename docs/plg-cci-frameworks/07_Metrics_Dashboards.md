# PART 7: METRICS & DASHBOARDS

*Measuring What Matters for Growth*

---

## Table of Contents

7.1 Acquisition Metrics  
7.2 Engagement Metrics  
7.3 Conversion Metrics  
7.4 Business Health Metrics  
7.5 Dashboard Setup Guide  
7.6 Weekly Review Template  
7.7 Monthly Business Review  
7.8 Alert Configuration

---

# METRICS PHILOSOPHY

## The One Metric That Matters (OMTM)

**Phase-Dependent Focus:**

```
PHASE 1 (Weeks 1-12): Weekly Active Users (WAU)
Why: Need to prove people return
Target: 30+ WAU by Week 12

PHASE 2 (Weeks 13-24): WAU/MAU Ratio
Why: Need sustainable engagement
Target: 40% by Week 24

PHASE 3 (Weeks 25-36): Qualified Leads Generated
Why: Need revenue pipeline
Target: 50+ qualified leads by Week 36
```

**North Star Metric (Always):**
```
Active Engaged Users (AEU)
= Users who take 3+ actions per week

Why: Predicts retention AND conversion
Target: 200+ AEU by Week 24
```

---

## Metrics Hierarchy

```
                    BUSINESS OUTCOMES
                    (Revenue, Growth)
                           ↑
              ┌────────────┼────────────┐
              |            |            |
         CONVERSIONS   ENGAGEMENT   RETENTION
         (Qualified)   (Activity)   (Coming back)
              ↑            ↑            ↑
              |            |            |
         ACTIVATION    USAGE       VALUE DELIVERY
         (Aha moment)  (Features)  (Tools working)
              ↑            ↑            ↑
              └────────────┴────────────┘
                           |
                      ACQUISITION
                    (New signups)
```

---

# 7.1 ACQUISITION METRICS

## Top-Level Metrics

### 1. New Signups

**Definition:**
```
Users who complete registration flow
- Provide phone number
- Verify OTP
- Create account
```

**Calculation:**
```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(DISTINCT id) as new_signups
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

**Targets:**
```
Week 12 (PTSE Launch): 100+
Week 24: 1,000 total (40/week avg)
Week 36: 10,000 total (250/week avg)

Growth Rate:
Weeks 1-12: 50%+ week-over-week
Weeks 13-24: 30%+ week-over-week
Weeks 25-36: 20%+ week-over-week
```

**Alert Thresholds:**
```
🔴 Critical: <50% of target for 2 consecutive weeks
🟡 Warning: <75% of target for 1 week
🟢 Good: ≥100% of target
```

---

### 2. Signup Conversion Rate

**Definition:**
```
% of visitors who complete signup

Formula: (Completed Signups / Landing Page Visits) × 100
```

**Funnel Breakdown:**
```
Landing Page Visit: 100%
    ↓
Click "Sign Up": 40% (60% drop)
    ↓
Enter Phone: 30% (25% drop)
    ↓
Verify OTP: 25% (17% drop)
    ↓
Complete Profile: 20% (20% drop)

Overall Conversion: 20%
```

**Targets:**
```
Week 12: 15% (early product, friction)
Week 24: 20% (optimized flow)
Week 36: 25% (mature product)
```

**Optimization Opportunities:**
```
If drop at "Click Sign Up": 
→ Improve value proposition
→ Add social proof
→ Clarify benefits

If drop at "Enter Phone":
→ Trust signals (verified badge)
→ Privacy assurance
→ Alternative signup methods

If drop at "Verify OTP":
→ SMS delivery issues (check Twilio)
→ Clear instructions
→ Resend option prominent

If drop at "Complete Profile":
→ Too many fields (reduce)
→ Optional vs. required
→ Save progress
```

---

### 3. Traffic Sources

**Definition:**
```
Where are signups coming from?
```

**Calculation:**
```sql
SELECT 
  utm_source,
  utm_medium,
  COUNT(DISTINCT user_id) as signups,
  ROUND(COUNT(DISTINCT user_id) * 100.0 / 
    SUM(COUNT(DISTINCT user_id)) OVER (), 2) as percentage
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source, utm_medium
ORDER BY signups DESC;
```

**Target Distribution:**
```
Organic (Direct + Search): 40%
Referral (Word of mouth): 30%
Association Partners: 15%
Social Media: 10%
Events (PTSE, etc.): 5%
```

**By Phase:**
```
PHASE 1 (Week 1-12):
Events: 50% (PTSE launch)
Referral: 30%
Organic: 20%

PHASE 2 (Week 13-24):
Referral: 40% (word of mouth growing)
Organic: 30%
Association: 20%
Social: 10%

PHASE 3 (Week 25-36):
Organic: 40% (SEO + brand)
Referral: 30%
Association: 20%
Social: 10%
```

---

### 4. Viral Coefficient (K-factor)

**Definition:**
```
Average number of new users each user brings

Formula: K = (Invites Sent × Conversion Rate)
```

**Calculation:**
```
Example:
- User sends 5 invites on average
- 30% of invites sign up
- K = 5 × 0.30 = 1.5

K > 1.0 = Exponential growth
K < 1.0 = Growth slows over time
```

**Calculation Query:**
```sql
WITH invites AS (
  SELECT 
    inviter_id,
    COUNT(*) as invites_sent,
    COUNT(CASE WHEN invited_user_id IS NOT NULL THEN 1 END) as invites_converted
  FROM referrals
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY inviter_id
)
SELECT 
  AVG(invites_sent) as avg_invites_per_user,
  AVG(invites_converted * 1.0 / NULLIF(invites_sent, 0)) as conversion_rate,
  AVG(invites_converted) as k_factor
FROM invites;
```

**Targets:**
```
Week 12: 0.8 (building viral loops)
Week 24: 1.2 (achieving viral growth)
Week 36: 1.5 (strong viral growth)
```

**Optimization Levers:**
```
Increase Invites Sent:
□ In-app referral prompts
□ Incentives (reputation points)
□ Easy sharing (WhatsApp, SMS)
□ Social proof ("X friends joined")

Increase Conversion Rate:
□ Personalized invites
□ Clear value proposition
□ Trusted referrer
□ Seamless signup flow
```

---

### 5. Cost Per Acquisition (CPA)

**Definition:**
```
How much does it cost to acquire one user?

Formula: Total Acquisition Cost / New Users
```

**Calculation:**
```
Total Acquisition Cost:
+ Paid advertising: ₹X
+ Event costs: ₹Y
+ Partnership costs: ₹Z
+ Marketing salaries (allocated): ₹W
= Total: ₹(X+Y+Z+W)

New Users: N

CPA = (X+Y+Z+W) / N
```

**Target:**
```
Week 12: ₹800 (PTSE investment amortized)
Week 24: ₹500 (improving efficiency)
Week 36: ₹300 (organic growth dominant)

Maximum Acceptable: ₹1,000
(Should be <10% of customer LTV)
```

**By Channel:**
```
Organic (Direct): ₹0
Referral: ₹50 (incentive cost)
Association: ₹200 (partnership cost)
Events: ₹1,000 (booth + travel)
Social Ads (if running): ₹600-800
```

---

## Acquisition Dashboard (PostHog)

**Daily View:**
```
┌─────────────────────────────────────────────┐
│ NEW SIGNUPS TODAY                    42     │
│ Target: 36  ✅ +17%                         │
├─────────────────────────────────────────────┤
│ SIGNUP CONVERSION                    23%    │
│ Target: 20%  ✅ +3pp                        │
├─────────────────────────────────────────────┤
│ TOP SOURCES TODAY                           │
│ 1. Referral           18 (43%)             │
│ 2. Organic            12 (29%)             │
│ 3. Association         8 (19%)             │
│ 4. Social              4 (9%)              │
└─────────────────────────────────────────────┘
```

**Weekly Trend:**
```
New Signups (Last 7 Days):
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 38   42   45   40   48   52   50  = 315 total
Target: 252 (36/day)  ✅ +25%

Signup Funnel:
Landing → Sign Up: 42% (▲ 2pp vs last week)
Sign Up → Phone: 75% (▼ 3pp vs last week) ⚠️
Phone → OTP: 85% (→ 0pp vs last week)
OTP → Profile: 82% (▲ 5pp vs last week)
```

---

# 7.2 ENGAGEMENT METRICS

## Top-Level Metrics

### 1. Daily Active Users (DAU)

**Definition:**
```
Users who take any meaningful action in a day

Actions counted:
□ Open app
□ View profile
□ Use calculator
□ Post/comment/like
□ Send message
□ Search
□ View Q&A
```

**Calculation:**
```sql
SELECT 
  DATE_TRUNC('day', timestamp) as date,
  COUNT(DISTINCT user_id) as dau
FROM events
WHERE event_name IN (
  'app_opened',
  'profile_viewed',
  'calculator_used',
  'post_created',
  'message_sent',
  'search_performed',
  'question_viewed'
)
AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

**Targets:**
```
Week 12: 30+ DAU (30% of 100 users)
Week 24: 200+ DAU (20% of 1,000 users)
Week 36: 500+ DAU (5% of 10,000 users)

Note: DAU % decreases as base grows (normal)
```

---

### 2. Weekly Active Users (WAU)

**Definition:**
```
Users who take any action in a week
```

**Calculation:**
```sql
SELECT 
  DATE_TRUNC('week', timestamp) as week,
  COUNT(DISTINCT user_id) as wau
FROM events
WHERE timestamp >= NOW() - INTERVAL '12 weeks'
GROUP BY week
ORDER BY week;
```

**Targets:**
```
Week 12: 70+ WAU (70% of 100 users)
Week 24: 400+ WAU (40% of 1,000 users)
Week 36: 2,000+ WAU (20% of 10,000 users)
```

---

### 3. WAU/MAU Ratio (Stickiness)

**Definition:**
```
% of monthly users who are active weekly

Formula: (WAU / MAU) × 100

Indicates: How "sticky" is the product?
```

**Calculation:**
```sql
WITH monthly_active AS (
  SELECT COUNT(DISTINCT user_id) as mau
  FROM events
  WHERE timestamp >= NOW() - INTERVAL '30 days'
),
weekly_active AS (
  SELECT COUNT(DISTINCT user_id) as wau
  FROM events
  WHERE timestamp >= NOW() - INTERVAL '7 days'
)
SELECT 
  wau,
  mau,
  ROUND(wau * 100.0 / mau, 2) as stickiness_ratio
FROM weekly_active, monthly_active;
```

**Interpretation:**
```
>50%: Excellent (daily use case)
40-50%: Great (habit forming)
30-40%: Good (weekly use case)
20-30%: Okay (needs improvement)
<20%: Poor (engagement problem)
```

**Targets:**
```
Week 12: 30% (early, not habitual yet)
Week 24: 40% (habit forming)
Week 36: 45% (sticky product)
```

**Benchmark Comparison:**
```
Social Media (Facebook): 60%+
Professional Networks (LinkedIn): 35-40%
SaaS Tools (average): 20-30%
B2B Communities: 15-25%

PoultryCo Target: 40-45% (professional network)
```

---

### 4. Session Frequency

**Definition:**
```
How often do users open the app?
```

**Calculation:**
```sql
SELECT 
  user_id,
  COUNT(DISTINCT DATE_TRUNC('day', session_start)) as days_active,
  COUNT(session_id) as total_sessions,
  ROUND(COUNT(session_id) * 1.0 / 
    COUNT(DISTINCT DATE_TRUNC('day', session_start)), 2) as sessions_per_day
FROM sessions
WHERE session_start >= NOW() - INTERVAL '30 days'
GROUP BY user_id;
```

**Target Distribution:**
```
Daily (7+ days/week): 15%
Few times/week (3-6 days): 30%
Weekly (1-2 days): 35%
Monthly (<1 day/week): 20%
```

**By User Type:**
```
Power Users (top 10%):
- 5+ days/week
- 3+ sessions/day
- 20+ min/session

Regular Users (next 40%):
- 2-4 days/week
- 2 sessions/day
- 10+ min/session

Casual Users (bottom 50%):
- 1 day/week
- 1 session/day
- 5+ min/session
```

---

### 5. Session Duration

**Definition:**
```
Average time spent per session
```

**Calculation:**
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (session_end - session_start))/60) as avg_session_minutes
FROM sessions
WHERE session_start >= NOW() - INTERVAL '30 days'
  AND session_end IS NOT NULL;
```

**Targets:**
```
Week 12: 5+ minutes
Week 24: 8+ minutes
Week 36: 10+ minutes

Power Users: 20+ minutes
Regular Users: 10+ minutes
Casual Users: 5+ minutes
```

**By Activity:**
```
Calculator usage: 3-5 minutes
Reading Q&A: 5-8 minutes
Posting question: 5-10 minutes
Messaging: 10-15 minutes
Browsing feed: 8-12 minutes
Profile editing: 5-8 minutes
```

---

### 6. Feature Adoption

**Definition:**
```
% of users who have used each feature
```

**Calculation:**
```sql
WITH feature_usage AS (
  SELECT 
    feature_name,
    COUNT(DISTINCT user_id) as users_used
  FROM events
  WHERE timestamp >= NOW() - INTERVAL '30 days'
  GROUP BY feature_name
),
total_users AS (
  SELECT COUNT(DISTINCT id) as total
  FROM users
  WHERE created_at <= NOW() - INTERVAL '30 days'
)
SELECT 
  f.feature_name,
  f.users_used,
  t.total as total_users,
  ROUND(f.users_used * 100.0 / t.total, 2) as adoption_rate
FROM feature_usage f, total_users t
ORDER BY adoption_rate DESC;
```

**Target Adoption (Month 1):**
```
Core Features (Must-have):
□ Profile view: 95%
□ Calculator use: 70%
□ Search: 60%
□ Q&A view: 50%

Secondary Features:
□ Post creation: 30%
□ Messaging: 25%
□ Connections: 40%
□ Reputation: 20%

Advanced Features (Month 3+):
□ Groups: 15%
□ Events: 10%
□ Voice features: 5%
```

---

### 7. Content Creation Rate

**Definition:**
```
How much content users generate
```

**Calculation:**
```sql
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(CASE WHEN type = 'question' THEN 1 END) as questions,
  COUNT(CASE WHEN type = 'answer' THEN 1 END) as answers,
  COUNT(CASE WHEN type = 'post' THEN 1 END) as posts,
  COUNT(CASE WHEN type = 'comment' THEN 1 END) as comments
FROM content
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY week
ORDER BY week;
```

**Targets:**
```
Week 12:
- Questions: 10+/week
- Answers: 20+/week
- Posts: 30+/week
- Comments: 50+/week

Week 24:
- Questions: 50+/week
- Answers: 100+/week
- Posts: 150+/week
- Comments: 300+/week

Week 36:
- Questions: 150+/week
- Answers: 300+/week
- Posts: 500+/week
- Comments: 1000+/week
```

**Creator Distribution (90-9-1 Rule):**
```
Consumers (90%): View only
Contributors (9%): Occasional posts/comments
Creators (1%): Regular content creation

Target: Improve to 80-15-5
```

---

## Engagement Dashboard (PostHog)

**Daily View:**
```
┌─────────────────────────────────────────────┐
│ DAILY ACTIVE USERS              185         │
│ Yesterday: 178  ▲ +3.9%                     │
├─────────────────────────────────────────────┤
│ TODAY'S ENGAGEMENT                          │
│ • Posts created:        28                  │
│ • Questions asked:      12                  │
│ • Answers posted:       24                  │
│ • Messages sent:        156                 │
│ • Calculator uses:      68                  │
├─────────────────────────────────────────────┤
│ TOP FEATURES TODAY (Sessions)               │
│ 1. Feed browsing        342                 │
│ 2. Messaging            298                 │
│ 3. FCR Calculator       156                 │
│ 4. Q&A Reading          124                 │
│ 5. Profile viewing      98                  │
└─────────────────────────────────────────────┘
```

**Weekly Metrics:**
```
WAU/MAU STICKINESS: 42%
Target: 40%  ✅

Average Session Duration: 8.5 min
Target: 8.0 min  ✅

Sessions per User: 4.2/week
Target: 4.0/week  ✅

Feature Adoption (Last 7 Days):
Calculator:     72% (▲ 2pp)
Q&A:           48% (▲ 5pp)
Messaging:     28% (▲ 3pp)
Posts:         22% (→ 0pp)
```

---

# 7.3 CONVERSION METRICS

## Top-Level Metrics

### 1. Qualified Lead Definition

**Criteria (Must meet 2 of 4):**
```
□ Farm size >50K birds
□ Active user (5+ days in last 30)
□ Uses 3+ tools regularly
□ Farm growing (added capacity or mentioned growth)
```

**Scoring System (0-100):**
```
FARM SIZE (40 points):
>100K birds: 40 pts
80-100K: 30 pts
60-80K: 20 pts
50-60K: 10 pts
<50K: 0 pts

ENGAGEMENT (30 points):
Daily active: 30 pts
3-6 days/week: 20 pts
1-2 days/week: 10 pts
<1 day/week: 0 pts

TOOL USAGE (20 points):
5+ tools: 20 pts
3-4 tools: 15 pts
1-2 tools: 5 pts

PAIN SIGNALS (10 points):
Explicit ("need X"): 10 pts
Implicit (workarounds): 5 pts
Questions about ERP: 5 pts

SCORE TIERS:
90-100: 🔥 Red Hot (Call now)
70-89: 🟠 Hot (Reach out this week)
50-69: 🟡 Warm (Nurture content)
0-49: ⚪ Too early (Let grow)
```

---

### 2. Qualification Rate

**Definition:**
```
% of users who become qualified leads

Formula: (Qualified Leads / Total Users) × 100
```

**Calculation:**
```sql
WITH scored_users AS (
  SELECT 
    u.id,
    u.farm_size,
    COUNT(DISTINCT DATE(e.timestamp)) as active_days,
    COUNT(DISTINCT e.feature_name) as tools_used,
    -- Scoring logic
    (CASE 
      WHEN u.farm_size > 100000 THEN 40
      WHEN u.farm_size > 80000 THEN 30
      WHEN u.farm_size > 60000 THEN 20
      WHEN u.farm_size > 50000 THEN 10
      ELSE 0
    END) +
    (CASE 
      WHEN COUNT(DISTINCT DATE(e.timestamp)) >= 20 THEN 30
      WHEN COUNT(DISTINCT DATE(e.timestamp)) >= 10 THEN 20
      WHEN COUNT(DISTINCT DATE(e.timestamp)) >= 3 THEN 10
      ELSE 0
    END) +
    (CASE 
      WHEN COUNT(DISTINCT e.feature_name) >= 5 THEN 20
      WHEN COUNT(DISTINCT e.feature_name) >= 3 THEN 15
      ELSE 5
    END) as score
  FROM users u
  LEFT JOIN events e ON u.id = e.user_id
    AND e.timestamp >= NOW() - INTERVAL '30 days'
  GROUP BY u.id, u.farm_size
)
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN score >= 70 THEN 1 END) as qualified_leads,
  ROUND(COUNT(CASE WHEN score >= 70 THEN 1 END) * 100.0 / COUNT(*), 2) as qualification_rate
FROM scored_users;
```

**Targets:**
```
Week 24: 2% (20 of 1,000 users)
Week 36: 3% (300 of 10,000 users)
Year 1 End: 5% (500 of 10,000 users)
```

---

### 3. Lead Velocity Rate (LVR)

**Definition:**
```
Month-over-month growth in qualified leads

Formula: ((This Month Leads - Last Month Leads) / Last Month Leads) × 100
```

**Target:**
```
20%+ month-over-month growth
```

**Calculation:**
```sql
WITH monthly_leads AS (
  SELECT 
    DATE_TRUNC('month', qualified_at) as month,
    COUNT(*) as leads
  FROM qualified_leads
  GROUP BY month
  ORDER BY month
)
SELECT 
  month,
  leads,
  LAG(leads) OVER (ORDER BY month) as prev_month_leads,
  ROUND((leads - LAG(leads) OVER (ORDER BY month)) * 100.0 / 
    LAG(leads) OVER (ORDER BY month), 2) as growth_rate
FROM monthly_leads;
```

---

### 4. Lead-to-Demo Conversion

**Definition:**
```
% of qualified leads who schedule/complete demo

Formula: (Demos Completed / Qualified Leads) × 100
```

**Funnel:**
```
Qualified Lead: 100%
    ↓
Outreach Sent: 90% (open rate)
    ↓
Replied: 50% (response rate)
    ↓
Demo Scheduled: 30%
    ↓
Demo Completed: 25% (some no-shows)

Overall: 25% lead-to-demo
```

**Targets:**
```
Week 24: 20%
Week 36: 30%
Year 1: 35%
```

**Optimization:**
```
Improve Response Rate:
□ Personalization (reference their usage)
□ Timing (send during work hours)
□ Value-focused (not feature-focused)
□ Social proof (case studies)

Reduce No-shows:
□ Calendar reminders (24hr, 1hr before)
□ SMS reminder
□ Confirmation call
□ Clear value proposition
□ Easy reschedule option
```

---

### 5. Demo-to-Trial Conversion

**Definition:**
```
% of demos that convert to trial

Formula: (Trials Started / Demos Completed) × 100
```

**Targets:**
```
Week 24: 50%
Week 36: 60%
Year 1: 70%
```

**Success Factors:**
```
During Demo:
□ Discovered pain points
□ Showed relevant features
□ Used their data (if possible)
□ Built rapport
□ Addressed concerns
□ Clear next steps

After Demo:
□ Sent follow-up within 1 hour
□ Included proposal with ROI
□ Made trial setup easy
□ Offered onboarding support
□ Set expectations clearly
```

---

### 6. Trial-to-Paid Conversion

**Definition:**
```
% of trials that convert to paid customers

Formula: (Paid Customers / Trials Started) × 100
```

**Targets:**
```
Week 24: 30%
Week 36: 40%
Year 1: 50%
```

**Trial Success Indicators:**
```
High Conversion Probability:
□ Logged in 15+ days during 30-day trial
□ Added 3+ team members
□ Used 5+ features
□ Generated reports
□ Contacted support (engaged)
□ Added data for multiple batches

Low Conversion Probability:
□ Logged in <5 days
□ Single user only
□ Used 1-2 features
□ No data added
□ No support contact
```

**Intervention Points:**
```
Day 3: No login → Email + Call
Day 7: Low usage → Onboarding call
Day 15: High usage → Check-in call (pre-sell)
Day 20: Usage dropped → Re-engagement call
Day 25: Decision time → Conversion call
```

---

### 7. Overall Conversion Rate

**Definition:**
```
% of users who become paying customers

Formula: (Paid Customers / Total Users) × 100
```

**Full Funnel:**
```
New User: 10,000
    ↓
Qualified Lead: 300 (3%)
    ↓
Demo Completed: 90 (30% of 300)
    ↓
Trial Started: 54 (60% of 90)
    ↓
Paid Customer: 27 (50% of 54)

Overall: 0.27% user-to-customer
```

**Targets:**
```
Week 36: 0.2% (20 of 10,000)
Year 1: 0.3% (30 of 10,000)
Year 2: 0.5% (100 of 20,000)
```

**Benchmark:**
```
Freemium SaaS average: 0.5-2%
B2B PLG: 1-3%
Enterprise PLG: 0.1-0.5%

PoultryCo (B2B PLG): 0.3-0.5% is good
```

---

## Conversion Dashboard

**Sales Pipeline View:**
```
┌─────────────────────────────────────────────┐
│ CONVERSION FUNNEL (LAST 30 DAYS)            │
├─────────────────────────────────────────────┤
│ Qualified Leads        45  (100%)           │
│    ↓ 33% conversion                         │
│ Demos Completed        15  (33%)            │
│    ↓ 60% conversion                         │
│ Trials Started          9  (60% of 15)      │
│    ↓ 44% conversion                         │
│ Paid Customers          4  (44% of 9)       │
├─────────────────────────────────────────────┤
│ CURRENT PIPELINE VALUE                      │
│ • Active Trials:  9 × ₹15K = ₹1.35L        │
│ • Hot Leads: 12 × ₹15K × 30% = ₹54K        │
│ • Total Pipeline: ₹1.89L                    │
└─────────────────────────────────────────────┘
```

**Lead Scoring View:**
```
┌─────────────────────────────────────────────┐
│ TOP QUALIFIED LEADS THIS WEEK               │
├─────────────────────────────────────────────┤
│ 🔥 RED HOT (Score 90+)         5            │
│ • Ravi Kumar (95) - Call today             │
│ • Murugan Farms (93) - Demo scheduled      │
│ • ...                                       │
├─────────────────────────────────────────────┤
│ 🟠 HOT (Score 70-89)          12            │
│ • Senthil Poultry (87) - Reach out         │
│ • ...                                       │
├─────────────────────────────────────────────┤
│ 🟡 WARM (Score 50-69)         28            │
│ • Send nurture content                      │
└─────────────────────────────────────────────┘
```

---

# 7.4 BUSINESS HEALTH METRICS

## Revenue Metrics

### 1. Monthly Recurring Revenue (MRR)

**Definition:**
```
Predictable monthly revenue from subscriptions

Formula: Number of Customers × Average Revenue Per Customer
```

**Calculation:**
```sql
SELECT 
  DATE_TRUNC('month', subscription_start) as month,
  COUNT(*) as customers,
  SUM(monthly_price) as mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY month
ORDER BY month;
```

**Targets:**
```
Month 6: ₹30K (2 customers)
Month 12: ₹4.5L (30 customers)
Month 24: ₹18L (120 customers)
```

**Growth Rate:**
```
Target: 15%+ month-over-month
Acceptable: 10%+
Concerning: <5%
```

---

### 2. Customer Lifetime Value (LTV)

**Definition:**
```
Total revenue from a customer over their lifetime

Simple Formula: ARPU × Gross Margin × (1 / Churn Rate)
```

**Calculation:**
```
Average Revenue Per User (ARPU): ₹15,000/month
Gross Margin: 70%
Monthly Churn Rate: 2% (1/0.02 = 50 months)

LTV = ₹15,000 × 0.70 × 50
    = ₹5,25,000

Simplified: ₹5.25L per customer
```

**Target Ratio:**
```
LTV:CAC should be >3:1

Current:
LTV: ₹5.25L
CAC: ₹10,000
Ratio: 52.5:1 ✅ Excellent!

(This is high because CAC is low via PLG)
```

---

### 3. Churn Rate

**Definition:**
```
% of customers who cancel per month

Formula: (Customers Lost / Customers at Start) × 100
```

**Calculation:**
```sql
WITH monthly_cohorts AS (
  SELECT 
    DATE_TRUNC('month', subscription_start) as cohort_month,
    user_id
  FROM subscriptions
),
churned_users AS (
  SELECT 
    DATE_TRUNC('month', cancelled_at) as churn_month,
    user_id
  FROM subscriptions
  WHERE status = 'cancelled'
)
SELECT 
  c.cohort_month,
  COUNT(c.user_id) as cohort_size,
  COUNT(ch.user_id) as churned,
  ROUND(COUNT(ch.user_id) * 100.0 / COUNT(c.user_id), 2) as churn_rate
FROM monthly_cohorts c
LEFT JOIN churned_users ch ON c.user_id = ch.user_id
  AND ch.churn_month = c.cohort_month + INTERVAL '1 month'
GROUP BY c.cohort_month
ORDER BY c.cohort_month;
```

**Targets:**
```
Year 1: <5% monthly churn
Year 2: <3% monthly churn
Year 3: <2% monthly churn

Annual Churn Target: <25%
```

**Churn Reasons to Track:**
```
□ Too expensive (price objection)
□ Not using enough (engagement issue)
□ Missing features (product gaps)
□ Technical issues (quality problem)
□ Business closed (market risk)
□ Competitor switch (competitive threat)
```

---

### 4. Net Revenue Retention (NRR)

**Definition:**
```
Revenue retained from existing customers including upgrades/downgrades

Formula: (Starting MRR + Expansion - Churn) / Starting MRR × 100
```

**Example:**
```
Starting MRR: ₹10L
+ Expansion (upgrades): ₹2L
- Churned MRR: ₹1L
= Ending MRR: ₹11L

NRR = ₹11L / ₹10L × 100 = 110%
```

**Interpretation:**
```
>100%: Excellent (growth from existing customers)
90-100%: Good (minimal churn, some expansion)
80-90%: Acceptable (room for improvement)
<80%: Concerning (high churn, no expansion)
```

**Target:**
```
Year 1: 90%+ (focus on retention)
Year 2: 100%+ (add expansion revenue)
Year 3: 110%+ (strong expansion)
```

---

## Product Health Metrics

### 5. App Crash Rate

**Definition:**
```
% of sessions that end in a crash

Formula: (Crashed Sessions / Total Sessions) × 100
```

**Target:**
```
<1% crash rate
<0.5% is excellent
>2% is concerning
```

**Tracking (Sentry):**
```
□ Monitor crash trends
□ Group by error type
□ Prioritize by frequency
□ Track fix deployment
□ Verify crash reduction
```

---

### 6. API Error Rate

**Definition:**
```
% of API requests that return errors

Formula: (5xx Responses / Total Requests) × 100
```

**Targets:**
```
<0.1%: Excellent
0.1-0.5%: Good
0.5-1%: Acceptable
>1%: Concerning
```

**Monitoring:**
```
□ Track by endpoint
□ Alert on spikes
□ Root cause analysis
□ Performance optimization
```

---

### 7. Page Load Time

**Definition:**
```
Time for page to become interactive

Measurement: Time to Interactive (TTI)
```

**Targets:**
```
Mobile (3G):
- <3s: Excellent
- 3-5s: Good
- 5-7s: Acceptable
- >7s: Poor

Mobile (4G):
- <2s: Excellent
- 2-3s: Good
- 3-5s: Acceptable
- >5s: Poor

Web (Desktop):
- <1s: Excellent
- 1-2s: Good
- 2-3s: Acceptable
- >3s: Poor
```

---

### 8. Net Promoter Score (NPS)

**Definition:**
```
User satisfaction and willingness to recommend

Question: "How likely are you to recommend PoultryCo to a friend?" (0-10)

Calculation:
Promoters (9-10): X%
Passives (7-8): Y%
Detractors (0-6): Z%

NPS = X% - Z%
```

**Interpretation:**
```
>70: Excellent
50-70: Great
30-50: Good
0-30: Needs improvement
<0: Poor
```

**Target:**
```
Week 24: NPS 30+ (early product)
Week 36: NPS 40+ (improving)
Year 2: NPS 50+ (mature)
```

**When to Survey:**
```
□ After 30 days of usage
□ After support interaction
□ Quarterly for all users
□ Post-conversion (new customers)
```

---

## Business Health Dashboard

**Executive View:**
```
┌─────────────────────────────────────────────┐
│ REVENUE METRICS                             │
├─────────────────────────────────────────────┤
│ MRR                    ₹4.5L                │
│ Target: ₹4L  ✅ +12.5%                      │
│                                             │
│ New MRR (This Month)   ₹75K                 │
│ Expansion MRR          ₹15K                 │
│ Churned MRR           -₹10K                 │
│ Net New MRR            ₹80K                 │
├─────────────────────────────────────────────┤
│ CUSTOMER METRICS                            │
├─────────────────────────────────────────────┤
│ Total Customers         30                  │
│ New This Month          5                   │
│ Churned This Month      1                   │
│ Churn Rate             3.3%  ✅             │
│                                             │
│ LTV                    ₹5.25L               │
│ CAC                    ₹10K                 │
│ LTV:CAC Ratio          52.5:1  ✅           │
├─────────────────────────────────────────────┤
│ PRODUCT HEALTH                              │
├─────────────────────────────────────────────┤
│ App Crash Rate         0.4%  ✅             │
│ API Error Rate         0.08%  ✅            │
│ Avg Load Time          2.3s  ✅             │
│ NPS Score              42  ✅               │
└─────────────────────────────────────────────┘
```

---

# 7.5 DASHBOARD SETUP GUIDE

## PostHog Setup

### Step 1: Create Account & Project

```bash
# Sign up at posthog.com or self-host

# Install SDK in mobile app
npm install posthog-react-native

# Install SDK in web app
npm install posthog-js
```

### Step 2: Initialize

**Mobile (React Native):**
```typescript
// src/lib/posthog.ts
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  'YOUR_API_KEY',
  {
    host: 'https://app.posthog.com', // or your self-hosted URL
    captureApplicationLifecycleEvents: true,
    captureDeepLinks: true,
  }
);
```

**Web (Next.js):**
```typescript
// src/lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init('YOUR_API_KEY', {
    api_host: 'https://app.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
  });
}

export default posthog;
```

---

### Step 3: Track Events

**Key Events to Track:**

```typescript
// User events
posthog.capture('user_signed_up', {
  method: 'phone', // or 'email', 'google', 'linkedin'
  referral_source: 'organic',
});

posthog.capture('profile_completed', {
  role: 'farmer',
  farm_size: 80000,
  location: 'Tamil Nadu',
});

// Feature events
posthog.capture('calculator_used', {
  calculator_type: 'fcr',
  farm_size: 80000,
  fcr_result: 1.65,
});

posthog.capture('question_posted', {
  tags: ['disease', 'broiler'],
  has_media: true,
});

posthog.capture('message_sent', {
  recipient_type: 'vet',
  message_length: 245,
});

// Conversion events
posthog.capture('lead_qualified', {
  score: 92,
  qualification_reason: ['farm_size', 'engagement'],
});

posthog.capture('demo_scheduled', {
  lead_score: 92,
  days_since_signup: 45,
});

posthog.capture('trial_started', {
  plan: 'professional',
  team_size: 3,
});

posthog.capture('subscription_created', {
  plan: 'professional',
  billing_cycle: 'monthly',
  amount: 15000,
});
```

---

### Step 4: Identify Users

```typescript
// After signup/login
posthog.identify(
  userId,
  {
    email: user.email,
    name: user.name,
    role: user.role,
    farm_size: user.farmSize,
    location: user.location,
    created_at: user.createdAt,
  }
);
```

---

### Step 5: Create Dashboards

**Dashboard 1: Acquisition**
```
Panels:
1. New Signups (Daily) - Line chart
2. Signup Conversion Funnel - Funnel chart
3. Traffic Sources - Pie chart
4. Viral Coefficient - Metric
5. Cost Per Acquisition - Metric
```

**Dashboard 2: Engagement**
```
Panels:
1. DAU/WAU/MAU - Line chart
2. WAU/MAU Ratio - Metric
3. Feature Adoption - Bar chart
4. Session Duration - Line chart
5. Content Creation - Stacked area chart
```

**Dashboard 3: Conversion**
```
Panels:
1. Sales Funnel - Funnel chart
2. Lead Score Distribution - Bar chart
3. Pipeline Value - Metric
4. Conversion Rates - Table
5. MRR Growth - Line chart
```

**Dashboard 4: Product Health**
```
Panels:
1. App Crash Rate - Line chart
2. API Error Rate - Line chart
3. Page Load Time - Line chart
4. NPS Score - Gauge
5. User Feedback - Table
```

---

### Step 6: Set Up Alerts

**Critical Alerts (Slack):**
```
□ Crash rate >2%
□ API error rate >1%
□ Signups <50% of daily target
□ WAU/MAU drops >5pp
□ MRR negative growth
□ Churn rate >5%
```

**Warning Alerts (Email):**
```
□ Crash rate >1%
□ API error rate >0.5%
□ Signups <75% of target
□ Session duration drops >10%
□ Feature adoption drops >10%
```

---

## Google Analytics 4 Setup

### Step 1: Create Property

```
1. Go to analytics.google.com
2. Create new property "PoultryCo"
3. Add data stream for website
4. Copy Measurement ID
```

### Step 2: Install Tag

**Next.js:**
```typescript
// pages/_app.tsx
import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}
```

### Step 3: Track Conversions

```typescript
// Track custom events
gtag('event', 'sign_up', {
  method: 'phone',
});

gtag('event', 'purchase', {
  transaction_id: 'T12345',
  value: 15000,
  currency: 'INR',
  items: [{
    item_name: 'PoultryCare Professional',
    item_category: 'subscription',
    price: 15000,
    quantity: 1,
  }],
});
```

---

## Metabase Setup (Self-Hosted BI)

### Why Metabase?

```
Pros:
✅ Free and open-source
✅ Beautiful dashboards
✅ SQL + GUI query builder
✅ Self-hosted (data privacy)
✅ Embedded dashboards
✅ Scheduled reports

Use for:
□ Complex SQL queries
□ Custom reports
□ Business intelligence
□ Data exploration
```

### Installation (Docker):

```bash
docker run -d -p 3000:3000 \
  --name metabase \
  -v metabase-data:/metabase-data \
  -e "MB_DB_FILE=/metabase-data/metabase.db" \
  metabase/metabase
```

### Connect to Supabase:

```
Database type: PostgreSQL
Host: db.xxx.supabase.co
Port: 5432
Database name: postgres
Username: postgres
Password: [your_password]
```

### Example Queries:

**User Growth:**
```sql
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) as total_users
FROM users
GROUP BY week
ORDER BY week;
```

**Cohort Retention:**
```sql
WITH cohorts AS (
  SELECT 
    user_id,
    DATE_TRUNC('week', created_at) as cohort_week
  FROM users
),
activity AS (
  SELECT 
    user_id,
    DATE_TRUNC('week', timestamp) as activity_week
  FROM events
  WHERE event_name = 'app_opened'
)
SELECT 
  c.cohort_week,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week THEN a.user_id END) as week_0,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '1 week' THEN a.user_id END) as week_1,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '2 weeks' THEN a.user_id END) as week_2,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '3 weeks' THEN a.user_id END) as week_3,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '4 weeks' THEN a.user_id END) as week_4
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_week
ORDER BY c.cohort_week;
```

---

# 7.6 WEEKLY REVIEW TEMPLATE

## Monday Morning Ritual (30 minutes)

### 1. Quick Scan (5 min)

**Check These Metrics:**
```
□ DAU/WAU/MAU (from PostHog)
□ New signups last week
□ Qualified leads generated
□ Trials started
□ Customers added
□ MRR change
```

**Red Flags:**
```
□ Any metric >20% below target?
□ Any negative trends >2 weeks?
□ Any critical bugs?
□ Any customer churn?
```

---

### 2. Acquisition Review (5 min)

**Questions:**
```
□ Did we hit signup target?
□ What was the best traffic source?
□ How's the signup conversion rate?
□ Any viral growth happening?
```

**Template:**
```
ACQUISITION LAST WEEK:
New Signups: 245 (Target: 252) ⚠️ -3%

Sources:
1. Referral: 98 (40%)
2. Organic: 74 (30%)
3. Association: 49 (20%)
4. Social: 24 (10%)

Signup Conversion: 22% (▲ 2pp vs prev week) ✅

Action Items:
- Investigate referral drop (was 45% last week)
- Double down on association partnerships
```

---

### 3. Engagement Review (10 min)

**Questions:**
```
□ Are users coming back?
□ What features are they using?
□ Any drop in engagement?
□ What content performed well?
```

**Template:**
```
ENGAGEMENT LAST WEEK:
WAU/MAU: 41% (Target: 40%) ✅
Avg Session: 8.2 min (Target: 8.0 min) ✅
Sessions/User: 4.5/week (Target: 4.0/week) ✅

Top Features:
1. Feed: 1,245 sessions
2. Messaging: 987 sessions
3. Calculator: 456 sessions

Content Performance:
- Top post: "FCR Optimization Tips" (245 likes)
- Top question: "Broiler mortality week 3" (18 answers)

Action Items:
- Promote calculator more (usage down 10%)
- Create more content like top post
```

---

### 4. Conversion Review (5 min)

**Questions:**
```
□ Any new qualified leads?
□ How many demos this week?
□ Any trials started?
□ Any deals closed?
```

**Template:**
```
CONVERSION LAST WEEK:
Qualified Leads: 8 new (Total: 42)
- Red Hot (90+): 2
- Hot (70-89): 4
- Warm (50-69): 2

Demos: 3 completed
- 2 trials started
- 1 thinking (follow-up Friday)

Deals Closed: 1 🎉
- Murugan Farms
- ₹15K/month
- 75K birds

Pipeline Value: ₹2.1L

Action Items:
- Call 2 Red Hot leads today
- Follow up with "thinking" lead Friday
- Send case study to 4 Hot leads
```

---

### 5. Action Planning (5 min)

**This Week's Focus:**
```
TOP 3 PRIORITIES:
1. [Most important thing]
2. [Second most important]
3. [Third most important]

EXPERIMENTS TO RUN:
1. [Test/experiment]
2. [Test/experiment]

BLOCKERS TO RESOLVE:
1. [Blocker]
2. [Blocker]
```

**Template:**
```
THIS WEEK'S FOCUS:

TOP 3 PRIORITIES:
1. Convert 2 Red Hot leads (demos scheduled)
2. Increase calculator usage (down 10%)
3. Launch referral incentive program

EXPERIMENTS:
1. A/B test: Profile completion flow (reduce steps)
2. Test: WhatsApp notification for FCR tips

BLOCKERS:
1. None currently

TEAM SUPPORT NEEDED:
- Engineering: Fix calculator loading bug
- Marketing: Create 3 case study one-pagers
```

---

# 7.7 MONTHLY BUSINESS REVIEW

## First Week of Month (2 hours)

### 1. Metrics Summary (30 min)

**Prepare Report:**
```markdown
# PoultryCo Monthly Review - [Month Year]

## Executive Summary
[2-3 sentences on overall progress]

## Key Metrics

### Acquisition
- New Signups: X (Target: Y) [Z% vs target]
- Total Users: X (▲ Y% MoM)
- Viral Coefficient: X
- CPA: ₹X

### Engagement
- WAU: X (Target: Y)
- WAU/MAU: X% (Target: Y%)
- Avg Session: X min
- Feature Adoption: [List top 3]

### Conversion
- Qualified Leads: X (▲ Y MoM)
- Demos: X
- Trials: X
- New Customers: X

### Revenue
- MRR: ₹X (▲ Y% MoM)
- New MRR: ₹X
- Churn: Y%
- NRR: X%

## Wins This Month
1. [Win 1]
2. [Win 2]
3. [Win 3]

## Challenges
1. [Challenge 1]
2. [Challenge 2]

## Next Month Focus
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

---

### 2. Deep Dive Analysis (45 min)

**Cohort Analysis:**
```
Review retention by signup week:
- Which cohorts retained best?
- What was different about them?
- Can we replicate those conditions?
```

**Feature Performance:**
```
- Which features drove retention?
- Which features drove conversion?
- Which features are underused?
- What should we double down on?
- What should we sunset?
```

**Sales Analysis:**
```
- Which lead sources converted best?
- What's the average sales cycle?
- What objections came up?
- What case studies worked?
- What should we change in sales process?
```

---

### 3. Team Review (30 min)

**Discuss with Team:**
```
□ Share metrics report
□ Celebrate wins
□ Discuss challenges
□ Get feedback
□ Align on priorities
□ Adjust roadmap if needed
```

---

### 4. Stakeholder Communication (15 min)

**Send Update to:**
```
□ Prabharan (co-founder)
□ PTIC board
□ Key advisors
```

**Email Template:**
```
Subject: PoultryCo Monthly Update - [Month]

Hi [Name],

Quick update on PoultryCo's progress this month:

📈 GROWTH
- X new users (Y% growth)
- Z total users now
- MRR: ₹X (▲Y%)

🎯 HIGHLIGHTS
1. [Key win 1]
2. [Key win 2]
3. [Key win 3]

🚧 CHALLENGES
- [Challenge + how addressing it]

🎯 NEXT MONTH
- [Focus 1]
- [Focus 2]
- [Focus 3]

Let me know if you'd like to discuss anything in detail.

Best,
Janagaran

[Link to full report]
```

---

# 7.8 ALERT CONFIGURATION

## Critical Alerts (Immediate Action)

**Slack #emergency Channel:**

### 1. System Outage
```
Trigger: API error rate >5% for 5 minutes
Message: "🚨 CRITICAL: API error rate at X%. Check status immediately."
Action: Follow incident response (Part 6)
```

### 2. Database Issues
```
Trigger: Database latency >5 seconds
Message: "🚨 CRITICAL: Database responding slowly. Check Supabase dashboard."
Action: Check queries, indexes, connections
```

### 3. High Crash Rate
```
Trigger: App crash rate >5%
Message: "🚨 CRITICAL: App crash rate at X%. Check Sentry for details."
Action: Identify crash, deploy hotfix
```

---

## Warning Alerts (Action within 24 hours)

**Slack #ops Channel:**

### 4. Signup Drop
```
Trigger: Daily signups <50% of target
Message: "⚠️  WARNING: Only X signups today (target: Y). Check signup funnel."
Action: Review analytics, check for bugs
```

### 5. Engagement Drop
```
Trigger: WAU/MAU drops >5pp
Message: "⚠️  WARNING: WAU/MAU dropped to X% (was Y% last week)."
Action: Review engagement metrics, user feedback
```

### 6. Churn Spike
```
Trigger: >3 customers churn in one week
Message: "⚠️  WARNING: X customers churned this week (normal: <2)."
Action: Contact churned customers, identify patterns
```

---

## Info Alerts (Monitor, no immediate action)

**Email to Janagaran:**

### 7. Weekly Summary
```
Trigger: Every Monday 8 AM
Message: Weekly metrics summary
Content: Pre-filled review template
```

### 8. Monthly Summary
```
Trigger: 1st of each month
Message: Monthly metrics summary
Content: Pre-filled review template
```

### 9. Lead Score Alert
```
Trigger: User crosses score threshold (70, 90)
Message: "🔥 New qualified lead: [Name] (Score: X)"
Action: Add to sales outreach list
```

---

**[END OF PART 7]**

---

## METRICS EXCELLENCE CHECKLIST

```
ACQUISITION:
□ Tracking new signups daily
□ Monitoring conversion funnel
□ Analyzing traffic sources
□ Calculating viral coefficient
□ Measuring CPA by channel

ENGAGEMENT:
□ Tracking DAU/WAU/MAU
□ Monitoring stickiness (WAU/MAU)
□ Measuring session metrics
□ Analyzing feature adoption
□ Tracking content creation

CONVERSION:
□ Scoring qualified leads
□ Tracking sales funnel
□ Monitoring conversion rates
□ Measuring pipeline value
□ Analyzing churn reasons

BUSINESS HEALTH:
□ Tracking MRR growth
□ Calculating LTV:CAC
□ Monitoring churn rate
□ Measuring NRR
□ Tracking NPS

DASHBOARDS:
□ PostHog set up
□ Google Analytics configured
□ Alerts configured
□ Weekly review scheduled
□ Monthly review scheduled

PROCESS:
□ Monday review ritual
□ Weekly action planning
□ Monthly deep dive
□ Stakeholder updates
□ Team alignment
```

---