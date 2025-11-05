import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Verification is Trust | Why the Blue Badge Matters",
  description: "In an industry losing ₹5,000 Cr annually to fake products, verified badges separate quality from fraud. Learn how PTIC verification protects everyone.",
  keywords: ["verified poultry vet", "verified badge", "PTIC verification", "trust badges poultry", "credential verification"],
  openGraph: {
    title: "Verification is Trust | Why the Blue Badge Matters",
    description: "₹5,000 Cr lost to fakes. Verification changes everything.",
    type: "article",
  },
};

export default function VerificationIsTrustPage() {
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
              In a World of Fakes,{" "}
              <span className="text-primary">Trust is Everything</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              The poultry industry loses ₹5,000 Crore annually to fake products and unqualified advisors. The blue verified badge is how we separate quality from fraud.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              PTIC verifies. Community trusts. Everyone wins.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Get Verified - Build Trust
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#why">See How Verification Works</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Manual PTIC Review</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Degree Validated</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Can't Be Faked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section id="why" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              The ₹5,000 Crore Problem
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Every year, the poultry industry loses <strong className="text-orange-600">₹5,000 Crore</strong> to fake products and unqualified advisors. Counterfeit medicine. Substandard feed labeled as premium. People claiming veterinary expertise without degrees.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-10">
                <div className="bg-orange-50 p-6 rounded-2xl border-l-4 border-orange-500">
                  <h3 className="text-xl font-bold text-foreground mb-2">Fake Products</h3>
                  <p className="text-muted-foreground">Medicine that doesn't work. Feed with wrong composition. Equipment that fails.</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl border-l-4 border-orange-500">
                  <h3 className="text-xl font-bold text-foreground mb-2">Unqualified Advisors</h3>
                  <p className="text-muted-foreground">People giving vet advice without BVSc degrees. Nutritionists without credentials.</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl border-l-4 border-orange-500">
                  <h3 className="text-xl font-bold text-foreground mb-2">No Way to Verify</h3>
                  <p className="text-muted-foreground">On WhatsApp, Facebook, anyone can claim anything. No verification system.</p>
                </div>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed">
                A farmer loses ₹50,000 worth of birds because he took advice from someone who claimed to be a vet but wasn't. A genuine vet loses clients because someone is impersonating them online. <strong>Trust is broken.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              The Blue Badge: PTIC-Verified Credentials
            </h2>

            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20 shadow-xl mb-10">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">What "Verified" Means on PoultryCo</h3>
                  <p className="text-lg text-foreground/80 leading-relaxed">
                    When you see a blue verified badge next to someone's name, PTIC (Section 8 Non-Profit) has manually reviewed and validated their credentials. Not automated. Not self-reported. <strong className="text-primary">Human-verified.</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">For Veterinarians:</p>
                    <p className="text-sm text-muted-foreground">BVSc/MVSc degree checked against university records. Veterinary license validated.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">For Businesses:</p>
                    <p className="text-sm text-muted-foreground">Business registration verified. Quality certifications checked. Product claims validated.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">For Experts:</p>
                    <p className="text-sm text-muted-foreground">Nutritionists, consultants, researchers—credentials validated by PTIC team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading">
              Why Verification Protects Everyone
            </h2>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="text-xl font-bold text-foreground mb-3">Farmers: Trust the Advice You Get</h3>
                <p className="text-foreground/80 leading-relaxed">
                  When Dr. Priya answers your question about Newcastle disease, you see her BVSc degree, 8 years experience, and 4.9-star rating from 50+ farmers. You're not gambling with your flock's life on anonymous advice.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="text-xl font-bold text-foreground mb-3">Vets: Your Expertise is Protected</h3>
                <p className="text-foreground/80 leading-relaxed">
                  You spent years earning your degree. Unqualified people can't claim to be vets on PoultryCo. Your verified badge means farmers know they're getting real expertise, not someone who watched YouTube videos.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-border">
                <h3 className="text-xl font-bold text-foreground mb-3">Businesses: Prove Your Quality</h3>
                <p className="text-foreground/80 leading-relaxed">
                  You make legitimate, quality products. But farmers can't tell you apart from the fakes. Verified badge shows: PTIC checked your certifications, visited your facility, validated your claims. Trust earned, not claimed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-10 rounded-3xl border-2 border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Every Business Deserves to Prove Quality
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                You make good products. You treat diseases correctly. You give honest advice. But in a world of fakes, how do you prove it?
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed mt-4">
                <strong className="text-primary">The verified badge is your proof.</strong> PTIC validates your credentials so farmers can trust you with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Get Verified. Stand Out from Fakes.
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              50+ verified vets already building their reputation. 100+ verified businesses proving quality. Be recognized for your real expertise, not lost among imposters.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Verification Process
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Upload credentials. PTIC reviews. You get verified badge. Trust built.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

