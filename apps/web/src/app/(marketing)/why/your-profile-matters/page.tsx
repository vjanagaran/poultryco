import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Your Profile is Your Professional Currency | Why PoultryCo",
  description: "Why 80% profile completion gets you 10x more connections and opportunities. Learn how your profile becomes your reputation in the poultry community.",
  keywords: ["poultry profile tips", "professional profile completion", "networking profile", "verified profile benefits"],
  openGraph: {
    title: "Your Profile is Your Professional Currency | PoultryCo",
    description: "Complete profiles get opportunities. Incomplete profiles get ignored. Here's why.",
    type: "article",
  },
};

export default function YourProfileMattersPage() {
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
              Your Profile is Your{" "}
              <span className="text-primary">Professional Currency</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              In the poultry industry, wrong advice kills birds. Your profile tells others whether they should trust your expertise. 80% completion changes everything.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              25% profile = ignored. 80% profile = 10x opportunities.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Build Your Professional Profile
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#why">See the Difference</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>0-100% Strength Calculator</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Real-Time Recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Unlocks Contribution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE REALITY */}
      <section id="why" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              The Reality: Incomplete Profiles Get Ignored
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-muted/30 p-8 rounded-2xl border-2 border-orange-500/30">
                <h3 className="text-xl font-bold text-foreground mb-4">Farmer A (25% Profile)</h3>
                <ul className="space-y-3 text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>No photo (generic avatar)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>Headline: "Farmer" (vague)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>No experience listed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <span>Empty bio</span>
                  </li>
                </ul>
                <p className="text-foreground font-semibold mb-2">Posts a brilliant question:</p>
                <p className="text-sm text-muted-foreground italic mb-4">
                  "Need advice on heat stress management for 5,000 broilers in summer"
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-foreground/80">
                    <strong>Result:</strong> Gets 2 generic answers. People think: "Is this person even real?"
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/30 shadow-lg">
                <h3 className="text-xl font-bold text-foreground mb-4">Farmer B (85% Profile)</h3>
                <ul className="space-y-3 text-foreground/80 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Professional photo (farm background)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Headline: "Broiler Farmer | 5,000 birds | Namakkal"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Experience: "10 years broiler farming"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Bio filled with farm details</span>
                  </li>
                </ul>
                <p className="text-foreground font-semibold mb-2">Posts same question:</p>
                <p className="text-sm text-foreground/70 italic mb-4">
                  "Need advice on heat stress management for 5,000 broilers in summer"
                </p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-foreground/80">
                    <strong>Result:</strong> Gets 8 detailed answers from 3 verified vets. People see credibility, invest time to help.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center bg-primary/5 p-8 rounded-2xl border-2 border-primary/20">
              <p className="text-2xl font-bold text-foreground mb-2">
                Same Question. <span className="text-primary">10x Different Response.</span>
              </p>
              <p className="text-muted-foreground">
                Your profile determines whether experts invest their time to help you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY 80% MATTERS */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              Why 80% is the Magic Number
            </h2>

            <div className="prose prose-lg max-w-none mb-10">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                We didn't pick 80% randomly. After analyzing thousands of professional profiles, we found that <strong className="text-primary">80% completion is where credibility becomes visible</strong>.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-muted-foreground mb-2">0-40%</div>
                  <p className="text-sm text-muted-foreground">Looks abandoned</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">41-79%</div>
                  <p className="text-sm text-muted-foreground">Incomplete, questionable</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">80-100%</div>
                  <p className="text-sm text-foreground font-semibold">Professional, trustworthy</p>
                </div>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed">
                At 80%, you've added enough information for others to judge: Are you qualified? Are you experienced? Are you serious about this community?
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-6">What 80% Profile Unlocks:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">Ability to Ask Questions</p>
                    <p className="text-sm text-muted-foreground">Post problems, get expert answers from verified vets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">Share Knowledge & Build Reputation</p>
                    <p className="text-sm text-muted-foreground">Post articles, answer questions, establish expertise</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">10x More Connection Requests</p>
                    <p className="text-sm text-muted-foreground">People connect with credible profiles, not empty ones</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">Higher Search Visibility</p>
                    <p className="text-sm text-muted-foreground">Complete profiles rank higher in discovery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION CONNECTION */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-10 rounded-3xl border-2 border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
                Every Professional Deserves Recognition
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed text-center mb-6">
                You've spent years building expertise—whether it's managing a 10,000-bird farm or treating hundreds of disease cases. Your experience has value.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed text-center">
                Your 80% complete profile ensures that experience gets the recognition it deserves. Not buried. Not overlooked. <strong className="text-primary">Visible and valued.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Build a Profile That Opens Doors
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              5,000+ professionals with complete profiles are getting opportunities daily. Connection requests. Expert consultations. Business partnerships. Your expertise deserves the same visibility.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Building Your Profile Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Free forever. Start as consumer. Build credibility. Unlock opportunities.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

