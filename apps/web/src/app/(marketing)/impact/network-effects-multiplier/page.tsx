import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Network Effects Multiplier | Why 1+1=3 in Practice",
  description: "Mathematical proof: 5,000 connected farmers > 5,000 isolated farmers. More members = more value for everyone. See the multiplier effect in action.",
  keywords: ["network effects", "platform value", "metcalfe's law", "community multiplier"],
  openGraph: {
    title: "Network Effects Multiplier | The Math Behind the Magic",
    description: "1 farmer alone = limited. 5,000 farmers connected = exponential value.",
    type: "article",
  },
};

export default function NetworkEffectsMultiplierPage() {
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
              The Network{" "}
              <span className="text-primary">Multiplier Effect</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              5,000 connected farmers create more value than 5,000 isolated farmers. It's not addition—it's multiplication. Here's the mathematical proof and real-world impact.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Your success helps others. Their success helps you.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Multiply Your Value
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#math">See the Math</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Metcalfe's Law (n²)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Exponential, Not Linear</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Everyone Wins</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE MATH */}
      <section id="math" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              The Mathematical Reality: n² Value
            </h2>

            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20 mb-10">
              <p className="text-lg text-foreground/80 mb-8 text-center">
                Network value follows <strong className="text-primary">Metcalfe's Law:</strong> Value = n² (number of users squared)
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-muted/30 rounded-xl">
                  <div className="text-5xl font-bold text-muted-foreground mb-3">100</div>
                  <p className="text-sm text-muted-foreground mb-4">Members</p>
                  <div className="text-3xl font-bold text-foreground mb-2">10,000</div>
                  <p className="text-xs text-muted-foreground">Possible Connections</p>
                </div>

                <div className="text-center p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <div className="text-5xl font-bold text-orange-600 mb-3">1,000</div>
                  <p className="text-sm text-muted-foreground mb-4">Members</p>
                  <div className="text-3xl font-bold text-foreground mb-2">1,000,000</div>
                  <p className="text-xs text-muted-foreground">Possible Connections</p>
                  <p className="text-xs text-orange-600 font-semibold mt-2">100x more value</p>
                </div>

                <div className="text-center p-6 bg-primary/10 rounded-xl border-2 border-primary/30">
                  <div className="text-5xl font-bold text-primary mb-3">5,000</div>
                  <p className="text-sm text-muted-foreground mb-4">Members</p>
                  <div className="text-3xl font-bold text-foreground mb-2">25,000,000</div>
                  <p className="text-xs text-muted-foreground">Possible Connections</p>
                  <p className="text-xs text-primary font-semibold mt-2">2,500x more value</p>
                </div>
              </div>

              <div className="mt-8 text-center bg-primary/5 p-6 rounded-xl">
                <p className="text-foreground/80">
                  Member #5,000 doesn't just add their own value. They create <strong className="text-primary text-xl">25 million more connection possibilities</strong> than member #1 did.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL EXAMPLES */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Network Effects in Practice
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-foreground mb-3">More Farmers = Better Prices</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  1 farmer knows local price. 5,000 farmers sharing data = regional trends visible. Price manipulation impossible.
                </p>
                <p className="text-primary font-semibold text-sm">
                  Impact: ₹10-30K/farmer/year saved
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-foreground mb-3">More Vets = Faster Help</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  5 vets = maybe someone available. 50 vets = someone always available 24/7. Emergency coverage.
                </p>
                <p className="text-primary font-semibold text-sm">
                  Impact: ₹20-50K/farmer/year (mortality reduction)
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-foreground mb-3">More Suppliers = Competition</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  10 suppliers = limited choice. 100+ suppliers = competitive pricing + quality focus. Reviews drive standards up.
                </p>
                <p className="text-primary font-semibold text-sm">
                  Impact: Better quality, fair prices
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
              Be Part of the Multiplier Effect
            </h2>
            <p className="text-xl mb-8 opacity-90">
              You don't compete for value—you create it. Every member you help becomes more valuable. Every connection you make opens doors for others. Growing together, literally.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Add Your Value to the Network
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

