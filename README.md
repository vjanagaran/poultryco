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

## 📱 Features

### For Individuals
- **Professional Profiles:** Showcase your expertise, experience, and skills
- **Multi-Role Support:** Farmer, Veterinarian, Nutritionist, Supplier, etc.
- **Networking:** Connect with peers, mentors, and industry leaders
- **Knowledge Sharing:** Access industry insights, best practices, and resources
- **Job Opportunities:** Find and post poultry industry jobs

### For Businesses
- **Business Profiles:** Promote your products, services, and team
- **Product Listings:** Showcase feed, equipment, medications, and more
- **Verification:** Build trust with verified business status
- **Team Management:** Connect your team members to your business

### For Organizations
- **Event Management:** Create and promote industry events, webinars, and conferences
- **Membership Management:** Manage association members and benefits
- **Industry Insights:** Share research, publications, and updates

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
- **Deployment:** Vercel

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage + CDN (cdn.poultryco.net)
- **Real-time:** Supabase Realtime (planned)

### DevOps
- **Monorepo:** Turborepo
- **Package Manager:** npm workspaces
- **CI/CD:** Vercel (web/admin), Expo EAS (mobile)
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
├── supabase/
│   └── schema/          # Database migrations (12 files)
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
- **Supabase Account:** For backend services
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
   
   # Edit with your Supabase credentials
   ```

4. **Run development servers**
   ```bash
   # Run all apps
   npm run dev
   
   # Or run individually
   npm run mobile    # Mobile app on Expo
   npm run web       # Web app on http://localhost:3000
   npm run admin     # Admin portal on http://localhost:3001
   ```

For detailed setup instructions, see [QUICK_START.md](docs/QUICK_START.md).

---

## 📖 Documentation

### Getting Started
- [Quick Start Guide](docs/QUICK_START.md) - Setup and installation
- [Contributing Guidelines](docs/CONTRIBUTING.md) - How to contribute

### Development
- [Mobile MVP Sprint](docs/sprints/MOBILE_FIRST_MVP_SPRINT.md) - Current roadmap
- [Current Status](docs/strategy/CURRENT_STATUS.md) - Project progress
- [Brand Guidelines](docs/brand/poultryco_brand_guidelines.md) - Brand identity

### Deployment
- [Deployment Guide](docs/deployment/REACT_18_DEPLOYMENT_SUCCESS.md) - Vercel setup
- [Deployment Strategy](docs/deployment/DEPLOYMENT_STRATEGY.md) - Hosting options

### Architecture
- [React Version Strategy](docs/strategy/REACT_18_VS_19_ANALYSIS.md) - Technical decisions
- [Database Schema](supabase/schema/README.md) - Database structure

---

## 🎯 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Monorepo setup
- [x] Database schema and RLS policies
- [x] Marketing website
- [x] Admin portal with blog CMS
- [x] Mobile app foundation
- [x] Authentication system

### 🚧 Phase 2: Mobile MVP (In Progress - 9 Weeks)
- [ ] User onboarding and profile wizard (Weeks 1-2)
- [ ] Personal profiles with roles (Weeks 3-4)
- [ ] Networking and connections (Weeks 5-6)
- [ ] Business profiles (Week 7)
- [ ] Beta launch (Week 8)
- [ ] Public launch (Week 9)

### 📅 Phase 3: Growth (Planned)
- [ ] Advanced search and filters
- [ ] Messaging system
- [ ] Job board
- [ ] Events platform
- [ ] Analytics dashboard
- [ ] Mobile notifications

### 🔮 Phase 4: Scale (Future)
- [ ] Video content
- [ ] E-commerce integration
- [ ] International expansion
- [ ] API for integrations
- [ ] Mobile web version

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

- Supabase for providing an excellent backend platform
- Expo for simplifying React Native development
- Vercel for seamless Next.js deployments
- The open-source community for amazing tools and libraries

---

<div align="center">

**Made with ❤️ for the global poultry industry**

[Website](https://www.poultryco.net) · [Documentation](docs/) · [Report Bug](https://github.com/vjanagaran/poultryco/issues) · [Request Feature](https://github.com/vjanagaran/poultryco/issues)

</div>
