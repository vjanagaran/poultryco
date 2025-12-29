# Comprehensive Test Plan - Web & Admin Apps

**Date:** January 2025  
**Status:** In Progress

## Test Environment Setup

### Prerequisites
- ✅ API server running on `http://localhost:3002`
- ✅ Web app running on `http://localhost:3000`
- ✅ Admin app running on `http://localhost:3001`
- ✅ Database connected and migrated
- ✅ Environment variables configured

---

## 🧪 WEB APP TESTING

### 1. Authentication & User Management

#### 1.1 Sign Up / Registration
- [ ] Email sign up with OTP
- [ ] Google OAuth sign up
- [ ] LinkedIn OAuth sign up
- [ ] Phone number sign up (SMS OTP)
- [ ] WhatsApp OTP sign up
- [ ] Form validation (email format, password strength)
- [ ] Error handling for duplicate emails
- [ ] Success redirect after sign up

#### 1.2 Sign In / Login
- [ ] Email/Password login
- [ ] OTP-based login
- [ ] Google OAuth login
- [ ] LinkedIn OAuth login
- [ ] Remember me functionality
- [ ] Forgot password flow
- [ ] Error handling for invalid credentials
- [ ] Session persistence

#### 1.3 Profile Management
- [ ] View own profile (`/me/[slug]`)
- [ ] Edit profile information
- [ ] Upload profile photo
- [ ] Upload cover photo
- [ ] Add/Edit experiences
- [ ] Add/Edit education
- [ ] Add/Remove skills
- [ ] Update email preferences
- [ ] Profile strength calculation
- [ ] Profile slug generation

### 2. Discovery & Search

#### 2.1 Member Directory
- [ ] Search members by name
- [ ] Filter by role
- [ ] Filter by location (state, city)
- [ ] Pagination
- [ ] View member profile
- [ ] Connection request from search

#### 2.2 Business Directory
- [ ] Search businesses
- [ ] Filter by business type
- [ ] Filter by location
- [ ] View business profile (`/com/[slug]`)
- [ ] Edit business profile (if owner/admin)
- [ ] Create new business
- [ ] Add team members
- [ ] Add products
- [ ] Add locations
- [ ] Add certifications

#### 2.3 Organization Directory
- [ ] Search organizations
- [ ] View organization profile
- [ ] Create organization
- [ ] Edit organization (if admin)
- [ ] Add members
- [ ] Add announcements

### 3. Messaging

#### 3.1 Conversations
- [ ] View conversation list
- [ ] Create new conversation
- [ ] Send text message
- [ ] Send image/file
- [ ] Mark messages as read
- [ ] Search messages
- [ ] Group conversation creation
- [ ] Add participants to group
- [ ] Remove participants
- [ ] View contact info

#### 3.2 Real-time Features
- [ ] Real-time message delivery
- [ ] Online/offline status
- [ ] Typing indicators
- [ ] Message read receipts

### 4. Social Features

#### 4.1 Connections
- [ ] Send connection request
- [ ] Accept connection request
- [ ] Reject connection request
- [ ] Withdraw connection request
- [ ] View pending requests
- [ ] View connections list
- [ ] Remove connection
- [ ] View mutual connections

#### 4.2 Posts & Feed
- [ ] Create text post
- [ ] Create image post
- [ ] Create video post
- [ ] Edit post
- [ ] Delete post
- [ ] Like/Unlike post
- [ ] Comment on post
- [ ] Share post
- [ ] Bookmark post
- [ ] View feed
- [ ] Filter feed by connections
- [ ] Hashtag support

#### 4.3 Follow/Unfollow
- [ ] Follow profile
- [ ] Unfollow profile
- [ ] View followers list
- [ ] View following list

### 5. Events

#### 5.1 Event Discovery
- [ ] Search events
- [ ] Filter by event type
- [ ] Filter by format (online/offline)
- [ ] View event details
- [ ] Register for event
- [ ] Cancel registration
- [ ] View registered events

### 6. Jobs

#### 6.1 Job Discovery
- [ ] Search job postings
- [ ] Filter by job type
- [ ] Filter by location
- [ ] View job details
- [ ] Apply for job
- [ ] View applications
- [ ] Withdraw application

### 7. Marketplace

#### 7.1 Product Discovery
- [ ] Search products
- [ ] Filter by category
- [ ] Filter by price range
- [ ] View product details
- [ ] Contact seller

