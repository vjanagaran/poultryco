# 🚀 PoultryCo MVP Transaction Features - Implementation Plan

**Date:** October 26, 2025  
**Status:** ✅ APPROVED BY USER  
**Implementation Timeline:** 1-2 weeks

---

## ✅ USER DECISIONS CONFIRMED

### **What to Add (MVP):**
1. ✅ **Product/Service Inquiries** → Start 1-on-1 chat with contact person
2. ✅ **Service Bookings** → Same as inquiries (chat-based)
3. ✅ **Review System** → With fake review prevention
4. ✅ **Enhanced Search** → Products/services in directory

### **What to Defer (Post-MVP):**
1. ❌ **Capacity Management** → Add after 1000+ users
2. ❌ **Transaction Management** → No order/payment system in MVP
3. ❌ **Inventory Tracking** → Not needed yet

### **Primary Channel Strategy:**
- 🎯 **Chat System** as primary communication
- 📧 **Email notifications** as preference
- 💬 **WhatsApp notifications** as preference
- 🔔 **Push notifications** (in-app)

---

## 📋 Implementation Breakdown

### **TASK 1: Inquiry/Booking System (3 days)**

#### **Approach: Chat-Based Communication**

**No separate inquiry table needed!** Instead, use existing messaging system:

#### **1.1 Add "Contact Business" Button**

**On Business Profile Page:**
```tsx
// Business Profile Actions
<div className="actions">
  <button onClick={() => startChatWithBusiness()}>
    💬 Send Inquiry
  </button>
  <button onClick={() => startChatWithBusiness('quote')}>
    📋 Request Quote
  </button>
  <button onClick={() => startChatWithBusiness('book')}>
    📅 Book Service
  </button>
</div>
```

**On Product Card:**
```tsx
// Individual Product
<div className="product-actions">
  <button onClick={() => startChatAboutProduct(productId)}>
    💬 Inquire about this product
  </button>
</div>
```

#### **1.2 Chat Starter with Context**

