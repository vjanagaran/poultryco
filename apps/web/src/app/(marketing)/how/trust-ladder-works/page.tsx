import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How the Trust Ladder Works | From Guest to Verified Expert",
  description: "Understand the 4-level journey: Guest → Consumer → Contributor → Verified Expert. Learn what unlocks at each level and how to climb the trust ladder.",
  keywords: ["trust ladder", "user levels", "verification process", "contribution requirements", "expert status"],
  openGraph: {
    title: "How the Trust Ladder Works | PoultryCo",
    description: "4 levels. Clear requirements. Progressive unlocks. Start as consumer, grow to expert.",
    type: "article",
  },
};

export default function TrustLadderWorksPage() {
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
              The{" "}
              <span className="text-primary">Trust Ladder</span>:
              Guest to Expert
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Everyone starts as a consumer with free tool access. Build credibility to unlock contribution. Get verified to become an expert. Clear path, clear benefits.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              4 levels. Progressive unlocks. Transparent requirements.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Start Your Journey
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#levels">See All Levels</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Start at Level 2 (Consumer)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Climb by Building Credibility</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Reach Expert Status</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 4 LEVELS */}
      <section id="levels" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-12 font-heading text-center">
              The 4 Levels of the Trust Ladder
            </h2>

            <div className="space-y-8">
              {/* Level 1: Guest */}
              <div className="bg-muted/20 p-8 rounded-2xl border border-border">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-gray-600">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-3">Level 1: Guest (Before Signup)</h3>
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      You can read marketing pages, explore our philosophy, understand stakeholder benefits. But can't access platform features yet.
                    </p>
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Access:</strong> Marketing pages, blog posts, philosophy pages
                        <br /><strong>Can't:</strong> Use tools, see content, browse profiles
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 2: Consumer */}
              <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/30">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-primary">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-3">Level 2: Consumer (After Signup)</h3>
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      Immediate access to all tools and community knowledge. No profile required. Start benefiting from day one.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/80 p-4 rounded-lg">
                        <p className="font-semibold text-primary mb-2">✓ Use All Tools:</p>
                        <ul className="text-sm text-foreground/70 space-y-1">
                          <li>• FCR calculator</li>
                          <li>• Market price data</li>
                          <li>• Feed projections</li>
                          <li>• Mortality tracker</li>
                        </ul>
                      </div>
                      <div className="bg-white/80 p-4 rounded-lg">
                        <p className="font-semibold text-primary mb-2">✓ Browse & Learn:</p>
                        <ul className="text-sm text-foreground/70 space-y-1">
                          <li>• Read all stream content</li>
                          <li>• Browse verified vets</li>
                          <li>• Discover suppliers</li>
                          <li>• Join conversations</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Requirements:</strong> Just sign up (free, 30 seconds)
                        <br /><strong>Can't:</strong> Post content, ask questions, answer questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 3: Contributor */}
              <div className="bg-primary/10 p-8 rounded-2xl border-2 border-primary/40">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-primary">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-3">Level 3: Contributor (Verified Identity + Network)</h3>
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      Everything from Level 2, PLUS ability to contribute content, ask questions, and build your reputation.
                    </p>
                    <div className="bg-white/80 p-4 rounded-lg mb-4">
                      <p className="font-semibold text-primary mb-2">Requirements to Reach Level 3:</p>
                      <ul className="text-sm text-foreground/70 space-y-2">
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><strong>Phone number verified</strong> (you're a real person, not a bot)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><strong>Address with geo location verified</strong> (you're part of the community)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><strong>Minimum 5 connections</strong> (you're engaged, not hit-and-run)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><strong>80% profile completion</strong> (people can judge your credibility)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-primary mb-2">✓ What You Can Do:</p>
                      <p className="text-sm text-foreground/70">
                        Ask questions, post articles, answer queries, comment on content, build your reputation through contributions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 4: Verified Expert */}
              <div className="bg-primary/20 p-8 rounded-2xl border-2 border-primary shadow-lg">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-3">Level 4: Verified Expert (PTIC Verified)</h3>
                    <p className="text-foreground/80 mb-4 leading-relaxed">
                      Everything from Level 3, PLUS blue verified badge, higher visibility in search, expert Q&A priority, and thought leadership status.
                    </p>
                    <div className="bg-white/90 p-4 rounded-lg mb-4">
                      <p className="font-semibold text-primary mb-2">Requirements for Verification:</p>
                      <ul className="text-sm text-foreground/70 space-y-2">
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><strong>All Level 3 requirements</strong> (verified, connected, complete profile)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><strong>Professional credentials uploaded</strong> (BVSc, MVSc, certifications)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><strong>PTIC manual review</strong> (degrees validated, credentials checked)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white/90 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-primary mb-2">✓ Expert Benefits:</p>
                      <p className="text-sm text-foreground/70">
                        Blue verified badge on profile, higher search rankings, expert Q&A priority, increased visibility, thought leadership status.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-12 text-center bg-primary/5 p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Typical Journey Timeline</h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground">Day 1</p>
                  <p className="text-muted-foreground">Level 2 (Consumer)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Week 1</p>
                  <p className="text-muted-foreground">Build 5 connections</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Week 2</p>
                  <p className="text-muted-foreground">Level 3 (Contributor)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Week 3-4</p>
                  <p className="text-muted-foreground">Level 4 (Verified Expert)</p>
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
              Start at Level 2. Climb to Expert.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Everyone begins with free tool access. Build credibility at your own pace. Reach expert status when you're ready. Clear path, clear benefits at every level.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Begin Your Journey - Level 2 Awaits
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

