# 🔧 NECC Admin App - Complete To-Do List

**Location:** `apps/admin`  
**Purpose:** Comprehensive admin interface to manage the entire NECC system  
**Status:** Core Features Implemented ✅  
**Last Updated:** January 23, 2025

---

## 📋 OVERVIEW

The NECC Admin App will provide a comprehensive administrative interface for managing:
- **Data Management:** Zones, prices, scraping
- **Content Management:** Expert annotations, predictions, blog posts
- **Expert Management:** Verification, permissions, analytics
- **System Monitoring:** Scraper health, data quality, system performance
- **Analytics:** Usage stats, engagement metrics, SEO performance

---

## 🎯 CORE MODULES

### 1️⃣ **Dashboard Module**
Central hub for monitoring and quick actions

### 2️⃣ **Zone Management**
Manage NECC zones and their metadata

### 3️⃣ **Price Management**
View, edit, and manage price data

### 4️⃣ **Scraper Management**
Monitor and control the NECC price scraper

### 5️⃣ **Expert Management**
Manage expert profiles, verification, and permissions

### 6️⃣ **Annotation Management**
Review, approve, and manage expert annotations

### 7️⃣ **Prediction Management**
Manage price predictions (AI & expert)

### 8️⃣ **Blog Management**
Create and publish NECC-related blog content

### 9️⃣ **Analytics Dashboard**
Detailed analytics and reporting

### 🔟 **Settings & Configuration**
System settings and configurations

---

## 📝 DETAILED TO-DO LIST

---

## 1️⃣ DASHBOARD MODULE

### 📊 Overview Cards
- [ ] **Today's Summary Card**
  - [ ] Total zones with prices today
  - [ ] Average price (all zones)
  - [ ] Price change vs yesterday (↑/↓%)
  - [ ] Highest & lowest zone prices
  - [ ] Last scrape time

- [ ] **System Health Card**
  - [ ] Scraper status (running/stopped/error)
  - [ ] Last successful scrape
  - [ ] Failed zones (if any)
  - [ ] API response time
  - [ ] Database size

- [ ] **Content Stats Card**
  - [ ] Total annotations (today/this week)
  - [ ] Pending annotations (if approval required)
  - [ ] Total experts (active/inactive)
  - [ ] Total predictions
  - [ ] Blog posts (published/draft)

- [ ] **Engagement Metrics Card**
  - [ ] Page views (today/this week)
  - [ ] Unique users
  - [ ] Top pages
  - [ ] Social shares
  - [ ] Search traffic

### 📈 Quick Charts
- [ ] **7-Day Price Trend Chart**
  - [ ] Line chart of average prices (last 7 days)
  - [ ] Interactive with tooltips

- [ ] **Zone Comparison Chart**
  - [ ] Top 5 zones by price
  - [ ] Bar chart visualization

- [ ] **Traffic Chart**
  - [ ] Page views (last 30 days)
  - [ ] Line/area chart

### ⚡ Quick Actions
- [ ] **Action Buttons**
  - [ ] Trigger manual scrape
  - [ ] View scraper logs
  - [ ] View pending annotations
  - [ ] Create new blog post
  - [ ] Refresh materialized views
  - [ ] View system logs

### 🔔 Alert Panel
- [ ] **Recent Alerts**
  - [ ] Scraper failures
  - [ ] Data quality issues
  - [ ] Missing prices (zones without data)
  - [ ] Unusual price spikes/drops
  - [ ] System errors

---

## 2️⃣ ZONE MANAGEMENT ✅ COMPLETED

### 📋 Zone List View
- [x] **Zone Table** ✅
  - [x] Columns: Name, Type (PC/CC), State, City, Status, Last Price, Actions
  - [x] Sortable by all columns
  - [x] Filterable by type, state, status
  - [x] Search by name
  - [x] Pagination (50 per page)
  - [ ] Export to CSV

- [ ] **Bulk Actions**
  - [ ] Bulk activate/deactivate zones
  - [ ] Bulk update sorting order
  - [ ] Bulk export

### ➕ Add New Zone
- [x] **Zone Form** ✅
  - [x] Zone name (required)
  - [x] Slug (auto-generated, editable)
  - [x] Description (rich text)
  - [x] Zone type (PC/CC) - dropdown
  - [x] Zone code (optional)
  - [x] State (dropdown or autocomplete)
  - [x] District (text)
  - [x] City (text)
  - [x] Sorting order (number)
  - [x] Status (active/inactive)
  - [x] Save & Add Another button
  - [x] Save & View button

