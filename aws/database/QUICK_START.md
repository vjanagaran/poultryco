# 🚀 Quick Start Guide - AWS Database Deployment

**Time to Deploy:** 30 minutes  
**Prerequisites:** AWS account, PostgreSQL client, basic terminal knowledge

---

## 📋 Pre-Flight Checklist

Before you begin, ensure you have:

- [ ] AWS account with RDS access
- [ ] PostgreSQL client installed (`psql`)
- [ ] AWS CLI configured (optional)
- [ ] This repository cloned locally
- [ ] RDS endpoint and credentials ready

---

## ⚡ Database Strategy

We'll create both `poultryco_test` (testing) and `poultryco` (production) databases on the same RDS instance:

- **poultryco_test** - For testing schema, queries, and development
- **poultryco** - For production data

This approach:
- ✅ No local PostgreSQL installation needed
- ✅ Test on actual AWS infrastructure
- ✅ Same environment for testing and production
- ✅ Easy to switch between databases

---

## 🌐 AWS RDS Deployment

### Step 1: Create RDS Instance (10 minutes)

**Via AWS Console:**

1. Go to RDS → Create database
2. **Engine options:**
   - Engine type: PostgreSQL
   - Engine version: **PostgreSQL 17.5-R1** (or latest 17.x)
3. Templates: Production (or Dev/Test for staging)
4. Settings:
   - DB instance identifier: `poultryco-db`
   - Master username: `postgres`
   - Master password: (generate strong password - save it!)
5. Instance configuration:
   - Instance class: `db.t3.medium` (2 vCPU, 4 GB RAM)
   - For production later: `db.t3.large` or higher
6. Storage:
   - Allocated: 100 GB
   - Storage type: GP3 (General Purpose SSD)
   - Enable storage autoscaling: Yes
   - Maximum storage threshold: 500 GB
7. Connectivity:
   - VPC: Default (or your custom VPC)
   - **Public access: Yes** (for development access)
   - VPC security group: Create new → `poultryco-db-sg`
