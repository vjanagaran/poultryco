import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How Tools Work | FCR Calculator, Market Data, Offline-First",
  description: "Breed-specific FCR calculator. Region-specific market data. Works offline without internet. Free forever. Built specifically for poultry professionals.",
  keywords: ["FCR calculator poultry", "broiler market prices", "poultry tools offline", "breed specific calculator"],
  openGraph: {
    title: "How Tools Work | Poultry-Specific, Free Forever",
    description: "Not generic calculators. Built for poultry. Works offline. Free.",
    type: "article",
  },
};

export default function ToolsWorkPage() {
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
              Tools Built for{" "}
              <span className="text-primary">Poultry</span>,
              Not Generic Farming
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              FCR calculator knows Cobb vs Vencobb breeds. Market data shows Namakkal vs Erode rates. Everything works offline. Because we understand poultry reality.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Breed-specific. Region-specific. Offline-first. Free.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Access All Tools Free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#tools">See All Tools</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>No Internet Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Poultry-Specific</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Always Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS LIST */}
      <section id="tools" className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Professional Tools (All Free, All Offline)
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">FCR Calculator (Most Requested)</h3>
                <p className="text-muted-foreground mb-4">
                  Input: Feed consumed, weight gained, breed type (Cobb, Ross, Vencobb)
                  <br/>Output: FCR, efficiency rating, comparison to breed standard
                </p>
                <p className="text-sm text-primary font-semibold">
                  Why breed-specific: Cobb 1.6 FCR is excellent. Vencobb 1.6 FCR is average. Context matters.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">Market Price Data</h3>
                <p className="text-muted-foreground mb-4">
                  Live broiler, layer, egg, feed prices by region. Namakkal vs Erode vs Chennai. Historical trends. Price alerts.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Why region-specific: ₹102/kg in Namakkal ≠ ₹98/kg in Chennai. Location matters.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">Feed Projection Calculator</h3>
                <p className="text-muted-foreground mb-4">
                  Project feed requirements by flock size, bird age, growth phase. Plan purchases, budget accurately.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Saves: ₹5,000-10,000/batch in feed wastage through accurate planning.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">Mortality Tracker</h3>
                <p className="text-muted-foreground mb-4">
                  Daily mortality tracking, trend analysis, alert thresholds. Catch problems early before they become disasters.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Early detection: 2% mortality spike = investigate now, not when it hits 10%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY OFFLINE */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Why Offline-First Matters
            </h2>

            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Farms don't always have stable internet. You need to calculate FCR at 5 AM when connectivity is poor. Market check at 2 AM before selling. <strong className="text-primary">Tools that only work online are useless.</strong>
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-foreground mb-2">PoultryCo Tools:</p>
                  <ul className="text-sm text-foreground/70 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Download once, use forever offline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Sync when internet available</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>No connectivity = no problem</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-muted-foreground mb-2">Generic Online Tools:</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">❌</span>
                      <span>Require internet every time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">❌</span>
                      <span>Don't work in farms with poor signal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">❌</span>
                      <span>Data charges add up</span>
                    </li>
                  </ul>
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
              Tools That Work When You Need Them
            </h2>
            <p className="text-xl mb-8 opacity-90">
              5 AM, no internet, need to calculate FCR? It works. 2 AM, checking market prices before morning sale? It works. Built for farm reality, not office assumptions.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Get Free Tools Now
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

