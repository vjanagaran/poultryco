# EC2 SSH Setup & Troubleshooting

## SSH Connection Issue

If you're getting "Permission denied (publickey)", check the following:

### 1. Verify SSH Key Permissions
```bash
chmod 400 /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem
```

### 2. Verify Key is Associated with EC2 Instance

In AWS Console:
1. Go to EC2 → Instances
2. Select instance `i-0fe2fe8b26041a4f9`
3. Check "Key pair name" in instance details
4. Ensure it matches `maaya`

### 3. Test SSH Connection Manually
```bash
ssh -i /Users/vjanagaran/Drive/AWS/Certificates/maaya.pem ec2-user@15.206.247.73
```

### 4. If Key Doesn't Match

**Option A: Use the correct key**
- Find the key pair name in EC2 console
- Update `SSH_KEY` path in `deploy-ec2.sh`

**Option B: Add your public key to the instance**
```bash
# Generate SSH key pair if needed
ssh-keygen -t rsa -b 4096 -f ~/.ssh/poultryco-ec2

# Copy public key to EC2 (requires existing access or AWS Systems Manager)
# Or use AWS Systems Manager Session Manager
```

### 5. Alternative: Use AWS Systems Manager Session Manager

If SSH key doesn't work, use Session Manager:

```bash
# Install Session Manager plugin
# https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html

# Connect via Session Manager
aws ssm start-session --target i-0fe2fe8b26041a4f9 --region ap-south-1
```

### 6. Verify Security Group

Ensure security group allows SSH (port 22) from your IP:
- Inbound rule: SSH (22) from your IP address

## Once SSH Works

Run the deployment:
```bash
./deploy-ec2.sh
```