- [x] **Validation** ✅
  - [x] Name uniqueness check
  - [x] Slug uniqueness check
  - [x] Required field validation
  - [x] Slug format validation (lowercase, hyphens)

### ✏️ Edit Zone
- [x] **Edit Form** ✅
  - [x] Same as Add form
  - [x] Show created/updated timestamps
  - [x] Show total prices for this zone
  - [x] Link to view prices

- [x] **Danger Zone** ✅
  - [x] Delete zone (with confirmation)
  - [x] Warning if zone has prices
  - [x] Cascade delete option (or prevent)

### 📊 Zone Detail View
- [ ] **Zone Information**
  - [ ] All zone metadata
  - [ ] Edit button

- [ ] **Price Statistics**
  - [ ] Total prices recorded
  - [ ] First price date
  - [ ] Last price date
  - [ ] Average price (all time)
  - [ ] Highest/lowest prices

- [ ] **Quick Charts**
  - [ ] 30-day price trend
  - [ ] Year-over-year comparison

- [ ] **Recent Prices Table**
  - [ ] Last 30 days
  - [ ] Date, Suggested, Prevailing, Source

---

## 3️⃣ PRICE MANAGEMENT ✅ COMPLETED

### 📋 Price List View
- [x] **Price Table** ✅
  - [x] Columns: Date, Zone, Suggested, Prevailing, Source, Mode, Actions
  - [x] Sortable by all columns
  - [x] Filter by:
    - [x] Date range (date picker)
    - [x] Zone (multi-select dropdown)
    - [x] Source (scraped/manual/imported)
    - [x] Mode (CRON/MANUAL)
  - [x] Search by date or zone
  - [x] Pagination (100 per page)
  - [ ] Export to CSV/Excel

- [ ] **Bulk Actions**
  - [ ] Bulk delete (with confirmation)
  - [ ] Bulk export
  - [ ] Bulk update source/mode

### 📅 Daily Price View
- [x] **Date Selector** ✅
  - [x] Calendar date picker
  - [x] Quick links (Today, Yesterday, Last Week)

- [x] **Daily Price Grid** ✅
  - [x] All zones for selected date
  - [x] Table with: Zone, Suggested, Prevailing, Source, Actions
  - [ ] Color-coded by price change (vs yesterday)
  - [ ] Missing zones highlighted
  - [x] Edit inline or modal

- [ ] **Daily Actions**
  - [ ] Add missing zone prices
  - [ ] Trigger re-scrape for this date
  - [ ] Export daily prices
  - [ ] View on consumer site (link)

### ➕ Add Manual Price
- [x] **Manual Price Form** ✅
  - [x] Date picker (default: today)
  - [x] Zone selector (dropdown)
  - [x] Suggested price (number)
  - [x] Prevailing price (number)
  - [x] Source: Manual (locked)
  - [x] Notes (optional text)
  - [x] Save button

- [x] **Validation** ✅
  - [x] Date not in future
  - [x] Zone + Date uniqueness check
  - [x] Price > 0 validation
  - [x] Duplicate warning (if exists)

### ✏️ Edit Price
- [x] **Edit Price Form** ✅
  - [x] Same as Add form
  - [x] Show original values
  - [x] Show who created/updated
  - [ ] Audit trail (change history)

- [x] **Danger Zone** ✅
  - [x] Delete price (with confirmation)

### 📊 Price Analytics
- [ ] **Price Trends**
  - [ ] Average price over time
  - [ ] Zone-wise breakdown
  - [ ] Volatility analysis

- [ ] **Data Quality Metrics**
  - [ ] Missing dates by zone
  - [ ] Unusual price spikes
  - [ ] Data completeness %
  - [ ] Source breakdown (scraped vs manual)

### 📥 Import Prices
- [ ] **Import Interface**
  - [ ] CSV file upload
  - [ ] Excel file upload
  - [ ] Template download
  - [ ] Column mapping
  - [ ] Preview before import
  - [ ] Import progress bar
  - [ ] Error handling & reporting

---

## 4️⃣ SCRAPER MANAGEMENT ✅ COMPLETED

### 🤖 Scraper Dashboard
- [x] **Scraper Status Panel** ✅
  - [x] Current status (Running/Stopped/Error)
  - [x] Last run timestamp
  - [x] Last successful run
  - [x] Next scheduled run (if cron enabled)
  - [x] Total runs today/this week

