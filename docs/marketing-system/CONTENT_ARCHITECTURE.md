# Content Architecture - PoultryCo Marketing System

**Version:** 1.0  
**Date:** November 24, 2025  
**Audience:** Marketing Team

---

## Overview

This document explains how content flows through the PoultryCo marketing system, from ideation to publication. Understanding this architecture will help you maximize content reuse and maintain consistency across all channels.

---

## Content Workflow (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

1. IDEATION
   ┌──────────────┐
   │ Content Idea │  ← Capture ideas from any source
   └──────┬───────┘
          │
          ↓
   ┌──────────────┐
   │  NDP Topic   │  ← Categorize by Need/Desire/Pain
   └──────┬───────┘
          │
          ↓

2. RESEARCH
   ┌──────────────────┐
   │ Content Pillar   │  ← Deep research, source documents
   │                  │    SEO strategy, key insights
   │ • Target URL     │
   │ • Focus Keywords │
   │ • Research Notes │
   └──────┬───────────┘
          │
          ↓

3. PRODUCTION
   ┌─────────────────────────────────────┐
   │         MASTER CONTENT              │
   │  • Blog Post (1,500-2,500 words)    │
   │  • E-book / Guide                   │
   │  • Video / Webinar                  │
   └──────┬──────────────────────────────┘
          │
          ↓
   ┌─────────────────────────────────────┐
   │      REPURPOSED CONTENT             │
   │  • Social Media Posts (10 formats)  │
   │  • Infographics                     │
   │  • Email Snippets                   │
   │  • Quote Cards                      │
   └──────┬──────────────────────────────┘
          │
          ↓

4. DISTRIBUTION
   ┌──────────────────┐
   │ Content Schedule │  ← Assign to channels & dates
   └──────┬───────────┘
          │
          ↓
   ┌──────────────────────────────────────┐
   │     MARKETING CHANNELS               │
   │  LinkedIn | Facebook | Instagram     │
   │  Twitter  | YouTube  | Blog          │
   │  WhatsApp | Email                    │
   └──────┬───────────────────────────────┘
          │
          ↓

5. MEASUREMENT
   ┌──────────────────┐
   │   KPI Tracking   │  ← Monitor performance
   └──────────────────┘
```

---

## Core Concepts

### 1. NDP Topics

**What:** Content topics based on audience psychology  
**Why:** Ensures content resonates with real needs

**Categories:**
- **Need:** Essential requirements (e.g., "Reduce feed costs")
- **Desire:** Aspirational goals (e.g., "Achieve 95% uniformity")
- **Pain Point:** Current problems (e.g., "High summer mortality")
- **Problem:** Systemic issues (e.g., "Vaccine supply chain")
- **Fear:** Concerns (e.g., "Disease outbreak prevention")
- **Fantasy:** Ideal outcomes (e.g., "Fully automated farm")

**Example:**
```
Topic: "High Mortality Rate in Broiler Farms"
Category: Pain Point
Target Segments: Farmers, Veterinarians, Consultants
Key Message: "Reduce mortality from 8% to 3% with proven protocols"
```

### 2. Content Pillars

**What:** Deep-dive research that feeds multiple content pieces  
**Why:** Creates authoritative, comprehensive content foundation

**Components:**
- **Research Question:** What are we investigating?
- **Hypothesis:** What do we expect to find?
- **Source Documents:** Minimum 3 credible sources
- **Key Insights:** 5-10 actionable takeaways
- **Target URL:** Landing page for SEO backlinks
- **Focus Keywords:** Primary SEO targets
- **Research Notes:** Detailed findings

**Example:**
```
Pillar: "Complete Guide to Broiler Mortality Reduction"
Research Question: "What are the top 10 causes of broiler mortality and proven solutions?"
Target URL: /solutions/broiler-health
Focus Keywords: "reduce broiler mortality", "broiler health management"
Estimated Pieces: 20 (4 blogs + 16 social posts)
```

### 3. Content Types & Modes

#### Content Types (Format)
- Blog Post
- E-book / Guide
- Video
- Webinar
- Infographic
- Social Post
- Email Newsletter
- Case Study
- Whitepaper

#### Content Modes
- **Master:** Original, comprehensive content
- **Repurposed:** Derived from master content

**Relationship:**
```
Master Content (Blog)
  ├─ Repurposed (LinkedIn Post)
  ├─ Repurposed (Twitter Thread)
  ├─ Repurposed (Instagram Carousel)
  ├─ Repurposed (Email Snippet)
  └─ Repurposed (Quote Card)
