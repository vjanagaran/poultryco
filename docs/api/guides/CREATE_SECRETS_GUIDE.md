# Creating AWS Secrets Manager Secrets

Your ECS task requires secrets from AWS Secrets Manager. Currently, no secrets are configured.

---

## Quick Setup (Interactive Script)

Run the interactive script to create all secrets:

```bash
cd apps/api
./create-secrets.sh
```

The script will:
- Prompt you for each value
- Generate random JWT secrets automatically
- Create or update all required secrets
- Use sensible defaults where possible

---

## Manual Setup (AWS Console)

If you prefer to create secrets manually in the AWS Console:

### 1. Go to AWS Secrets Manager
- Navigate to: https://console.aws.amazon.com/secretsmanager/
- Select region: **Asia Pacific (Mumbai) - ap-south-1**
- Click **"Store a new secret"**

### 2. Create Each Secret

For each secret below, follow these steps:
1. Click **"Store a new secret"**
2. Select **"Other type of secret"**
3. Choose **"Plaintext"** tab
4. Enter the secret value
5. Click **"Next"**
6. **Secret name:** `poultryco/secret-name` (use names from list below)
7. Click **"Next"** → **"Store"**

---

## Required Secrets

### 1. Database URL
- **Name:** `poultryco/database-url`
- **Value:** `postgresql://username:password@host:5432/dbname?sslmode=require`
- **Example:** `postgresql://admin:mypass@db.poultryco.net:5432/poultryco?sslmode=require`

### 2. JWT Secret
- **Name:** `poultryco/jwt-secret`
- **Value:** Random 64-character hex string
- **Generate:** `openssl rand -hex 32`

### 3. Admin JWT Secret
- **Name:** `poultryco/admin-jwt-secret`
- **Value:** Random 64-character hex string (different from JWT secret)
- **Generate:** `openssl rand -hex 32`

### 4. SES SMTP Host
- **Name:** `poultryco/ses-smtp-host`
- **Value:** `email-smtp.ap-south-1.amazonaws.com`

### 5. SES SMTP Username
- **Name:** `poultryco/ses-smtp-username`
- **Value:** Your AWS SES SMTP username (from SES console)

### 6. SES SMTP Password
- **Name:** `poultryco/ses-smtp-password`
- **Value:** Your AWS SES SMTP password (from SES console)

### 7. SES Sender Email
- **Name:** `poultryco/ses-sender-email`
- **Value:** `noreply@poultryco.net` (or your verified sender email)

### 8. AWS Region
- **Name:** `poultryco/aws-region`
- **Value:** `ap-south-1`

### 9. S3 Bucket Name
- **Name:** `poultryco/s3-bucket-name`
- **Value:** `poultryco-cdn` (or your S3 bucket name)

### 10. AWS Access Key ID
- **Name:** `poultryco/aws-access-key-id`
- **Value:** Your AWS access key ID (for S3 access)

### 11. AWS Secret Access Key
- **Name:** `poultryco/aws-secret-access-key`
- **Value:** Your AWS secret access key (for S3 access)

### 12. Cognito User Pool ID (Optional)
- **Name:** `poultryco/cognito-user-pool-id`
- **Value:** Your Cognito User Pool ID (if using Cognito)

### 13. Cognito Client ID (Optional)
- **Name:** `poultryco/cognito-client-id`
- **Value:** Your Cognito Client ID (if using Cognito)

---

## Manual Setup (AWS CLI)

If you prefer using AWS CLI:

