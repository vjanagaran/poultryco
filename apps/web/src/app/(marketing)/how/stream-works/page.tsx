import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How Stream Works | Share Knowledge, Build Reputation",
  description: "Post questions, articles, problems, updates. Engage through likes, comments, shares. Build your professional reputation through valuable contributions.",
  keywords: ["poultry stream", "knowledge sharing", "professional content", "build reputation poultry"],
  openGraph: {
    title: "How Stream Works | Share Knowledge, Build Reputation",
    description: "Not WhatsApp chaos. Professional knowledge that lasts forever.",
    type: "article",
  },
};

export default function StreamWorksPage() {
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
              Share Knowledge.{" "}
              <span className="text-primary">Build Reputation</span>.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Stream is where professionals share expertise, ask questions, and build their reputation. Not temporary chat—permanent, searchable, valuable content.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Permanent. Searchable. Reputation-building.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Start Sharing Expertise
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#types">See Post Types</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>4 Content Types</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Searchable Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Linked to Your Profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POST TYPES */}
      <section id="types" className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              4 Types of Content You Can Share
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">1. Questions</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Ask the community for help. Verified vets, experienced farmers, expert nutritionists respond with advice.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Example: "My 5,000 broilers showing respiratory symptoms. What should I check first?"
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">2. Articles</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Share long-form knowledge. "How I Reduced Mortality from 12% to 5%"—your expertise helping thousands.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Example: Detailed guides, best practices, lessons learned from 10+ years farming.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">3. Problems</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Report urgent issues. Tag experts. Get fast help. Community rallies to solve problems together.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Example: "Emergency: Heat stroke affecting 200 birds. Need immediate vet advice."
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">4. Updates</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Share wins, milestones, observations. "Achieved 1.5 FCR this batch!"—celebrate with the community.
                </p>
                <p className="text-sm text-primary font-semibold">
                  Example: Success stories, market observations, seasonal tips, achievements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENGAGEMENT */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              How Engagement Builds Your Reputation
            </h2>

            <div className="bg-white p-8 rounded-3xl border-2 border-primary/20">
              <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                Every helpful answer you give, every insightful article you post, every problem you help solve—it's all linked to your profile. Over time, this builds your reputation as an expert.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <p className="text-sm text-muted-foreground">Helpful answers given</p>
                  <p className="text-xs text-primary mt-2">→ Regional expert status</p>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">10+</div>
                  <p className="text-sm text-muted-foreground">In-depth articles posted</p>
                  <p className="text-xs text-primary mt-2">→ Thought leader recognition</p>
                </div>

                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">100+</div>
                  <p className="text-sm text-muted-foreground">People helped through content</p>
                  <p className="text-xs text-primary mt-2">→ Community impact</p>
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
              Your Expertise Deserves a Permanent Home
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Stop losing your knowledge in WhatsApp scrolls. Build a library of expertise that helps farmers for years, builds your reputation, and positions you as a trusted expert.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Sharing Knowledge
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

