import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How Discovery Works | Find the Right People Fast",
  description: "Search by location, specialty, reviews. Filter vets, suppliers, experts. Find exactly who you need in minutes, not days.",
  keywords: ["find poultry vet", "discover suppliers", "search experts", "poultry directory"],
  openGraph: {
    title: "How Discovery Works | Find the Right People Fast",
    description: "Location + specialty + reviews = find the perfect match in minutes.",
    type: "article",
  },
};

export default function DiscoveryWorksPage() {
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
              Find the{" "}
              <span className="text-primary">Right People</span>{" "}
              in Minutes
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Search by location + specialty + reviews. Whether you need a layer specialist vet in Namakkal or a verified feed mill in Erode—find them fast.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Location. Specialty. Reviews. Verified badges.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Discover Professionals
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#search">See Search Tips</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH STRATEGIES */}
      <section id="search" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading">
              Search Strategies That Work
            </h2>

            <div className="space-y-6">
              <div className="bg-muted/30 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Finding the Right Vet (Example)</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">1</div>
                    <div>
                      <p className="font-semibold text-foreground">Location: "Namakkal" (within 30km)</p>
                      <p className="text-sm text-muted-foreground">Narrows to vets near you for emergency visits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">2</div>
                    <div>
                      <p className="font-semibold text-foreground">Specialty: "Layer specialist"</p>
                      <p className="text-sm text-muted-foreground">Shows vets with layer expertise, not general</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">3</div>
                    <div>
                      <p className="font-semibold text-foreground">Verified: "Yes" (blue badge only)</p>
                      <p className="text-sm text-muted-foreground">Shows only PTIC-verified vets with validated BVSc degrees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">4</div>
                    <div>
                      <p className="font-semibold text-foreground">Sort by: "Rating" (highest first)</p>
                      <p className="text-sm text-muted-foreground">See 4.9-star vets with proven track records from other farmers</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-sm text-primary font-semibold">
                    Result: 3 verified layer specialist vets within 30km of Namakkal, all rated 4.8+, available for consultation.
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
              Stop Guessing. Start Finding.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              50+ verified vets. 100+ verified suppliers. 5,000+ professionals. All searchable by location, specialty, reviews. Find exactly who you need.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Discovering Now
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

