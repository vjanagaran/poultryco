# 📚 PoultryCo Documentation

**Single Source of Truth for Platform Documentation**  
**Last Updated:** November 1, 2025

---

## 🎯 START HERE

### New to PoultryCo?
1. **[MVP_COMPLETE_SCOPE.md](MVP_COMPLETE_SCOPE.md)** ⭐ Complete MVP feature reference
2. **[QUICK_START.md](QUICK_START.md)** - Development environment setup
3. **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute

### Looking for Something Specific?
Use the organized folders below or jump to [Quick Navigation](#quick-navigation)

---

## 📂 Documentation Structure

### `/01-getting-started/` - Setup & Onboarding
Essential guides to get started with PoultryCo development

- **QUICK_START.md** - Environment setup (Node, npm, Supabase)
- **DEVELOPER_QUICK_START.md** - Developer onboarding
- **SETUP_NEW_ENVIRONMENT.md** - New machine setup
- **CONTRIBUTING.md** - Contribution guidelines

### `/02-product/` - Product & Strategy
Product vision, strategy, and business documentation

- **MVP_COMPLETE_SCOPE.md** ⭐ Complete MVP feature reference
- **PROJECT_SUMMARY_AND_NEXT_STEPS.md** - Project status & roadmap
- **poultryco-team-onboarding.md** - Team onboarding guide

###`/03-features/` - Feature Documentation
Detailed documentation for each platform feature

**Core Features:**
- **authentication/** - Auth system (email, Google, LinkedIn, OAuth)
- **profiles/** - Profile systems (personal, business, organization)
- **network/** - Connections and following system
- **discovery/** - Discovery system for all entities
- **stream/** - Social feed and content system
- **messaging/** - Real-time messaging system
- **resources/** - Tools, calculators, market data
- **notifications/** - Notification system

**Supporting Features:**
- **home/** - Customizable dashboard
- **settings/** - User preferences and settings

### `/04-technical/` - Architecture & Database
Technical implementation details

- **database/** - Database schema and migrations
- **api/** - API documentation
- **security/** - Security and RLS policies
- **performance/** - Optimization guides

### `/05-deployment/` - Deployment & Operations
Deployment guides and operational procedures

- **DEPLOYMENT_STRATEGY.md** - Hosting and deployment
- **web-deployment.md** - Web app deployment
- **mobile-deployment.md** - Mobile app deployment
- **monitoring.md** - System monitoring

### `/06-design/` - Design & Brand
Brand guidelines and design system

- **brand/** - Brand guidelines, logos, assets
- **wireframes/** - UI/UX wireframes
- **design-system.md** - Component library

### `/07-marketing/` - Marketing & Content
Marketing strategy and content planning

- **website/** - Website structure and SEO
- **content/** - Content strategy
- **pre-launch/** - Pre-launch marketing

### `/08-admin/` - Admin Portal
Admin portal documentation

- **admin-features.md** - Feature specifications
- **admin-quick-start.md** - Admin setup guide

### `/09-sprints/` - Development Sprints
Active sprint planning and tracking

- **MOBILE_FIRST_MVP_SPRINT.md** - Current 9-week sprint

### `/archive/` - Historical Reference
Completed sessions and superseded documents

---

## 🚀 Quick Navigation

### By Role

**Developer:**
- Setup: [QUICK_START.md](QUICK_START.md)
- MVP Scope: [MVP_COMPLETE_SCOPE.md](MVP_COMPLETE_SCOPE.md)
- Database: [database/](database/)
- Features: [03-features/](03-features/)

**Product Manager:**
- MVP Scope: [MVP_COMPLETE_SCOPE.md](MVP_COMPLETE_SCOPE.md)
- Project Status: [PROJECT_SUMMARY_AND_NEXT_STEPS.md](PROJECT_SUMMARY_AND_NEXT_STEPS.md)
- Sprint Plan: [sprints/MOBILE_FIRST_MVP_SPRINT.md](sprints/MOBILE_FIRST_MVP_SPRINT.md)

**Designer:**
- Brand Guidelines: [brand/poultryco_brand_guidelines.md](brand/poultryco_brand_guidelines.md)
- Wireframes: [wireframes/](wireframes/)
- Design System: [06-design/](06-design/)

**Marketing:**
- Strategy: [website/MARKETING_STRATEGY.md](website/MARKETING_STRATEGY.md)
- Content: [website/CONTENT_STRATEGY.md](website/CONTENT_STRATEGY.md)
- SEO: [website/SEO_STRATEGY.md](website/SEO_STRATEGY.md)

### By Feature

| Feature | Documentation |
|---------|--------------|
| Authentication | [03-features/authentication/](03-features/authentication/) |
| Profiles | [03-features/profiles/](03-features/profiles/) |
| Network | [03-features/network/](03-features/network/) |
| Discovery | [03-features/discovery/](03-features/discovery/) |
| Stream | [03-features/stream/](03-features/stream/) |
| Messages | [03-features/messaging/](03-features/messaging/) |
| Resources | [03-features/resources/](03-features/resources/) |
| Home | [03-features/home/](03-features/home/) |

### By Status

| Status | Location |
|--------|----------|
| What's Complete? | [MVP_COMPLETE_SCOPE.md](MVP_COMPLETE_SCOPE.md) |
| What's Next? | [PROJECT_SUMMARY_AND_NEXT_STEPS.md](PROJECT_SUMMARY_AND_NEXT_STEPS.md) |
| Current Sprint | [sprints/MOBILE_FIRST_MVP_SPRINT.md](sprints/MOBILE_FIRST_MVP_SPRINT.md) |

---

## 📋 Document Conventions

### File Naming
- `UPPERCASE.md` - Major reference documents
- `lowercase.md` - Supporting documentation
- `feature-name.md` - Feature-specific docs
- `00_filename.md` - Ordered/indexed files

### Status Labels
- ✅ **Complete** - Fully implemented and documented
- 🚧 **In Progress** - Active development
- 📋 **Planned** - Designed but not started
- 🗄️ **Archived** - Historical reference only

### Update Frequency
- **MVP_COMPLETE_SCOPE.md** - When features added/changed
- **PROJECT_SUMMARY_AND_NEXT_STEPS.md** - Weekly
- **Feature docs** - When feature changes
- **This README** - Monthly or after restructuring

---

## 🔍 Finding Information

### Quick Searches

**"How do I...?"**
- Set up development → QUICK_START.md
- Understand the product → MVP_COMPLETE_SCOPE.md
- Deploy to production → 05-deployment/
- Find a specific feature → 03-features/[feature-name]/

**"Where is...?"**
- Database schema → database/ or supabase/schema/
- API documentation → 04-technical/api/
- Brand assets → brand/logo/
- Marketing strategy → website/

**"What's the status of...?"**
- Overall project → PROJECT_SUMMARY_AND_NEXT_STEPS.md
- Specific feature → 03-features/[feature-name]/
- Current sprint → sprints/MOBILE_FIRST_MVP_SPRINT.md

---

## 🧹 Documentation Maintenance

### Responsibilities
- **Lead Developer:** Update MVP scope and project status weekly
- **Feature Developers:** Update feature docs when completing work
- **All Team:** Move completed session docs to archive

### Cleanup Guidelines
1. **Weekly:** Archive session summaries after consolidation
2. **Monthly:** Review and update main documents
3. **Quarterly:** Audit archived documents for relevance

### When to Archive
- Session summaries after consolidation into main docs
- Superseded strategy documents
- Outdated specifications
- Completed one-time guides

### When to Keep
- Main reference documents (MVP scope, project summary)
- Feature documentation (living documents)
- Setup and onboarding guides
- API and technical references

---

## 🌟 Documentation Highlights

### Most Important Documents

1. **[MVP_COMPLETE_SCOPE.md](MVP_COMPLETE_SCOPE.md)**
   - 500+ lines of complete MVP specification
   - All features with detailed descriptions
   - Technical stack and architecture
   - Success metrics and criteria

2. **[PROJECT_SUMMARY_AND_NEXT_STEPS.md](PROJECT_SUMMARY_AND_NEXT_STEPS.md)**
   - Current project status
   - What's done, what's next
   - Timeline and milestones
   - Team structure

3. **Feature Documentation** ([03-features/](03-features/))
   - Detailed implementation guides
   - API references
   - Testing procedures
   - Troubleshooting

---

## 📞 Support & Questions

### Documentation Questions
- Check relevant feature folder
- Search in MVP_COMPLETE_SCOPE.md
- Review troubleshooting sections

### Technical Questions
- Check 04-technical/ folder
- Review database schema docs
- Check API documentation

### Process Questions
- Review CONTRIBUTING.md
- Check project summary
- Ask team lead

---

## 🔗 External Resources

### Live Applications
- **Website:** [www.poultryco.net](https://www.poultryco.net)
- **Admin Portal:** [admin.poultryco.net](https://admin.poultryco.net)

### Development Tools
- **GitHub:** Repository
- **Supabase:** Database dashboard
- **Vercel:** Deployment dashboard

### Documentation Tools
- **Markdown:** All documentation
- **Mermaid:** Diagrams (future)
- **PlantUML:** Architecture diagrams (future)

---

## 📊 Documentation Statistics

- **Total Docs:** ~100 files
- **Main References:** 3 core documents
- **Feature Docs:** ~30 feature-specific
- **Archived:** ~20 historical
- **Last Major Cleanup:** November 1, 2025

---

**💡 TIP:** Always start with [MVP_COMPLETE_SCOPE.md](MVP_COMPLETE_SCOPE.md) for the complete feature reference, then dive into specific feature folders as needed.

---

**Maintained By:** PoultryCo Development Team  
**Next Review:** December 1, 2025  
**Version:** 2.0 - Reorganized Structure


