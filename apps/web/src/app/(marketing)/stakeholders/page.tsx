import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Every Stakeholder | PoultryCo",
  description: "One platform connecting farmers, vets, suppliers, FPOs, associations, and every poultry professional. Network effects create value for all. Free forever.",
  keywords: ["poultry networking platform", "poultry industry collaboration", "farmer vet connection", "poultry supply chain", "industry network effects"],
  openGraph: {
    title: "For Every Stakeholder | PoultryCo",
    description: "Every stakeholder under one roof. Network effects amplify value for everyone.",
    type: "website",
  },
};

export default function StakeholdersPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20 relative z-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Every Stakeholder.{" "}
              <span className="text-primary">One Platform</span>.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              When farmers connect with vets, suppliers connect with farms, and FPOs coordinate with members—<strong className="text-primary">everyone wins.</strong>
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              11 stakeholder types. Unlimited connections. Zero cost.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Join the Ecosystem - Free Forever
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#network-effects">See the Network Effects</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* NETWORK EFFECTS SECTION */}
      <section id="network-effects" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              The Power of <span className="text-primary">Network Effects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every new member makes the platform more valuable for everyone else. Here&apos;s how:
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Network Effect 1 */}
            <div className="bg-muted/30 p-8 md:p-12 rounded-3xl border-2 border-primary/10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-heading">
                    More Farmers = <span className="text-primary">Better Prices for All</span>
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    When 5,000 farmers share market data, price manipulation becomes impossible. Collective knowledge = collective power.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Crowdsourced prices are more accurate than any single source</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Middlemen can&apos;t hide rates when thousands know the truth</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>FPOs can negotiate better with supplier data transparency</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">₹60,000</div>
                    <div className="text-muted-foreground">Saved per farmer/year when market data is transparent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Effect 2 */}
            <div className="bg-muted/30 p-8 md:p-12 rounded-3xl border-2 border-primary/10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">50+</div>
                      <div className="text-muted-foreground">Verified vets available 24/7 as more join the network</div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-heading">
                    More Vets = <span className="text-primary">Faster Help for Farmers</span>
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    When vets join, farmers get instant expert access. When farmers join, vets get more clients. Everyone grows together.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Farmers get answers in minutes (not hours or days)</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Vets build regional reputation through 5-star reviews</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Emergency support 24/7 (someone always available)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Network Effect 3 */}
            <div className="bg-muted/30 p-8 md:p-12 rounded-3xl border-2 border-primary/10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-heading">
                    More Suppliers = <span className="text-primary">Quality Competition</span>
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    When feed mills, hatcheries, and equipment suppliers join, farmers get verified options. Competition drives quality up and prices down.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Verified badges separate quality from fake products</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Reviews and ratings help farmers choose the best</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Direct access = better margins for both sides</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">100+</div>
                    <div className="text-muted-foreground">Verified businesses accessible to every farmer</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Effect 4 */}
            <div className="bg-muted/30 p-8 md:p-12 rounded-3xl border-2 border-primary/10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">10,000+</div>
                      <div className="text-muted-foreground">Collective voice to government and industry</div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-heading">
                    More Members = <span className="text-primary">Stronger Voice</span>
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    When FPOs and associations connect their members here, collective issues become visible. Data drives policy. Unity creates change.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Feed quality issues escalate from 1 farmer to PTIC to government</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Disease outbreaks detected early through geo-tagged reports</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Associations prove member value with aggregate data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* The Multiplier Effect */}
          <div className="mt-16 text-center bg-gradient-to-br from-primary/10 to-orange-500/10 p-12 rounded-3xl border-2 border-primary/20 max-w-5xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              The Multiplier Effect
            </h3>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed max-w-3xl mx-auto">
              Every farmer who joins makes vets more valuable. Every vet who joins makes farmers more confident. Every supplier who joins creates competition. Every FPO amplifies impact.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-white font-bold text-lg shadow-xl">
              1 + 1 = 3 (Not 2)
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Network effects make the whole greater than the sum of its parts
            </p>
          </div>
        </div>
      </section>

      {/* ALL STAKEHOLDERS SECTION */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Who Benefits? <span className="text-primary">Everyone.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Click your role to see specific benefits and join the ecosystem.
            </p>
          </div>

          {/* Stakeholder Grid - Gateway to All Pages */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Farmers */}
            <Link 
              href="/stakeholders/farmers" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
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
              <p className="text-muted-foreground text-sm mb-3">
                Market prices, FCR calculators, expert advice. Save ₹30-80K/year.
              </p>
              <span className="text-sm text-primary font-semibold">
                2,000+ farmers already saving →
              </span>
            </Link>

            {/* Veterinarians */}
            <Link 
              href="/stakeholders/veterinarians" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
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
              <p className="text-muted-foreground text-sm mb-3">
                Build verified profile, reach 5,000+ farmers, grow practice 2-3x. 0% commission.
              </p>
              <span className="text-sm text-primary font-semibold">
                Get discovered by farmers →
              </span>
            </Link>

            {/* FPOs */}
            <Link 
              href="/stakeholders/fpos" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
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
              <p className="text-muted-foreground text-sm mb-3">
                Digital member management. Prove ₹26-50L impact. Free Year 1.
              </p>
              <span className="text-sm text-primary font-semibold">
                7 pilot slots remaining →
              </span>
            </Link>

            {/* Associations */}
            <Link 
              href="/stakeholders/associations" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
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
              <p className="text-muted-foreground text-sm mb-3">
                Give members ₹3-8 Cr total value. Boost engagement 2-3x. Zero cost.
              </p>
              <span className="text-sm text-primary font-semibold">
                Transform member lives →
              </span>
            </Link>

            {/* Nutritionists */}
            <Link 
              href="/stakeholders/nutritionists" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
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
              <p className="text-muted-foreground text-sm mb-3">
                Showcase formulations. Connect with farms and feed mills. Build reputation.
              </p>
              <span className="text-sm text-primary font-semibold">
                Reach clients →
              </span>
            </Link>

            {/* Students */}
            <Link 
              href="/stakeholders/students" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
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
              <p className="text-muted-foreground text-sm mb-3">
                Real projects with 5,000 users. Internships. Publications. Career building.
              </p>
              <span className="text-sm text-primary font-semibold">
                Build real impact →
              </span>
            </Link>

            {/* Feed Mills */}
            <Link 
              href="/stakeholders/feed-mills" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
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
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Feed Mills</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Reach 5,000+ farmers directly. Bypass dealers. Build verified reputation.
              </p>
              <span className="text-sm text-primary font-semibold">
                Direct farmer access →
              </span>
            </Link>

            {/* Hatcheries */}
            <Link 
              href="/stakeholders/hatcheries" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Hatcheries</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Connect with farmers needing DOCs. Showcase breeds. Build trust.
              </p>
              <span className="text-sm text-primary font-semibold">
                Reach farmers →
              </span>
            </Link>

            {/* Consultants */}
            <Link 
              href="/stakeholders/consultants" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Consultants</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Grow consulting practice. Showcase expertise. 0% commission on fees.
              </p>
              <span className="text-sm text-primary font-semibold">
                Find clients →
              </span>
            </Link>

            {/* Researchers */}
            <Link 
              href="/stakeholders/researchers" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Researchers</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Access real farm data. Field research participants. Publication opportunities.
              </p>
              <span className="text-sm text-primary font-semibold">
                Access data →
              </span>
            </Link>

            {/* Equipment Suppliers */}
            <Link 
              href="/stakeholders/equipment-suppliers" 
              className="group bg-background p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-heading">For Equipment Suppliers</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Product catalog. Reach modernizing farms. Customer feedback.
              </p>
              <span className="text-sm text-primary font-semibold">
                Showcase products →
              </span>
            </Link>
          </div>

          {/* Don't See Your Role */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6 text-lg">
              Don&apos;t see your exact role? The platform is built for the <strong>entire poultry ecosystem</strong>.
            </p>
            <Button variant="primary" size="lg" className="px-8 py-6" asChild>
              <Link href="/register">
                Join the Ecosystem - Free Forever
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WHY ONE PLATFORM MATTERS */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Why One Platform Changes Everything
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {/* Reason 1 */}
            <div className="bg-muted/30 p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <span className="text-primary">Trust</span> Through Transparency
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                When everyone is on one platform, fake products get exposed. Verified badges mean something. Reviews are real. Trust is earned, not claimed.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="bg-muted/30 p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <span className="text-primary">Knowledge</span> Flows Freely
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A farmer&apos;s question gets answered by vets, nutritionists, and experienced farmers. A vet&apos;s case study educates thousands. A nutritionist&apos;s formulation helps feed mills improve. Knowledge multiplies when everyone connects.
              </p>
            </div>

            {/* Reason 3 */}
            <div className="bg-muted/30 p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <span className="text-primary">Opportunities</span> Become Visible
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A farmer looking for a vet finds 50 verified options. A vet looking for clients reaches 5,000 farms. A feed mill showcases products to entire regions. Opportunities that were hidden become visible.
              </p>
            </div>

            {/* Reason 4 */}
            <div className="bg-muted/30 p-8 rounded-2xl border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                <span className="text-primary">Problems</span> Get Solved Faster
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Disease outbreak? 50 vets see it. Feed quality issue? 1,000 farmers report it. Government ignoring a problem? 10,000 voices escalate it together. Collective action creates results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              The More Who Join, The More Valuable It Becomes
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              5,000+ professionals are already connecting. Every new member creates value for existing members. Be part of the network effect.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6"
              asChild
            >
              <Link href="/register">
                Join Now - See Immediate Value
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-4 opacity-75">
              Free forever. Every stakeholder. Growing together.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

