import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "About PTIC | PoultryTech Innovation Council",
  description: "Section 8 non-profit organization enabling poultry industry transformation. PTSE events, PoultryCo platform, Academy, Policy Advocacy—all part of ecosystem vision.",
  keywords: ["PTIC", "PoultryTech Innovation Council", "Section 8 non-profit", "poultry industry transformation"],
  openGraph: {
    title: "About PTIC | PoultryTech Innovation Council",
    description: "The non-profit mission enabling industry transformation through ecosystem approach.",
    type: "website",
  },
};

export default function AboutPTICPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-heading leading-tight">
              About{" "}
              <span className="text-primary">PTIC</span>
            </h1>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-4">
              PoultryTech Innovation Council
            </p>
            <p className="text-lg text-muted-foreground">
              The non-profit ecosystem enabling poultry industry transformation
            </p>
          </div>
        </div>
      </section>

      {/* WHAT IS PTIC */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              What is PTIC?
            </h2>

            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20 mb-10">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                <strong>PoultryTech Innovation Council (PTIC)</strong> is a <strong className="text-primary">Section 8 non-profit company</strong> registered under India's Companies Act 2013. We exist to close the poultry industry's decade-long technology gap through ecosystem transformation.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-foreground mb-2">Legal Structure:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Section 8 Non-Profit Company</li>
                    <li>• Registered under Companies Act 2013</li>
                    <li>• Legally prohibited from profit distribution</li>
                    <li>• Mission enshrined in charter</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">Formation:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Discussions: Early 2024</li>
                    <li>• Announced: PTSE 1st (June 29, 2024)</li>
                    <li>• Officially formed: Mid-2024</li>
                    <li>• Co-founders: Janagaran + Prabharan</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-6">The Mission: Industry Bicycle</h3>

            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              Inspired by Steve Jobs' bicycle metaphor, PTIC's mission is to <strong className="text-primary">assemble all components (stakeholders) into one ecosystem</strong> that transforms industry efficiency from struggling to thriving.
            </p>

            <p className="text-lg text-foreground/80 leading-relaxed">
              Just as a bicycle transforms human efficiency from 47th to 1st rank, an ecosystem of connected stakeholders transforms industry capability exponentially.
            </p>
          </div>
        </div>
      </section>

      {/* WHY NON-PROFIT */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Why PTIC Had to Be Non-Profit
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Trust Factor</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Farmers are skeptical of for-profit platforms: "What's the hidden agenda?" Section 8 structure legally removes commercial conflict. Mission isn't marketing—it's legally binding.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Neutrality Requirement</h3>
                <p className="text-foreground/80 leading-relaxed">
                  No vendor gets privileged position. No stakeholder has unfair advantage. Everyone has equal standing. Competition remains fair. Community over commerce.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Market Positioning</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Large integrators (Suguna, Venky's, Godrej) already serve contract farmers (40% of market) with expensive ERPs. PTIC serves the <strong className="text-primary">forgotten 60%</strong>—independent farmers. No commercial conflict.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Sustainability Model</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Free access enables adoption at scale. CSR partnerships + government grants + community contribution = sustainable mission delivery. No paywall barriers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PTIC INITIATIVES */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              PTIC's Five Initiatives
            </h2>

            <div className="space-y-6">
              <div className="bg-primary/5 p-8 rounded-2xl border-l-4 border-primary">
                <h3 className="text-2xl font-bold text-foreground mb-3">1. PTSE (PoultryTech Summit & Expo)</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Annual event bringing all stakeholders to one physical space. Technology awareness, expert speakers, live demonstrations. Convergence catalyst.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Status: 2 editions completed (2024, 2025). 3rd edition Feb 2026.
                </p>
              </div>

              <div className="bg-primary/5 p-8 rounded-2xl border-l-4 border-primary">
                <h3 className="text-2xl font-bold text-foreground mb-3">2. PoultryCo (Digital Platform)</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Free digital platform connecting all stakeholders. Tools, knowledge sharing, verification, networking. Direct response to Mr. Singaraj's plea for connection.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Status: 20% complete. Launching Feb 2026 at PTSE 3rd Edition.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl border-l-4 border-gray-400">
                <h3 className="text-2xl font-bold text-foreground mb-3">3. Academy (Coming 2026-2027)</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Education beyond tools. Best practices, professional development, knowledge transfer, skill bridge building. Making expertise accessible.
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: Planned post-PoultryCo launch.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl border-l-4 border-gray-400">
                <h3 className="text-2xl font-bold text-foreground mb-3">4. Policy Advocacy (Coming 2027+)</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Amplifying small farmer voices to policymakers. Data-driven advocacy. Connecting government schemes to farmers. Systemic industry support.
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: Planned. Requires platform data for advocacy.
                </p>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl border-l-4 border-gray-400">
                <h3 className="text-2xl font-bold text-foreground mb-3">5. Poultry-Specific Incubation (Coming)</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Supporting poultry technology startups and innovations. Industry-focused incubation, stakeholder mentorship, pilot testing with real farms.
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: Vision stage. Timing depends on ecosystem maturity.
                </p>
              </div>
            </div>

            <div className="mt-10 text-center bg-white p-8 rounded-2xl border-2 border-primary/20">
              <p className="text-lg text-foreground/80">
                <strong className="text-primary">PoultryCo is one initiative within PTIC's broader ecosystem vision.</strong> The non-profit structure enables all five initiatives to remain free, neutral, and mission-driven.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GOVERNANCE */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading text-center">
              Governance & Partners
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Leadership</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li><strong>Janagaran:</strong> Co-founder & Promoter (Tech Stakeholder)</li>
                  <li><strong>Prabharan:</strong> Co-founder & Promoter (Farming Mentor)</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Key Partners</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li><strong>StartupTN:</strong> Government backing</li>
                  <li><strong>KSR College:</strong> Academic partnership</li>
                  <li><strong>Associations:</strong> TNPFA, BCC, PFRC</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="https://www.poultrytech.org" target="_blank" rel="noopener noreferrer">
                  Visit PTIC Website
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL MESSAGE */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-10 rounded-3xl border-2 border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                PTIC: The Ecosystem Vision
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                PoultryCo is one initiative within PTIC's broader mission. The non-profit structure ensures every initiative—events, platform, academy, advocacy—remains <strong className="text-primary">free, neutral, and mission-driven</strong>.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed mt-4">
                This is how we assemble the bicycle for the entire poultry industry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