```

### 4. Target Segments

**11 Stakeholder Types:**

| Segment | Content Focus | Preferred Channels |
|---------|---------------|-------------------|
| **Farmers** | Practical, ROI-focused | WhatsApp, Facebook, YouTube |
| **Veterinarians** | Clinical, evidence-based | LinkedIn, Email, Blog |
| **FPOs** | Collective solutions | LinkedIn, Email |
| **Associations** | Industry trends | LinkedIn, Twitter |
| **Nutritionists** | Technical, data-driven | Blog, LinkedIn, Email |
| **Students** | Educational, career | Instagram, YouTube, Blog |
| **Feed Mills** | Supply chain, quality | LinkedIn, Email |
| **Hatcheries** | Breeding, disease control | LinkedIn, Blog |
| **Consultants** | Advanced strategies | LinkedIn, Blog, Email |
| **Researchers** | Innovation, studies | Blog, LinkedIn |
| **Equipment Suppliers** | Technology integration | LinkedIn, Email |

---

## Content Multiplication Strategy

### The 1:4:40 Model

**1 Content Pillar → 4 Master Pieces → 40 Repurposed Pieces**

#### Example: "Broiler Mortality Guide" Pillar

**Step 1: Create Pillar (2 hours)**
- Research 10 mortality causes
- Document 20 proven solutions
- Collect 5 case studies
- Identify 50+ statistics

**Step 2: Create 4 Master Pieces (4 hours)**
1. Blog: "Top 10 Causes of Broiler Mortality" (1,800 words)
2. Blog: "Proven Protocols to Reduce Mortality" (2,000 words)
3. Blog: "Case Studies: Farms That Cut Mortality by 50%" (1,500 words)
4. E-book: "Complete Broiler Health Management Guide" (5,000 words)

**Step 3: Repurpose into 40 Pieces (2 hours)**

From each blog (4 blogs × 10 formats = 40 pieces):
- 1 LinkedIn article (summary + link)
- 3 LinkedIn posts (key insights)
- 3 Facebook posts (visual + tips)
- 2 Instagram carousels (5-slide tips)
- 5 Twitter/X posts (quick tips)
- 2 Email snippets (newsletter sections)
- 2 Quote cards (key statistics)
- 2 WhatsApp messages (actionable tips)

**Total Time: 8 hours for 44 pieces = 11 minutes per piece**

---

## SEO Architecture

### Pillar-Based SEO Strategy

Each pillar creates a **content cluster** for SEO:

```
Landing Page: /solutions/broiler-health
         ↑
         │ (backlinks from all content)
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
  Blog 1   Blog 2   Blog 3   Blog 4
    │         │        │        │
    └─────────┴────────┴────────┘
              ↓
         Social Posts
      (drive traffic back)
```

**Benefits:**
- **Topic Authority:** Google sees comprehensive coverage
- **Internal Linking:** Strong site structure
- **Keyword Clustering:** Rank for related terms
- **Backlink Power:** Multiple pieces link to one page

### Content-Level SEO

Every content piece includes:
- **Meta Title:** 50-60 characters, includes focus keyword
- **Meta Description:** 150-160 characters, compelling CTA
- **Slug:** Short, keyword-rich URL
- **Focus Keywords:** 1 primary + 2-3 secondary
- **Hashtags:** Platform-specific, relevant
- **Internal Links:** 2-3 links to related content
- **CTA:** Clear next action for reader

---

## Campaign Organization

### What is a Campaign?

A campaign groups related content for coordinated launches and unified tracking.

**Example Campaign: "Product Launch Q1 2026"**

```
Campaign: Product Launch Q1 2026
Duration: Jan 1 - Mar 31, 2026
Goal: 1,000 early adopters
Budget: $5,000
Color: #FF6B6B (for calendar)

