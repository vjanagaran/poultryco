import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How Verification Works | Get Your Verified Badge",
  description: "Phone → Address → Connections → Profile → Credentials. Learn the step-by-step verification process and what PTIC validates to give you the blue badge.",
  keywords: ["get verified badge", "PTIC verification process", "credential verification", "expert verification poultry"],
  openGraph: {
    title: "How Verification Works | Get Your Verified Badge",
    description: "5-step process. PTIC validates. You get blue badge. Trust earned.",
    type: "article",
  },
};

export default function VerificationWorksPage() {
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
              How to Get Your{" "}
              <span className="text-primary">Verified Badge</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              The blue verified badge means PTIC validated your credentials. Here's the exact process, what we check, and how long it takes.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              5 steps. Manual review. Credentials validated. Badge earned.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Start Verification
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#process">See the Process</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>1-2 Days Review Time</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>PTIC Manual Validation</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Can't Be Faked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 5-STEP PROCESS */}
      <section id="process" className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-heading text-center">
              The 5-Step Verification Process
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl border-l-4 border-primary">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Verify Your Phone Number</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We send OTP to your mobile. Enter code. Phone verified. This proves you're a real person, not a bot creating fake accounts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl border-l-4 border-primary">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Verify Your Address with Location</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Add your farm/clinic address. We use geo-location to confirm. This proves you're part of the poultry community (not random internet user).
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      Why: Location enables local connections, regional content, nearby vet discovery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl border-l-4 border-primary">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Build 5 Connections</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Connect with 5 people in your industry. They accept your requests. This proves you're engaged, not hit-and-run.
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      Why: Community members who invest in relationships contribute quality content.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-8 rounded-2xl border-l-4 border-primary">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Complete 80% of Your Profile</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Fill photo, headline, about, experience, education, skills. At 80%, people can judge your credibility. You unlock contributor status.
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      Why: Others need context to trust your advice. Complete profile = credible source.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-primary/10 p-8 rounded-2xl border-l-4 border-primary shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Upload Credentials for Expert Badge</h3>
                    <p className="text-foreground/80 leading-relaxed mb-4">
                      For vets: Upload BVSc/MVSc degree + license
                      <br />For businesses: Upload registration + certifications
                      <br />For experts: Upload relevant credentials
                    </p>
                    <p className="text-sm font-semibold text-foreground mb-3">
                      PTIC team manually reviews (1-2 days):
                    </p>
                    <ul className="text-sm text-foreground/80 space-y-2">
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Check degree against university records</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Validate license numbers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Verify certifications are authentic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>Approve or request additional documentation</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-4 bg-white rounded-lg">
                      <p className="text-sm text-primary font-bold">
                        ✓ Approved → Blue verified badge appears on your profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT GETS VERIFIED */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              What PTIC Verifies (By Role)
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">For Veterinarians</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>BVSc/MVSc degree certificate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Veterinary council registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Practice license (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Specialization certifications</span>
                  </li>
                </ul>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">For Businesses</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Business registration certificate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>GST number validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Quality certifications (ISO, FSSAI)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Product testing reports (if claimed)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">For Experts</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Educational credentials (PhD, MSc)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Professional certifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Work experience validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Published work (if researcher)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              What the Verified Badge Gets You
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20">
                <h3 className="font-bold text-foreground mb-3">Higher Visibility</h3>
                <p className="text-sm text-foreground/80">
                  Verified profiles rank higher in search. When farmers look for "vet near Namakkal," you appear first.
                </p>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20">
                <h3 className="font-bold text-foreground mb-3">Instant Credibility</h3>
                <p className="text-sm text-foreground/80">
                  Blue badge = PTIC validated. Farmers trust verified experts 10x more than unverified profiles.
                </p>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20">
                <h3 className="font-bold text-foreground mb-3">Expert Q&A Priority</h3>
                <p className="text-sm text-foreground/80">
                  Your answers appear first. Farmers seeking expert advice see verified experts prominently.
                </p>
              </div>

              <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20">
                <h3 className="font-bold text-foreground mb-3">Thought Leadership Status</h3>
                <p className="text-sm text-foreground/80">
                  Build regional reputation. Speaking opportunities. Media features. Association partnerships.
                </p>
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
              Get Verified. Stand Out as an Expert.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              50+ vets already have verified badges. 100+ businesses proven legitimate. Join them and let PTIC validate your expertise for the entire community to see.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Verification Process Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Sign up → Complete profile → Upload credentials → Get verified in 1-2 days
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

