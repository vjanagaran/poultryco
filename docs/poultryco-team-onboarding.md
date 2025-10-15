# PoultryCo - New Developer Onboarding Guide
**Quick Start Guide for Joining the Development Team**

Version: 1.0  
Last Updated: October 15, 2025  
Estimated Setup Time: 30-45 minutes

---

## 📋 What You'll Need

Before starting, make sure you have:
- [ ] GitHub account with access to the repository
- [ ] Supabase connection details (provided by team lead)
- [ ] Stable internet connection
- [ ] macOS, Windows, or Linux computer
- [ ] 10GB free disk space

---

## 🚀 Quick Start (5 Steps)

```bash
1. Install prerequisites (Node.js, etc.)
2. Clone repository and switch to dev branch
3. Copy .env.sample to .env.local and add credentials
4. Install dependencies
5. Start development server
```

**Note:** We use a simplified workflow - everyone works on the `dev` branch collaboratively. Communicate in WhatsApp group before pushing significant changes.

**Communication Channels:**
- **WhatsApp Group**: https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8 (Join immediately)
- **GitHub Issues**: https://github.com/vjanagaran/poultryco/issues (For task tracking)

---

## Step 1: Install Prerequisites

### 1.1 Install Node.js (v20 LTS)

**macOS (recommended: using nvm):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
npm --version
```

**Windows:**
```bash
# Download Node.js installer from:
https://nodejs.org/en/download/

# Choose v20.x.x LTS version
# Run installer and follow prompts

# Verify (in Command Prompt or PowerShell)
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify
node --version
npm --version
```

### 1.2 Install Git

**macOS:**
```bash
# Using Homebrew
brew install git

# Or download from: https://git-scm.com/download/mac
```

**Windows:**
```bash
# Download Git installer from:
https://git-scm.com/download/win

# Run installer with default settings
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install git
```

**Configure Git:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 1.3 Install Cursor IDE (Recommended)

```bash
# Download from:
https://cursor.sh/

# Install for your operating system
# Launch and sign in
```

**Alternative:** You can use VS Code, but Cursor has better AI integration.

### 1.4 Install Expo CLI

```bash
# Install globally
npm install -g expo-cli

# Verify
expo --version
```

### 1.5 Install Expo Go App (for testing)

- **iOS**: Download from App Store
- **Android**: Download from Play Store

---

## Step 2: Clone the Repository

### 2.1 Get Repository Access

Contact your team lead to get added as a collaborator:
```
Repository: https://github.com/vjanagaran/poultryco.git
```

### 2.2 Clone the Project

```bash
# Navigate to where you want the project
cd ~
mkdir Projects  # or your preferred location
cd Projects

# Clone the repository
git clone https://github.com/vjanagaran/poultryco.git

# Navigate into project
cd poultryco

# Verify structure
ls -la
```

You should see:
```
poultryco/
├── .claude-code/
├── mobile/
├── supabase/
└── README.md
```

### 2.3 Switch to Dev Branch

```bash
# Switch to the development branch
git checkout dev

# Verify you're on the correct branch
git branch
# Should show: * dev

# Get latest changes
git pull origin dev
```

### 2.4 Navigate to Mobile Directory

```bash
cd mobile
ls -la
```

You should see:
```
mobile/
├── src/
├── assets/
├── .env.sample         # Template for environment variables (in git)
├── .env.local          # Your local environment (not in git)
├── .env.production     # Production environment (not in git)
├── app.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Step 3: Setup Environment Variables

### 3.1 Get Supabase Credentials

**Ask your team lead for:**
1. Supabase URL
2. Supabase Anon Key
3. (Optional) Database credentials

### 3.2 Create .env.local File

```bash
cd ~/Projects/poultryco/mobile

# Copy the sample file to create your local environment file
cp .env.sample .env.local

# Open in editor to add actual values
code .env.local  # or nano .env.local
```

### 3.3 Add Environment Variables

The `.env.sample` file already has the structure. You just need to replace the placeholder values:

**Ask your team lead for:**
- Supabase Anon Key (the long JWT token)

**Update these values in .env.local:**
```bash
# Supabase Configuration
SUPABASE_URL=https://ceknyafzwqlchzxipsqx.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here  # ← Replace this with actual key

# Database Configuration (for reference only)
DB_HOST=db.ceknyafzwqlchzxipsqx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres

# App Configuration
APP_ENV=development
APP_NAME=PoultryCo
```

**⚠️ IMPORTANT:**
- Never commit `.env.local` to Git
- Don't share these credentials publicly
- If you accidentally commit them, inform team lead immediately

### 3.4 Verify .gitignore

Check that `.env.local` is in `.gitignore` (but `.env.sample` should NOT be):

