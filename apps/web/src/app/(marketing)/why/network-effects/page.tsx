import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Network Effects: Why 1+1=3 | PoultryCo",
  description: "Every new member makes the platform more valuable for everyone. Learn how network effects create exponential value in the poultry community.",
  keywords: ["network effects", "platform economics", "community value", "poultry networking benefits"],
  openGraph: {
    title: "Network Effects: Why 1+1=3 | PoultryCo",
    description: "More farmers = better prices. More vets = faster help. Everyone wins together.",
    type: "article",
  },
};

export default function NetworkEffectsPage() {
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
              Why{" "}
              <span className="text-primary">1 + 1 = 3</span>{" "}
              on PoultryCo
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Every new member makes the platform more valuable for existing members. It's not linear growth—it's exponential. Here's the math and the magic.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              More farmers = better for vets. More vets = better for farmers.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Be Part of the Network
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#examples">See Real Examples</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>5,000+ Connected Members</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Value Multiplies Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Everyone Wins Together</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXAMPLES */}
      <section id="examples" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-heading text-center">
              How Network Effects Work in Practice
            </h2>

            <div className="space-y-10">
              {/* Example 1 */}
              <div className="bg-muted/30 p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  More Farmers = <span className="text-primary">Better Prices for All</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">With 10 Farmers:</p>
                    <p className="text-foreground/80">Limited market data. Middlemen can still manipulate. Individual farmers powerless.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-2">With 5,000 Farmers:</p>
                    <p className="text-foreground/80">Crowdsourced prices across regions. Price manipulation impossible. Collective knowledge = collective power. <strong>₹60,000/year savings per farmer.</strong></p>
                  </div>
                </div>
              </div>

              {/* Example 2 */}
              <div className="bg-muted/30 p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  More Vets = <span className="text-primary">Faster Help for Farmers</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">With 5 Vets:</p>
                    <p className="text-foreground/80">Emergency at 3 AM? Maybe no one available. Limited expertise areas. Geographic gaps.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-2">With 50+ Vets:</p>
                    <p className="text-foreground/80">24/7 coverage. Someone always available. Specialists for every problem. Regional experts everywhere. <strong>Emergency help in minutes.</strong></p>
                  </div>
                </div>
              </div>

              {/* Example 3 */}
              <div className="bg-muted/30 p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  More Suppliers = <span className="text-primary">Quality Competition</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">With Few Suppliers:</p>
                    <p className="text-foreground/80">Limited options. No price comparison. Trust is a gamble. Quality unknown.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-2">With 100+ Verified Suppliers:</p>
                    <p className="text-foreground/80">Compare prices. Read reviews. Check certifications. Competition drives quality up, prices down. <strong>Better deals for farmers.</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE MATH */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              The Mathematical Reality
            </h2>
            
            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20 shadow-xl">
              <p className="text-lg text-foreground/80 mb-6">
                Network value follows <strong>Metcalfe's Law:</strong> Value = n² (number of users squared)
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div>
                  <div className="text-4xl font-bold text-muted-foreground mb-2">100</div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <div className="text-2xl font-bold text-foreground mt-2">10,000</div>
                  <p className="text-xs text-muted-foreground">Possible Connections</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">1,000</div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <div className="text-2xl font-bold text-foreground mt-2">1,000,000</div>
                  <p className="text-xs text-muted-foreground">Possible Connections</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">5,000</div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <div className="text-2xl font-bold text-foreground mt-2">25,000,000</div>
                  <p className="text-xs text-muted-foreground">Possible Connections</p>
                </div>
              </div>

              <p className="text-foreground/80">
                Member #1 creates value for everyone. Member #5,000 creates <strong className="text-primary">25 million times more connection possibilities</strong> than member #1 did.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              The More Who Join, The More You Benefit
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              You're not competing for scarce resources. You're multiplying value. Every farmer who joins improves market data. Every vet who joins increases expert availability. Your success helps others succeed.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Add Your Value to the Network
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Growing together. Not competing. Network effects in action.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

