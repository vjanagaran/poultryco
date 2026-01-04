# 🐔 PoultryCo - Professional Networking for the Poultry Industry

**Mobile-First Professional Network | Connecting Poultry Professionals Globally**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status: Active Development](https://img.shields.io/badge/Status-Active%20Development-brightgreen)](https://github.com/vjanagaran/poultryco)

---

## 🌟 Overview

PoultryCo is a **mobile-first professional networking platform** designed specifically for the global poultry industry. We connect farmers, veterinarians, nutritionists, suppliers, consultants, and businesses to foster collaboration, knowledge sharing, and business growth.

### 🎯 Mission
Empower poultry professionals worldwide with the tools and network they need to succeed in a rapidly evolving industry.

### 🚀 Current Status
- ✅ **Web Application:** Live at [www.poultryco.net](https://www.poultryco.net)
- ✅ **Admin Portal:** Live at [admin.poultryco.net](https://admin.poultryco.net)
- 🚧 **Mobile App:** In active development (9-week MVP sprint)

---

## 📱 Platform Features

### 10 Core Modules (All Live on Web ✅)

1. **Authentication** - OTP-based (Email, SMS, WhatsApp)
2. **Profiles** - Personal, Business, Organization profiles
3. **Network** - Connections (2-way) & Following (1-way)
4. **Discover** - Find members, businesses, orgs, products, jobs, events
5. **Stream** - Social feed (posts, problems, expert Q&A, articles)
6. **Messages** - Real-time chat (1:1, groups, business leads)
7. **Resources** - Tools, calculators, market data, references
8. **Home** - Customizable dashboard with widgets
9. **Notifications** - Multi-channel alerts
10. **Settings** - Preferences, privacy, email controls

**See [MVP Complete Scope](docs/MVP_COMPLETE_SCOPE.md) for detailed feature descriptions**

### For Different Users

**Farmers:** Market data, calculators, expert connections, problem solving  
**Veterinarians:** Expert Q&A, case discussions, client management  
**Suppliers:** Product listings, business inquiries, market intelligence  
**Organizations:** Member management, events, announcements, resources

---

## 🛠️ Technology Stack

### Mobile App
- **Framework:** React Native with Expo (SDK 54)
- **Language:** TypeScript
- **State Management:** Zustand + React Query
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** React Navigation 7

### Web & Admin
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI (Admin), Custom components (Web)
- **Deployment:** EC2 + PM2

### Backend
- **API:** NestJS 10 (REST API with Socket.io)
- **Database:** PostgreSQL 18.1 (AWS RDS)
- **Authentication:** Custom OTP-based Auth (Email/SMS/WhatsApp)
- **Storage:** AWS S3 + CloudFront CDN
- **Real-time:** Socket.io

### DevOps
- **Monorepo:** Turborepo
- **Package Manager:** npm workspaces
- **CI/CD:** Manual deployment to EC2, Expo EAS (mobile)
- **Version Control:** Git + GitHub

---

## 📂 Project Structure

```
poultryco/
├── apps/
│   ├── mobile/          # React Native mobile app (React 19)
│   ├── web/             # Next.js marketing website (React 18)
│   └── admin/           # Next.js admin portal (React 18)
├── packages/
│   ├── design-system/   # Shared design tokens (colors, typography, spacing)
│   ├── types/           # Shared TypeScript types
│   ├── ui/              # Shared UI components
│   ├── utils/           # Shared utility functions
│   └── config/          # Shared configuration
├── aws/
│   └── database/
│       └── schema/      # PostgreSQL schema files
├── apps/
│   └── api/            # NestJS REST API
├── docs/
│   ├── sprints/         # Sprint plans and roadmaps
│   ├── strategy/        # Strategic decisions and status
│   ├── deployment/      # Deployment guides
│   ├── brand/           # Brand guidelines and assets
│   └── archive/         # Historical documentation
└── turbo.json           # Turborepo configuration
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js:** >= 20.0.0
- **npm:** >= 10.0.0
- **PostgreSQL 18.1:** AWS RDS or local instance
- **AWS Account:** For S3, SES, and RDS
- **Expo Account:** For mobile development (optional but recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vjanagaran/poultryco.git
   cd poultryco
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy example env files
   cp apps/web/.env.local.example apps/web/.env.local
   cp apps/admin/.env.local.example apps/admin/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
   
   # Edit with your database and API credentials
   ```

4. **Run development servers**
   ```bash
   # Run all apps
   npm run dev
   
   # Or run individually
   npm run mobile    # Mobile app on Expo
   npm run web       # Web app on http://localhost:3000
   npm run admin     # Admin portal on http://localhost:3001
   npm run api       # API server on http://localhost:3002
   ```

For detailed setup instructions, see [QUICK_START.md](docs/QUICK_START.md).

---

## 📖 Documentation

**📚 [Complete Documentation Index](docs/00_README.md)** - Main documentation hub

### Essential Reads
- **[MVP Complete Scope](docs/MVP_COMPLETE_SCOPE.md)** ⭐ - Complete feature reference
- **[Project Status](docs/PROJECT_STATUS.md)** - Current status & roadmap
- **[Quick Start](docs/QUICK_START.md)** - Development setup
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute

### By Topic
- **Features:** [docs/03-features/](docs/03-features/) - All platform features
- **Authentication:** [docs/03-features/authentication/](docs/03-features/authentication/) - OAuth & login
- **Database:** [aws/database/schema/](aws/database/schema/) - PostgreSQL schema files
- **Deployment:** [docs/deployment/](docs/deployment/) - Deploy guides
- **Brand:** [docs/brand/](docs/brand/) - Brand guidelines
- **Marketing:** [docs/website/](docs/website/) - Marketing strategy

### Quick Links
- Current Sprint: [Mobile MVP Sprint](docs/sprints/MOBILE_FIRST_MVP_SPRINT.md)
- Tech Stack: [React 18 vs 19](docs/strategy/REACT_18_VS_19_ANALYSIS.md)
- Legal Pages: [Privacy](https://www.poultryco.net/privacy) | [Terms](https://www.poultryco.net/terms)

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Monorepo setup
- [x] Database schema and RLS policies
- [x] Marketing website
- [x] Admin portal with blog CMS
- [x] Mobile app foundation
- [x] Authentication system

### 🚧 Phase 2: Mobile MVP (Week 2 of 9)
- [x] Mobile foundation and navigation
- [x] Authentication screens
- [ ] Profile creation wizard (Weeks 1-2) ← Current
- [ ] Personal profiles (Weeks 3-4)
- [ ] Networking features (Weeks 5-6)
- [ ] Business profiles (Week 7)
- [ ] Beta testing (Week 8)
- [ ] Public launch (Week 9)

### 📅 Phase 3: Post-Launch (Q1 2026)
- [ ] Advanced search & AI recommendations
- [ ] Video content support
- [ ] Analytics dashboard
- [ ] International expansion
- [ ] API for third-party integrations

### 🔮 Phase 4: Scale (Q2-Q4 2026)
- [ ] E-commerce integration
- [ ] Certification programs
- [ ] Premium subscriptions
- [ ] Enterprise features
- [ ] IoT device integration

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

---

## 👥 Team

- **Lead Developer** - Technical architecture and strategy
- **Developer** - Implementation and features
- **Marketing/Content** - Content creation and organic growth
- **QA Tester** - Quality assurance and testing

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌐 Links

- **Website:** [www.poultryco.net](https://www.poultryco.net)
- **Admin Portal:** [admin.poultryco.net](https://admin.poultryco.net)
- **Documentation:** [docs/](docs/)
- **GitHub:** [github.com/vjanagaran/poultryco](https://github.com/vjanagaran/poultryco)

---

## 📧 Contact

For questions, feedback, or partnership inquiries:
- **Email:** team@poultryco.net
- **Website:** [www.poultryco.net/contact](https://www.poultryco.net/contact)

---

## 🙏 Acknowledgments

- Expo for simplifying React Native development
- AWS for infrastructure and services
- The open-source community for amazing tools and libraries

---

<div align="center">

**Made with ❤️ for the global poultry industry**

[Website](https://www.poultryco.net) · [Documentation](docs/) · [Report Bug](https://github.com/vjanagaran/poultryco/issues) · [Request Feature](https://github.com/vjanagaran/poultryco/issues)

</div>