```bash
cat .gitignore | grep .env
```

Should show:
```
.env.local
.env.production
.env*.local
```

**Note:** `.env.sample` is committed to the repository as a template. Only `.env.local` with actual credentials should be ignored.

---

## Step 4: Install Dependencies

### 4.1 Install All Packages

```bash
cd ~/Projects/poultryco/mobile

# Install dependencies
npm install

# This will take 2-5 minutes
# You should see progress for ~50-100 packages
```

### 4.2 Verify Installation

```bash
# Check if node_modules folder exists
ls -la node_modules

# Verify key packages are installed
npm list @supabase/supabase-js
npm list react-native
npm list expo
```

All should show version numbers without errors.

---

## Step 5: Start Development Server

### 5.1 Start Expo Development Server

```bash
cd ~/Projects/poultryco/mobile

# Start the development server
npm start

# Or with cache clearing (if needed)
npm start -- --clear
```

**You should see:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### 5.2 Test on Your Device

**Using Expo Go App:**

1. Open Expo Go app on your phone
2. Scan the QR code shown in terminal
3. App should load on your device

**OR Using Simulator:**

- **iOS**: Press `i` in terminal (macOS only, requires Xcode)
- **Android**: Press `a` in terminal (requires Android Studio)
- **Web**: Press `w` in terminal

### 5.3 Verify Supabase Connection

The app should show a connection status on launch. If you see "✅ Connected to Supabase", you're good to go!

---

## 📁 Understanding the Project Structure

```
poultryco/
├── .claude-code/          # AI development context
│   └── context.md         # Project overview for AI assistance
│
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── common/    # Buttons, inputs, cards
│   │   │   ├── layout/    # Headers, footers, containers
│   │   │   └── features/  # Feature-specific components
│   │   │
│   │   ├── screens/       # App screens
│   │   │   ├── auth/      # Login, register, onboarding
│   │   │   ├── home/      # Home feed, dashboard
│   │   │   ├── profile/   # User profiles
│   │   │   └── community/ # Groups, discussions
│   │   │
│   │   ├── navigation/    # React Navigation setup
│   │   │
│   │   ├── services/      # External services
│   │   │   └── supabase/  # Supabase queries and mutations
│   │   │       ├── auth.ts
│   │   │       ├── profiles.ts
│   │   │       └── testConnection.ts
│   │   │
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useProfile.ts
│   │   │
│   │   ├── store/         # Zustand state management
│   │   │   └── authStore.ts
│   │   │
│   │   ├── types/         # TypeScript type definitions
│   │   │   ├── database.ts
│   │   │   └── models.ts
│   │   │
│   │   ├── utils/         # Helper functions
│   │   │   ├── validation.ts
│   │   │   └── formatting.ts
│   │   │
│   │   └── config/        # App configuration
│   │       ├── supabase.ts
│   │       └── constants.ts
│   │
│   ├── assets/            # Images, fonts, etc.
│   ├── .env.sample        # Environment template (committed to git)
│   ├── .env.local         # Your credentials (NOT in git)
│   ├── app.json           # Expo configuration
│   ├── package.json       # Dependencies
│   ├── tsconfig.json      # TypeScript configuration
│   └── tailwind.config.js # Styling configuration
│
├── supabase/              # Supabase migrations (reference only)
│   └── migrations/        # Database schema changes
│
└── docs/                  # Project documentation
    └── brand-guidelines/  # Brand assets and guidelines
```

**Note:** Currently, all development happens on the `dev` branch. The team works collaboratively without feature branches.

---

## 💻 Development Workflow

### Daily Workflow

**1. Start Your Day:**
```bash
cd ~/Projects/poultryco/mobile

# Get latest changes from dev branch
git checkout dev
git pull origin dev

# Start development server
npm start
```

**2. Make Changes:**
- Edit files in `src/` directory
- Test on your device/simulator
- App auto-reloads on save

**3. Commit Your Work:**
```bash
# Check what changed
git status

# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add user profile component"

# IMPORTANT: Before pushing, pull latest changes to avoid conflicts
git pull origin dev

# If no conflicts, push to dev branch
git push origin dev
```

**💡 Best Practice:** For large changes, announce in WhatsApp group before pushing:
```
"Pushing updates to authentication flow - please pull latest changes"
```

**Note:** Currently, the team works directly on the `dev` branch. Communicate in WhatsApp group before pushing significant changes to coordinate with other developers.

### Git Branch Strategy

```
main    # Production-ready code
  └── dev  # Development branch (everyone works here)
```

**Current Workflow:**
- All development happens on `dev` branch
- Keep commits small and focused
- Communicate with team before pushing large changes
- Pull latest changes frequently to avoid conflicts