- [x] **Performance Metrics** ✅
  - [x] Average scrape time
  - [x] Success rate %
  - [x] Zones scraped successfully
  - [x] Zones failed
  - [x] API response times

### ⚙️ Scraper Controls
- [x] **Action Buttons** ✅
  - [x] Start manual scrape (with confirmation)
  - [x] Month selector for historical scraping
  - [x] View scrape results with stats
  - [x] Zone validation (checks against DB)
  - [x] Missing zone warnings

- [ ] **Configuration**
  - [ ] Enable/disable cron schedule
  - [ ] Set cron expression (with validation)
  - [ ] Set scraper timeout
  - [ ] Set retry attempts
  - [ ] Set user agent
  - [ ] Enable/disable notifications

### 📜 Scraper Logs
- [ ] **Log Viewer**
  - [ ] Table: Timestamp, Type (info/warn/error), Message, Details
  - [ ] Filter by type, date range
  - [ ] Search logs
  - [ ] Pagination
  - [ ] Real-time log streaming (WebSocket)
  - [ ] Export logs

- [ ] **Log Details Modal**
  - [ ] Full error stack trace
  - [ ] Request/response details
  - [ ] Screenshots (if applicable)

### 📊 Scraper Analytics
- [ ] **Historical Performance**
  - [ ] Success rate chart (last 30 days)
  - [ ] Average scrape time chart
  - [ ] Failed zones heatmap

- [ ] **Zone Success Rate**
  - [ ] Table: Zone, Success Rate %, Last Success, Last Failure
  - [ ] Highlight problematic zones

### 🔔 Scraper Alerts
- [ ] **Alert Configuration**
  - [ ] Enable email alerts on failure
  - [ ] Enable Slack/Discord notifications
  - [ ] Set alert threshold (X failures = alert)
  - [ ] Recipient email addresses

- [ ] **Alert History**
  - [ ] Table of past alerts
  - [ ] Acknowledged/unacknowledged

---

## 5️⃣ EXPERT MANAGEMENT

### 👥 Expert List View
- [ ] **Expert Table**
  - [ ] Columns: Name, Email, Status, Verified, Reputation Score, Annotations, Predictions, Joined Date, Actions
  - [ ] Sortable by all columns
  - [ ] Filter by:
    - [ ] Status (active/inactive/suspended)
    - [ ] Verified (yes/no)
    - [ ] Reputation tier (bronze/silver/gold/platinum)
  - [ ] Search by name or email
  - [ ] Pagination

- [ ] **Bulk Actions**
  - [ ] Bulk verify experts
  - [ ] Bulk activate/deactivate
  - [ ] Bulk export

### ➕ Add New Expert
- [ ] **Expert Form**
  - [ ] Profile ID (user lookup/search)
  - [ ] Expert name (auto-filled from profile)
  - [ ] Credentials (text)
  - [ ] Organization (text)
  - [ ] Experience years (number)
  - [ ] Specialization (tags/chips)
  - [ ] Bio (rich text)
  - [ ] Website URL (optional)
  - [ ] Social links (optional)
  - [ ] Verified checkbox
  - [ ] NECC access checkbox
  - [ ] Status (active/inactive)

- [ ] **Expert Permissions**
  - [ ] Can create annotations
  - [ ] Can create predictions
  - [ ] Can write blog posts
  - [ ] Can access raw data

### ✏️ Edit Expert
- [ ] **Edit Form**
  - [ ] Same as Add form
  - [ ] Show reputation score (read-only)
  - [ ] Show total annotations/predictions
  - [ ] Link to view profile

- [ ] **Reputation Management**
  - [ ] Manual reputation adjustment (with reason)
  - [ ] Reset reputation (with confirmation)
  - [ ] Reputation history log

- [ ] **Danger Zone**
  - [ ] Suspend expert (with reason)
  - [ ] Delete expert (with confirmation)
  - [ ] Transfer content to another expert

### 📊 Expert Detail View
- [ ] **Expert Profile**
  - [ ] All expert metadata
  - [ ] Profile photo
  - [ ] Edit button

- [ ] **Statistics**
  - [ ] Total annotations
  - [ ] Total predictions
  - [ ] Prediction accuracy %
  - [ ] Avg likes per annotation
  - [ ] Avg helpful votes
  - [ ] Reputation score & tier
  - [ ] Followers count

