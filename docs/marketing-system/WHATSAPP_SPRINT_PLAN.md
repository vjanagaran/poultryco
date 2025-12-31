# WhatsApp Integration Sprint Plan
## Week Focus: Core WhatsApp Integration with Safety Controls

## Sprint Goals
1. ✅ Complete WebSocket real-time updates (Backend done, Frontend pending)
2. 🔥 **HIGH PRIORITY**: Rate limits & safety controls
3. Group management (discover, scrape, auto-post)
4. Media handling for broadcasts
5. Basic analytics dashboard

---

## 1. Rate Limits & Safety Controls (HIGH PRIORITY)

### Database Schema
```sql
-- Rate limit tracking per account
ALTER TABLE mkt_wap_accounts ADD COLUMN IF NOT EXISTS rate_limit_config JSONB DEFAULT '{
  "messages_per_minute": 20,
  "messages_per_hour": 200,
  "messages_per_day": 1000,
  "groups_per_day": 50,
  "contacts_per_day": 100,
  "cooldown_after_error": 300
}'::jsonb;

-- Rate limit tracking table
CREATE TABLE IF NOT EXISTS mkt_wap_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  window_type TEXT NOT NULL, -- 'minute', 'hour', 'day'
  window_start TIMESTAMPTZ NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  group_count INTEGER NOT NULL DEFAULT 0,
  contact_count INTEGER NOT NULL DEFAULT 0,
  last_error_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, window_type, window_start)
);

-- Safety controls per account
CREATE TABLE IF NOT EXISTS mkt_wap_safety_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  max_message_length INTEGER NOT NULL DEFAULT 4096,
  allowed_media_types TEXT[] DEFAULT ARRAY['image', 'video', 'document', 'audio'],
  block_unknown_numbers BOOLEAN NOT NULL DEFAULT false,
  require_opt_in BOOLEAN NOT NULL DEFAULT false,
  spam_detection_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_pause_on_error BOOLEAN NOT NULL DEFAULT true,
  error_threshold INTEGER NOT NULL DEFAULT 5, -- Pause after N errors
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id)
);
```

### Implementation Features

#### Rate Limiting Service
- **Per-minute limits**: Track messages sent in 1-minute windows
- **Per-hour limits**: Track messages sent in 1-hour windows
- **Per-day limits**: Track messages sent in 24-hour windows
- **Group limits**: Separate limits for group operations
- **Contact limits**: Limits for contact scraping/adding
- **Cooldown periods**: Automatic cooldown after errors

#### Safety Controls
- **Message length validation**: Max 4096 characters
- **Media type filtering**: Only allow configured media types
- **Unknown number blocking**: Block messages to unverified numbers
- **Opt-in requirement**: Require explicit opt-in for marketing messages
- **Spam detection**: Basic spam pattern detection
- **Auto-pause on errors**: Automatically pause account after error threshold
- **Error tracking**: Track and log all errors per account

#### Rate Limit Enforcement
```typescript
class RateLimitService {
  async checkRateLimit(accountId: string, action: 'message' | 'group' | 'contact'): Promise<boolean>
  async incrementUsage(accountId: string, action: 'message' | 'group' | 'contact'): Promise<void>
  async isInCooldown(accountId: string): Promise<boolean>
  async getRemainingQuota(accountId: string, window: 'minute' | 'hour' | 'day'): Promise<number>
}
```

---

## 2. Group Management Features

### Auto-Joining Groups
- Discover public groups (if possible)
- Join groups via invite links
- Track group membership per account

### Auto-Scraping Contacts from Groups
- Extract all contacts from a group
- Map contacts to persona system
- Store in `mkt_wap_contacts` table
- Link to `mkt_persona_contacts` for persona mapping

### Auto-Posting to Groups
- Schedule posts to multiple groups
- Campaign-based group posting
- Respect group rules and rate limits
- Track engagement per group

### Database Schema (Already exists, verify)
- ✅ `mkt_wap_groups` - Group storage
- ✅ `mkt_wap_contacts` - Contact storage
- ✅ `mkt_persona_group_memberships` - Persona mapping

---

## 3. Media Handling

### Media Storage for Scheduled/Sent Posts
- Store media in S3 when scheduling posts
- Link media to content pieces (`mkt_con_content`)
- Reuse media across multiple broadcasts
- Support: Images, Videos, Documents, Audio