Content Plan:
├─ Pillar: "Why PoultryCo is Different"
│   ├─ Blog: "The Problem with Current Solutions"
│   ├─ Blog: "Our Unique Approach"
│   └─ 20 Social Posts
├─ Pillar: "Success Stories"
│   ├─ Video: Customer testimonials
│   └─ 15 Social Posts
└─ Direct Content:
    ├─ Email Series (5 emails)
    └─ Webinar: "Platform Demo"

Total: 2 Pillars, 5 Master Pieces, 35 Repurposed Pieces
```

### Campaign Benefits
- **Coordinated Messaging:** All content supports one goal
- **Unified Tracking:** See campaign-wide performance
- **Visual Organization:** Color-coded on calendar
- **Resource Planning:** Budget and team allocation
- **Performance Analysis:** What worked for next campaign

---

## Content Tags

### Why Tags?

Tags provide **cross-cutting categorization** beyond the linear workflow.

**Example:**
```
Content: "10 Ways to Reduce Feed Costs"
├─ Topic: Feed Optimization (primary category)
├─ Pillar: Complete Feed Management Guide (content source)
└─ Tags:
    ├─ Cost Reduction (theme)
    ├─ How-To (format)
    ├─ Beginner (level)
    ├─ All Seasons (timing)
    └─ Farm Management (product area)
```

### Tag Strategy

**Tag Categories:**

1. **Themes**
   - Disease Management
   - Feed Optimization
   - Farm Automation
   - Financial Planning

2. **Formats**
   - How-To Guide
   - Case Study
   - Research Summary
   - Opinion / Commentary
   - Listicle

3. **Audience Level**
   - Beginner
   - Intermediate
   - Advanced
   - Expert

4. **Seasonality**
   - Summer
   - Winter
   - Monsoon
   - All Seasons

5. **Product Areas**
   - Platform Features
   - Advisory Services
   - Community
   - Resources

### Using Tags

**Content Discovery:**
- "Show me all 'How-To' content for 'Beginners' about 'Disease Management'"
- "What 'Summer' content do we have?"

**Gap Analysis:**
- "We have 20 pieces on Feed but only 3 on Automation"
- "No 'Advanced' content for Nutritionists"

**Content Planning:**
- "Next month: Create 5 'Beginner' pieces on 'Farm Automation'"

---

## Channel Strategy

### Platform-Specific Approach

#### LinkedIn (Professional)
- **Frequency:** 5×/week
- **Content Types:** Articles, insights, company updates
- **Tone:** Professional, authoritative
- **Length:** 300-500 words or 1,300 characters
- **Best Times:** Tue-Thu, 7-9 AM, 12-1 PM

#### Facebook (Community)
- **Frequency:** 7×/week
- **Content Types:** Mixed, community engagement
- **Tone:** Friendly, conversational
- **Length:** 40-80 words
- **Best Times:** Daily, 1-3 PM

#### Instagram (Visual)
- **Frequency:** 7×/week
- **Content Types:** Stories, tips, behind-scenes
- **Tone:** Inspirational, visual
- **Length:** 125-150 characters + visual
- **Best Times:** Daily, 11 AM, 7-9 PM

#### Twitter/X (Real-time)
- **Frequency:** 10×/week
- **Content Types:** Quick tips, news, engagement
- **Tone:** Concise, timely
- **Length:** 100-280 characters
- **Best Times:** Multiple times daily

#### YouTube (Educational)
- **Frequency:** 2×/month
- **Content Types:** Tutorials, interviews, demos
- **Tone:** Educational, engaging
- **Length:** 8-15 minutes
- **Best Times:** Weekend mornings

#### Blog (SEO)
- **Frequency:** 8×/month
- **Content Types:** Long-form, comprehensive
- **Tone:** Authoritative, helpful
- **Length:** 1,500-2,500 words
- **Best Times:** Any (SEO-focused)

---

## Practical Examples

### Example 1: From Idea to 44 Pieces

**Monday: Idea Capture**
```
Idea: "Farmers struggling with high feed costs"
Source: Customer feedback call
Format: Blog series
Priority: High (Impact: 5, Effort: 3)
Status: Approved
```

**Tuesday: Create Topic**
```
Topic: "Feed Cost Optimization"
Category: Pain Point
Segments: Farmers, Nutritionists, Feed Mills
Key Message: "Reduce feed costs by 15-20% without compromising quality"
```

**Wednesday-Thursday: Research Pillar**
```
Pillar: "Complete Guide to Feed Cost Reduction"
Research: 5 academic papers, 3 industry reports, 10 farmer interviews
Key Insights: 12 proven strategies
Target URL: /solutions/feed-optimization
Focus Keywords: "reduce feed costs", "poultry feed optimization"
```

**Friday: Create Master Content**
```
Blog 1: "Top 10 Ways to Reduce Feed Costs" (1,800 words)
Blog 2: "Feed Conversion Ratio: A Complete Guide" (2,000 words)
Blog 3: "Alternative Feed Ingredients That Save Money" (1,600 words)
Blog 4: "Case Study: Farm Reduced Feed Costs by 22%" (1,400 words)
```

**Next Week: Repurpose**
```
From each blog, create:
- 3 LinkedIn posts
- 3 Facebook posts
- 2 Instagram carousels
- 5 Twitter posts
- 2 Email snippets
- 2 Quote cards
- 2 WhatsApp messages

