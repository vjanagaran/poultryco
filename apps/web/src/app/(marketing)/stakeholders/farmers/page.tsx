import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Poultry Farmers | PoultryCo",
  description: "Stop losing ₹60,000/year to middlemen. Get live market prices, FCR calculators, and expert advice. Join 5,000+ farmers growing together. Free forever.",
  keywords: ["poultry farming", "broiler prices today", "FCR calculator", "poultry market rates", "farmer networking India", "poultry expert advice"],
  openGraph: {
    title: "For Poultry Farmers | PoultryCo",
    description: "Stop losing ₹60,000/year to middlemen. Get live market prices, expert advice, and connect with 5,000+ farmers. Free forever.",
    type: "website",
  },
};

export default function FarmersPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            {/* Emotional Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Stop Losing Money to{" "}
              <span className="text-primary">Middlemen</span>
            </h1>

            {/* Problem Statement */}
            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              You work hard. But middlemen know today&apos;s market rates—you don&apos;t. That&apos;s <strong className="text-orange-600">₹5,000 lost every month</strong>. ₹60,000 a year.
            </p>

            {/* Value Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Get live market prices. FCR calculator. Expert advice. All free.
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/register">
                  Join 2,000+ Farmers Saving Money
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#benefits">See the Benefits</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Join in 30 Seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS SECTION */}
      <section id="benefits" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Three Problems Every Independent Farmer Faces
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              You&apos;re not alone. Thousands of farmers struggle with the same challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Problem 1 */}
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Hidden Market Prices</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                WhatsApp groups are unreliable. Middlemen lie about rates. You sell too low, losing ₹2,000-5,000 per batch.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                💔 Feeling: "I&apos;m being cheated after every sale."
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">No Expert When You Need One</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Bird mortality at 3 AM. Vet not answering. Googling in panic. Watching your flock die while feeling helpless.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                💔 Feeling: "I&apos;m alone when problems strike."
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414zm-1.414 5.658a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">No Voice to Decision Makers</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Feed quality is bad. Government doesn&apos;t hear you. Problems ignored for months. No collective bargaining power.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                💔 Feeling: "Nobody listens. Nobody cares."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              What If You Had the <span className="text-primary">Same Information as Middlemen?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              PoultryCo gives you three superpowers that level the playing field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Solution 1 */}
            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Market Intelligence</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Live broiler, layer, egg, feed prices (updated daily)</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Compare Namakkal vs Erode vs Chennai markets</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>SMS/WhatsApp alerts when prices spike</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Historical trends for better selling decisions</span>
                </li>
              </ul>
              <p className="text-primary font-semibold text-lg">
                💪 Result: Save ₹10,000-30,000/year
              </p>
            </div>

            {/* Solution 2 */}
            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Expert Network</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>50+ verified veterinarians available 24/7</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Ask questions, get answers in minutes (not hours)</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Learn from 2,000+ fellow farmers&apos; experiences</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Emergency support for disease outbreaks</span>
                </li>
              </ul>
              <p className="text-primary font-semibold text-lg">
                💪 Result: Reduce mortality by 5-10%
              </p>
            </div>

            {/* Solution 3 */}
            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Professional Tools</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>FCR Calculator (most requested by farmers)</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Feed projection & profit/loss calculators</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Mortality tracker & heat stress calculator</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Works offline (no internet needed for calculations)</span>
                </li>
              </ul>
              <p className="text-primary font-semibold text-lg">
                💪 Result: Save 10+ hours/week
              </p>
            </div>
          </div>

          {/* Overall Impact */}
          <div className="mt-16 text-center bg-primary/5 p-8 rounded-2xl border border-primary/20 max-w-4xl mx-auto">
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Average Farmer Benefit: <span className="text-primary">₹30,000-80,000/Year</span>
            </p>
            <p className="text-muted-foreground">
              Better prices + reduced mortality + time savings = More profit in your pocket
            </p>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              2,000+ Farmers Already Saving Money
            </h2>
            <p className="text-xl text-muted-foreground">
              Real farmers. Real results. Real savings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Murugan R.</h4>
                  <p className="text-sm text-muted-foreground">Broiler Farmer, Namakkal</p>
                </div>
              </div>
              <p className="text-foreground mb-4 leading-relaxed">
                "Before PoultryCo, I sold at ₹95/kg because the buyer said that&apos;s the rate. Now I check the app, wait for ₹102/kg. <strong>₹7 per kg × 2,000 birds = ₹14,000 extra per batch.</strong>"
              </p>
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Verified Farmer
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Selvam K.</h4>
                  <p className="text-sm text-muted-foreground">Layer Farmer, Erode</p>
                </div>
              </div>
              <p className="text-foreground mb-4 leading-relaxed">
                "The FCR calculator showed I was wasting feed. Fixed my feeding schedule. <strong>Saved ₹25,000 in one batch.</strong> The calculator alone is worth joining."
              </p>
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Verified Farmer
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="font-semibold">Backed by PTIC (Section 8 Non-Profit)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="font-semibold">Endorsed by 3 Farmer Associations</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="font-semibold">Validated by 500 Farmer Surveys</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Start Saving in <span className="text-primary">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Sign Up Free</h3>
              <p className="text-muted-foreground leading-relaxed">
                Just your name, phone, and location. Takes 30 seconds. No credit card needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Get Today&apos;s Prices</h3>
              <p className="text-muted-foreground leading-relaxed">
                Immediately see live prices in your area. Check FCR. Calculate profit. All free tools.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Connect & Save</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ask vets questions. Learn from peers. Report issues. Start saving ₹30,000-80,000/year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              Common Questions from Farmers
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ 1 */}
            <div className="bg-background p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">Is this really free?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes. Forever. We&apos;re PTIC (Section 8 non-profit). No hidden fees. No tricks. Our mission is farmer welfare, not profit.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-background p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">Will you sell my data?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Never. Your data is yours. We don&apos;t sell anything. Transparent privacy policy. Government oversight as Section 8 organization.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-background p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">I&apos;m not good with apps. Is it difficult?</h3>
              <p className="text-muted-foreground leading-relaxed">
                It&apos;s simpler than WhatsApp. Video tutorials included. Email support available. We&apos;ll help you every step.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-background p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">What if I&apos;m a contract farmer?</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can still learn best practices to improve performance. Track feed, mortality, and weight to calculate your FCR and validate you&apos;re paid fairly by your integrator. The tools work for everyone.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-background p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">Where do market prices come from?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Crowdsourced from farmers, traders, and verified by PTIC. The more farmers join, the more accurate the data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Every Day You Wait, You Lose Money
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              2,000 farmers are already getting better prices, saving time, and growing their business. Your competitors know today&apos;s rates. Do you?
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6"
              asChild
            >
              <Link href="/register">
                Join Free Now - Start Saving Today
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-4 opacity-75">
              Free forever. No credit card. No spam. Just better prices and expert help.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