### Commit Message Format

```bash
# Format: <type>: <description>

feat: add new feature
fix: bug fix
docs: documentation changes
style: code formatting
refactor: code restructuring
test: adding tests
chore: maintenance tasks

# Examples:
git commit -m "feat: implement user login screen"
git commit -m "fix: resolve supabase connection timeout"
git commit -m "docs: update component documentation"
```

---

## 🎨 Using Cursor AI for Development

### Cursor Composer (Multi-file editing)
```
Keyboard: Cmd/Ctrl + K

Example prompts:
- "Create a UserProfileCard component with avatar, name, and role badges"
- "Add authentication flow with login and register screens"
- "Refactor this component to use TypeScript strict mode"
```

### Cursor Chat (Ask questions)
```
Keyboard: Cmd/Ctrl + L

Example questions:
- "How do I fetch user profile from Supabase?"
- "What's the best way to handle authentication state?"
- "Explain this code and suggest improvements"
```

### Inline AI (Quick edits)
```
Keyboard: Cmd/Ctrl + I

Use for:
- Quick fixes
- Code generation in place
- Refactoring functions
```

---

## 🗄️ Working with Supabase

### Database Changes

**Important:** We manage the database directly on Supabase Dashboard, NOT through migrations.

**To make database changes:**

1. Go to Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/ceknyafzwqlchzxipsqx
   ```

2. Navigate to:
   - **Table Editor**: Create/modify tables
   - **SQL Editor**: Run custom queries
   - **Database > Roles**: Manage RLS policies

3. Test your changes in development environment

4. Document changes in team chat/Notion

### Common Database Tasks

**Query data:**
```typescript
// In your React component
import { supabase } from '@/config/supabase';

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

**Insert data:**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .insert({
    full_name: 'John Doe',
    role: 'farmer'
  });
```

**Update data:**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({ bio: 'Updated bio' })
  .eq('id', userId);
```

**Access Supabase Dashboard:**
- URL: `https://supabase.com/dashboard`
- Login with team credentials
- Select PoultryCo project

---

## 🧪 Testing Your Changes

### Manual Testing

**Before committing:**

1. **Test on Real Device:**
   ```bash
   npm start
   # Scan QR code with Expo Go
   ```

2. **Test Different Scenarios:**
   - Fresh app launch
   - Login/logout flow
   - Navigation between screens
   - Network offline/online

3. **Check Console for Errors:**
   - Look for red error messages
   - Warning messages (yellow) should be addressed
   - No console.log statements in production code

### Test Checklist

- [ ] App launches without crashes
- [ ] No TypeScript errors
- [ ] No console errors in Metro bundler
- [ ] Feature works as expected
- [ ] Tested on both iOS and Android (if possible)
- [ ] Works with slow/no internet connection
- [ ] No obvious performance issues

---

## 🔧 Common Issues & Solutions

### Issue 1: Metro Bundler Won't Start

```bash
# Clear cache and restart
npm start -- --clear

# OR
rm -rf node_modules
npm install
npm start
```

### Issue 2: Supabase Connection Fails

**Check:**
1. Is `.env.local` file present?
2. Are credentials correct?
3. Is Supabase URL reachable?

```bash
# Test connection manually
node -e "console.log(process.env.SUPABASE_URL)"

# If undefined, environment variables not loading
```

### Issue 3: TypeScript Errors

```bash
# Check for errors
npx tsc --noEmit

# Most common: update types
npm install --save-dev @types/react @types/react-native
```

### Issue 4: "Unable to Resolve Module"

```bash
# Clear watchman cache (macOS)
watchman watch-del-all

# Clear Metro cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue 5: Expo Go Connection Issues

**Solutions:**
- Ensure phone and computer on same WiFi
- Restart Expo Go app
- Try connecting via tunnel: `npm start -- --tunnel`
- Check firewall settings

### Issue 6: Git Conflicts

```bash
# Update your branch with latest changes
git pull origin dev

# If conflicts occur, they'll be marked in files
# Open conflicted files and resolve manually
# Look for markers: <<<<<<< HEAD, =======, >>>>>>>

