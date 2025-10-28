-- Product and Service Extension Schema
-- Extends products table to support both products and services with custom fields

-- Add type column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'product' 
CHECK (item_type IN ('product', 'service'));

-- Add service-specific fields as JSONB for flexibility
ALTER TABLE products
ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '{}';

-- Add custom fields support
ALTER TABLE products
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Create index on item_type
CREATE INDEX IF NOT EXISTS idx_products_item_type ON products(item_type);

-- Update existing products to have item_type
UPDATE products SET item_type = 'product' WHERE item_type IS NULL;

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
            JOIN products_categories pc ON pc.product_id = NEW.id
            JOIN service_categories sc ON sc.name = (
                SELECT c.name FROM categories c WHERE c.id = pc.category_id
            )
            WHERE sa.category_id = sc.id AND sa.is_required = true
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
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION validate_service_custom_fields();

-- View to get products and services with their details
CREATE OR REPLACE VIEW products_services_view AS
SELECT 
    p.*,
    CASE 
        WHEN p.item_type = 'service' THEN 
            jsonb_build_object(
                'duration', p.service_details->>'duration',
                'delivery_method', p.service_details->>'delivery_method',
                'coverage_area', p.service_details->>'coverage_area',
                'availability', p.service_details->>'availability'
            )
        ELSE NULL
    END as service_info,
    array_agg(DISTINCT c.name) as category_names
FROM products p
LEFT JOIN products_categories pc ON pc.product_id = p.id
LEFT JOIN categories c ON c.id = pc.category_id
GROUP BY p.id;

-- Function to search products and services
CREATE OR REPLACE FUNCTION search_products_services(
    p_search_term TEXT DEFAULT NULL,
    p_item_type TEXT DEFAULT NULL,
    p_category_ids UUID[] DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_profile_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    profile_id UUID,
    name TEXT,
    description TEXT,
    item_type TEXT,
    price DECIMAL,
    images TEXT[],
    custom_fields JSONB,
    service_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    profile_name TEXT,
    profile_type TEXT,
    categories TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.profile_id,
        p.name,
        p.description,
        p.item_type,
        p.price,
        p.images,
        p.custom_fields,
        p.service_details,
        p.created_at,
        pr.full_name as profile_name,
        CASE 
            WHEN bp.id IS NOT NULL THEN 'business'
            ELSE 'personal'
        END as profile_type,
        array_agg(DISTINCT c.name) as categories
    FROM products p
    JOIN profiles pr ON pr.id = p.profile_id
    LEFT JOIN business_profiles bp ON bp.owner_id = pr.id
    LEFT JOIN products_categories pc ON pc.product_id = p.id
    LEFT JOIN categories c ON c.id = pc.category_id
    WHERE 
        p.is_active = true
        AND (p_search_term IS NULL OR (
            p.name ILIKE '%' || p_search_term || '%' OR
            p.description ILIKE '%' || p_search_term || '%'
        ))
        AND (p_item_type IS NULL OR p.item_type = p_item_type)
        AND (p_category_ids IS NULL OR pc.category_id = ANY(p_category_ids))
        AND (p_min_price IS NULL OR p.price >= p_min_price)
        AND (p_max_price IS NULL OR p.price <= p_max_price)
        AND (p_profile_id IS NULL OR p.profile_id = p_profile_id)
    GROUP BY p.id, pr.full_name, bp.id
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