8. Additional configuration:
   - Initial database name: `postgres` (we'll create our databases manually)
   - Backup retention: 7 days
   - Enable deletion protection: No (for testing), Yes (for production later)
9. Create database

**Wait for status: Available (~10 minutes)**

**Note:** We'll create both `poultryco_test` and `poultryco` databases on this instance.

### Step 2: Configure Security Group (2 minutes)

1. Go to EC2 → Security Groups
2. Find the RDS security group (created in Step 1)
3. Edit inbound rules:
   - Type: PostgreSQL
   - Protocol: TCP
   - Port: 5432
   - Source: Your IP (for testing) or VPC CIDR (for production)
4. Save rules

### Step 3: Get Connection Details (1 minute)

1. Go to RDS → Databases → Your instance
2. Copy the **Endpoint** (e.g., `poultryco-staging.abc123.us-east-1.rds.amazonaws.com`)
3. Note the **Port** (default: 5432)
4. Note the **Master username** (default: `postgres`)
5. Have your **Master password** ready

### Step 4: Test Connection & Create Databases (3 minutes)

```bash
# Set environment variables for convenience
export RDS_ENDPOINT="your-rds-instance.region.rds.amazonaws.com"
export RDS_PASSWORD="your-master-password"

# Test connection
psql -h $RDS_ENDPOINT -U postgres -d postgres

# If successful, you'll see:
# psql (17.5)
# Type "help" for help.
# postgres=>
```

**Create both databases:**

```sql
-- Create test database
CREATE DATABASE poultryco_test;

-- Create production database
CREATE DATABASE poultryco;

-- Verify
\l

-- You should see both databases listed
-- Exit
\q
```

**Troubleshooting:**
- Connection timeout? Check security group allows your IP
- Authentication failed? Check password is correct
- Can't connect? Ensure Public access = Yes in RDS settings

### Step 5: Deploy Schema to Test Database (5 minutes)

**First, deploy to test database to verify everything works:**

```bash
# 1. Navigate to database directory
cd /Users/janagaran/Programs/poultryco/aws/database

# 2. Environment variables should already be set from Step 4
# If not:
# export RDS_ENDPOINT="your-rds-instance.region.rds.amazonaws.com"
# export RDS_PASSWORD="your-master-password"

# 3. Execute schema on TEST database
./scripts/run-schema.sh $RDS_ENDPOINT postgres $RDS_PASSWORD poultryco_test

# You'll see output like:
# Starting schema execution for database: poultryco_test on your-rds-instance...
# Executing: 00_extensions.sql...
# Successfully executed 00_extensions.sql.
# Executing: 01_core_and_ref.sql...
# Successfully executed 01_core_and_ref.sql.
# ...
# All schema files executed successfully!
```

**Expected Duration:** 2-3 minutes

**If successful, deploy to production database:**

```bash
# Execute schema on PRODUCTION database
./scripts/run-schema.sh $RDS_ENDPOINT postgres $RDS_PASSWORD poultryco

# Same output, but for poultryco database
```

### Step 6: Load Seed Data (2 minutes)

**Load seed data to both databases:**

```bash
# Load to TEST database
psql -h $RDS_ENDPOINT -U postgres -d poultryco_test -f seeds/01_reference_data.sql

# You'll see:
# INSERT 0 3
# INSERT 0 32
# INSERT 0 14
# ...

# Load to PRODUCTION database
psql -h $RDS_ENDPOINT -U postgres -d poultryco -f seeds/01_reference_data.sql

# Same output
```

### Step 7: Verify Deployment (3 minutes)

**Verify TEST database:**

```bash
# Connect to TEST database
psql -h $RDS_ENDPOINT -U postgres -d poultryco_test

# Check tables
\dt
# Expected: ~120 tables

# Check functions
\df
# Expected: 15+ functions

# Check materialized views
\dm
# Expected: 5 views

# Check sample data
SELECT COUNT(*) FROM profiles;
# Expected: 0 (no profiles yet)

SELECT COUNT(*) FROM ref_states;
# Expected: 32 (Indian states)

SELECT COUNT(*) FROM ref_roles;
# Expected: 14 (user roles)

SELECT * FROM adm_system_settings WHERE category = 'general';
# Expected: Platform name, tagline, version, etc.

# Exit
\q
```

**Verify PRODUCTION database:**

```bash
# Connect to PRODUCTION database
psql -h $RDS_ENDPOINT -U postgres -d poultryco

# Run same verification queries
\dt
\df
\dm
SELECT COUNT(*) FROM ref_states;
SELECT COUNT(*) FROM ref_roles;

# Exit
\q
```

**Both databases should have identical schema and seed data.**

---

## ✅ Verification Checklist

After deployment, verify for **both databases** (`poultryco_test` and `poultryco`):

- [ ] RDS instance running PostgreSQL 17.5
- [ ] Both databases created
- [ ] All tables created (~120) in both databases
- [ ] All functions created (15+) in both databases
- [ ] All materialized views created (5) in both databases
- [ ] All indexes created (200+) in both databases
- [ ] Seed data loaded (32 states, 14 roles, etc.) in both databases
- [ ] No errors in execution log
- [ ] Can connect via pgAdmin to both databases
- [ ] Can query tables successfully in both databases

---

## 🔧 Common Issues & Solutions

### Issue 1: Connection Timeout

**Symptom:** `could not connect to server: Connection timed out`

**Solution:**
1. Check security group allows your IP
2. Check RDS is in public subnet (if accessing from internet)
3. Check VPC route tables

### Issue 2: Authentication Failed

**Symptom:** `FATAL: password authentication failed`

**Solution:**
1. Verify password is correct
2. Check username is `postgres`
3. Try resetting master password in RDS console

### Issue 3: Database Does Not Exist

**Symptom:** `FATAL: database "poultryco" does not exist`

**Solution:**
Create databases manually (see Step 4):
```bash
psql -h $RDS_ENDPOINT -U postgres -d postgres -c "CREATE DATABASE poultryco_test;"
psql -h $RDS_ENDPOINT -U postgres -d postgres -c "CREATE DATABASE poultryco;"
```

### Issue 4: Permission Denied

**Symptom:** `ERROR: permission denied to create extension`

**Solution:**
1. Ensure you're using master user (`postgres`)
2. Extensions require superuser privileges

### Issue 5: Schema Execution Fails

**Symptom:** Script stops with error

**Solution:**
1. Check error message
2. Fix issue in SQL file if needed
3. Drop and recreate database:
   ```bash
   # For test database
   psql -h $RDS_ENDPOINT -U postgres -d postgres -c "DROP DATABASE poultryco_test;"
   psql -h $RDS_ENDPOINT -U postgres -d postgres -c "CREATE DATABASE poultryco_test;"
   
   # For production database
   psql -h $RDS_ENDPOINT -U postgres -d postgres -c "DROP DATABASE poultryco;"
   psql -h $RDS_ENDPOINT -U postgres -d postgres -c "CREATE DATABASE poultryco;"
   ```
4. Re-run schema script

---

## 🎯 Next Steps After Deployment

### 1. Configure Cognito (30 minutes)

```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name poultryco-users \
  --auto-verified-attributes email \
  --schema Name=email,Required=true

# Configure Lambda triggers (post-confirmation)
# To sync Cognito users to RDS profiles table
```

### 2. Set Up S3 Buckets (10 minutes)

```bash
# Create buckets
aws s3 mb s3://poultryco-media-staging
aws s3 mb s3://poultryco-media-production

# Configure CORS
aws s3api put-bucket-cors --bucket poultryco-media-staging --cors-configuration file://cors.json
```

### 3. Configure SES (10 minutes)

```bash
# Verify domain
aws ses verify-domain-identity --domain poultryco.in

# Create email templates
aws ses create-template --cli-input-json file://welcome-email-template.json
```

### 4. Update Application Code (1-2 hours)

```bash
# Generate Drizzle schema
npm run db:generate

# Update environment variables
# For development/testing:
# DATABASE_URL=postgresql://postgres:PASSWORD@RDS_ENDPOINT:5432/poultryco_test

# For production:
# DATABASE_URL=postgresql://postgres:PASSWORD@RDS_ENDPOINT:5432/poultryco

# Other AWS services:
# COGNITO_USER_POOL_ID=...
# COGNITO_CLIENT_ID=...
# AWS_REGION=us-east-1
# S3_BUCKET=poultryco-media-staging

# Test connection
npm run db:test
```

### 5. Migrate Data from Supabase (2-4 hours)

```bash
# Export from Supabase
npm run migrate:export

# Transform data
npm run migrate:transform

# Import to RDS
npm run migrate:import

# Verify
npm run migrate:verify
```

---

## 📊 Monitoring & Maintenance

### Daily

- [ ] Check CloudWatch metrics (CPU, memory, connections)
- [ ] Check error logs
- [ ] Monitor slow queries

### Weekly

- [ ] Refresh materialized views
  ```sql
  SELECT refresh_all_materialized_views();
  ```
- [ ] Run cleanup functions
  ```sql
  SELECT cleanup_old_activity_logs();
  SELECT cleanup_old_profile_views();
  ```
- [ ] Check backup status

### Monthly

- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Test backup restore
- [ ] Review and adjust RDS instance size

---

## 🔒 Security Best Practices

### Immediate

1. **Restrict Security Group (After Development)**
   - Keep public access during development for pgAdmin/testing
   - For production: Remove public access and allow only application servers
   - Whitelist specific IPs for admin access

2. **Use Secrets Manager**
   ```bash
   aws secretsmanager create-secret \
     --name poultryco/rds/credentials \
     --secret-string '{"username":"postgres","password":"YOUR_PASSWORD"}'
   ```

3. **Enable SSL**
   ```bash
   # Download RDS CA certificate
   wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
   
   # Connect with SSL
   psql "host=$RDS_ENDPOINT dbname=poultryco user=postgres sslmode=require sslrootcert=global-bundle.pem"
   ```

### Short-term

1. **Create Read-Only User**
   ```sql
   CREATE USER readonly WITH PASSWORD 'strong_password';
   GRANT CONNECT ON DATABASE poultryco TO readonly;
   GRANT USAGE ON SCHEMA public TO readonly;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
   ```

2. **Create Application User**
   ```sql
   CREATE USER app_user WITH PASSWORD 'strong_password';
   GRANT CONNECT ON DATABASE poultryco TO app_user;
   GRANT USAGE ON SCHEMA public TO app_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
   GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
   ```

3. **Enable Audit Logging**
   - Enable in RDS parameter group
   - Log to CloudWatch

---

## 📞 Support & Resources

### Documentation

- [README.md](./README.md) - Comprehensive setup guide
- [INDEX.md](./schema/INDEX.md) - Schema reference
- [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) - Progress tracking
- [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - Detailed summary

### AWS Resources

- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)

### PostgreSQL Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin](https://www.pgadmin.org/) - GUI tool

---

## 🎉 Success!

If you've completed all steps, you now have:

- ✅ AWS RDS PostgreSQL 17.5 instance running
- ✅ Two databases: `poultryco_test` (testing) and `poultryco` (production)
- ✅ Complete database schema deployed to both
- ✅ Reference data loaded to both
- ✅ Public access enabled for development
- ✅ Ready for application integration
- ✅ Ready for data migration

**Development Workflow:**
1. Test queries and changes on `poultryco_test`
2. Once verified, apply to `poultryco`
3. Use `poultryco_test` for development environment
4. Use `poultryco` for production environment

**Next:** Configure Cognito, update application code, and migrate data!

---

**Questions?** Review the documentation or check the troubleshooting section.

**Good luck! 🚀**

