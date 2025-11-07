import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { HomepageRouter } from "@/components/HomepageRouter";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.tagline} | ${siteConfig.name}`,
  description: siteConfig.mission,
  openGraph: {
    title: `${siteConfig.tagline} | ${siteConfig.name}`,
    description: siteConfig.mission,
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function HomePage() {
  return (
    <>
      <HomepageRouter />
      
      {/* HERO SECTION - WOW MOMENT */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
        {/* Modern Geometric Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          
          {/* Large accent shapes */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl"></div>
          
          {/* Geometric grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Subtle Floating Shapes - Right Side Animation */}
          <div className="absolute top-1/4 right-[15%] w-20 h-20 border-2 border-primary/20 rounded-full animate-float-slow"></div>
          <div className="absolute top-1/2 right-[25%] w-12 h-12 bg-primary/5 rounded-lg rotate-45 animate-float-slower"></div>
          <div className="absolute top-[60%] right-[10%] w-16 h-16 border-2 border-orange-500/20 rounded-full animate-float-medium"></div>
          <div className="absolute bottom-1/4 right-[20%] w-8 h-8 bg-orange-500/5 rounded-full animate-float-slow"></div>
          
          {/* Small accent dots (static) */}
          <div className="absolute top-1/3 right-[30%] w-2 h-2 bg-primary rounded-full"></div>
          <div className="absolute bottom-1/3 right-[35%] w-2 h-2 bg-orange-500 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-6 py-12 lg:py-16 relative z-20">
          <div className="max-w-5xl">
            {/* Main Headline with Visual Impact */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1] tracking-tight">
              <span className="block">Connect</span>
              <span className="block text-primary">Collaborate</span>
              <span className="block">Co-create</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-foreground/70 mb-5 max-w-3xl leading-relaxed">
              Where every poultry professional finds opportunities, solves problems, and grows together.
            </p>

            {/* Bold Tagline Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Free forever. For everyone. Growing together.
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-6 py-5 shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/register">
                  Join Now - 5,000+ Already Growing Together
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-6 py-5 border-2 hover:bg-primary/5" asChild>
                <Link href="#vision">See How It Works</Link>
              </Button>
            </div>

            {/* Trust Indicators - Redesigned */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">5,000+</div>
                  <div className="text-xs text-muted-foreground">30 Countries</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">Community</div>
                  <div className="text-xs text-muted-foreground">Driven</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">100% Free</div>
                  <div className="text-xs text-muted-foreground">Forever</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VISION SECTION */}
      <section id="vision" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Why PoultryCo Exists
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The global poultry industry faces critical challenges: <span className="text-orange-600 font-semibold">trust, transparency, and connection</span> are broken. We&apos;re fixing that.
            </p>
          </div>

          {/* The Problem */}
          <div className="mb-16 p-8 bg-muted/30 rounded-2xl border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-6 font-heading">
              The Industry Reality
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Farmers Lose ₹60,000/Year</h4>
                <p className="text-muted-foreground">
                  Middlemen hide market prices. Farmers sell at losses. Information asymmetry costs billions.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Vets Stay Invisible</h4>
                <p className="text-muted-foreground">
                  Qualified vets trapped in 15km radius. No verification. Fake advisors compete unfairly.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Trust is Broken</h4>
                <p className="text-muted-foreground">
                  Fake products everywhere. No verification. Businesses can&apos;t prove quality. Farmers suffer.
                </p>
              </div>
            </div>
          </div>

          {/* The Solution */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-8 font-heading text-center">
              Our Vision: <span className="text-primary">One Platform. Every Stakeholder. Total Transparency.</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Connect */}
              <div className="text-center p-8 bg-background rounded-2xl border-2 border-primary/20 hover:border-primary transition-all">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3 font-heading">Connect</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Farmers find vets. Vets find clients. Suppliers find customers. FPOs find members. Everyone finds opportunity.
                </p>
              </div>

              {/* Collaborate */}
              <div className="text-center p-8 bg-background rounded-2xl border-2 border-primary/20 hover:border-primary transition-all">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3 font-heading">Collaborate</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Share knowledge. Solve problems together. Expert Q&A. Peer learning. Real-time market data. Growing together.
                </p>
              </div>

              {/* Co-create */}
              <div className="text-center p-8 bg-background rounded-2xl border-2 border-primary/20 hover:border-primary transition-all">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3 font-heading">Co-create</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Build the future together. Your feedback shapes features. Community-driven development. Industry-wide transformation.
                </p>
              </div>
            </div>
          </div>

          {/* Mission Statement Box */}
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 font-heading">
              We Believe Every Poultry Professional Worldwide Deserves
            </h3>
            <ul className="text-lg space-y-3 max-w-2xl mx-auto text-left md:text-center">
              <li className="flex items-start md:justify-center gap-2">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span><strong>Fair access</strong> to market information and opportunities</span>
              </li>
              <li className="flex items-start md:justify-center gap-2">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span><strong>Recognition</strong> for their expertise and hard work</span>
              </li>
              <li className="flex items-start md:justify-center gap-2">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span><strong>Trust</strong> through verification and transparency</span>
              </li>
              <li className="flex items-start md:justify-center gap-2">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span><strong>Community</strong> of peers who understand their challenges</span>
              </li>
            </ul>
            <p className="mt-8 text-xl font-semibold">
              That&apos;s why PoultryCo is free. Forever. For everyone.
            </p>
          </div>
        </div>
      </section>

      {/* STAKEHOLDER SHOWCASE */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              One Platform. <span className="text-primary">Every Stakeholder.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you grow birds, treat them, feed them, or study them—there&apos;s a place for you here.
            </p>
          </div>

          {/* Stakeholder Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Card 1: Farmers */}
            <Link 
              href="/stakeholders/farmers" 
              className="group p-6 bg-background rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Farmers</h3>
              <p className="text-muted-foreground mb-4">
                Get live market prices, FCR calculators, expert advice, and connect with 2,000+ farmers.
              </p>
              <span className="text-sm text-primary font-semibold">
                Stop losing to middlemen →
              </span>
            </Link>

            {/* Card 2: Veterinarians */}
            <Link 
              href="/stakeholders/veterinarians" 
              className="group p-6 bg-background rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Veterinarians</h3>
              <p className="text-muted-foreground mb-4">
                Build your verified profile, reach 5,000+ farmers, answer expert Q&A, grow your practice.
              </p>
              <span className="text-sm text-primary font-semibold">
                Get discovered by farmers →
              </span>
            </Link>

            {/* Card 3: FPOs */}
            <Link 
              href="/stakeholders/fpos" 
              className="group p-6 bg-background rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For FPOs</h3>
              <p className="text-muted-foreground mb-4">
                Digital member management, bulk purchase coordination, prove ₹26-50L member impact with data.
              </p>
              <span className="text-sm text-primary font-semibold">
                Run a digital FPO →
              </span>
            </Link>

            {/* Card 4: Associations */}
            <Link 
              href="/stakeholders/associations" 
              className="group p-6 bg-background rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Associations</h3>
              <p className="text-muted-foreground mb-4">
                Give members ₹3-8 Cr total savings, boost engagement 2-3x, prove impact with admin dashboard.
              </p>
              <span className="text-sm text-primary font-semibold">
                Transform member lives →
              </span>
            </Link>

            {/* Card 5: Nutritionists */}
            <Link 
              href="/stakeholders/nutritionists" 
              className="group p-6 bg-background rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Nutritionists</h3>
              <p className="text-muted-foreground mb-4">
                Showcase formulation expertise, connect with farms and feed mills, share knowledge, build reputation.
              </p>
              <span className="text-sm text-primary font-semibold">
                Reach more clients →
              </span>
            </Link>

            {/* Card 6: Students */}
            <Link 
              href="/stakeholders/students" 
              className="group p-6 bg-background rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Students</h3>
              <p className="text-muted-foreground mb-4">
                Real projects with 5,000 users, research opportunities, internships, portfolio-worthy work.
              </p>
              <span className="text-sm text-primary font-semibold">
                Build real impact →
              </span>
            </Link>
          </div>

          {/* CTA to View All */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              + 5 more stakeholder groups: Feed Mills, Hatcheries, Consultants, Researchers, Equipment Suppliers
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register">
                Claim Your Spot - Join 5,000+ Professionals
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Don&apos;t Get Left Behind - Join the Movement
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              5,000+ poultry professionals are already connecting, collaborating, and growing together. Your competitors are here. Your customers are here. Where are you?
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 font-bold"
              asChild
            >
              <Link href="/register">
                Join Free Now - Takes 30 Seconds
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-4 opacity-75">
              No credit card. No commitments. Just opportunities.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