```bash
# Database URL
aws secretsmanager create-secret \
  --name poultryco/database-url \
  --secret-string "postgresql://user:pass@host:5432/dbname?sslmode=require" \
  --region ap-south-1

# JWT Secret (generate random)
aws secretsmanager create-secret \
  --name poultryco/jwt-secret \
  --secret-string "$(openssl rand -hex 32)" \
  --region ap-south-1

# Admin JWT Secret (generate random)
aws secretsmanager create-secret \
  --name poultryco/admin-jwt-secret \
  --secret-string "$(openssl rand -hex 32)" \
  --region ap-south-1

# SES SMTP Host
aws secretsmanager create-secret \
  --name poultryco/ses-smtp-host \
  --secret-string "email-smtp.ap-south-1.amazonaws.com" \
  --region ap-south-1

# SES SMTP Username
aws secretsmanager create-secret \
  --name poultryco/ses-smtp-username \
  --secret-string "YOUR_SES_SMTP_USERNAME" \
  --region ap-south-1

# SES SMTP Password
aws secretsmanager create-secret \
  --name poultryco/ses-smtp-password \
  --secret-string "YOUR_SES_SMTP_PASSWORD" \
  --region ap-south-1

# SES Sender Email
aws secretsmanager create-secret \
  --name poultryco/ses-sender-email \
  --secret-string "noreply@poultryco.net" \
  --region ap-south-1

# AWS Region
aws secretsmanager create-secret \
  --name poultryco/aws-region \
  --secret-string "ap-south-1" \
  --region ap-south-1

# S3 Bucket Name
aws secretsmanager create-secret \
  --name poultryco/s3-bucket-name \
  --secret-string "poultryco-cdn" \
  --region ap-south-1

# AWS Access Key ID
aws secretsmanager create-secret \
  --name poultryco/aws-access-key-id \
  --secret-string "YOUR_ACCESS_KEY_ID" \
  --region ap-south-1

# AWS Secret Access Key
aws secretsmanager create-secret \
  --name poultryco/aws-secret-access-key \
  --secret-string "YOUR_SECRET_ACCESS_KEY" \
  --region ap-south-1

# Cognito User Pool ID (optional)
aws secretsmanager create-secret \
  --name poultryco/cognito-user-pool-id \
  --secret-string "YOUR_COGNITO_USER_POOL_ID" \
  --region ap-south-1

# Cognito Client ID (optional)
aws secretsmanager create-secret \
  --name poultryco/cognito-client-id \
  --secret-string "YOUR_COGNITO_CLIENT_ID" \
  --region ap-south-1
```

---

## Verify Secrets Created

After creating secrets, verify:

```bash
aws secretsmanager list-secrets \
  --region ap-south-1 \
  --query 'SecretList[?starts_with(Name, `poultryco/`)].Name' \
  --output table
```

You should see all 13 secrets listed.

---

## Update Existing Secrets

To update a secret later:

```bash
aws secretsmanager update-secret \
  --secret-id poultryco/secret-name \
  --secret-string "new-value" \
  --region ap-south-1
```

Or use AWS Console:
1. Go to Secrets Manager
2. Click on the secret name
3. Click **"Retrieve secret value"** → **"Edit"**
4. Update the value
5. Click **"Save"**

---

## Important Notes

1. **Database URL:** Must be a valid PostgreSQL connection string
2. **JWT Secrets:** Should be random, secure strings (64+ characters)
3. **SES Credentials:** Get these from AWS SES Console → SMTP Settings
4. **AWS Credentials:** Use IAM user credentials with S3 access (not root keys)
5. **Cognito:** Only needed if using AWS Cognito for authentication

---

## After Creating Secrets

Once all secrets are created:

1. **Update ECS service** to pick up secrets:
   ```bash
   cd apps/api
   ./deploy-with-existing-resources.sh
   ```

2. **Monitor task status:**
   ```bash
   aws ecs describe-services \
     --cluster poultryco-cluster \
     --services poultryco-api \
     --region ap-south-1
   ```

3. **Check task logs** if issues persist:
   ```bash
   aws logs tail /ecs/poultryco-api --follow --region ap-south-1
   ```

---

## Troubleshooting

### Error: "Secret not found"
- Verify secret name matches exactly: `poultryco/secret-name`
- Check region is `ap-south-1`
- Ensure secret ARN in task-definition.json matches

### Error: "Access denied"
- Ensure ECS task execution role has `secretsmanager:GetSecretValue` permission
- Check IAM role: `ecsTaskExecutionRole`

### Error: "Connection timeout"
- This is the network issue we fixed earlier
- Ensure `assignPublicIp=ENABLED` in network configuration

