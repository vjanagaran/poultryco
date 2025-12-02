# 📚 Database Architecture Documentation

**Version:** 2.0  
**Date:** November 30, 2025  
**Status:** Production Ready

---

## 📄 Documents

### **1. [DATABASE_STANDARDS.md](./DATABASE_STANDARDS.md)** ⭐ **Reference Manual**

**Universal naming conventions and design patterns.**

**Use this when:**
- Creating any new table
- Designing a new feature
- Reviewing code
- Onboarding developers

**Key sections:**
- 28 module prefixes
- Naming rules (tables, columns, indexes)
- Enum vs mapping table decision matrix
- 6 real-world examples
- Quick reference cheat sheet

**Read time:** 30 minutes

---

### **2. [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md)** 🎯 **Implementation Plan**

**PoultryCo-specific strategy for 500-table architecture.**

**Use this when:**
- Planning implementation
- Understanding current state
- Organizing teams
- Tracking progress

**Key sections:**
- Current state (161 tables analyzed)
- Target architecture (500 tables, 2 years)
- Complete table renaming map
- 6-week implementation timeline
- Team organization
- Success metrics

**Read time:** 20 minutes

---

## 🚀 Quick Start

### **For New Developers:**

1. **Read:** [DATABASE_STANDARDS.md](./DATABASE_STANDARDS.md) (30 min)
2. **Review:** Examples section (15 min)
3. **Bookmark:** Quick reference cheat sheet
4. **Practice:** Name 5 tables from your feature

### **For Feature Development:**

1. **Design:** Sketch tables and relationships
2. **Name:** Use decision trees in standards doc
3. **Validate:** Check against validation checklist
4. **Review:** Get peer review
5. **Implement:** Create Drizzle schema in correct module

### **For Implementation:**

1. **Review:** [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md)
2. **Plan:** Identify your module's tables
3. **Generate:** Create Drizzle schemas
4. **Test:** Verify in staging
5. **Deploy:** Push to production

---

## 📊 Architecture Overview

### **28 Modules, 500 Tables**

```
Core (no prefix)
└── profiles

User Management (usr_) - 35 tables
Business (biz_) - 30 tables
Organizations (org_) - 35 tables
Social Network (soc_) - 30 tables
Messaging (msg_) - 15 tables
Marketing (mkt_) - 35 tables
Email (eml_) - 20 tables
Events (evt_) - 25 tables
Products (prd_) - 20 tables
... 19 more modules
```

### **Current State:** 161 tables  
### **Target (Year 2):** 500 tables

---

## 🎯 Key Principles

1. **Module Prefixes** - Every table has a 3-letter prefix (except core)
2. **Plural Names** - `usr_profiles` not `usr_profile`
3. **Snake_case** - `usr_profile_roles` not `usrProfileRoles`
4. **Mapping Tables** - Prefer over enums for extensibility
5. **Consistent Patterns** - Same rules for everyone

---

## ✅ Quick Reference

### **Table Naming:**
```
{prefix}_{entity_plural}
usr_profiles, biz_products, soc_posts
```

### **Junction Tables:**
```
{prefix}_{entity1}_{entity2}
usr_profile_roles, soc_post_tags
```

### **Column Naming:**
```
id, {entity}_id, {field}_at, is_{state}
```

---

## 📞 Support

### **Questions About:**
- **Naming conventions** → See DATABASE_STANDARDS.md
- **Implementation** → See DATABASE_STRATEGY.md
- **Specific cases** → Ask in #database-architecture

### **Team Contacts:**
- **CTO Team** - Strategic decisions
- **Data Architecture** - Technical guidance
- **DevOps** - Infrastructure support

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 2025 | Initial schema (66 tables) |
| 2.0 | Nov 2025 | **Enterprise standard (500 tables ready)** |

---

## 🎓 Training

### **New Team Members:**
- Week 1: Read both documents
- Week 2: Design small feature schema
- Week 3: Independent schema design

### **Resources:**
- Drizzle ORM: https://orm.drizzle.team/
- PostgreSQL: https://www.postgresql.org/docs/
- NestJS Database: https://docs.nestjs.com/techniques/database

---

**Questions?** Start with the standards document, then check the strategy document.
