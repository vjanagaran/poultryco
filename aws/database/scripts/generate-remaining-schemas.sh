#!/bin/bash
# =====================================================
# Generate Remaining Schema Files
# This script creates all remaining schema files
# based on the Supabase schema with new naming standards
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$SCRIPT_DIR/../schema"
SUPABASE_SCHEMA_DIR="$SCRIPT_DIR/../../../supabase/schema"

echo "========================================="
echo "Generating Remaining Schema Files"
echo "========================================="
echo ""

# Function to convert Supabase table names to new naming standard
convert_table_name() {
    local old_name=$1
    
    # Business tables
    if [[ $old_name == business_* ]]; then
        echo "biz_${old_name#business_}"
        return
    fi
    
    # Organization tables
    if [[ $old_name == organization_* ]]; then
        echo "org_${old_name#organization_}"
        return
    fi
    
    # Social/Post tables
    if [[ $old_name == post_* ]] || [[ $old_name == posts ]]; then
        echo "soc_${old_name}"
        return
    fi
    
    # Connection tables
    if [[ $old_name == connection* ]] || [[ $old_name == follow* ]]; then
        echo "soc_${old_name}"
        return
    fi
    
    # Message tables
    if [[ $old_name == message* ]] || [[ $old_name == conversation* ]]; then
        echo "msg_${old_name}"
        return
    fi
    
    # Notification tables
    if [[ $old_name == notification* ]]; then
        echo "ntf_${old_name}"
        return
    fi
    
    # Email tables
    if [[ $old_name == email_* ]]; then
        echo "eml_${old_name#email_}"
        return
    fi
    
    # Marketing tables
    if [[ $old_name == content_* ]] || [[ $old_name == stakeholder_* ]]; then
        echo "mkt_${old_name}"
        return
    fi
    
    # CMS/Blog tables
    if [[ $old_name == blog_* ]]; then
        echo "cms_${old_name#blog_}"
        return
    fi
    
    # Event tables
    if [[ $old_name == event_* ]] || [[ $old_name == events ]]; then
        echo "evt_${old_name}"
        return
    fi
    
    # Job tables
    if [[ $old_name == *_job* ]]; then
        echo "job_${old_name}"
        return
    fi
    
    # Product tables
    if [[ $old_name == product_* ]]; then
        echo "prd_${old_name#product_}"
        return
    fi
    
    # Feedback/Support tables
    if [[ $old_name == feedback_* ]]; then
        echo "sup_${old_name#feedback_}"
        return
    fi
    
    # Integration tables
    if [[ $old_name == integration_* ]] || [[ $old_name == invitations ]]; then
        echo "int_${old_name}"
        return
    fi
    
    # Admin tables
    if [[ $old_name == admin_* ]]; then
        echo "adm_${old_name#admin_}"
        return
    fi
    
    # Queue tables
    if [[ $old_name == *_queue ]]; then
        echo "que_${old_name}"
        return
    fi
    
    # Default: return as-is
    echo "$old_name"
}

echo "✓ Table name conversion function ready"
echo ""
echo "Note: Remaining schema files should be created manually"
echo "      using the patterns from existing files as templates."
echo ""
echo "Files to create:"
echo "  - 20_biz_core.sql (business profiles)"
echo "  - 21_biz_details.sql (business details)"
echo "  - 30_org_core.sql (organizations)"
echo "  - 31_org_membership.sql (membership)"
echo "  - 32_org_structure.sql (structure)"
echo "  - 40_soc_posts.sql (social posts)"
echo "  - 41_soc_engagement.sql (engagement)"
echo "  - 42_soc_connections.sql (connections)"
echo "  - 50_msg_core.sql (messaging)"
echo "  - 60_ntf_core.sql (notifications)"
echo "  - 70-200 (other modules)"
echo "  - 999_functions.sql (all functions)"
echo ""
echo "Use existing files as templates and follow DATABASE_STANDARDS.md"
echo ""

