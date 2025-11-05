import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Trust-First Architecture | Why PoultryCo Works Differently",
  description: "Why we require credibility to contribute but let you consume freely. Learn the philosophy behind PoultryCo's trust-first design that protects quality from day one.",
  keywords: ["trust-first platform", "verified community", "credibility system", "quality control poultry", "professional networking trust"],
  openGraph: {
    title: "Trust-First Architecture | Why PoultryCo Works Differently",
    description: "Consume freely. Contribute credibly. Learn why this design protects everyone.",
    type: "article",
  },
};

export default function TrustFirstArchitecturePage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20 relative z-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Consume Freely.{" "}
              <span className="text-primary">Contribute Credibly</span>.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Why we let you use all tools for free, but require credibility before you can ask questions or post content. This simple principle protects quality from day one.
            </p>

            {/* Key Message Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Free tools. Quality protected. Trust built.
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/register">
                  Join the Trusted Community
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            {/* Credible Indicators */}
            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>₹5,000 Cr Lost Annually to Fakes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>All Contributors Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Quality from Day 1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE INDUSTRY REALITY */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              The Industry Reality: Trust is Broken
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                The poultry industry loses <strong className="text-primary">₹5,000 Crore annually</strong> to fake products and unqualified advice. A farmer buys medicine that's counterfeit. A vet's reputation is damaged by someone impersonating them online. A business loses customers because they can't prove they're legitimate.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                On generic platforms—WhatsApp groups, Facebook forums, even LinkedIn—anyone can claim expertise. No verification. No accountability. A poultry farmer posts a desperate question at 3 AM about bird mortality. Ten people respond. <strong className="text-orange-600">Which advice is from a qualified vet? Which is from someone who read a blog once?</strong>
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                The stakes are high. Wrong advice kills birds worth ₹50,000. Fake feed destroys an entire batch. Unqualified consultants cost farmers their livelihoods.
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 my-8 rounded-r-lg">
                <p className="text-lg text-foreground/90 font-semibold mb-2">
                  The Core Problem:
                </p>
                <p className="text-foreground/80">
                  On most platforms, <strong>anyone can say anything</strong>. There's no way to know if the person giving advice has ever held a chicken, let alone managed a 10,000-bird farm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PHILOSOPHY */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Our Philosophy: Trust Must Be Earned, Not Assumed
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                We made a fundamental design decision: <strong className="text-primary">Separate consumption from contribution.</strong>
              </p>

              <div className="grid md:grid-cols-2 gap-8 my-10">
                {/* Consumer Tier */}
                <div className="bg-white p-8 rounded-2xl border-2 border-primary/20 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Consumer Tier (Free Access)</h3>
                  <p className="text-muted-foreground mb-4">
                    From the moment you sign up, you get:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>All professional tools (FCR calculator, market data)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Read all content (questions, articles, discussions)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Browse verified vets, suppliers, experts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Learn from community knowledge</span>
                    </li>
                  </ul>
                  <p className="text-sm text-primary font-semibold mt-4">
                    No profile required. Just sign up and benefit.
                  </p>
                </div>

                {/* Contributor Tier */}
                <div className="bg-white p-8 rounded-2xl border-2 border-orange-500/20 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Contributor Tier (Requires Credibility)</h3>
                  <p className="text-muted-foreground mb-4">
                    To ask questions or post content, you need:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span><strong>Phone verified</strong> (you're a real person)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span><strong>Address with location</strong> (you're part of the community)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span><strong>5 connections</strong> (you're engaged, not hit-and-run)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span><strong>80% profile complete</strong> (people can judge your credibility)</span>
                    </li>
                  </ul>
                  <p className="text-sm text-orange-600 font-semibold mt-4">
                    Show who you are. Then contribute.
                  </p>
                </div>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                This isn't gatekeeping. This is <strong className="text-primary">quality protection</strong>. We give you the tools for free. We ask that you prove you're real before asking the community for help.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed">
                It's a fair exchange: <em>We invest in tools for you. You invest in credibility for the community.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THIS MATTERS */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Why This Design Protects Everyone
            </h2>

            <div className="space-y-8">
              {/* Benefit 1 */}
              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-4">For Farmers: Quality Advice You Can Trust</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  When you ask "My birds are showing respiratory symptoms, what should I do?"—you need to know the answers come from <strong>verified veterinarians</strong>, not random strangers.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Because contributors have verified profiles, you can see: BVSc degree, 10 years experience, 50+ successful consultations, 4.8-star rating from other farmers. You're not gambling with your flock's life.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-4">For Vets: Your Reputation is Protected</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  You spent years earning your BVSc degree. Your expertise has value. On PoultryCo, unqualified people can't impersonate you or give advice that damages your profession's reputation.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  When only <strong>verified professionals</strong> can answer medical questions, farmers trust the platform—and by extension, trust you.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-4">For Everyone: No Spam, No Fake, No Chaos</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Generic platforms become unusable because anyone can spam. PoultryCo stays clean because contributors have invested in their profiles.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Phone verified + Address verified + Connections built = You're not a bot. You're not a scammer. You're a <strong>real professional</strong> in the poultry industry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE TRUST LADDER */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading text-center">
              The Trust Ladder: How It Works
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Level 1: Guest */}
              <div className="bg-muted/30 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-gray-600">
                  1
                </div>
                <h4 className="font-bold text-foreground mb-2">Guest</h4>
                <p className="text-sm text-muted-foreground">
                  Can read marketing pages. Can't access platform.
                </p>
              </div>

              {/* Level 2: Consumer */}
              <div className="bg-primary/5 p-6 rounded-2xl text-center border-2 border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  2
                </div>
                <h4 className="font-bold text-foreground mb-2">Consumer</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Signed up. Can use tools, read content, browse profiles.
                </p>
                <p className="text-xs text-primary font-semibold">
                  Free access, no requirements
                </p>
              </div>

              {/* Level 3: Contributor */}
              <div className="bg-primary/10 p-6 rounded-2xl text-center border-2 border-primary/30">
                <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  3
                </div>
                <h4 className="font-bold text-foreground mb-2">Contributor</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Verified + 5 connections + 80% profile. Can post, ask, answer.
                </p>
                <p className="text-xs text-primary font-semibold">
                  Requires credibility
                </p>
              </div>

              {/* Level 4: Verified Expert */}
              <div className="bg-primary/20 p-6 rounded-2xl text-center border-2 border-primary">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  4
                </div>
                <h4 className="font-bold text-foreground mb-2">Verified Expert</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Credentials verified by PTIC. Gets blue badge, higher visibility.
                </p>
                <p className="text-xs text-primary font-semibold">
                  Expert status
                </p>
              </div>
            </div>

            <div className="mt-10 text-center bg-white p-8 rounded-2xl border border-border">
              <p className="text-lg text-foreground/80 leading-relaxed">
                Everyone starts at Level 2 (Consumer) with <strong>free access to all tools</strong>. But to contribute content—to ask questions, post advice, answer queries—you climb to Level 3 by building your credibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REAL SCENARIO */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Why This Makes a Difference: Real Scenario
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Scenario A: Without Trust-First */}
              <div className="bg-white p-8 rounded-2xl border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Generic Platform (No Trust System)</h3>
                </div>
                
                <div className="space-y-4 text-sm text-foreground/80">
                  <p>
                    <strong>3:00 AM:</strong> Ramesh's 2,000 broilers show respiratory distress. He posts question in Facebook group.
                  </p>
                  <p>
                    <strong>3:05 AM:</strong> 8 people respond:
                  </p>
                  <ul className="pl-4 space-y-1 text-muted-foreground">
                    <li>• "Try this medicine" (feed salesman)</li>
                    <li>• "It's heat stress" (random person)</li>
                    <li>• "Buy my product" (spammer)</li>
                    <li>• "Call this number" (competitor vet)</li>
                  </ul>
                  <p>
                    <strong>Result:</strong> Ramesh can't tell which advice is from qualified vet. Tries wrong medicine. <strong className="text-orange-600">Loses 200 birds (₹40,000)</strong>.
                  </p>
                </div>
              </div>

              {/* Scenario B: With Trust-First */}
              <div className="bg-white p-8 rounded-2xl border-2 border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">PoultryCo (Trust-First System)</h3>
                </div>
                
                <div className="space-y-4 text-sm text-foreground/80">
                  <p>
                    <strong>3:00 AM:</strong> Ramesh posts same question on PoultryCo (verified phone, 85% profile, 12 connections).
                  </p>
                  <p>
                    <strong>3:08 AM:</strong> 3 responses—ALL from verified vets:
                  </p>
                  <ul className="pl-4 space-y-1 text-muted-foreground">
                    <li>• Dr. Priya (BVSc, 8 yrs, 4.9★, Erode)</li>
                    <li>• Dr. Kumar (MVSc, 12 yrs, 4.8★, Salem)</li>
                    <li>• Dr. Lakshmi (BVSc, 6 yrs, 5.0★, Namakkal)</li>
                  </ul>
                  <p>
                    <strong>Result:</strong> Ramesh sees credentials, chooses Dr. Priya (closest). Gets correct diagnosis. <strong className="text-primary">Saves 1,800 birds</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-primary/5 p-8 rounded-2xl border-2 border-primary/20 text-center">
              <p className="text-xl font-bold text-foreground mb-3">
                Same Question. Different Outcomes.
              </p>
              <p className="text-lg text-foreground/80">
                <strong className="text-orange-600">Without trust system:</strong> ₹40,000 lost<br />
                <strong className="text-primary">With trust-first design:</strong> 1,800 birds saved
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE BENEFIT */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              What You Get From This Design
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">High-Quality Advice from Day One</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Every answer comes from someone who proved their credentials. No spam. No fake experts. No dangerous advice from unqualified people.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Your Time is Respected</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    When questions come from verified members (not anonymous trolls), experts are more willing to help. Quality questions get quality answers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Professional Community, Not Free-for-All Forum</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    This isn't Reddit or Quora where anyone posts anything. This is a <strong>professional community</strong> where expertise is verified and valued.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE DEEPER MEANING */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-orange-500/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              How This Serves Our Mission
            </h2>
            
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl border border-primary/20 shadow-xl">
              <div className="space-y-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg text-foreground/90 leading-relaxed">
                      <strong className="text-primary">"Every farmer deserves fair prices"</strong><br />
                      <span className="text-foreground/70">Trust-first design prevents fake advice that costs farmers money. When only verified experts contribute, farmers make better decisions.</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg text-foreground/90 leading-relaxed">
                      <strong className="text-primary">"Every vet deserves recognition"</strong><br />
                      <span className="text-foreground/70">Profile requirements ensure vets get credit for expertise. Complete profiles mean farmers know who they're learning from.</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg text-foreground/90 leading-relaxed">
                      <strong className="text-primary">"Every business deserves trust"</strong><br />
                      <span className="text-foreground/70">Verification separates quality suppliers from fake products. Trust-first architecture is how we restore faith in the industry.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Common Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-muted/30 p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">Why do I need 5 connections before asking questions?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Because building 5 connections means you're invested in the community, not just here for a quick answer. It prevents hit-and-run behavior and ensures you're part of the "growing together" ecosystem.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">Isn't this making it harder to use the platform?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Actually, it makes it better. You can use all tools immediately (FCR calculator, market data) without any profile. But to ask the community for help—which costs experts their time—we ask that you show you're real and engaged. Fair exchange.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">What if I'm new and don't have 5 connections yet?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Start by reading existing content and using tools. As you browse profiles and connect with people in your region or specialty, you'll build 5 connections naturally. Most users achieve this in their first week.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">Can these requirements change?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes. As the community grows, we'll adjust based on what works. The philosophy (trust-first) stays. The mechanics (exact numbers) may evolve. We'll always communicate changes clearly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Join Where Trust is Built-In, Not Hoped-For
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              5,000+ professionals trust PoultryCo because quality is protected from day one. Every answer comes from verified experts. Every question comes from real members. No spam. No fakes. Just professionals helping professionals.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6"
              asChild
            >
              <Link href="/register">
                Start with Free Tools - Build Trust Later
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Use all tools immediately. Contribute when you complete your profile. Fair exchange.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

