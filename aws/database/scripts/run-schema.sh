#!/bin/bash
# =====================================================
# PoultryCo AWS Database Schema Execution Script
# Version: 2.0
# Date: 2025-12-01
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$SCRIPT_DIR/../schema"

# Database connection (from environment or AWS Secrets Manager)
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-poultryco}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if database connection works
check_connection() {
    print_info "Checking database connection..."
    
    if PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        print_info "✓ Database connection successful"
        return 0
    else
        print_error "✗ Database connection failed"
        return 1
    fi
}

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local filename=$(basename "$file")
    
    print_info "Executing: $filename"
    
    if PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        print_info "✓ $filename executed successfully"
        return 0
    else
        print_error "✗ Error executing $filename"
        return 1
    fi
}

# Function to get database credentials from AWS Secrets Manager
get_credentials_from_secrets_manager() {
    local secret_name="${1:-staging/poultryco/db/password}"
    
    print_info "Fetching credentials from AWS Secrets Manager..."
    
    if command -v aws &> /dev/null; then
        local secret=$(aws secretsmanager get-secret-value --secret-id "$secret_name" --query SecretString --output text 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            DB_HOST=$(echo "$secret" | jq -r .host)
            DB_PASSWORD=$(echo "$secret" | jq -r .password)
            DB_USER=$(echo "$secret" | jq -r .username)
            DB_NAME=$(echo "$secret" | jq -r .dbname)
            
            print_info "✓ Credentials fetched successfully"
            return 0
        else
            print_warning "Failed to fetch credentials from Secrets Manager"
            return 1
        fi
    else
        print_warning "AWS CLI not installed, using environment variables"
        return 1
    fi
}

# Main execution
main() {
    echo "========================================="
    echo "PoultryCo Database Schema Setup"
    echo "========================================="
    echo ""
    
    # Check if credentials are provided
    if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
        print_info "Database credentials not found in environment"
        
        # Try to get from AWS Secrets Manager
        if [ -n "$AWS_SECRET_NAME" ]; then
            get_credentials_from_secrets_manager "$AWS_SECRET_NAME"
        else
            print_error "Please provide database credentials via environment variables or AWS_SECRET_NAME"
            echo ""
            echo "Usage:"
            echo "  DB_HOST=xxx DB_PASSWORD=xxx ./run-schema.sh"
            echo "  or"
            echo "  AWS_SECRET_NAME=staging/poultryco/db/password ./run-schema.sh"
            exit 1
        fi
    fi
    
    # Check connection
    if ! check_connection; then
        exit 1
    fi
    
    echo ""
    print_info "Starting schema execution..."
    echo ""
    
    # Execute schema files in order
    local files=(
        "00_auth_custom.sql"
        "01_core_and_ref.sql"
        "10_usr_core.sql"
        "11_usr_roles.sql"
        "12_usr_professional.sql"
        "13_usr_skills.sql"
        "14_usr_engagement.sql"
        "20_biz_core.sql"
        "21_biz_details.sql"
        "30_org_core.sql"
        "31_org_membership.sql"
        "32_org_structure.sql"
        "40_soc_posts.sql"
        "41_soc_engagement.sql"
        "42_soc_connections.sql"
        "50_msg_core.sql"
        "60_ntf_core.sql"
        "70_mkt_core.sql"
        "71_mkt_campaigns.sql"
        "80_eml_core.sql"
        "81_eml_config.sql"
        "90_cms_core.sql"
        "100_nec_core.sql"
        "110_evt_core.sql"
        "111_evt_details.sql"
        "120_job_core.sql"
        "130_prd_core.sql"
        "140_ana_core.sql"
        "150_sup_core.sql"
        "160_int_core.sql"
        "170_adm_core.sql"
        "180_shr_core.sql"
        "190_que_core.sql"
        "200_prf_core.sql"
        "999_functions.sql"
    )
    
    local success_count=0
    local total_count=${#files[@]}
    
    for file in "${files[@]}"; do
        local filepath="$SCHEMA_DIR/$file"
        
        if [ -f "$filepath" ]; then
            if execute_sql_file "$filepath"; then
                ((success_count++))
            else
                print_error "Failed to execute $file"
                echo ""
                print_error "Schema execution stopped due to error"
                exit 1
            fi
        else
            print_warning "File not found: $file (skipping)"
        fi
    done
    
    echo ""
    echo "========================================="
    print_info "Schema execution complete!"
    print_info "Successfully executed: $success_count/$total_count files"
    echo "========================================="
    echo ""
    
    # Verify installation
    print_info "Verifying installation..."
    echo ""
    
    local table_count=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    print_info "Total tables created: $table_count"
    
    local function_count=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';" | xargs)
    print_info "Total functions created: $function_count"
    
    echo ""
    print_info "✓ Database schema setup complete!"
    print_info "You can now connect using pgAdmin or any PostgreSQL client"
    echo ""
}

# Run main function
main "$@"

