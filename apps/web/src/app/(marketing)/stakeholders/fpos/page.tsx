import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For FPOs and Cooperatives | PoultryCo",
  description: "Digital member management for FPOs. Save 8-10 hours/week on admin. Show ₹26-50L member impact with data. Free Year 1, ₹24K/year after.",
  keywords: ["FPO management software", "farmer producer organization tools", "cooperative management India", "FPO digital tools"],
  openGraph: {
    title: "For FPOs and Cooperatives | PoultryCo",
    description: "Free digital management tools for FPOs. Member management, bulk coordination, impact tracking. Free Year 1.",
    type: "website",
  },
};

export default function FPOsPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Lead a <span className="text-primary">Digital FPO</span>. Show Measurable Impact.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              You&apos;re running a ₹2 Crore FPO with Excel sheets. Members ask "What&apos;s the benefit?" <strong className="text-orange-600">You can&apos;t show data.</strong>
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Member management. Impact dashboard. Free Year 1.
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
                <Link href="#demo">See Dashboard Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section id="demo" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Running an FPO Shouldn&apos;t Be This Hard
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-background p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">❌ Coordinating bulk purchases = 50 phone calls</h3>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">❌ Tracking payments = Excel hell</h3>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">❌ Proving FPO value = "Trust me, we saved money"</h3>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">❌ Your time = 15 hours/week on admin alone</h3>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl text-orange-600 font-semibold">
              💔 Feeling: "I&apos;m a volunteer. This is burning me out."
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              What PoultryCo Gives Your FPO
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-muted/30 p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">Digital Member Management</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Complete member database (phone, farm size, type)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Automatic renewal reminders (SMS/WhatsApp)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Payment tracking (who paid, who didn&apos;t)
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">Bulk Activity Coordination</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Collect feed requirements digitally (2-3 days, not weeks)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Track who has birds ready for collective selling
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Training event registration & attendance
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">Instant Communication</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Broadcast to all members (SMS + WhatsApp + App)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Targeted messages (broiler farmers, Namakkal region)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Two-way feedback from members
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">Impact Dashboard</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Track bulk purchase savings (₹5-10K per member)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Show collective selling premium
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Export reports for AGM presentations
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 text-center bg-primary/5 p-8 rounded-2xl border border-primary/20 max-w-4xl mx-auto">
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              For 200-Member FPO: <span className="text-primary">₹26-50 Lakh Total Impact</span>
            </p>
            <p className="text-muted-foreground">
              Member savings + Admin time saved + Professional image = Quantifiable FPO value
            </p>
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-muted/30 p-10 rounded-3xl border-2 border-primary/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-heading">
                Namakkal Broiler Farmers FPO
              </h2>
              <p className="text-muted-foreground">250 members · Focused on collective selling</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-foreground mb-3">Before PoultryCo:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Chairman: 15 hours/week on coordination</li>
                  <li>• Individual calls to check bird readiness</li>
                  <li>• Buyers negotiated individually (lower prices)</li>
                  <li>• 40% member participation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-3">After PoultryCo (6 months):</h4>
                <ul className="space-y-2 text-foreground">
                  <li className="font-semibold">✓ Chairman: 5 hours/week (10 hrs saved)</li>
                  <li className="font-semibold">✓ Digital tracking (one-click aggregate)</li>
                  <li className="font-semibold">✓ Collective bargaining: ₹3/kg premium</li>
                  <li className="font-semibold">✓ 75% member participation</li>
                </ul>
              </div>
            </div>

            <div className="text-center p-6 bg-primary/10 rounded-lg">
              <p className="text-lg font-bold text-foreground">
                Member Benefit: <span className="text-primary text-2xl">₹3,000-5,000</span> additional income/year each
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
              Join as Pilot FPO - Only 7 Slots Remaining
            </h2>
            <p className="text-xl mb-8 opacity-90">
              3 FPOs already transforming member experience. Test free for 12 months. Decide Year 2 based on proven value.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Apply for Pilot Program
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-4 opacity-75">
              Free Year 1. Prove value. Then decide. No strings attached.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

