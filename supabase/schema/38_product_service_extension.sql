-- Product and Service Extension Schema
-- Extends business_products table to support both products and services with custom fields
-- 
-- IMPORTANT ARCHITECTURE DECISION:
-- Products/Services are ONLY for business profiles, not personal profiles
-- Personal profiles (vets, consultants, etc.) should use their about/experience sections
-- If they want to generate leads, they must create a business profile

-- Add type column to business_products table
ALTER TABLE business_products 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'product' 
CHECK (item_type IN ('product', 'service'));

-- Add service-specific fields as JSONB for flexibility
ALTER TABLE business_products
ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '{}';

-- Add custom fields support
ALTER TABLE business_products
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Create index on item_type
CREATE INDEX IF NOT EXISTS idx_business_products_item_type ON business_products(item_type);

-- Update existing products to have item_type
UPDATE business_products SET item_type = 'product' WHERE item_type IS NULL;

-- Service categories specific to services
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    icon_name TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default service categories
INSERT INTO service_categories (name, description, icon_name, sort_order) VALUES
    ('Consulting', 'Professional consulting services', 'briefcase', 1),
    ('Transportation', 'Logistics and transportation services', 'truck', 2),
    ('Veterinary', 'Animal health and veterinary services', 'medical', 3),
    ('Feed Processing', 'Feed manufacturing and processing services', 'factory', 4),
    ('Equipment Maintenance', 'Maintenance and repair services', 'wrench', 5),
    ('Training & Education', 'Training and educational services', 'graduation-cap', 6),
    ('Laboratory Services', 'Testing and analysis services', 'flask', 7),
    ('Financial Services', 'Banking, insurance, and financial services', 'dollar-sign', 8)
ON CONFLICT (name) DO NOTHING;

-- Service-specific attributes template
CREATE TABLE IF NOT EXISTS service_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL,
    attribute_type TEXT NOT NULL CHECK (attribute_type IN ('text', 'number', 'boolean', 'date', 'select', 'multiselect')),
    attribute_options JSONB DEFAULT '[]', -- For select/multiselect types
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample attributes for services
INSERT INTO service_attributes (category_id, attribute_name, attribute_type, is_required, attribute_options) 
SELECT 
    sc.id, 
    'Service Duration',
    'select',
    true,
    '["Hourly", "Daily", "Weekly", "Monthly", "Project-based", "Annual Contract"]'::jsonb
FROM service_categories sc WHERE sc.name = 'Consulting';

INSERT INTO service_attributes (category_id, attribute_name, attribute_type, is_required)
SELECT 
    sc.id, 
    'Coverage Area',
    'text',
    true
FROM service_categories sc WHERE sc.name = 'Transportation';

-- Function to validate custom fields based on service category
CREATE OR REPLACE FUNCTION validate_service_custom_fields()
RETURNS TRIGGER AS $$
DECLARE
    v_required_attributes RECORD;
    v_custom_fields JSONB;
BEGIN
    -- Only validate for services
    IF NEW.item_type = 'service' THEN
        v_custom_fields := COALESCE(NEW.custom_fields, '{}'::jsonb);
        
        -- Check if all required attributes are present
        FOR v_required_attributes IN
            SELECT sa.attribute_name
            FROM service_attributes sa
            WHERE sa.category_id IN (
                SELECT id FROM service_categories 
                WHERE name = NEW.product_subcategory
            ) AND sa.is_required = true
        LOOP
            IF NOT v_custom_fields ? v_required_attributes.attribute_name THEN
                RAISE EXCEPTION 'Required service attribute % is missing', v_required_attributes.attribute_name;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER validate_service_fields_trigger
    BEFORE INSERT OR UPDATE ON business_products
    FOR EACH ROW
    EXECUTE FUNCTION validate_service_custom_fields();

-- View to get products and services with their details
CREATE OR REPLACE VIEW business_products_services_view AS
SELECT 
    bp.*,
    CASE 
        WHEN bp.item_type = 'service' THEN 
            jsonb_build_object(
                'duration', bp.service_details->>'duration',
                'delivery_method', bp.service_details->>'delivery_method',
                'coverage_area', bp.service_details->>'coverage_area',
                'availability', bp.service_details->>'availability'
            )
        ELSE NULL
    END as service_info,
    b.business_name,
    b.business_slug
FROM business_products bp
JOIN business_profiles b ON b.id = bp.business_profile_id;

-- Function to search products and services
CREATE OR REPLACE FUNCTION search_business_products_services(
    p_search_term TEXT DEFAULT NULL,
    p_item_type TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_business_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    business_profile_id UUID,
    product_name TEXT,
    short_description TEXT,
    full_description TEXT,
    item_type TEXT,
    price DECIMAL,
    price_unit TEXT,
    featured_image_url TEXT,
    custom_fields JSONB,
    service_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    business_name TEXT,
    business_slug TEXT,
    product_category TEXT,
    product_subcategory TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.business_profile_id,
        bp.product_name,
        bp.short_description,
        bp.full_description,
        bp.item_type,
        bp.price,
        bp.price_unit,
        bp.featured_image_url,
        bp.custom_fields,
        bp.service_details,
        bp.created_at,
        b.business_name,
        b.business_slug,
        bp.product_category,
        bp.product_subcategory
    FROM business_products bp
    JOIN business_profiles b ON b.id = bp.business_profile_id
    WHERE 
        bp.is_published = true
        AND bp.is_available = true
        AND (p_search_term IS NULL OR (
            bp.product_name ILIKE '%' || p_search_term || '%' OR
            bp.short_description ILIKE '%' || p_search_term || '%' OR
            bp.full_description ILIKE '%' || p_search_term || '%'
        ))
        AND (p_item_type IS NULL OR bp.item_type = p_item_type)
        AND (p_category IS NULL OR bp.product_category = p_category)
        AND (p_min_price IS NULL OR bp.price >= p_min_price)
        AND (p_max_price IS NULL OR bp.price <= p_max_price)
        AND (p_business_id IS NULL OR bp.business_profile_id = p_business_id)
    ORDER BY bp.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