- [ ] **Recent Activity**
  - [ ] Last 10 annotations (with links)
  - [ ] Last 10 predictions (with links)
  - [ ] Activity timeline

- [ ] **Engagement Metrics**
  - [ ] Total views on annotations
  - [ ] Total likes
  - [ ] Total shares
  - [ ] Total helpful votes

- [ ] **Actions**
  - [ ] Send message to expert
  - [ ] View on consumer site
  - [ ] Download expert report

### 🏆 Expert Leaderboard
- [ ] **Leaderboard Table**
  - [ ] Top experts by reputation
  - [ ] Top by annotations
  - [ ] Top by prediction accuracy
  - [ ] Top by engagement
  - [ ] Sortable/filterable

---

## 6️⃣ ANNOTATION MANAGEMENT

### 📝 Annotation List View
- [ ] **Annotation Table**
  - [ ] Columns: Date, Zone, Expert, Title, Type, Status, Views, Likes, Helpful, Actions
  - [ ] Sortable by all columns
  - [ ] Filter by:
    - [ ] Date range
    - [ ] Zone (multi-select)
    - [ ] Expert (multi-select)
    - [ ] Type (price_spike/price_drop/trend_change/etc.)
    - [ ] Status (pending/approved/rejected)
  - [ ] Search by title or content
  - [ ] Pagination

- [ ] **Bulk Actions**
  - [ ] Bulk approve
  - [ ] Bulk reject
  - [ ] Bulk delete
  - [ ] Bulk export

### ➕ Create Annotation (Admin)
- [ ] **Annotation Form**
  - [ ] Expert selector (dropdown)
  - [ ] Date picker
  - [ ] Zone selector (optional, for zone-specific)
  - [ ] Title (required)
  - [ ] Content (rich text editor)
  - [ ] Annotation type (dropdown)
  - [ ] Tags (chips/multi-select)
  - [ ] Featured checkbox
  - [ ] Status (draft/published)
  - [ ] Save button

### ✏️ Edit Annotation
- [ ] **Edit Form**
  - [ ] Same as Create form
  - [ ] Show engagement metrics
  - [ ] Show created/updated info

- [ ] **Review Actions** (if approval workflow)
  - [ ] Approve button
  - [ ] Reject button (with reason)
  - [ ] Request changes (with comments)

- [ ] **Danger Zone**
  - [ ] Delete annotation (with confirmation)

### 📊 Annotation Detail View
- [ ] **Annotation Content**
  - [ ] Full annotation display
  - [ ] Edit button

- [ ] **Metadata**
  - [ ] Expert info
  - [ ] Date, zone, type, tags
  - [ ] Created/updated timestamps

- [ ] **Engagement Metrics**
  - [ ] Total views
  - [ ] Unique viewers
  - [ ] Total likes
  - [ ] Total shares (WhatsApp, Twitter, etc.)
  - [ ] Helpful votes
  - [ ] Comment count

- [ ] **Comments** (if enabled)
  - [ ] List of comments
  - [ ] Moderate comments

- [ ] **Actions**
  - [ ] View on consumer site
  - [ ] Feature annotation
  - [ ] Pin to top
  - [ ] Duplicate annotation

### 📈 Annotation Analytics
- [ ] **Performance Metrics**
  - [ ] Top annotations by views
  - [ ] Top annotations by engagement
  - [ ] Annotations by type (chart)
  - [ ] Annotations over time (chart)

---

## 7️⃣ PREDICTION MANAGEMENT

### 🔮 Prediction List View
- [ ] **Prediction Table**
  - [ ] Columns: Created, Prediction Date, Zone, Expert/AI, Predicted Price, Actual Price, Accuracy, Status, Actions
  - [ ] Sortable by all columns
  - [ ] Filter by:
    - [ ] Prediction date range
    - [ ] Zone
    - [ ] Source (AI/Expert)
    - [ ] Expert (if expert prediction)
    - [ ] Status (pending/confirmed/incorrect)
    - [ ] Accuracy range
  - [ ] Search
  - [ ] Pagination

- [ ] **Bulk Actions**
  - [ ] Bulk confirm predictions
  - [ ] Bulk mark as incorrect
  - [ ] Bulk export

### ➕ Create Expert Prediction
- [ ] **Prediction Form**
  - [ ] Expert selector
  - [ ] Prediction date (future date)
  - [ ] Zone selector (or "all zones")
  - [ ] Predicted price (number)
  - [ ] Confidence level (1-100%)
  - [ ] Reasoning (rich text)
  - [ ] Factors considered (tags)
  - [ ] Status (draft/published)