**New Function:**
```typescript
async function startChatWithBusiness(
  businessId: string,
  contactPersonId: string,
  context?: {
    type: 'inquiry' | 'quote' | 'booking',
    productId?: string,
    productName?: string,
    message?: string
  }
) {
  // Check if conversation already exists
  const existingConv = await findConversation(userId, contactPersonId);
  
  if (existingConv) {
    // Navigate to existing conversation
    router.push(`/messages?conversation=${existingConv.id}`);
  } else {
    // Create new conversation
    const conversation = await createConversation([userId, contactPersonId]);
    
    // Send auto-generated context message
    if (context) {
      let message = '';
      
      if (context.type === 'inquiry' && context.productName) {
        message = `Hi! I'm interested in learning more about ${context.productName}.`;
      } else if (context.type === 'quote') {
        message = `Hi! I'd like to request a quote for your products.`;
      } else if (context.type === 'booking') {
        message = `Hi! I'd like to book a consultation/service.`;
      }
      
      await sendMessage(conversation.id, message);
    }
    
    router.push(`/messages?conversation=${conversation.id}`);
  }
}
```

#### **1.3 Company Notification Preferences**

**New Table:**
```sql
CREATE TABLE business_notification_preferences (
  business_profile_id UUID PRIMARY KEY REFERENCES business_profiles(id),
  
  -- Inquiry Notifications
  notify_new_inquiry BOOLEAN DEFAULT true,
  inquiry_notification_channels TEXT[] DEFAULT ARRAY['in_app', 'email'], -- in_app, email, whatsapp, push
  
  -- Contact Person Routing
  route_inquiries_to TEXT DEFAULT 'all', -- 'all', 'primary', 'sales', 'specific'
  specific_contact_person_id UUID REFERENCES profiles(id),
  
  -- Response Time Settings
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_message TEXT,
  
  -- Office Hours
  office_hours_enabled BOOLEAN DEFAULT false,
  office_hours JSONB, -- {monday: {open: '09:00', close: '18:00'}, ...}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **1.4 Notification Flow**

```typescript
// When new message received in business chat
async function handleBusinessInquiry(messageData: Message) {
  const business = await getBusinessFromConversation(messageData.conversation_id);
  const prefs = await getBusinessNotificationPrefs(business.id);
  
  if (!prefs.notify_new_inquiry) return;
  
  // Get contact persons to notify
  let contactPersons = [];
  
  if (prefs.route_inquiries_to === 'all') {
    contactPersons = await getAllContactPersons(business.id);
  } else if (prefs.route_inquiries_to === 'primary') {
    contactPersons = await getPrimaryContact(business.id);
  } else if (prefs.route_inquiries_to === 'sales') {
    contactPersons = await getContactPersonsByType(business.id, 'sales');
  } else if (prefs.route_inquiries_to === 'specific') {
    contactPersons = [await getContactPerson(prefs.specific_contact_person_id)];
  }
  
  // Send notifications based on preferences
  for (const person of contactPersons) {
    if (prefs.inquiry_notification_channels.includes('in_app')) {
      await createNotification(person.profile_id, 'message_new', messageData);
    }
    
    if (prefs.inquiry_notification_channels.includes('email')) {
      await sendEmail(person.email, {
        subject: `New inquiry about ${business.business_name}`,
        template: 'business_inquiry',
        data: { business, message: messageData }
      });
    }
    
    if (prefs.inquiry_notification_channels.includes('whatsapp')) {
      await sendWhatsAppNotification(person.whatsapp_number, {
        message: `New inquiry: "${messageData.content.substring(0, 100)}..."`,
        link: `poultryco.net/messages?conversation=${messageData.conversation_id}`
      });
    }
  }
}
```

---

### **TASK 2: Review System with Fake Prevention (4 days)**

#### **2.1 Enhanced Review Table**

```sql
CREATE TABLE profile_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic Target
  reviewee_type TEXT NOT NULL CHECK (reviewee_type IN ('personal', 'business')),
  reviewee_id UUID NOT NULL, -- FK to profiles OR business_profiles
  
  -- Reviewer
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Transaction Link (optional but important for verification)
  related_conversation_id UUID REFERENCES conversations(id), -- Link to chat conversation
  related_message_count INTEGER, -- How many messages exchanged
  conversation_duration_days INTEGER, -- How long they chatted
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT CHECK (char_length(review_text) <= 1000),
  review_category TEXT[], -- ['quality', 'service', 'response_time', 'value', 'professionalism']
  
  -- Verification & Trust
  is_verified_interaction BOOLEAN DEFAULT false, -- Based on message history
  interaction_score INTEGER, -- 0-100 based on conversation depth
  reviewer_trust_score INTEGER, -- Reviewer's own trust score
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  is_hidden BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Response
  business_response TEXT,
  business_response_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews (one review per reviewer per reviewee)
  UNIQUE(reviewer_id, reviewee_type, reviewee_id)
);

-- Indexes
CREATE INDEX idx_reviews_reviewee ON profile_reviews(reviewee_type, reviewee_id);
CREATE INDEX idx_reviews_reviewer ON profile_reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON profile_reviews(rating);
CREATE INDEX idx_reviews_status ON profile_reviews(moderation_status);
CREATE INDEX idx_reviews_conversation ON profile_reviews(related_conversation_id);

-- Composite index for verified reviews
CREATE INDEX idx_reviews_verified ON profile_reviews(reviewee_type, reviewee_id, is_verified_interaction, moderation_status);
```

#### **2.2 Fake Review Prevention Logic**

```typescript
interface ReviewValidation {
  canReview: boolean;
  reason?: string;
  interactionScore: number;
  isVerified: boolean;
  requiresModeration: boolean;
}

async function validateReviewEligibility(
  reviewerId: string,
  revieweeId: string,
  revieweeType: 'personal' | 'business'
): Promise<ReviewValidation> {
  
  // 1. Check if already reviewed
  const existingReview = await checkExistingReview(reviewerId, revieweeId, revieweeType);
  if (existingReview) {
    return {
      canReview: false,
      reason: 'You have already reviewed this profile/business',
      interactionScore: 0,
      isVerified: false,
      requiresModeration: false
    };
  }
  
  // 2. Check if they had a conversation
  const conversation = await findConversationBetween(reviewerId, revieweeId);
  
  if (!conversation) {
    return {
      canReview: true,
      reason: 'No conversation history - review will require manual moderation',
      interactionScore: 0,
      isVerified: false,
      requiresModeration: true // Manual approval needed
    };
  }
  
  // 3. Calculate interaction score
  const messageCount = await getMessageCount(conversation.id);
  const conversationAge = await getConversationAge(conversation.id);
  const conversationDurationDays = Math.floor(conversationAge / (1000 * 60 * 60 * 24));
  
  let interactionScore = 0;
  
  // Message count score (0-40 points)
  if (messageCount >= 20) interactionScore += 40;
  else if (messageCount >= 10) interactionScore += 30;
  else if (messageCount >= 5) interactionScore += 20;
  else if (messageCount >= 2) interactionScore += 10;
  
  // Conversation duration score (0-30 points)
  if (conversationDurationDays >= 7) interactionScore += 30;
  else if (conversationDurationDays >= 3) interactionScore += 20;
  else if (conversationDurationDays >= 1) interactionScore += 10;
  
  // Message variety score (0-30 points)
  const hasImages = await conversationHasMedia(conversation.id, 'image');
  const hasDocuments = await conversationHasMedia(conversation.id, 'document');
  const hasMultipleDays = conversationDurationDays > 0;
  
  if (hasImages) interactionScore += 10;
  if (hasDocuments) interactionScore += 10;
  if (hasMultipleDays) interactionScore += 10;
  
  // 4. Get reviewer's trust score
  const reviewerProfile = await getProfile(reviewerId);
  const reviewerTrustScore = reviewerProfile.trust_score || 50;
  
  // 5. Determine verification status
  const isVerified = interactionScore >= 50 && reviewerTrustScore >= 60;
  
  // 6. Determine if moderation needed
  const requiresModeration = 
    interactionScore < 30 || 
    reviewerTrustScore < 50 || 
    (reviewerProfile.reviews_given_count || 0) === 0; // First review
  
  return {
    canReview: true,
    interactionScore,
    isVerified,
    requiresModeration
  };
}
```

#### **2.3 Review Submission Flow**

```typescript
async function submitReview(data: {
  revieweeType: 'personal' | 'business',
  revieweeId: string,
  rating: number,
  reviewText: string,
  categories: string[]
}) {
  const userId = getCurrentUserId();
  
  // Validate eligibility
  const validation = await validateReviewEligibility(
    userId,
    data.revieweeId,
    data.revieweeType
  );
  
  if (!validation.canReview) {
    throw new Error(validation.reason);
  }
  
  // Find related conversation
  const conversation = await findConversationBetween(userId, data.revieweeId);
  
  const reviewData = {
    reviewee_type: data.revieweeType,
    reviewee_id: data.revieweeId,
    reviewer_id: userId,
    rating: data.rating,
    review_text: data.reviewText,
    review_category: data.categories,
    is_verified_interaction: validation.isVerified,
    interaction_score: validation.interactionScore,
    reviewer_trust_score: await getTrustScore(userId),
    moderation_status: validation.requiresModeration ? 'pending' : 'approved',
    related_conversation_id: conversation?.id,
    related_message_count: conversation ? await getMessageCount(conversation.id) : 0,
    conversation_duration_days: conversation ? await getConversationDurationDays(conversation.id) : 0
  };
  
  // Insert review
  const review = await insertReview(reviewData);
  
  // Update reviewee's average rating
  await updateAverageRating(data.revieweeType, data.revieweeId);
  
  // Notify reviewee
  await createNotification(
    data.revieweeId,
    'review_received',
    {
      review_id: review.id,
      rating: data.rating,
      reviewer_name: await getProfileName(userId)
    }
  );
  
  // If requires moderation, notify admins
  if (validation.requiresModeration) {
    await notifyModerators('new_review_pending', review.id);
  }
  
  return review;
}
```

#### **2.4 Review Display with Trust Indicators**

```tsx
// Review Card Component
function ReviewCard({ review }) {
  return (
    <div className={`review-card ${review.is_verified_interaction ? 'verified' : ''}`}>
      <div className="review-header">
        <div className="reviewer-info">
          <Avatar src={review.reviewer.profile_photo_url} />
          <div>
            <h4>{review.reviewer.full_name}</h4>
            <p>{review.reviewer.headline}</p>
          </div>
        </div>
        
        <div className="review-meta">
          <StarRating value={review.rating} />
          {review.is_verified_interaction && (
            <Badge variant="success">
              ✓ Verified Interaction
            </Badge>
          )}
          <span className="review-date">
            {formatDate(review.created_at)}
          </span>
        </div>
      </div>
      
      <div className="review-content">
        <p>{review.review_text}</p>
        
        {review.review_category?.length > 0 && (
          <div className="review-categories">
            {review.review_category.map(cat => (
              <Chip key={cat}>{cat}</Chip>
            ))}
          </div>
        )}
      </div>
      
      {/* Trust Indicator */}
      {review.interaction_score > 0 && (
        <div className="trust-indicator">
          <InfoIcon />
          <span>
            Based on {review.related_message_count} messages over {review.conversation_duration_days} days
          </span>
        </div>
      )}
      
      {/* Business Response */}
      {review.business_response && (
        <div className="business-response">
          <h5>Response from {businessName}</h5>
          <p>{review.business_response}</p>
          <span>{formatDate(review.business_response_at)}</span>
        </div>
      )}
      
      {/* Helpful buttons */}
      <div className="review-actions">
        <button onClick={() => markHelpful(review.id)}>
          👍 Helpful ({review.helpful_count})
        </button>
        <button onClick={() => reportReview(review.id)}>
          🚩 Report
        </button>
      </div>
    </div>
  );
}
```

---

### **TASK 3: Enhanced Search with Products/Services (3 days)**

#### **3.1 Unified Search Index**

```sql
-- Create materialized view for unified search
CREATE MATERIALIZED VIEW search_index AS
SELECT 
  'profile' AS result_type,
  p.id,
  p.profile_slug AS slug,
  p.full_name AS name,
  p.headline AS description,
  p.location_state || ', ' || COALESCE(p.location_district, '') AS location,
  NULL AS business_type,
  NULL AS product_category,
  to_tsvector('english', 
    p.full_name || ' ' || 
    COALESCE(p.headline, '') || ' ' || 
    COALESCE(p.bio, '')
  ) AS search_vector,
  p.profile_photo_url AS image_url,
  (SELECT AVG(rating) FROM profile_reviews WHERE reviewee_id = p.id AND reviewee_type = 'personal') AS avg_rating,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.is_public = true

UNION ALL

SELECT 
  'business' AS result_type,
  bp.id,
  bp.business_slug AS slug,
  bp.business_name AS name,
  bp.tagline AS description,
  bp.headquarters_state || ', ' || COALESCE(bp.headquarters_city, '') AS location,
  bp.business_type,
  NULL AS product_category,
  to_tsvector('english', 
    bp.business_name || ' ' || 
    COALESCE(bp.display_name, '') || ' ' || 
    COALESCE(bp.about, '') || ' ' ||
    bp.business_type
  ) AS search_vector,
  bp.logo_url AS image_url,
  (SELECT AVG(rating) FROM profile_reviews WHERE reviewee_id = bp.id AND reviewee_type = 'business') AS avg_rating,
  bp.created_at,
  bp.updated_at
FROM business_profiles bp
WHERE bp.is_verified = true OR bp.owner_id IS NOT NULL

UNION ALL

SELECT 
  'product' AS result_type,
  prod.id,
  NULL AS slug,
  prod.product_name AS name,
  prod.description,
  bp.headquarters_state || ', ' || COALESCE(bp.headquarters_city, '') AS location,
  bp.business_type,
  prod.category AS product_category,
  to_tsvector('english', 
    prod.product_name || ' ' || 
    COALESCE(prod.description, '') || ' ' || 
    COALESCE(prod.category, '') || ' ' ||
    COALESCE(prod.sub_category, '')
  ) AS search_vector,
  (SELECT image_url FROM product_images WHERE product_id = prod.id AND is_primary = true LIMIT 1) AS image_url,
  NULL AS avg_rating,
  prod.created_at,
  prod.updated_at
FROM business_products prod
JOIN business_profiles bp ON prod.business_profile_id = bp.id
WHERE prod.is_featured = true OR prod.availability_status != 'discontinued';

-- Create GIN index for full-text search
CREATE INDEX idx_search_index_vector ON search_index USING gin(search_vector);
CREATE INDEX idx_search_index_type ON search_index(result_type);
CREATE INDEX idx_search_index_location ON search_index(location);
CREATE INDEX idx_search_index_business_type ON search_index(business_type);
CREATE INDEX idx_search_index_category ON search_index(product_category);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_search_index()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;
END;
$$ LANGUAGE plpgsql;

-- Auto-refresh trigger (run every hour via pg_cron or cron job)
```

#### **3.2 Advanced Search Function**

```typescript
interface SearchParams {
  query: string;
  resultTypes?: ('profile' | 'business' | 'product')[];
  location?: string;
  businessType?: string;
  productCategory?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
}

async function unifiedSearch(params: SearchParams) {
  const {
    query,
    resultTypes = ['profile', 'business', 'product'],
    location,
    businessType,
    productCategory,
    minRating,
    limit = 20,
    offset = 0
  } = params;
  
  let sql = `
    SELECT *
    FROM search_index
    WHERE 1=1
  `;
  
  const sqlParams: any[] = [];
  let paramIndex = 1;
  
  // Full-text search
  if (query) {
    sql += ` AND search_vector @@ plainto_tsquery('english', $${paramIndex})`;
    sqlParams.push(query);
    paramIndex++;
  }
  
  // Filter by result types
  if (resultTypes.length < 3) {
    sql += ` AND result_type = ANY($${paramIndex})`;
    sqlParams.push(resultTypes);
    paramIndex++;
  }
  
  // Filter by location
  if (location) {
    sql += ` AND location ILIKE $${paramIndex}`;
    sqlParams.push(`%${location}%`);
    paramIndex++;
  }
  
  // Filter by business type
  if (businessType) {
    sql += ` AND business_type = $${paramIndex}`;
    sqlParams.push(businessType);
    paramIndex++;
  }
  
  // Filter by product category
  if (productCategory) {
    sql += ` AND product_category = $${paramIndex}`;
    sqlParams.push(productCategory);
    paramIndex++;
  }
  
  // Filter by rating
  if (minRating) {
    sql += ` AND avg_rating >= $${paramIndex}`;
    sqlParams.push(minRating);
    paramIndex++;
  }
  
  // Ranking
  sql += `
    ORDER BY 
      CASE 
        WHEN result_type = 'business' THEN 1
        WHEN result_type = 'product' THEN 2
        WHEN result_type = 'profile' THEN 3
      END,
      ts_rank(search_vector, plainto_tsquery('english', $1)) DESC,
      avg_rating DESC NULLS LAST,
      updated_at DESC
  `;
  
  // Pagination
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  sqlParams.push(limit, offset);
  
  const results = await db.query(sql, sqlParams);
  
  return {
    results: results.rows,
    hasMore: results.rows.length === limit
  };
}
```

#### **3.3 Search UI with Filters**

```tsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    resultTypes: ['profile', 'business', 'product'],
    location: '',
    businessType: '',
    productCategory: '',
    minRating: 0
  });
  const [results, setResults] = useState([]);
  
  return (
    <Container>
      {/* Search Bar */}
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search professionals, businesses, products..."
      />
      
      {/* Filters */}
      <FilterPanel>
        <Select
          label="Type"
          multiple
          value={filters.resultTypes}
          onChange={(v) => setFilters({...filters, resultTypes: v})}
        >
          <option value="profile">Professionals</option>
          <option value="business">Businesses</option>
          <option value="product">Products/Services</option>
        </Select>
        
        <Input
          label="Location"
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
          placeholder="City, District, State"
        />
        
        <Select
          label="Business Type"
          value={filters.businessType}
          onChange={(e) => setFilters({...filters, businessType: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="feed_mill">Feed Mills</option>
          <option value="hatchery">Hatcheries</option>
          <option value="farm">Farms</option>
          {/* ... more options */}
        </Select>
        
        <Select
          label="Min Rating"
          value={filters.minRating}
          onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
        >
          <option value="0">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </Select>
      </FilterPanel>
      
      {/* Results */}
      <ResultsGrid>
        {results.map(result => (
          <ResultCard key={result.id} result={result} />
        ))}
      </ResultsGrid>
    </Container>
  );
}
```

---

## 📊 Summary: MVP Transaction Features

### **✅ INCLUDED (MVP):**

| Feature | Implementation | Timeline |
|---------|---------------|----------|
| **Product/Service Inquiry** | Chat-based with auto-context message | 2 days |
| **Notification Preferences** | Business settings for email/WhatsApp/push | 1 day |
| **Review System** | With interaction-based verification | 3 days |
| **Fake Review Prevention** | Conversation history scoring | 1 day |
| **Enhanced Search** | Unified search (profiles + businesses + products) | 2 days |
| **Search Filters** | Location, type, category, rating | 1 day |

**Total:** ~10 days

### **❌ DEFERRED (Post-MVP):**
- Capacity management (wait for 1000+ users)
- Transaction/order management
- Payment processing
- Inventory sync
- Advanced analytics

---

## 🎯 Next Steps

1. **Week 1 (Days 1-3):** Inquiry system + notifications
2. **Week 1 (Days 4-5):** Review system
3. **Week 2 (Days 1-3):** Fake review prevention
4. **Week 2 (Days 4-5):** Enhanced search + filters

**Ready to start implementation?** 🚀


