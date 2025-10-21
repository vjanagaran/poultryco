/**
 * Site Configuration
 * Central configuration for the PoultryCo marketing website
 */

export const siteConfig = {
  name: "PoultryCo",
  description: "The World's First Professional Networking Platform for the Global Poultry Industry",
  url: "https://www.poultryco.net",
  ogImage: "https://www.poultryco.net/og-image.png",
  
  // Brand
  tagline: "Connect. Collaborate. Grow.",
  longDescription: "Join thousands of poultry professionals, businesses, and organizations in building the future of the global poultry industry.",
  
  // Contact
  email: "hello@poultryco.net",
  supportEmail: "support@poultryco.net",
  pressEmail: "press@poultryco.net",
  
  // Social Media
  social: {
    twitter: "@PoultryCo",
    linkedin: "company/poultryco",
    facebook: "PoultryCo",
    instagram: "@poultryco",
    youtube: "@PoultryCo",
  },
  
  // Navigation
  mainNav: [
    {
      title: "Features",
      href: "/features",
    },
    {
      title: "About",
      href: "/about",
    },
    {
      title: "Blog",
      href: "/blog",
    },
    {
      title: "Contact",
      href: "/contact",
    },
  ],
  
  // Features Navigation
  featuresNav: [
    {
      title: "Professional Profiles",
      href: "/features/profiles",
      description: "Multi-role profiles for individuals and businesses",
    },
    {
      title: "Smart Networking",
      href: "/features/networking",
      description: "Connect with the right people at the right time",
    },
    {
      title: "Job Board",
      href: "/features/jobs",
      description: "Find opportunities across the poultry industry",
    },
    {
      title: "Events Platform",
      href: "/features/events",
      description: "Discover and attend industry events worldwide",
    },
    {
      title: "Business Tools",
      href: "/features/tools",
      description: "Essential tools for poultry professionals",
    },
    {
      title: "Organizations Hub",
      href: "/features/organizations",
      description: "Connect and collaborate with industry organizations",
    },
  ],
  
  // Footer Links
  footerLinks: {
    product: [
      { title: "Features", href: "/features" },
      { title: "Early Access", href: "/early-access" },
      { title: "PTSE 2026", href: "/ptse" },
      { title: "Tools Preview", href: "/tools" },
    ],
    company: [
      { title: "About Us", href: "/about" },
      { title: "Our Story", href: "/about#story" },
      { title: "Associations", href: "/associations" },
      { title: "Press", href: "/press" },
    ],
    resources: [
      { title: "Blog", href: "/blog" },
      { title: "Contact", href: "/contact" },
      { title: "Support", href: "/support" },
      { title: "FAQ", href: "/faq" },
    ],
    legal: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Cookie Policy", href: "/cookies" },
    ],
  },
  
  // SEO
  keywords: [
    "poultry networking",
    "poultry professionals",
    "poultry industry",
    "poultry jobs",
    "poultry events",
    "poultry business",
    "chicken farming",
    "egg production",
    "feed manufacturing",
    "veterinary services",
  ],
  
  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  },
  
  // Launch Date
  launchDate: new Date("2026-01-01"),
  ptseDate: new Date("2026-01-15"),
} as const;

export type SiteConfig = typeof siteConfig;

