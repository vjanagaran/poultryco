import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Vets Grow Practice 2-3x | Discovery + Reputation Building",
  description: "3-5 new clients/week. 2-3x practice growth in 6 months. ₹30K-1.5L extra revenue/year. Real case studies from verified veterinarians.",
  keywords: ["vet practice growth", "veterinary clients", "grow vet practice", "vet revenue increase"],
  openGraph: {
    title: "Vets Grow Practice 2-3x | Real Growth Numbers",
    description: "From 15 to 45 clients. From ₹40K to ₹80K/month. 6 months.",
    type: "article",
  },
};

export default function VetsGrowPracticePage() {
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
              From 15 Clients to{" "}
              <span className="text-primary">45 Clients</span>{" "}
              in 6 Months
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Discovery + reputation building = 2-3x practice growth. 3-5 new inquiries/week from verified profile. ₹30,000-1,50,000 extra revenue/year. Here are real examples.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Discovery. Reputation. Growth. 0% commission.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Grow Your Practice
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#examples">See Real Examples</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>10x Visibility Increase</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>3-5 Inquiries/Week</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section id="examples" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-heading text-center">
              Real Growth Examples
            </h2>

            <div className="space-y-8">
              {/* Example 1: Young Vet */}
              <div className="bg-muted/30 p-8 rounded-3xl border-2 border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    Dr.R
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Dr. Ravi Kumar, BVSc</h3>
                    <p className="text-sm text-muted-foreground">Namakkal | 8 years experience | Young Vet</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl">
                    <p className="font-semibold text-muted-foreground mb-3">Before PoultryCo:</p>
                    <ul className="text-sm text-foreground/80 space-y-2">
                      <li>• 15 regular clients (word-of-mouth only)</li>
                      <li>• 20-25 consultations/month</li>
                      <li>• 10km service radius</li>
                      <li>• ₹30-40K/month revenue</li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary">
                    <p className="font-semibold text-primary mb-3">After PoultryCo (6 months):</p>
                    <ul className="text-sm text-foreground/80 space-y-2 font-semibold">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>45 clients (+30 from platform discovery)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>60-70 consultations/month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>30km service radius (3x reach)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>₹70-90K/month revenue</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 text-center bg-white p-4 rounded-lg">
                  <p className="text-xl font-bold text-foreground">
                    Growth: <span className="text-primary">+100%</span> in 6 months
                  </p>
                </div>
              </div>

              {/* Example 2: Specialist */}
              <div className="bg-muted/30 p-8 rounded-3xl border-2 border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    Dr.P
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Dr. Priya S., MVSc</h3>
                    <p className="text-sm text-muted-foreground">Coimbatore | Layer Specialist | Niche Expert</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl">
                    <p className="font-semibold text-muted-foreground mb-3">Before PoultryCo:</p>
                    <ul className="text-sm text-foreground/80 space-y-2">
                      <li>• 25 layer farm clients (hard to discover)</li>
                      <li>• Limited to local referrals</li>
                      <li>• ₹60-80K/month revenue</li>
                      <li>• Expertise unknown beyond 15km</li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary">
                    <p className="font-semibold text-primary mb-3">After PoultryCo (6 months):</p>
                    <ul className="text-sm text-foreground/80 space-y-2 font-semibold">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>70 clients (+45 from platform)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>"Go-to expert" for layers statewide</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>₹1.8-2.2L/month revenue</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>Regional recognition achieved</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 text-center bg-white p-4 rounded-lg">
                  <p className="text-xl font-bold text-foreground">
                    Growth: <span className="text-primary">+200%</span> in 6 months
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW GROWTH HAPPENS */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              How the Growth Happens
            </h2>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">Discovery (10x Visibility)</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Farmers search "vet near Namakkal + broiler specialist + verified." Your profile appears. They see BVSc degree, 8 years experience, 4.9★ from 50 farmers. They contact you. Before: 15km radius. After: 50km+ reach.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">Reputation Building (Authority)</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Answer 20 questions publicly. Each answer linked to your profile. Farmers searching for "heat stress treatment" find your expert answer from 3 months ago. See your credentials. Contact you. Expertise compounds over time.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-4">Time Saved (5-7 Hours/Week)</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Answer common questions once publicly. 100 farmers read it. No more repeating "vaccination schedule for broilers" 10 times individually. More time for complex cases. Scalable knowledge sharing.
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
              Build the Practice You Deserve
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              You're qualified. You're experienced. You help farmers daily. But only 15-20 farmers know you exist. PoultryCo gives you the visibility your expertise deserves. 5,000+ farmers searching for vets right now.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Get Discovered by 5,000+ Farmers
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-6 opacity-75">
              Free forever. 0% commission. Just opportunities to grow.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