### Media in Broadcasts
- Attach media to broadcast messages
- Support captions with media
- Media preview in admin UI
- Media analytics (views, clicks)

### Implementation
```typescript
// When scheduling a WhatsApp message with media
1. Upload media to S3 (if not already stored)
2. Store S3 URL in message record
3. When sending, download from S3 and attach to WhatsApp message
4. Track media usage in analytics
```

---

## 4. Integration Priorities

### A. Content Calendar → WhatsApp Posting
- Link content pieces to WhatsApp broadcasts
- Schedule WhatsApp posts from content calendar
- Multi-channel distribution (WhatsApp + Social + Email)

### B. Persona Mapping → Targeted Broadcasts
- Filter contacts by persona
- Send targeted messages based on persona attributes
- Track engagement by persona segment

### C. Campaign Management → Multi-Channel Distribution
- Create campaigns with WhatsApp as a channel
- Distribute content across WhatsApp groups/contacts
- Unified campaign analytics

---

## 5. Analytics & Metrics

### Message Metrics
- **Delivery Rate**: Sent vs Delivered
- **Read Rate**: Delivered vs Read
- **Response Rate**: Messages with replies
- **Error Rate**: Failed messages

### Group Metrics
- **Group Count**: Total groups per account
- **Member Count**: Total members across groups
- **Engagement Rate**: Messages sent vs responses
- **Active Groups**: Groups with recent activity

### Campaign Metrics
- **Campaign Reach**: Total recipients
- **Campaign Engagement**: Clicks, replies, forwards
- **Campaign Performance**: By persona, by group, by content type

### Account Health Metrics
- **Connection Uptime**: % time connected
- **Daily Usage**: Messages sent per day
- **Error Frequency**: Errors per day
- **Rate Limit Status**: Current quota usage

### Database Schema
```sql
-- Message analytics
CREATE TABLE IF NOT EXISTS mkt_wap_message_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES mkt_wap_messages(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES mkt_campaigns(id),
  sent_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  forwarded_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Group analytics
CREATE TABLE IF NOT EXISTS mkt_wap_group_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_received INTEGER NOT NULL DEFAULT 0,
  members_added INTEGER NOT NULL DEFAULT 0,
  members_removed INTEGER NOT NULL DEFAULT 0,
  engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, date)
);

-- Account health tracking
CREATE TABLE IF NOT EXISTS mkt_wap_account_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  uptime_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_delivered INTEGER NOT NULL DEFAULT 0,
  messages_read INTEGER NOT NULL DEFAULT 0,
  errors_count INTEGER NOT NULL DEFAULT 0,
  rate_limit_hits INTEGER NOT NULL DEFAULT 0,
  health_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, date)
);
```

---

## Implementation Order (This Week)

### Day 1-2: Rate Limits & Safety Controls
1. ✅ Create database schema for rate limits
2. ✅ Create database schema for safety controls
3. ✅ Implement RateLimitService
4. ✅ Integrate rate limits into message sending
5. ✅ Add safety controls validation
6. ✅ Create admin UI for rate limit configuration

### Day 3: Group Management
1. ✅ Enhance group discovery
2. ✅ Implement contact scraping from groups
3. ✅ Add auto-posting to groups
4. ✅ Link groups to campaigns

### Day 4: Media Handling
1. ✅ S3 integration for media storage
2. ✅ Media upload for scheduled posts
3. ✅ Media attachment in broadcasts
4. ✅ Media preview in admin UI

### Day 5: Analytics Dashboard
1. ✅ Create analytics service
2. ✅ Implement metrics collection
3. ✅ Build analytics dashboard UI
4. ✅ Add real-time metrics updates

---

## Next Steps

1. **Start with Rate Limits** (Highest Priority)
2. **Complete Frontend WebSocket Integration** (In Progress)
3. **Build Safety Controls UI**
4. **Implement Group Management Features**
5. **Add Media Handling**
6. **Create Analytics Dashboard**

---

## Success Criteria

- ✅ Rate limits enforced on all message operations
- ✅ Safety controls prevent spam and errors
- ✅ Groups can be discovered, scraped, and posted to
- ✅ Media can be stored and reused in broadcasts
- ✅ Analytics dashboard shows all key metrics
- ✅ Real-time updates via WebSocket
- ✅ Integration with content calendar and campaigns

