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
  tagline: "Connect · Collaborate · Co-create",
  longDescription: "The professional platform bringing India's entire poultry industry under one roof. Free forever. For everyone. Growing together.",
  mission: "Every farmer deserves fair prices. Every vet deserves recognition. Every business deserves trust. We're building the platform that makes this possible.",
  
  // Contact
  email: "hello@poultryco.net",
  supportEmail: "support@poultryco.net",
  pressEmail: "press@poultryco.net",
  
  // Social Media
  social: {
    twitter: "@PoultryCo",
    linkedin: "https://www.linkedin.com/company/poultryco",
    facebook: "https://www.facebook.com/poultryco.net/",
    instagram: "@poultryco",
    youtube: "https://www.youtube.com/@poultryco",
  },
  
  // PTIC Website
  pticWebsite: "https://www.poultrytech.org",
  
  // Navigation
  mainNav: [
    {
      title: "Who",
      href: "#", // Dropdown trigger
      dropdown: [
        { title: "About", href: "/about", description: "Our story, mission, and vision" },
        { title: "Origin Story", href: "/about/origin-story", description: "From farmer's plea to platform" },
        { title: "Founder's Letter", href: "/about/letter-from-founder", description: "Personal note from Janagaran" },
        { title: "About PTIC", href: "/about/ptic", description: "Non-profit mission and initiatives" },
      ],
    },
    {
      title: "Whom",
      href: "#", // Dropdown trigger
      dropdown: [
        { title: "For Farmers", href: "/stakeholders/farmers", description: "Market prices, tools, and expert advice" },
        { title: "For Veterinarians", href: "/stakeholders/veterinarians", description: "Build practice, reach farmers" },
        { title: "For FPOs", href: "/stakeholders/fpos", description: "Digital member management tools" },
        { title: "For Associations", href: "/stakeholders/associations", description: "Transform member engagement" },
        { title: "For Nutritionists", href: "/stakeholders/nutritionists", description: "Showcase expertise, find clients" },
        { title: "For Students", href: "/stakeholders/students", description: "Real projects, internships" },
        { title: "For Feed Mills", href: "/stakeholders/feed-mills", description: "Reach farmers directly" },
        { title: "For Hatcheries", href: "/stakeholders/hatcheries", description: "Connect with farms" },
        { title: "For Consultants", href: "/stakeholders/consultants", description: "Grow your practice" },
        { title: "For Researchers", href: "/stakeholders/researchers", description: "Access research data" },
        { title: "For Equipment Suppliers", href: "/stakeholders/equipment-suppliers", description: "Showcase products" },
      ],
    },
    {
      title: "Why",
      href: "#", // Dropdown trigger
      dropdown: [
        { title: "Trust-First Architecture", href: "/why/trust-first-architecture", description: "Consume freely, contribute credibly" },
        { title: "Your Profile Matters", href: "/why/your-profile-matters", description: "Profile is your professional currency" },
        { title: "Verification is Trust", href: "/why/verification-is-trust", description: "How verified badges protect everyone" },
        { title: "Network Effects", href: "/why/network-effects", description: "Why every member makes you more valuable" },
        { title: "Free Forever", href: "/why/free-forever", description: "Quality without compromise" },
        { title: "Not Just WhatsApp", href: "/why/not-whatsapp", description: "Professional knowledge vs chat chaos" },
      ],
    },
    {
      title: "How",
      href: "#", // Dropdown trigger
      dropdown: [
        { title: "Trust Ladder Works", href: "/how/trust-ladder-works", description: "Guest to verified expert journey" },
        { title: "Profiles Work", href: "/how/profiles-work", description: "Strength calculation and unlocks" },
        { title: "Networking Works", href: "/how/networking-works", description: "Connections vs following explained" },
        { title: "Verification Works", href: "/how/verification-works", description: "Get your verified badge" },
        { title: "Stream Works", href: "/how/stream-works", description: "Share knowledge, build reputation" },
        { title: "Discovery Works", href: "/how/discovery-works", description: "Find the right people fast" },
        { title: "Tools Work", href: "/how/tools-work", description: "FCR calculator, market data, offline-first" },
      ],
    },
    {
      title: "Impact",
      href: "#", // Dropdown trigger
      dropdown: [
        { title: "Farmers Save ₹60K/Year", href: "/impact/farmers-save-60k", description: "Market intelligence + reduced mortality" },
        { title: "Vets Grow Practice 2-3x", href: "/impact/vets-grow-practice", description: "Discovery + reputation building" },
        { title: "FPOs Prove ₹26-50L Value", href: "/impact/fpos-prove-value", description: "Admin time + member savings" },
        { title: "Network Effects Multiplier", href: "/impact/network-effects-multiplier", description: "Why 1+1=3 in a network" },
        { title: "Trust Stops Exploitation", href: "/impact/trust-stops-exploitation", description: "Verification reduces ₹5,000 Cr loss" },
      ],
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
    platform: [
      { title: "Who", href: "/about" },
      { title: "Whom", href: "/stakeholders" },
      { title: "Why", href: "/why" },
      { title: "How", href: "/how" },
      { title: "Impact", href: "/impact" },
    ],
    company: [
      { title: "Home", href: "/" },
      { title: "Blog", href: "/blog" },
      { title: "Contact", href: "/contact" },
    ],
    legal: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
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