### 8. Blog

#### 8.1 Blog Pages
- [ ] View blog listing (`/blog`)
- [ ] Pagination
- [ ] View featured post
- [ ] View blog categories
- [ ] View blog post detail (`/blog/[slug]`)
- [ ] View category page (`/blog/category/[slug]`)
- [ ] View tag page (`/blog/tag/[slug]`)
- [ ] Related posts
- [ ] Next/Previous navigation
- [ ] View count increment
- [ ] Share post

### 9. NECC Module

#### 9.1 NECC Pages
- [ ] View NECC dashboard
- [ ] View today's prices
- [ ] View zone prices
- [ ] View historical data
- [ ] View year-over-year comparison
- [ ] View all-time trends
- [ ] Filter by zone
- [ ] Filter by date range

### 10. Forms & Submissions

#### 10.1 Contact Forms
- [ ] Early access form submission
- [ ] Contact form submission
- [ ] Newsletter subscription
- [ ] Form validation
- [ ] Success/Error messages

### 11. Settings

#### 11.1 User Settings
- [ ] Email preferences
- [ ] Notification preferences
- [ ] Privacy settings
- [ ] Account deletion

---

## 🛠️ ADMIN APP TESTING

### 1. Authentication

#### 1.1 Admin Login
- [ ] Login with admin credentials
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Protected routes redirect

### 2. Dashboard

#### 2.1 Main Dashboard
- [ ] View dashboard statistics
- [ ] Quick actions
- [ ] Recent activity
- [ ] Navigation sidebar

### 3. Blog Management

#### 3.1 Blog Posts
- [ ] Create new blog post
- [ ] Edit existing post
- [ ] Delete post
- [ ] Upload featured image
- [ ] Add tags
- [ ] Assign category
- [ ] Publish/Draft/Archive
- [ ] Schedule post
- [ ] View post list
- [ ] Search posts
- [ ] Filter by status
- [ ] Filter by category

#### 3.2 Blog Categories
- [ ] Create category
- [ ] Edit category
- [ ] Delete category
- [ ] View category list
- [ ] Set category color/icon

#### 3.3 Blog Tags
- [ ] Create tag
- [ ] Edit tag
- [ ] Delete tag
- [ ] View tag list
- [ ] Auto-create tags from posts

### 4. Marketing Content Management

#### 4.1 Content Ideas
- [ ] Create content idea
- [ ] Edit idea
- [ ] Delete idea
- [ ] Assign to pillar
- [ ] Set priority
- [ ] View idea list
- [ ] Filter by status

#### 4.2 Content Pillars
- [ ] Create pillar
- [ ] Edit pillar
- [ ] Delete pillar
- [ ] Assign tags
- [ ] Assign campaigns
- [ ] View pillar list
- [ ] View pillar details

#### 4.3 Content
- [ ] Create content
- [ ] Edit content
- [ ] Delete content
- [ ] Assign tags
- [ ] Assign campaigns
- [ ] Create repurposed content
- [ ] View content list
- [ ] Filter by mode (master/repurposed)

#### 4.4 Content Calendar
- [ ] Create schedule
- [ ] Edit schedule
- [ ] Delete schedule
- [ ] Assign channel
- [ ] Set scheduled date/time
- [ ] Mark as published
- [ ] View calendar view
- [ ] View list view

### 5. Email Campaigns

#### 5.1 Email Templates
- [ ] Create template
- [ ] Edit template
- [ ] Delete template
- [ ] Preview template
- [ ] View template list

#### 5.2 Email Campaigns
- [ ] Create campaign
- [ ] Edit campaign
- [ ] Delete campaign
- [ ] Add campaign steps
- [ ] Schedule campaign
- [ ] View campaign list
- [ ] View campaign analytics

### 6. NECC Management

#### 6.1 Zones
- [ ] View zone list
- [ ] Create new zone
- [ ] Edit zone
- [ ] Delete zone
- [ ] Activate/Deactivate zone
- [ ] Search zones
- [ ] Filter zones

#### 6.2 Prices
- [ ] View price list
- [ ] View daily price grid
- [ ] Add manual price
- [ ] Edit price
- [ ] Delete price
- [ ] Bulk import prices
- [ ] Filter by zone
- [ ] Filter by date range