### ✏️ Edit Prediction
- [ ] **Edit Form**
  - [ ] Same as Create form
  - [ ] Show actual price (if available)
  - [ ] Show accuracy (if calculated)

- [ ] **Validation Actions**
  - [ ] Mark as confirmed (if prediction was correct)
  - [ ] Mark as incorrect
  - [ ] Calculate accuracy score

### 🤖 AI Prediction Settings
- [ ] **AI Configuration**
  - [ ] Enable/disable AI predictions
  - [ ] Select AI model (dropdown)
  - [ ] Set prediction horizon (7d, 30d, 90d)
  - [ ] Set confidence threshold
  - [ ] Enable/disable auto-publish

- [ ] **AI Training**
  - [ ] Trigger model retraining
  - [ ] View training metrics
  - [ ] Upload training data

### 📊 Prediction Analytics
- [ ] **Accuracy Metrics**
  - [ ] Overall accuracy % (AI vs Expert)
  - [ ] Accuracy by expert
  - [ ] Accuracy by zone
  - [ ] Accuracy by prediction horizon
  - [ ] Accuracy trend over time (chart)

- [ ] **Performance Comparison**
  - [ ] AI vs Expert comparison chart
  - [ ] Zone-wise accuracy table
  - [ ] Confidence vs accuracy scatter plot

---

## 8️⃣ BLOG MANAGEMENT

### 📰 Blog Post List View
- [ ] **Post Table**
  - [ ] Columns: Title, Author, Category, Tags, Status, Views, Publish Date, Actions
  - [ ] Sortable by all columns
  - [ ] Filter by:
    - [ ] Status (draft/published/scheduled/archived)
    - [ ] Category
    - [ ] Tags
    - [ ] Author
    - [ ] Date range
  - [ ] Search by title or content
  - [ ] Pagination

- [ ] **Bulk Actions**
  - [ ] Bulk publish
  - [ ] Bulk archive
  - [ ] Bulk delete
  - [ ] Bulk export

### ➕ Create Blog Post
- [ ] **Blog Form**
  - [ ] Title (required)
  - [ ] Slug (auto-generated, editable)
  - [ ] Author selector (expert or admin)
  - [ ] Category (dropdown: Market Analysis, Expert Insights, Industry News, How-to, Case Study)
  - [ ] Tags (chips/multi-select)
  - [ ] Featured image upload
  - [ ] Excerpt (text area)
  - [ ] Content (rich text editor with:)
    - [ ] Headings, bold, italic, lists
    - [ ] Links, images, videos
    - [ ] Code blocks
    - [ ] Quotes
    - [ ] Tables
    - [ ] Embedded charts
  - [ ] SEO Title (text)
  - [ ] SEO Description (text area)
  - [ ] SEO Keywords (chips)
  - [ ] Status (draft/published/scheduled)
  - [ ] Publish date/time (if scheduled)
  - [ ] Featured checkbox
  - [ ] Save draft / Publish buttons

- [ ] **Preview**
  - [ ] Live preview pane
  - [ ] Desktop/mobile preview toggle

### ✏️ Edit Blog Post
- [ ] **Edit Form**
  - [ ] Same as Create form
  - [ ] Show engagement metrics
  - [ ] Show revision history
  - [ ] Restore previous version

- [ ] **Danger Zone**
  - [ ] Archive post
  - [ ] Delete post (with confirmation)

### 📊 Blog Analytics
- [ ] **Performance Metrics**
  - [ ] Top posts by views
  - [ ] Top posts by engagement
  - [ ] Posts by category (chart)
  - [ ] Publishing frequency (chart)

---

## 9️⃣ ANALYTICS DASHBOARD

### 📈 Traffic Analytics
- [ ] **Overview Cards**
  - [ ] Total page views (today/week/month)
  - [ ] Unique visitors
  - [ ] Avg session duration
  - [ ] Bounce rate

- [ ] **Traffic Charts**
  - [ ] Page views over time (line chart)
  - [ ] Top pages table
  - [ ] Traffic sources (pie chart)
  - [ ] Device breakdown (mobile/desktop/tablet)

### 📊 Content Analytics
- [ ] **Content Performance**
  - [ ] Top annotations by views
  - [ ] Top blog posts by views
  - [ ] Top experts by views
  - [ ] Top zones by views

