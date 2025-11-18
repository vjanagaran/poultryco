-- =====================================================
-- PoultryCo Database Schema
-- File: 53_import_necc_zones.sql
-- Description: Import NECC zones from PoultryCare data
-- Version: 1.0
-- Date: 2025-01-17
-- Dependencies: 50_necc_system.sql
-- =====================================================
-- 
-- This script imports zones from PoultryCare necczone table
-- Run this AFTER 50_necc_system.sql
--

-- Insert zones from PoultryCare
-- Zone type detection: (CC) = Consumption Center, others = Production Center
-- Major metros without (CC) are also consumption centers
INSERT INTO necc_zones (name, slug, description, zone_type, state, city, sorting, status) VALUES
  ('Ahmedabad', 'ahmedabad', NULL, 'production_center', 'Gujarat', 'Ahmedabad', 1, true),
  ('Ajmer', 'ajmer', NULL, 'production_center', 'Rajasthan', 'Ajmer', 1, true),
  ('Barwala', 'barwala', NULL, 'production_center', 'Haryana', 'Barwala', 1, true),
  ('Bengaluru (CC)', 'bengaluru-cc', NULL, 'consumption_center', 'Karnataka', 'Bengaluru', 1, true),
  ('Brahmapur (OD)', 'brahmapur-od', NULL, 'production_center', 'Odisha', 'Brahmapur', 1, true),
  ('Chennai (CC)', 'chennai-cc', NULL, 'consumption_center', 'Tamil Nadu', 'Chennai', 1, true),
  ('Chittoor', 'chittoor', NULL, 'production_center', 'Andhra Pradesh', 'Chittoor', 1, true),
  ('Delhi (CC)', 'delhi-cc', NULL, 'consumption_center', 'Delhi', 'Delhi', 1, true),
  ('E.Godavari', 'e-godavari', NULL, 'production_center', 'Andhra Pradesh', 'East Godavari', 1, true),
  ('Hyderabad', 'hyderabad', NULL, 'consumption_center', 'Telangana', 'Hyderabad', 1, true),
  ('Ludhiana', 'ludhiana', NULL, 'production_center', 'Punjab', 'Ludhiana', 1, true),
  ('Mumbai (CC)', 'mumbai-cc', NULL, 'consumption_center', 'Maharashtra', 'Mumbai', 1, true),
  ('Muzaffurpur (CC)', 'muzaffurpur-cc', NULL, 'consumption_center', 'Bihar', 'Muzaffarpur', 1, true),
  ('Mysuru', 'mysuru', NULL, 'production_center', 'Karnataka', 'Mysuru', 1, true),
  ('Nagpur', 'nagpur', NULL, 'production_center', 'Maharashtra', 'Nagpur', 1, true),
  ('Namakkal', 'namakkal', NULL, 'production_center', 'Tamil Nadu', 'Namakkal', 1, true),
  ('Patna', 'patna', NULL, 'consumption_center', 'Bihar', 'Patna', 1, true),
  ('Pune', 'pune', NULL, 'production_center', 'Maharashtra', 'Pune', 1, true),
  ('Ranchi (CC)', 'ranchi-cc', NULL, 'consumption_center', 'Jharkhand', 'Ranchi', 1, true),
  ('Vijayawada', 'vijayawada', NULL, 'production_center', 'Andhra Pradesh', 'Vijayawada', 1, true),
  ('Vizag', 'vizag', NULL, 'consumption_center', 'Andhra Pradesh', 'Visakhapatnam', 1, true),
  ('W.Godavari', 'w-godavari', NULL, 'production_center', 'Andhra Pradesh', 'West Godavari', 1, true),
  ('Warangal', 'warangal', NULL, 'production_center', 'Telangana', 'Warangal', 1, true),
  ('Allahabad (CC)', 'allahabad-cc', NULL, 'consumption_center', 'Uttar Pradesh', 'Prayagraj', 1, true),
  ('Bhopal', 'bhopal', NULL, 'consumption_center', 'Madhya Pradesh', 'Bhopal', 1, true),
  ('Hospet', 'hospet', NULL, 'production_center', 'Karnataka', 'Hospet', 1, true),
  ('Indore (CC)', 'indore-cc', NULL, 'consumption_center', 'Madhya Pradesh', 'Indore', 1, true),
  ('Jabalpur', 'jabalpur', NULL, 'production_center', 'Madhya Pradesh', 'Jabalpur', 1, true),
  ('Kanpur (CC)', 'kanpur-cc', NULL, 'consumption_center', 'Uttar Pradesh', 'Kanpur', 1, true),
  ('Kolkata (WB)', 'kolkata-wb', NULL, 'consumption_center', 'West Bengal', 'Kolkata', 1, true),
  ('Luknow (CC)', 'luknow-cc', NULL, 'consumption_center', 'Uttar Pradesh', 'Lucknow', 1, true),
  ('Raipur', 'raipur', NULL, 'production_center', 'Chhattisgarh', 'Raipur', 1, true),
  ('Surat', 'surat', NULL, 'production_center', 'Gujarat', 'Surat', 1, true),
  ('Varanasi (CC)', 'varanasi-cc', NULL, 'consumption_center', 'Uttar Pradesh', 'Varanasi', 1, true),
  ('Asansole', 'asansole', NULL, 'production_center', 'West Bengal', 'Asansol', 1, true),
  ('Burdwan (CC)', 'burdwan-cc', NULL, 'consumption_center', 'West Bengal', 'Bardhaman', 1, true),
  ('Midnapur (KOL)', 'midnapur-kol', NULL, 'production_center', 'West Bengal', 'Medinipur', 1, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify zones were imported:
-- SELECT COUNT(*) FROM necc_zones;
-- Should return 37

-- =====================================================
-- END OF FILE
-- =====================================================

