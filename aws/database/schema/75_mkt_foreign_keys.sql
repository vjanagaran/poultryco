-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 75_mkt_foreign_keys.sql
-- Description: Add foreign key constraints for marketing module
-- Version: 1.0
-- Date: 2025-12-01
-- Dependencies: 70_mkt_common.sql, 71_mkt_ndp.sql, 72_mkt_content.sql
-- =====================================================
-- 
-- This file adds foreign key constraints that reference tables
-- defined in other marketing schema files. Run this after all
-- marketing schema files (70-74) have been executed.
-- =====================================================

-- Add foreign key: mkt_campaign_ndp_assignments → mkt_ndp_topics
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_campaign_ndp_assignments')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_campaign_ndp_topic'
       AND table_name = 'mkt_campaign_ndp_assignments'
     ) THEN
    ALTER TABLE mkt_campaign_ndp_assignments
    ADD CONSTRAINT fk_campaign_ndp_topic
    FOREIGN KEY (ndp_topic_id) REFERENCES mkt_ndp_topics(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key: fk_campaign_ndp_topic';
  END IF;
END $$;

-- Add foreign key: mkt_campaign_pillar_assignments → mkt_con_pillars
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_pillars')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_campaign_pillar_assignments')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_campaign_pillar'
       AND table_name = 'mkt_campaign_pillar_assignments'
     ) THEN
    ALTER TABLE mkt_campaign_pillar_assignments
    ADD CONSTRAINT fk_campaign_pillar
    FOREIGN KEY (pillar_id) REFERENCES mkt_con_pillars(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key: fk_campaign_pillar';
  END IF;
END $$;

-- Add foreign key: mkt_campaign_content_assignments → mkt_con_content
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_content')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_campaign_content_assignments')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_campaign_content'
       AND table_name = 'mkt_campaign_content_assignments'
     ) THEN
    ALTER TABLE mkt_campaign_content_assignments
    ADD CONSTRAINT fk_campaign_content
    FOREIGN KEY (content_id) REFERENCES mkt_con_content(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key: fk_campaign_content';
  END IF;
END $$;

-- Add foreign keys for mkt_con_pillars, mkt_con_ideas, mkt_con_content → mkt_ndp_topics
-- (These are also added conditionally in 72_mkt_content.sql, but included here for completeness)

-- Add foreign key: mkt_con_pillars.topic_id → mkt_ndp_topics.id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_pillars')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_mkt_con_pillars_topic'
       AND table_name = 'mkt_con_pillars'
     ) THEN
    ALTER TABLE mkt_con_pillars
    ADD CONSTRAINT fk_mkt_con_pillars_topic
    FOREIGN KEY (topic_id) REFERENCES mkt_ndp_topics(id);
    
    RAISE NOTICE 'Added foreign key: fk_mkt_con_pillars_topic';
  END IF;
END $$;

-- Add foreign key: mkt_con_ideas.topic_id → mkt_ndp_topics.id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_ideas')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_mkt_con_ideas_topic'
       AND table_name = 'mkt_con_ideas'
     ) THEN
    ALTER TABLE mkt_con_ideas
    ADD CONSTRAINT fk_mkt_con_ideas_topic
    FOREIGN KEY (topic_id) REFERENCES mkt_ndp_topics(id);
    
    RAISE NOTICE 'Added foreign key: fk_mkt_con_ideas_topic';
  END IF;
END $$;

-- Add foreign key: mkt_con_content.topic_id → mkt_ndp_topics.id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_content')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_mkt_con_content_topic'
       AND table_name = 'mkt_con_content'
     ) THEN
    ALTER TABLE mkt_con_content
    ADD CONSTRAINT fk_mkt_con_content_topic
    FOREIGN KEY (topic_id) REFERENCES mkt_ndp_topics(id);
    
    RAISE NOTICE 'Added foreign key: fk_mkt_con_content_topic';
  END IF;
END $$;