#### 6.3 Scraper
- [ ] View scraper dashboard
- [ ] Scrape single month
- [ ] Scrape entire year
- [ ] View scraper logs
- [ ] View scraper status
- [ ] Manual trigger
- [ ] Error handling

#### 6.4 Annotations
- [ ] Create annotation
- [ ] Edit annotation
- [ ] Delete annotation
- [ ] View annotations list
- [ ] Filter by expert
- [ ] Filter by date

### 7. Content Campaigns

#### 7.1 Campaign Management
- [ ] Create campaign
- [ ] Edit campaign
- [ ] Delete campaign
- [ ] Assign content
- [ ] Assign pillars
- [ ] View campaign list
- [ ] View campaign details

---

## 🔍 API ENDPOINT TESTING

### Test All Migrated Endpoints

#### Users API
- [ ] GET `/users/search` - Search profiles
- [ ] GET `/users/:slug` - Get profile by slug
- [ ] PUT `/users/:id` - Update profile
- [ ] GET `/users/:id/stats` - Get profile stats
- [ ] POST `/users/:id/experiences` - Add experience
- [ ] PUT `/users/:id/experiences/:expId` - Update experience
- [ ] DELETE `/users/:id/experiences/:expId` - Delete experience
- [ ] POST `/users/:id/education` - Add education
- [ ] PUT `/users/:id/education/:eduId` - Update education
- [ ] DELETE `/users/:id/education/:eduId` - Delete education
- [ ] POST `/users/:id/skills` - Add skill
- [ ] DELETE `/users/:id/skills/:skillId` - Remove skill
- [ ] GET `/users/:id/email-preferences` - Get email preferences
- [ ] PUT `/users/:id/email-preferences` - Update email preferences

#### Businesses API
- [ ] GET `/businesses/search` - Search businesses
- [ ] GET `/businesses/slug/:slug` - Get business by slug
- [ ] POST `/businesses` - Create business
- [ ] PUT `/businesses/:id` - Update business
- [ ] DELETE `/businesses/:id` - Delete business
- [ ] POST `/businesses/:id/team-members` - Add team member
- [ ] PUT `/businesses/:id/team-members/:memberId` - Update team member
- [ ] DELETE `/businesses/:id/team-members/:memberId` - Remove team member
- [ ] POST `/businesses/:id/certifications` - Add certification
- [ ] PUT `/businesses/:id/certifications/:certId` - Update certification
- [ ] DELETE `/businesses/:id/certifications/:certId` - Remove certification

#### Organizations API
- [ ] GET `/organizations/search` - Search organizations
- [ ] GET `/organizations/slug/:slug` - Get organization by slug
- [ ] POST `/organizations` - Create organization
- [ ] PUT `/organizations/:id` - Update organization
- [ ] DELETE `/organizations/:id` - Delete organization
- [ ] POST `/organizations/:id/members` - Add member
- [ ] PUT `/organizations/:id/members/:memberId` - Update member
- [ ] DELETE `/organizations/:id/members/:memberId` - Remove member
- [ ] POST `/organizations/:id/announcements` - Add announcement
- [ ] PUT `/organizations/:id/announcements/:announcementId` - Update announcement
- [ ] DELETE `/organizations/:id/announcements/:announcementId` - Delete announcement

#### Events API
- [ ] GET `/events/search` - Search events
- [ ] GET `/events/slug/:slug` - Get event by slug
- [ ] POST `/events` - Create event
- [ ] PUT `/events/:id` - Update event
- [ ] DELETE `/events/:id` - Delete event
- [ ] POST `/events/:id/register` - Register for event
- [ ] PUT `/events/:id/registrations/:registrationId` - Update registration
- [ ] DELETE `/events/:id/registrations/:registrationId` - Cancel registration
- [ ] GET `/events/:id/attendees` - Get attendees

#### Jobs API
- [ ] GET `/jobs/search` - Search jobs
- [ ] GET `/jobs/slug/:slug` - Get job by slug
- [ ] POST `/jobs` - Create job posting
- [ ] PUT `/jobs/:id` - Update job posting
- [ ] DELETE `/jobs/:id` - Delete job posting
- [ ] POST `/jobs/:id/apply` - Apply for job
- [ ] PUT `/jobs/:id/applications/:applicationId` - Update application
- [ ] DELETE `/jobs/:id/applications/:applicationId` - Withdraw application
- [ ] GET `/jobs/:id/applications` - Get applications

