import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "FPOs Prove ₹26-50L Value | Admin Time + Member Savings",
  description: "For 200-member FPO: 8-10 hours/week admin time saved + ₹13-25K per member savings = ₹26-50 Lakh total impact. Show measurable value at AGM.",
  keywords: ["FPO impact", "FPO member value", "cooperative savings", "FPO digital tools ROI"],
  openGraph: {
    title: "FPOs Prove ₹26-50L Value | Measurable Impact",
    description: "Admin time saved. Member savings quantified. Impact proven with data.",
    type: "article",
  },
};

export default function FPOsProveValuePage() {
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
              Prove{" "}
              <span className="text-primary">₹26-50 Lakh</span>{" "}
              Impact at Your AGM
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              For 200-member FPO: Admin dashboard tracks bulk purchase savings, collective selling premium, member benefits. Show data, not just "trust me we saved money."
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Quantifiable impact. Data-driven advocacy. Measurable ROI.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Join as Pilot FPO (7 Slots Left)
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#breakdown">See the Math</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Free Year 1</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Dashboard Included</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Proven Impact</span>
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
              For 200-Member FPO: Where ₹26-50L Comes From
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20 text-center">
                <div className="text-4xl font-bold text-primary mb-3">₹5-10K</div>
                <p className="font-semibold text-foreground mb-2">Bulk Purchase Savings</p>
                <p className="text-sm text-muted-foreground">
                  Feed, chicks, medicine bought at FPO rates (per member/year)
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20 text-center">
                <div className="text-4xl font-bold text-primary mb-3">₹3-5K</div>
                <p className="font-semibold text-foreground mb-2">Collective Selling Premium</p>
                <p className="text-sm text-muted-foreground">
                  Better negotiated prices through aggregate supply (per member/year)
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20 text-center">
                <div className="text-4xl font-bold text-primary mb-3">₹5-10K</div>
                <p className="font-semibold text-foreground mb-2">Training Impact</p>
                <p className="text-sm text-muted-foreground">
                  Improved FCR, reduced mortality from expert access (per member/year)
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-10 rounded-3xl border-2 border-primary/30 text-center">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Total Member Impact: <span className="text-primary">₹13-25K per member/year</span>
              </h3>
              <p className="text-xl text-foreground/80 mb-6">
                × 200 members = <span className="text-primary font-bold text-3xl">₹26-50 Lakh</span> total FPO impact
              </p>
              <p className="text-sm text-muted-foreground">
                Plus: Chairman saves 8-10 hours/week on admin (₹50K-1L equivalent value)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Real FPO: Namakkal Broiler Farmers
            </h2>

            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20">
              <p className="text-lg text-foreground/80 mb-6">
                <strong>Profile:</strong> 250 members, focused on collective selling
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-foreground mb-4">Before PoultryCo:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Chairman: 15 hours/week coordinating sales</li>
                    <li>• Manual calls to check who has birds ready</li>
                    <li>• Buyers negotiated with individual farmers</li>
                    <li>• 40% member participation in activities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-primary mb-4">After PoultryCo (6 months):</h3>
                  <ul className="space-y-2 text-sm text-foreground/80 font-semibold">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Chairman: 5 hours/week (10 hours saved)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Digital tracking (one-click aggregate view)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Collective bargaining: ₹3/kg premium achieved</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>75% member participation (up from 40%)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg text-center">
                <p className="text-xl font-bold text-foreground">
                  Member Benefit: <span className="text-primary text-2xl">₹3,000-5,000</span> additional income/year each
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  × 250 members = ₹7.5-12.5 Lakh total impact for this FPO
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE ADMIN IMPACT */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Admin Time Saved: 8-10 Hours/Week
            </h2>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Before: Manual Coordination</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>50+ phone calls to collect bulk purchase requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>Excel sheets to track who paid membership fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>Individual calls to check who has birds ready for collective selling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>Manual reports for AGM (no data, just estimates)</span>
                  </li>
                </ul>
                <p className="text-sm text-orange-600 font-semibold mt-4">
                  Result: 15 hours/week on admin. Burnout. Can't prove FPO value.
                </p>
              </div>

              <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">After: Digital Management</h3>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Broadcast message: "Submit feed requirements." Done in 2 days (not 2 weeks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Dashboard shows: Who paid, who didn't. One-click view.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Digital tracking: See aggregate birds ready for sale instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Auto-generated reports: Export ₹26-50L impact data for AGM</span>
                  </li>
                </ul>
                <p className="text-sm text-primary font-semibold mt-4">
                  Result: 5 hours/week on admin. 10 hours saved. Provable impact with data.
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
              Show Members Exactly What FPO Does for Them
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              3 FPOs already using PoultryCo to prove member value. Dashboard shows: ₹5-10K bulk savings per member. ₹3-5K collective selling premium. Data-driven AGM presentations. Member retention up 30%.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Apply for Pilot Program
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Free Year 1. Test fully. Decide Year 2 based on proven value. 7 pilot slots remaining.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

