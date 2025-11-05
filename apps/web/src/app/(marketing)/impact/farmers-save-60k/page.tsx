import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Farmers Save ₹60,000/Year | Market Intelligence + Reduced Mortality",
  description: "Based on 500 farmer survey: ₹10-30K from better pricing decisions + ₹20-50K from reduced mortality = ₹30-80K total annual savings. Here's the math.",
  keywords: ["farmer savings", "poultry profit increase", "market intelligence savings", "reduce mortality costs"],
  openGraph: {
    title: "Farmers Save ₹60,000/Year | Real Numbers, Real Impact",
    description: "₹60K annual loss → ₹30-80K savings. Based on 500 farmer survey.",
    type: "article",
  },
};

export default function FarmersSave60KPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20 relative z-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              From{" "}
              <span className="text-orange-600">₹60,000 Lost</span>{" "}
              to{" "}
              <span className="text-primary">₹30-80K Saved</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Based on survey of 500 independent farmers: Information gap costs ₹60,000/year. Market intelligence + expert access saves ₹30,000-80,000/year. Here's the math.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Survey-validated. Real numbers. Transparent math.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Start Saving Money Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#breakdown">See the Breakdown</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>500 Farmer Survey</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>5 Districts Validated</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Conservative Estimates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE BREAKDOWN */}
      <section id="breakdown" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Where the Savings Come From
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Source 1: Better Pricing */}
              <div className="bg-white p-8 rounded-2xl border-2 border-primary/30 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Market Intelligence</h3>
                </div>
                
                <p className="text-lg font-semibold text-primary mb-4">₹10,000-30,000/year saved</p>
                
                <div className="space-y-3 mb-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">The Problem:</p>
                    <p className="text-sm text-muted-foreground">
                      Middleman says broiler rate is ₹95/kg. You sell 2,000 birds. Actually, rate is ₹102/kg in your region.
                    </p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">The Math:</p>
                    <p className="text-sm text-foreground/80">
                      ₹7/kg difference × 2,000 birds (avg 2kg) = <strong className="text-primary">₹14,000 lost per batch</strong>
                      <br/>3 batches/year = ₹42,000 annual loss
                    </p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="font-semibold text-primary text-sm mb-2">With PoultryCo:</p>
                    <p className="text-sm text-foreground/80">
                      Check app. See ₹102/kg is real rate. Wait for right price. Sell at peak. <strong>Save ₹10-30K/year</strong> on better timing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Source 2: Reduced Mortality */}
              <div className="bg-white p-8 rounded-2xl border-2 border-primary/30 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Expert Access</h3>
                </div>
                
                <p className="text-lg font-semibold text-primary mb-4">₹20,000-50,000/year saved</p>
                
                <div className="space-y-3 mb-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">The Problem:</p>
                    <p className="text-sm text-muted-foreground">
                      Bird mortality at 3 AM. Local vet not answering. Google in panic. Try wrong treatment. Lose 200 birds.
                    </p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="font-semibold text-foreground text-sm mb-2">The Math:</p>
                    <p className="text-sm text-foreground/80">
                      Current mortality: 10-15% (industry average)
                      <br/>200 birds × ₹200/bird = <strong className="text-primary">₹40,000 lost per batch</strong>
                      <br/>Preventable with early expert advice
                    </p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="font-semibold text-primary text-sm mb-2">With PoultryCo:</p>
                    <p className="text-sm text-foreground/80">
                      Post question at 3 AM. 50+ vets on platform, someone answers in 8 minutes. Get right treatment. Reduce mortality 5-10%. <strong>Save ₹20-50K/year.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TOTAL IMPACT */}
            <div className="mt-10 bg-gradient-to-br from-primary/10 to-orange-500/10 p-10 rounded-3xl border-2 border-primary/30 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Total Annual Savings: <span className="text-primary">₹30,000-80,000</span>
              </h3>
              <p className="text-lg text-foreground/80 mb-2">
                ₹10-30K (pricing) + ₹20-50K (mortality) = ₹30-80K saved
              </p>
              <p className="text-sm text-muted-foreground">
                Based on survey of 500 farmers across Namakkal, Erode, Salem, Coimbatore, Vellore
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REAL EXAMPLE */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Real Example: Murugan's Story
            </h2>

            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  M
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Murugan R.</h3>
                  <p className="text-sm text-muted-foreground">Broiler Farmer, Namakkal | 2,000 birds/batch</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-foreground mb-2">Before PoultryCo (Annual Loss: ₹65,000):</p>
                  <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                    <li>• Sold at ₹95/kg (buyer's quote, no way to verify)</li>
                    <li>• Lost ₹7/kg × 2,000 birds = ₹14,000 per batch</li>
                    <li>• 12% mortality (no expert access at night)</li>
                    <li>• 240 birds lost/batch × ₹200 = ₹48,000/batch</li>
                    <li>• Annual: ₹42,000 (pricing) + ₹23,000 (mortality) = <strong className="text-orange-600">₹65,000 lost</strong></li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-primary mb-2">After PoultryCo (Annual Savings: ₹55,000):</p>
                  <ul className="text-sm text-foreground/80 space-y-2 pl-4">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Checks app daily. Waits for ₹102/kg. Sells at peak. <strong className="text-primary">Saves ₹28,000/year</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Posts emergency questions. Gets vet answers in minutes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Mortality down to 7%. 100 birds saved/batch. <strong className="text-primary">Saves ₹27,000/year</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">
                    Total Annual Savings: <span className="text-primary">₹55,000</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    ₹28K (better pricing) + ₹27K (reduced mortality) = ₹55K profit improvement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              When You See the Impact
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-8 rounded-2xl text-center">
                <div className="text-4xl font-bold text-primary mb-3">Week 1</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Immediate Tool Access</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate FCR accurately. Check today's market prices. Save first ₹2-3K on better decisions.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl text-center">
                <div className="text-4xl font-bold text-primary mb-3">Month 1</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Expert Network Built</h3>
                <p className="text-sm text-muted-foreground">
                  Connected with 3 vets. Got help on disease issue. Saved 50 birds (₹10,000). See ROI clearly.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl text-center">
                <div className="text-4xl font-bold text-primary mb-3">Year 1</div>
                <h3 className="text-lg font-bold text-foreground mb-2">Full Annual Savings</h3>
                <p className="text-sm text-muted-foreground">
                  Better pricing all year. Mortality consistently lower. Total savings: ₹30-80K realized.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Every Day You Wait, You Lose Money
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              2,000+ farmers already saving ₹30-80K/year. Your competitors know today's rates. They have expert access. They're reducing mortality. Where are you?
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Saving Today - It's Free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Join 2,000+ farmers who stopped losing money to middlemen. Free forever.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