- [ ] **Engagement Metrics**
  - [ ] Total likes, shares, comments
  - [ ] Avg engagement rate
  - [ ] Engagement by content type (chart)

### 🔍 SEO Analytics
- [ ] **SEO Metrics**
  - [ ] Organic traffic
  - [ ] Top keywords
  - [ ] Search rankings
  - [ ] Backlinks count
  - [ ] Domain authority

- [ ] **Search Console Integration**
  - [ ] Impressions, clicks, CTR
  - [ ] Top queries
  - [ ] Top pages

### 👥 User Analytics
- [ ] **User Metrics**
  - [ ] Total registered users
  - [ ] Active users (DAU/WAU/MAU)
  - [ ] New signups
  - [ ] User retention rate
  - [ ] Churn rate

- [ ] **User Behavior**
  - [ ] User journey flows
  - [ ] Feature usage stats
  - [ ] Conversion funnels

### 📊 Export & Reporting
- [ ] **Report Generator**
  - [ ] Select metrics to include
  - [ ] Select date range
  - [ ] Format (PDF/CSV/Excel)
  - [ ] Schedule automated reports (daily/weekly/monthly)
  - [ ] Email reports to recipients

---

## 🔟 SETTINGS & CONFIGURATION

### ⚙️ System Settings
- [ ] **General Settings**
  - [ ] Site name
  - [ ] Site URL
  - [ ] Admin email
  - [ ] Timezone
  - [ ] Date format
  - [ ] Currency symbol

- [ ] **NECC Settings**
  - [ ] NECC official website URL
  - [ ] Data disclaimer text
  - [ ] Default price unit
  - [ ] Price display format

### 🤖 Scraper Settings
- [ ] **Scraper Configuration**
  - [ ] Enable/disable scraper
  - [ ] Cron schedule expression
  - [ ] Scraper timeout (seconds)
  - [ ] Retry attempts
  - [ ] User agent string
  - [ ] Target URL
  - [ ] Selectors (CSS/XPath)

- [ ] **Notification Settings**
  - [ ] Enable email notifications
  - [ ] Email recipients (multiple)
  - [ ] Enable Slack notifications
  - [ ] Slack webhook URL
  - [ ] Alert on failure threshold

### 🔐 Permission Settings
- [ ] **Role Management**
  - [ ] Define roles (admin, moderator, editor, viewer)
  - [ ] Assign permissions per role
  - [ ] User-role assignment

- [ ] **Expert Verification**
  - [ ] Manual verification required
  - [ ] Auto-verify after X annotations
  - [ ] Verification criteria

### 📧 Email Settings
- [ ] **Email Configuration**
  - [ ] SMTP server settings
  - [ ] From email address
  - [ ] From name
  - [ ] Email templates (annotations approved, predictions confirmed, etc.)

### 🎨 Appearance Settings
- [ ] **Branding**
  - [ ] Logo upload
  - [ ] Favicon upload
  - [ ] Primary color
  - [ ] Secondary color
  - [ ] Font selection

### 🔄 Database Maintenance
- [ ] **Maintenance Tools**
  - [ ] Refresh materialized views (monthly averages, YoY)
  - [ ] Rebuild indexes
  - [ ] Vacuum database
  - [ ] Backup database
  - [ ] Restore from backup
  - [ ] View database size & stats

### 📜 Audit Log
- [ ] **Audit Trail**
  - [ ] All admin actions logged
  - [ ] User, action, timestamp, details
  - [ ] Filter by user, action type, date range
  - [ ] Export audit log

---

## 🚀 ADDITIONAL FEATURES

### 🔔 Notification Center
- [ ] **In-App Notifications**
  - [ ] Scraper failure alerts
  - [ ] Pending annotation reviews
  - [ ] System errors
  - [ ] User reports/feedback
  - [ ] Mark as read/unread

### 💬 Support & Feedback
- [ ] **User Feedback Management**
  - [ ] View user-submitted feedback
  - [ ] Categorize feedback (bug/feature/question)
  - [ ] Respond to feedback
  - [ ] Mark as resolved

### 🔍 Search
- [ ] **Global Search**
  - [ ] Search across zones, prices, experts, annotations, predictions, blog posts
  - [ ] Quick results dropdown
  - [ ] Advanced search page

### 📱 Mobile Admin App
- [ ] **Mobile-Responsive Design**
  - [ ] Responsive dashboard
  - [ ] Touch-friendly controls
  - [ ] Mobile-optimized tables

