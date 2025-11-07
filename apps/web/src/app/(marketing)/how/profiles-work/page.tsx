import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How Profiles Work | Consumer to Contributor Journey",
  description: "Profile strength 0-100%, unlock mechanics, consumer vs contributor tiers. Learn how your profile evolves from basic access to full contribution rights.",
  keywords: ["profile strength", "profile completion", "contributor unlock", "profile mechanics poultry"],
  openGraph: {
    title: "How Profiles Work | Consumer to Contributor Journey",
    description: "From 0% to 100%. From consumer to contributor. Here's how it works.",
    type: "article",
  },
};

export default function ProfilesWorkPage() {
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
              From{" "}
              <span className="text-primary">0% to 100%</span>:
              Your Profile Journey
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Your profile strength unlocks features. At 0%, you're a consumer. At 80%, you're a contributor. At 100% with verification, you're an expert.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Real-time calculator. Smart suggestions. Progressive unlocks.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Build Your Profile
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#calculator">See Strength Calculator</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>6 Sections to Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>80% Unlocks Contribution</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>100% + Verification = Expert</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFILE STRENGTH CALCULATOR */}
      <section id="calculator" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              How Profile Strength is Calculated
            </h2>

            <div className="bg-white p-8 rounded-3xl border-2 border-primary/20 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6">6 Sections = 100% Strength</h3>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="font-semibold text-foreground">Photo & Headline</p>
                      <p className="text-sm text-muted-foreground">Professional photo + clear headline</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">20%</span>
                </div>

                <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="font-semibold text-foreground">About & Bio</p>
                      <p className="text-sm text-muted-foreground">Tell your story in 500 characters</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">15%</span>
                </div>

                <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="font-semibold text-foreground">Roles & Expertise</p>
                      <p className="text-sm text-muted-foreground">Farmer, vet, supplier—what you do</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">15%</span>
                </div>

                <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="font-semibold text-foreground">Experience</p>
                      <p className="text-sm text-muted-foreground">Your work history and achievements</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">20%</span>
                </div>

                <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="font-semibold text-foreground">Education</p>
                      <p className="text-sm text-muted-foreground">Degrees, certifications, training</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">15%</span>
                </div>

                <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="font-semibold text-foreground">Skills</p>
                      <p className="text-sm text-muted-foreground">What you're good at (broiler farming, layer management, etc.)</p>
                    </div>
                  </div>
                  <span className="text-primary font-bold">15%</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-foreground font-semibold">
                  Reach <span className="text-primary text-xl">80%</span> to unlock contribution features
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNLOCKS */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              What Unlocks at Each Milestone
            </h2>

            <div className="space-y-6">
              <div className="bg-background p-8 rounded-2xl border-l-4 border-gray-400">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-gray-600">0-39%</div>
                  <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[20%] bg-gray-400"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Basic Consumer</h3>
                <p className="text-muted-foreground">
                  Use tools (FCR calculator, market data). Browse content. Read discussions. Basic profile visible.
                </p>
              </div>

              <div className="bg-background p-8 rounded-2xl border-l-4 border-orange-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-orange-600">40-79%</div>
                  <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-orange-500"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Active Consumer</h3>
                <p className="text-muted-foreground">
                  Everything from 0-39%, PLUS profile looks professional. People start connecting with you. Higher visibility in search.
                </p>
              </div>

              <div className="bg-primary/5 p-8 rounded-2xl border-l-4 border-primary shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-primary">80-100%</div>
                  <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-primary"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Contributor Status 🔓 UNLOCKED</h3>
                <p className="text-foreground/80 font-semibold mb-3">
                  Everything from previous levels, PLUS:
                </p>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Ask questions to the community</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Post articles and share knowledge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Answer questions from others</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Comment and engage fully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Build reputation through contributions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SMART SUGGESTIONS */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Smart Recommendations Guide You
            </h2>

            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              We don't just show a percentage. We tell you exactly what to add next to increase your strength. Real-time guidance as you build.
            </p>

            <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/20">
              <p className="font-semibold text-foreground mb-4">Example Suggestions You'll See:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-foreground/80">
                    "Add professional photo to increase strength by 15%" (Priority: High)
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-foreground/80">
                    "Complete About section to reach 80% (unlock contribution)" (Priority: High)
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-foreground/80">
                    "Add 2 more skills to strengthen your expertise visibility" (Priority: Medium)
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
              Start at 0%. Grow to 100%. Unlock Opportunities.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Every section you complete opens more doors. At 80%, you unlock contribution. At 100% with verification, you become a trusted expert. The journey is clear.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Build Your Professional Profile
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