# After resolving conflicts:
git add .
git commit -m "fix: resolve merge conflicts"
git push origin dev
```

---

## 📚 Key Resources

### Documentation
- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Supabase Docs**: https://supabase.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

### PoultryCo Specific
- **GitHub Repository**: https://github.com/vjanagaran/poultryco
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ceknyafzwqlchzxipsqx
- **Brand Guidelines**: `docs/brand-guidelines/`

### Team Communication
- **WhatsApp Group**: https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8
  - Daily standup coordination
  - Quick questions and updates
  - Announcing code changes before pushing
- **GitHub Issues**: https://github.com/vjanagaran/poultryco/issues
  - Bug reports
  - Feature requests
  - Task tracking and assignment

---

## 🎯 First Day Tasks

### Task 1: Setup Complete
- [ ] All prerequisites installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] App running on device/simulator
- [ ] Supabase connection working

### Task 2: Understand Codebase
- [ ] Review project structure
- [ ] Read key files:
  - `src/config/supabase.ts`
  - `src/navigation/`
  - `src/screens/`
- [ ] Review brand guidelines
- [ ] Understand database schema (Supabase Dashboard)

### Task 3: Make First Change
- [ ] Switch to dev branch: `git checkout dev`
- [ ] Pull latest changes: `git pull origin dev`
- [ ] Make a small change (e.g., update text)
- [ ] Commit and push to dev
- [ ] Announce your changes in WhatsApp group

### Task 4: Team Integration
- [ ] Join WhatsApp group: https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8
- [ ] Introduce yourself in WhatsApp
- [ ] Review GitHub Issues: https://github.com/vjanagaran/poultryco/issues
- [ ] Schedule 1:1 with team lead (via WhatsApp)
- [ ] Join daily standup (check WhatsApp for time)
- [ ] Ask questions!

---

## 🆘 Getting Help

### When Stuck:

**1. Check Documentation:**
- This guide
- Official docs (Expo, React Native, Supabase)
- Project README files

**2. Use Cursor AI:**
```
Cmd/Ctrl + L: Ask Claude for help
```

**3. Ask Team:**
- **WhatsApp group** for quick questions: https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8
- **GitHub Issues** for bugs and feature requests: https://github.com/vjanagaran/poultryco/issues
- Schedule call for complex issues (coordinate via WhatsApp)

**4. Common Help Requests:**

```bash
# "I can't install dependencies"
→ Share error message in WhatsApp group
→ Check Node.js version: node --version

# "App won't start"
→ Try: npm start -- --clear
→ Share Metro bundler logs in WhatsApp

# "Supabase connection fails"
→ Verify .env.local file exists
→ Check credentials with team lead

# "Git conflicts"
→ Ask in WhatsApp group for pair programming session
```

**5. Report Bugs/Issues:**
- Create a GitHub issue: https://github.com/vjanagaran/poultryco/issues/new
- Include:
  - Clear description
  - Steps to reproduce
  - Error messages/screenshots
  - Your environment (OS, Node version)
- Mention in WhatsApp group for urgent issues

---

## ✅ Onboarding Checklist

### Prerequisites
- [ ] Node.js v20 installed
- [ ] Git installed and configured
- [ ] Cursor IDE installed
- [ ] Expo CLI installed
- [ ] Expo Go app on phone

### Repository Setup
- [ ] GitHub access granted
- [ ] Repository cloned
- [ ] Switched to dev branch
- [ ] Commit message format clear

### Environment Setup
- [ ] Supabase credentials received
- [ ] .env.local file created
- [ ] Environment variables verified
- [ ] .gitignore checked

### Dependencies
- [ ] npm install completed
- [ ] No installation errors
- [ ] Key packages verified

### Development Server
- [ ] npm start works
- [ ] App loads on device/simulator
- [ ] Supabase connection successful
- [ ] No Metro bundler errors

### Knowledge Transfer
- [ ] Project structure understood
- [ ] Database schema reviewed
- [ ] Brand guidelines read
- [ ] Cursor AI features learned

### Team Integration
- [ ] WhatsApp group joined and introduction posted
- [ ] GitHub Issues reviewed
- [ ] Daily standup time confirmed
- [ ] Team lead 1:1 scheduled
- [ ] Communication channels understood

### First Contribution
- [ ] Changes committed to dev branch
- [ ] Changes pushed successfully
- [ ] Changes announced in WhatsApp group
- [ ] Changes tested by at least one other team member

---

## 🎉 Welcome to PoultryCo!

You're now ready to start contributing to PoultryCo - the platform that's transforming how the global poultry industry connects and collaborates!

### Our Mission
Building the digital backbone of the poultry industry, where every professional can grow together.

### Your Impact
Every line of code you write helps farmers, veterinarians, vendors, and researchers connect and succeed.

### Next Steps
1. Complete your onboarding checklist
2. Review your first assigned task
3. Join daily standup
4. Start coding!

---

**Questions?** Ask in the WhatsApp group or create a GitHub issue.

**WhatsApp Group**: https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8  
**GitHub Issues**: https://github.com/vjanagaran/poultryco/issues

**Let's build something amazing together! 🚀🐔**

---

*Last updated: October 15, 2025*  
*Maintained by: PoultryCo Development Team*  
*For updates: Check GitHub repository or WhatsApp group*