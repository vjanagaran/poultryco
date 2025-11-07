import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "About PoultryCo | The Story Behind the Platform",
  description: "From a veteran farmer's plea to a platform transforming the industry. Learn about our mission, vision, and the debt to backyard birds that started it all.",
  keywords: ["PoultryCo story", "PTIC mission", "poultry platform origin", "founder story"],
  openGraph: {
    title: "About PoultryCo | The Story Behind the Platform",
    description: "This didn't start with a business plan. It started with a farmer's plea.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-heading leading-tight">
              The Story Behind{" "}
              <span className="text-primary">the Platform</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto">
              This didn't start with a business plan. It started with a veteran farmer's plea, a mother's sacrifice, and a debt that needed to be repaid.
            </p>
          </div>
        </div>
      </section>

      {/* ORIGIN HOOK */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-orange-500/5 p-10 rounded-3xl border-2 border-primary/20 mb-10">
              <p className="text-xl text-foreground/80 leading-relaxed italic text-center">
                "We lose thousands of birds to heat stroke. The information exists—somewhere in WhatsApp groups, somewhere with experts we cannot reach."
              </p>
              <p className="text-center text-muted-foreground mt-4">
                — Mr. Singaraj, Veteran Farmer<br/>
                PTSE 1st Edition, June 29, 2024, Namakkal
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                That moment changed everything. A respected industry leader—30+ years in poultry, founding chairman of Ponni Group, NECC Namakkal chairman—standing before 800 stakeholders, articulating the pain of an entire industry.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                But this story actually begins earlier. In a rural village in Tamil Nadu, where a mother raised hens to fund her son's education. Where backyard poultry made possible what seemed impossible: sending a village boy to College of Engineering, Guindy.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed">
                That boy built corporate ERPs internationally. Founded PoultryCare ERP, now serving 35+ enterprise clients across 8 countries. But he never forgot the birds that raised him. And when COVID brought him home to see his friend Prabharan managing 7 lakh birds on paper—a decade-long technology gap became impossible to ignore.
              </p>
            </div>

            <div className="mt-10 text-center">
              <Button size="lg" variant="primary" asChild>
                <Link href="/about/origin-story">
                  Read the Complete Origin Story
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-8 bg-background rounded-2xl">
                <h3 className="text-2xl font-bold text-foreground mb-4 font-heading">Mission</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Every farmer deserves fair prices. Every vet deserves recognition. Every business deserves trust. We're building the platform that makes this possible.
                </p>
              </div>

              <div className="text-center p-8 bg-background rounded-2xl">
                <h3 className="text-2xl font-bold text-foreground mb-4 font-heading">Vision</h3>
                <p className="text-foreground/80 leading-relaxed">
                  A world where every poultry professional—from backyard farmers to commercial operations—has access to knowledge, tools, and community that enable success.
                </p>
              </div>

              <div className="text-center p-8 bg-background rounded-2xl">
                <h3 className="text-2xl font-bold text-foreground mb-4 font-heading">Values</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Fairness through transparency. Trust through verification. Growth through collaboration. Free because of mission, not monetization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CURRENT STATUS */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading text-center">
              Where We Are Now
            </h2>

            <div className="bg-white p-10 rounded-3xl border-2 border-primary/20">
              <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                <strong className="text-primary">As of November 2025:</strong> PoultryCo is 20% complete with foundation set, authentication working, and core features being developed by 5 computer science students from KSR College alongside a dedicated team.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">What's Live:</h4>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Marketing website (this site)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Authentication systems (email, Google, LinkedIn, OTP)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Database infrastructure (Supabase, AWS SES)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Coming Soon:</h4>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Profile system (consumer to contributor journey)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Networking features (connections, discovery)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Stream and messaging (knowledge sharing)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-6 bg-primary/10 rounded-xl text-center">
                <p className="text-lg font-bold text-foreground">
                  Public Launch: <span className="text-primary">February 2026, PTSE 3rd Edition</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Promise made publicly. Accountability to the industry. Delivering as committed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIPS */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Building Together
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Farmer Associations</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  TNPFA, BCC, PFRC partnered for farmer reach and ground validation
                </p>
              </div>

              <div className="bg-background p-8 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Government Support</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  StartupTN backing provides credibility and institutional support
                </p>
              </div>

              <div className="bg-background p-8 rounded-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Academic Partnership</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  KSR College students building platform, learning real-world development
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE LINKS */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Explore Deeper
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/about/origin-story" className="group bg-muted/30 p-8 rounded-2xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">Full Origin Story</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  From backyard birds to digital platform. The complete 5-act narrative of how PoultryCo came to be.
                </p>
                <span className="text-sm text-primary font-semibold">
                  Read complete story →
                </span>
              </Link>

              <Link href="/about/letter-from-founder" className="group bg-muted/30 p-8 rounded-2xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">Letter from the Founder</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  A personal note on why this platform exists. The debt to mother's birds. The obligation to serve.
                </p>
                <span className="text-sm text-primary font-semibold">
                  Read personal letter →
                </span>
              </Link>

              <Link href="/about/ptic" className="group bg-muted/30 p-8 rounded-2xl border-2 border-border hover:border-primary hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">About PTIC</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  PoultryTech Innovation Council. Section 8 non-profit. The ecosystem vision enabling free transformation.
                </p>
                <span className="text-sm text-primary font-semibold">
                  Learn about PTIC →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL INVITATION */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              This is Just the Beginning
            </h2>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
              From one farmer's plea to a platform for thousands. From backyard birds to digital transformation. From individual struggle to collective strength. Join us in writing the next chapter.
            </p>
            <Button size="lg" variant="primary" className="px-8 py-6" asChild>
              <Link href="/register">
                Be Part of the Transformation
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
