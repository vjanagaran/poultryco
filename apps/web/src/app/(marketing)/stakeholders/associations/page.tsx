import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Farmer Associations | PoultryCo",
  description: "Give members ₹3-8 Cr total savings. Boost engagement 2-3x. Prove your impact with data. Free partnership. No financial commitment.",
  keywords: ["farmer association India", "poultry association partnership", "member engagement tools", "farmer association benefits"],
  openGraph: {
    title: "For Farmer Associations | PoultryCo",
    description: "Transform member lives with free digital tools. ₹3-8 Cr total savings for 1,000 members.",
    type: "website",
  },
};

export default function AssociationsPage() {
  return (
    <>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Your Members Deserve{" "}
              <span className="text-primary">₹80,000 Extra</span> This Year
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              You&apos;re working hard to help farmers. But can you <strong className="text-orange-600">prove your association&apos;s impact with data?</strong>
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Free tools for members. Admin dashboard. Zero cost.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Partner with PoultryCo (No Cost)
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#impact">See Member Impact</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE SECTION */}
      <section id="impact" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              What Your Members Get (All Free)
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Market Intelligence</h3>
              <p className="text-muted-foreground mb-4">
                Live prices, historical trends, FCR calculator, profit analyzer. Everything to save ₹30K-80K/year.
              </p>
              <p className="text-primary font-semibold">
                ₹10-30K savings/member/year
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Expert Network</h3>
              <p className="text-muted-foreground mb-4">
                50+ verified vets, peer learning, Q&A community. Reduce mortality, improve farming practices.
              </p>
              <p className="text-primary font-semibold">
                ₹20-50K savings/member/year
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Professional Network</h3>
              <p className="text-muted-foreground mb-4">
                Connect with suppliers, other farmers, businesses. Build relationships that grow their business.
              </p>
              <p className="text-primary font-semibold">
                Priceless connections
              </p>
            </div>
          </div>

          <div className="mt-16 text-center bg-primary/5 p-8 rounded-2xl max-w-4xl mx-auto">
            <p className="text-3xl font-bold text-foreground mb-3">
              For 1,000-Member Association: <span className="text-primary">₹3-8 Crore Total Savings</span>
            </p>
            <p className="text-muted-foreground">
              ₹30-80K per member × 1,000 members = Transformational impact you can prove
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Transform 1,000+ Farmer Lives. Show Measurable Impact.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              3 associations already partnered. 2,000+ members getting free tools. Your endorsement changes everything.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Partner with Us - Zero Cost
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