#### Marketplace API
- [ ] GET `/marketplace/products/search` - Search products
- [ ] GET `/marketplace/products/slug/:slug` - Get product by slug
- [ ] POST `/marketplace/products` - Create product
- [ ] PUT `/marketplace/products/:id` - Update product
- [ ] DELETE `/marketplace/products/:id` - Delete product
- [ ] GET `/marketplace/categories` - Get categories
- [ ] GET `/marketplace/categories/slug/:slug` - Get category by slug
- [ ] POST `/marketplace/categories` - Create category
- [ ] PUT `/marketplace/categories/:id` - Update category
- [ ] DELETE `/marketplace/categories/:id` - Delete category

#### Messages API
- [ ] GET `/messages/conversations` - Get conversations
- [ ] GET `/messages/conversations/:id` - Get conversation
- [ ] POST `/messages/conversations` - Create conversation
- [ ] POST `/messages/conversations/:id/participants` - Add participants
- [ ] DELETE `/messages/conversations/:id/participants/:participantId` - Remove participant
- [ ] PUT `/messages/conversations/:id/participants/:participantId` - Update participant
- [ ] GET `/messages/conversations/:id/messages` - Get messages
- [ ] POST `/messages/conversations/:id/messages` - Send message
- [ ] PUT `/messages/messages/:id/read` - Mark as read
- [ ] PUT `/messages/messages/:id` - Edit message
- [ ] DELETE `/messages/messages/:id` - Delete message

#### Notifications API
- [ ] GET `/notifications` - Get notifications
- [ ] GET `/notifications/unread-count` - Get unread count
- [ ] PUT `/notifications/:id/read` - Mark as read
- [ ] PUT `/notifications/read-all` - Mark all as read
- [ ] DELETE `/notifications/:id` - Delete notification
- [ ] GET `/notifications/preferences` - Get preferences
- [ ] PUT `/notifications/preferences` - Update preferences

#### Social API
- [ ] GET `/social/feed` - Get feed
- [ ] POST `/social/posts` - Create post
- [ ] GET `/social/posts/:id` - Get post
- [ ] PUT `/social/posts/:id` - Update post
- [ ] DELETE `/social/posts/:id` - Delete post
- [ ] POST `/social/posts/:id/like` - Like post
- [ ] DELETE `/social/posts/:id/like` - Unlike post
- [ ] POST `/social/posts/:id/comments` - Add comment
- [ ] PUT `/social/comments/:id` - Update comment
- [ ] DELETE `/social/comments/:id` - Delete comment
- [ ] GET `/social/connections/stats` - Get connection stats
- [ ] POST `/social/connections/request` - Send connection request
- [ ] PUT `/social/connections/:id/accept` - Accept connection
- [ ] PUT `/social/connections/:id/reject` - Reject connection
- [ ] DELETE `/social/connections/:id` - Remove connection
- [ ] GET `/social/connections` - Get connections
- [ ] POST `/social/follow/:profileId` - Follow profile
- [ ] DELETE `/social/follow/:profileId` - Unfollow profile
- [ ] POST `/social/block/:profileId` - Block profile
- [ ] DELETE `/social/block/:profileId` - Unblock profile
- [ ] POST `/social/posts/:id/bookmark` - Bookmark post
- [ ] DELETE `/social/posts/:id/bookmark` - Unbookmark post

---

## 🐛 ISSUE TRACKING

### Critical Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### High Priority Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Medium Priority Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Low Priority Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

---

## ✅ TEST RESULTS SUMMARY

### Web App
- **Total Tests:** [X]
- **Passed:** [X]
- **Failed:** [X]
- **Skipped:** [X]
- **Pass Rate:** [X]%

### Admin App
- **Total Tests:** [X]
- **Passed:** [X]
- **Failed:** [X]
- **Skipped:** [X]
- **Pass Rate:** [X]%

### API Endpoints
- **Total Tests:** [X]
- **Passed:** [X]
- **Failed:** [X]
- **Pass Rate:** [X]%

---

## 📝 NOTES

### Known Limitations
- [ ] Public blog endpoints not yet implemented
- [ ] Some features may require additional setup

### Recommendations
- [ ] Add automated E2E tests
- [ ] Add unit tests for critical functions
- [ ] Add integration tests for API endpoints
- [ ] Set up CI/CD testing pipeline