- [ ] **PWA Features**
  - [ ] Install as app
  - [ ] Offline support (read-only)
  - [ ] Push notifications

---

## 🛠️ TECHNICAL IMPLEMENTATION

### Tech Stack
- [ ] **Frontend**
  - [ ] Next.js 15 (App Router)
  - [ ] React 18+
  - [ ] TypeScript
  - [ ] Tailwind CSS
  - [ ] shadcn/ui components
  - [ ] Recharts for analytics

- [ ] **Backend**
  - [ ] Next.js API routes
  - [ ] Supabase (PostgreSQL)
  - [ ] Server Actions
  - [ ] Edge Functions (if needed)

- [ ] **Authentication**
  - [ ] Supabase Auth
  - [ ] Role-based access control (RBAC)
  - [ ] Admin-only routes

### Database Schema
- [ ] **Admin-Specific Tables**
  - [ ] `admin_users` (admin roles, permissions)
  - [ ] `admin_audit_log` (all admin actions)
  - [ ] `system_settings` (key-value config)
  - [ ] `scraper_logs` (scraper execution logs)
  - [ ] `scraper_config` (scraper settings)

- [ ] **Use Existing Tables**
  - [ ] `necc_zones`
  - [ ] `necc_prices`
  - [ ] `necc_annotations`
  - [ ] `necc_experts`
  - [ ] `necc_predictions`

### API Routes
- [ ] **Zone APIs**
  - [ ] `GET /api/admin/necc/zones` - List all zones
  - [ ] `POST /api/admin/necc/zones` - Create zone
  - [ ] `PUT /api/admin/necc/zones/:id` - Update zone
  - [ ] `DELETE /api/admin/necc/zones/:id` - Delete zone

- [ ] **Price APIs**
  - [ ] `GET /api/admin/necc/prices` - List prices (with filters)
  - [ ] `POST /api/admin/necc/prices` - Add manual price
  - [ ] `PUT /api/admin/necc/prices/:id` - Update price
  - [ ] `DELETE /api/admin/necc/prices/:id` - Delete price
  - [ ] `POST /api/admin/necc/prices/import` - Import prices (CSV)
  - [ ] `GET /api/admin/necc/prices/export` - Export prices

- [ ] **Scraper APIs**
  - [ ] `POST /api/admin/necc/scraper/run` - Trigger manual scrape
  - [ ] `POST /api/admin/necc/scraper/stop` - Stop running scrape
  - [ ] `GET /api/admin/necc/scraper/status` - Get scraper status
  - [ ] `GET /api/admin/necc/scraper/logs` - Get scraper logs
  - [ ] `PUT /api/admin/necc/scraper/config` - Update scraper config

- [ ] **Expert APIs**
  - [ ] `GET /api/admin/necc/experts` - List experts
  - [ ] `POST /api/admin/necc/experts` - Create expert
  - [ ] `PUT /api/admin/necc/experts/:id` - Update expert
  - [ ] `DELETE /api/admin/necc/experts/:id` - Delete expert
  - [ ] `PUT /api/admin/necc/experts/:id/reputation` - Update reputation

- [ ] **Annotation APIs**
  - [ ] `GET /api/admin/necc/annotations` - List annotations
  - [ ] `POST /api/admin/necc/annotations` - Create annotation
  - [ ] `PUT /api/admin/necc/annotations/:id` - Update annotation
  - [ ] `DELETE /api/admin/necc/annotations/:id` - Delete annotation
  - [ ] `PUT /api/admin/necc/annotations/:id/approve` - Approve annotation
  - [ ] `PUT /api/admin/necc/annotations/:id/reject` - Reject annotation

- [ ] **Prediction APIs**
  - [ ] `GET /api/admin/necc/predictions` - List predictions
  - [ ] `POST /api/admin/necc/predictions` - Create prediction
  - [ ] `PUT /api/admin/necc/predictions/:id` - Update prediction
  - [ ] `DELETE /api/admin/necc/predictions/:id` - Delete prediction
  - [ ] `PUT /api/admin/necc/predictions/:id/validate` - Validate prediction

- [ ] **Blog APIs**
  - [ ] `GET /api/admin/necc/blog` - List blog posts
  - [ ] `POST /api/admin/necc/blog` - Create blog post
  - [ ] `PUT /api/admin/necc/blog/:id` - Update blog post
  - [ ] `DELETE /api/admin/necc/blog/:id` - Delete blog post

