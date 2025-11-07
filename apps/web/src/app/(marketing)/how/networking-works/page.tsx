import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How Networking Works | Connections vs Following Explained",
  description: "Connections are 2-way relationships (both approve). Following is 1-way (instant). Learn when to use each and how to build a quality network of 50-100 professionals.",
  keywords: ["poultry networking", "connections vs following", "build network", "professional connections poultry"],
  openGraph: {
    title: "How Networking Works | Connections vs Following",
    description: "2-way vs 1-way. When to connect, when to follow. Build quality network.",
    type: "article",
  },
};

export default function NetworkingWorksPage() {
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
              Build a Network That{" "}
              <span className="text-primary">Actually Helps</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Connections are 2-way relationships (both approve). Following is 1-way (instant). Learn when to use each and how to build a quality network of 50-100 professionals.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Quality over quantity. Strategic connections. Real relationships.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Start Building Your Network
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#difference">See the Difference</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Connections (2-Way)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Following (1-Way)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Build Strategically</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONNECTIONS VS FOLLOWING */}
      <section id="difference" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-heading text-center">
              Connections vs Following: When to Use Each
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Connections */}
              <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/30">
                <h3 className="text-2xl font-bold text-foreground mb-4">Connections (2-Way)</h3>
                <p className="text-muted-foreground mb-6">
                  Like LinkedIn. You send request. They accept. Now you're mutually connected.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">When to Use:</p>
                      <p className="text-sm text-muted-foreground">People you know, peers in your region, potential collaborators</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Benefits:</p>
                      <p className="text-sm text-muted-foreground">Can message directly, see each other's content first, mutual trust signal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Best Practice:</p>
                      <p className="text-sm text-muted-foreground">Build 50-100 quality connections (not 1,000 random people)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Following */}
              <div className="bg-muted/30 p-8 rounded-2xl border-2 border-border">
                <h3 className="text-2xl font-bold text-foreground mb-4">Following (1-Way)</h3>
                <p className="text-muted-foreground mb-6">
                  Like Twitter/Instagram. You follow instantly. No approval needed. See their content.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">When to Use:</p>
                      <p className="text-sm text-muted-foreground">Experts you want to learn from, businesses you're interested in, thought leaders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Benefits:</p>
                      <p className="text-sm text-muted-foreground">See their content in your feed, learn from their expertise, no relationship needed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Best Practice:</p>
                      <p className="text-sm text-muted-foreground">Follow experts, upgrade to connection when relationship builds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center bg-primary/5 p-6 rounded-2xl">
              <p className="text-lg text-foreground/80">
                <strong>Pro Tip:</strong> Start by following experts (learn). Build connections with peers (collaborate). Aim for 50 quality connections in your first 3 months.
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
              Your Network is Your Net Worth
            </h2>
            <p className="text-xl mb-8 opacity-90">
              50 quality connections give you market intelligence, expert access, and business opportunities. Start building relationships with people who understand your challenges.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Connecting with Professionals
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

