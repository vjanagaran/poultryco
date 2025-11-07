import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Real Impact | Measurable Outcomes for Every Stakeholder",
  description: "Farmers save ₹60K/year. Vets grow 2-3x. FPOs prove ₹26-50L value. Network effects multiply benefits. Trust stops exploitation. See the numbers.",
  keywords: ["PoultryCo impact", "platform outcomes", "measurable benefits", "ROI poultry platform"],
  openGraph: {
    title: "Real Impact | Measurable Outcomes for Every Stakeholder",
    description: "Numbers. Case studies. Proof. Real impact, not promises.",
    type: "website",
  },
};

export default function ImpactHubPage() {
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
              Real{" "}
              <span className="text-primary">Impact</span>.
              Measurable Outcomes.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Numbers. Case studies. Proof. See exactly what farmers save, how vets grow, and why FPOs achieve measurable member value.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Survey-validated. Transparently sourced. Conservatively estimated.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Start Seeing Impact
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#outcomes">Explore Outcomes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* KEY STATS */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-12 font-heading text-center">
              Impact at a Glance
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-muted/30 rounded-2xl">
                <div className="text-5xl font-bold text-primary mb-3">₹30-80K</div>
                <p className="text-lg font-semibold text-foreground mb-2">Per Farmer/Year</p>
                <p className="text-sm text-muted-foreground">
                  Market intelligence + reduced mortality = measurable savings
                </p>
              </div>

              <div className="text-center p-8 bg-muted/30 rounded-2xl">
                <div className="text-5xl font-bold text-primary mb-3">2-3x</div>
                <p className="text-lg font-semibold text-foreground mb-2">Vet Practice Growth</p>
                <p className="text-sm text-muted-foreground">
                  Discovery + reputation = double or triple clients in 6 months
                </p>
              </div>

              <div className="text-center p-8 bg-muted/30 rounded-2xl">
                <div className="text-5xl font-bold text-primary mb-3">₹26-50L</div>
                <p className="text-lg font-semibold text-foreground mb-2">FPO Member Value</p>
                <p className="text-sm text-muted-foreground">
                  For 200 members: Provable impact shown at AGM with data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT CARDS */}
      <section id="outcomes" className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Explore <span className="text-primary">Measurable Outcomes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Click to see detailed breakdowns, case studies, and the math behind each impact area.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Link href="/impact/farmers-save-60k" className="group bg-background p-8 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
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
              <h3 className="text-2xl font-bold text-foreground mb-3 font-heading">Farmers Save ₹60K/Year</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Market intelligence + expert access = ₹30-80K annual savings. See Murugan's story and the math.
              </p>
              <span className="text-sm text-primary font-semibold">
                See detailed breakdown →
              </span>
            </Link>

            <Link href="/impact/vets-grow-practice" className="group bg-background p-8 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
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
              <h3 className="text-2xl font-bold text-foreground mb-3 font-heading">Vets Grow Practice 2-3x</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                15 → 45 clients in 6 months. Discovery + reputation = real growth. Dr. Ravi & Dr. Priya's examples.
              </p>
              <span className="text-sm text-primary font-semibold">
                See case studies →
              </span>
            </Link>

            <Link href="/impact/fpos-prove-value" className="group bg-background p-8 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
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
              <h3 className="text-2xl font-bold text-foreground mb-3 font-heading">FPOs Prove ₹26-50L Value</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Admin time + member savings = quantifiable FPO impact. Show data at AGM. Namakkal FPO example.
              </p>
              <span className="text-sm text-primary font-semibold">
                See the math →
              </span>
            </Link>

            <Link href="/impact/network-effects-multiplier" className="group bg-background p-8 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-heading">Network Effects Multiplier</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Why 1+1=3. Metcalfe's Law proven. Every new member multiplies value for existing members.
              </p>
              <span className="text-sm text-primary font-semibold">
                See the proof →
              </span>
            </Link>

            <Link href="/impact/trust-stops-exploitation" className="group bg-background p-8 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-heading">Trust Stops Exploitation</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                ₹5,000 Cr industry loss to fakes. Verification + transparency = end of exploitation.
              </p>
              <span className="text-sm text-primary font-semibold">
                See how trust works →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* DATA SOURCE */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-6">How We Validate These Numbers</h3>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <p className="font-semibold text-primary mb-2">Survey Data</p>
                  <p className="text-sm text-muted-foreground">
                    500 farmers across 5 districts. Pain points validated. Savings calculated.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">Expert Feedback</p>
                  <p className="text-sm text-muted-foreground">
                    5 veterinarians reviewed projections. 3 associations validated member benefits.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-primary mb-2">Conservative Estimates</p>
                  <p className="text-sm text-muted-foreground">
                    We use lower-range numbers. Real impact may be higher. Honesty builds trust.
                  </p>
                </div>
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
              Numbers Don't Lie. Experience the Impact.
            </h2>
            <p className="text-xl opacity-90 mb-8">
              2,000+ farmers saving money. 50+ vets growing practices. 3 FPOs proving member value. Real numbers. Real people. Real transformation happening now.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                See Your Own Impact - Join Free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