- [ ] **Analytics APIs**
  - [ ] `GET /api/admin/necc/analytics/traffic` - Traffic stats
  - [ ] `GET /api/admin/necc/analytics/content` - Content stats
  - [ ] `GET /api/admin/necc/analytics/engagement` - Engagement stats
  - [ ] `GET /api/admin/necc/analytics/seo` - SEO stats

- [ ] **Settings APIs**
  - [ ] `GET /api/admin/necc/settings` - Get all settings
  - [ ] `PUT /api/admin/necc/settings` - Update settings

### Utilities & Helpers
- [ ] **Form Validation**
  - [ ] Zod schemas for all forms
  - [ ] Client-side & server-side validation

- [ ] **Data Export**
  - [ ] CSV export utility
  - [ ] Excel export utility
  - [ ] PDF generation (for reports)

- [ ] **Image Handling**
  - [ ] Image upload to Supabase Storage
  - [ ] Image optimization
  - [ ] Image cropping/resizing

- [ ] **Rich Text Editor**
  - [ ] Integrate Tiptap or similar
  - [ ] Markdown support
  - [ ] Image upload in editor

### Security
- [ ] **Authentication**
  - [ ] Admin-only middleware
  - [ ] Role-based route protection
  - [ ] Session management

- [ ] **Authorization**
  - [ ] RLS policies for admin tables
  - [ ] Permission checks on all mutations
  - [ ] Audit logging

- [ ] **Input Validation**
  - [ ] Sanitize all inputs
  - [ ] SQL injection prevention
  - [ ] XSS prevention

### Testing
- [ ] **Unit Tests**
  - [ ] API route tests
  - [ ] Utility function tests
  - [ ] Validation schema tests

- [ ] **Integration Tests**
  - [ ] Database operations
  - [ ] Scraper functionality
  - [ ] Email sending

- [ ] **E2E Tests**
  - [ ] Critical user flows (Playwright/Cypress)

---

## 📅 IMPLEMENTATION PHASES

### **Phase 1: Foundation (Week 1-2)**
- [ ] Set up admin app structure
- [ ] Implement authentication & RBAC
- [ ] Create dashboard layout
- [ ] Build basic navigation

### **Phase 2: Core Data Management (Week 3-4)**
- [ ] Zone management (CRUD)
- [ ] Price management (CRUD)
- [ ] Price import/export
- [ ] Daily price view

### **Phase 3: Scraper & Monitoring (Week 5-6)**
- [ ] Scraper dashboard
- [ ] Scraper controls
- [ ] Scraper logs viewer
- [ ] Scraper configuration
- [ ] Alert system

### **Phase 4: Expert & Content (Week 7-8)**
- [ ] Expert management
- [ ] Annotation management
- [ ] Prediction management
- [ ] Blog management

### **Phase 5: Analytics & Reporting (Week 9-10)**
- [ ] Traffic analytics
- [ ] Content analytics
- [ ] SEO analytics
- [ ] Report generator

### **Phase 6: Settings & Polish (Week 11-12)**
- [ ] System settings
- [ ] Appearance customization
- [ ] Database maintenance tools
- [ ] Audit log
- [ ] Final testing & bug fixes

---

## ✅ COMPLETION CHECKLIST

### Before Launch
- [ ] All CRUD operations tested
- [ ] All forms validated (client + server)
- [ ] All API routes protected
- [ ] All database queries optimized
- [ ] All error states handled
- [ ] All loading states implemented
- [ ] All success/error messages displayed
- [ ] Responsive design on all pages
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] SEO meta tags (for admin, if needed)
- [ ] Analytics tracking implemented
- [ ] Audit logging working
- [ ] Email notifications working
- [ ] User documentation created
- [ ] Admin training materials prepared

---

## 📝 NOTES

- **Existing Admin App:** There's already an admin app (`apps/admin`), so we'll extend it with NECC-specific features
- **Shared Components:** Use existing UI components from `apps/admin/src/components/ui`
- **Consistency:** Match the existing admin design patterns
- **Permissions:** Implement granular permissions (some features only for super-admins)
- **Mobile-First:** Design for mobile, enhance for desktop
- **Performance:** Optimize queries, use pagination, lazy load charts
- **User Experience:** Clear CTAs, helpful error messages, confirmation dialogs

---

**Status:** ✅ **Planning Complete - Ready for Implementation**  
**Last Updated:** January 2025  
**Next Step:** Review with team and begin Phase 1 development