Total: 40 repurposed pieces
```

**Schedule & Publish**
```
Week 1: Publish Blog 1, schedule 10 social posts
Week 2: Publish Blog 2, schedule 10 social posts
Week 3: Publish Blog 3, schedule 10 social posts
Week 4: Publish Blog 4, schedule 10 social posts
```

**Result: 1 month of content from 1 week of work**

---

## Best Practices

### Content Creation

1. **Start with Research**
   - Never skip the pillar phase
   - Minimum 3 credible sources
   - Document everything for reuse

2. **Write for Repurposing**
   - Use clear subheadings (become social posts)
   - Include quotable statistics (become quote cards)
   - Create visual-friendly sections (become infographics)

3. **Optimize for SEO**
   - Every piece needs focus keywords
   - Internal linking is mandatory
   - Meta data is not optional

4. **Maintain Consistency**
   - Use brand voice guide
   - Follow format templates
   - Quality over quantity

### Scheduling

1. **Plan Ahead**
   - 2 weeks minimum buffer
   - Account for holidays/events
   - Leave room for real-time content

2. **Balance Content Mix**
   - 60% Educational
   - 20% Promotional
   - 20% Community/Engagement

3. **Respect Platform Norms**
   - Don't over-post on LinkedIn
   - Be consistent on Instagram
   - Engage in real-time on Twitter

### Performance Tracking

1. **Monitor Weekly**
   - What performed best?
   - What underperformed?
   - Any trends?

2. **Test Continuously**
   - A/B test headlines
   - Try different formats
   - Experiment with timing

3. **Learn and Adapt**
   - Double down on winners
   - Improve underperformers
   - Share insights with team

---

## Quick Reference

### Content Workflow Checklist

**Ideation:**
- [ ] Idea captured with source
- [ ] Topic created with NDP category
- [ ] Segments identified
- [ ] Priority assigned

**Research:**
- [ ] Pillar created
- [ ] Research question defined
- [ ] 3+ sources documented
- [ ] Key insights extracted
- [ ] SEO strategy defined

**Production:**
- [ ] Master content created
- [ ] SEO optimized
- [ ] Proofread & edited
- [ ] Repurposed content created
- [ ] Tags assigned
- [ ] Campaign assigned (if applicable)

**Distribution:**
- [ ] Scheduled on calendar
- [ ] Channels selected
- [ ] Dates/times set
- [ ] Team notified

**Measurement:**
- [ ] Published successfully
- [ ] Performance tracked
- [ ] Insights documented
- [ ] Next steps identified

---

## Conclusion

This content architecture enables PoultryCo to:
- **Create less, publish more** through strategic repurposing
- **Maintain consistency** across all channels
- **Optimize for SEO** with pillar-based strategy
- **Track performance** at every level
- **Scale efficiently** as the business grows

By following this architecture, the marketing team can achieve the 80% time reduction goal while increasing content output and quality.

---

**Questions?** Contact the marketing team lead or refer to the Developer Guide for technical details.

**Last Updated:** November 24, 2025  
**Next Review:** February 2026

