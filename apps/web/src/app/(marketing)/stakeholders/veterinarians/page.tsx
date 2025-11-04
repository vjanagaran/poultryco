import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Veterinarians | PoultryCo",
  description: "Build the practice you deserve. Get discovered by 5,000+ farmers. Earn ₹30K-1.5L extra per year. Verified profile. 0% commission. Free forever.",
  keywords: ["veterinary practice growth", "poultry vet directory", "vet marketing platform", "veterinary clients India", "poultry consultation"],
  openGraph: {
    title: "For Veterinarians | PoultryCo",
    description: "Get discovered by 5,000+ farmers. Build your verified profile. Grow your practice 2-3x. Free forever.",
    type: "website",
  },
};

export default function VeterinariansPage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              You&apos;re a Great Vet. But Only{" "}
              <span className="text-primary">20 Farmers</span> Know That.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Your expertise is trapped in a 15km radius. <strong className="text-orange-600">Thousands of farmers need you</strong>—they just can&apos;t find you.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Verified profile. 5,000+ farmers. 0% commission. Free forever.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/register">
                  Get Discovered by 5,000+ Farmers
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#growth">See Growth Potential</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>0% Commission</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Degree Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS SECTION */}
      <section id="growth" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Three Reasons Your Practice Isn&apos;t Growing
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="bg-background p-8 rounded-2xl border border-border">
              <h3 className="text-xl font-bold text-foreground mb-3">You&apos;re Invisible</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Farmers Google "vet near me" → Random results. No verified directory for poultry vets. New clients = word of mouth only.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                💔 "I&apos;m qualified. Why aren&apos;t farmers finding me?"
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border border-border">
              <h3 className="text-xl font-bold text-foreground mb-3">Same Questions Daily</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                10 farmers ask "What vaccination schedule for broilers?" You answer 10 times individually. No scalable knowledge sharing.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                💔 "I&apos;m wasting time on repetitive work."
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border border-border">
              <h3 className="text-xl font-bold text-foreground mb-3">No Recognition</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You solve 100 cases. No one knows. Unqualified advisors compete unfairly. Hard to differentiate yourself.
              </p>
              <p className="text-sm text-orange-600 font-semibold">
                💔 "My expertise is undervalued."
              </p>
            </div>
          </div>

          {/* Solutions */}
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-8 font-heading">
              What If 5,000 Farmers Could Find You, Rate You, Hire You?
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Get Discovered</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Verified "BVSc, Poultry Specialist" profile. Farmers search "vet near Namakkal + layer expert." Your profile appears with 5-star reviews.
              </p>
              <p className="text-primary font-semibold">
                💪 Result: 3-5 new inquiries/week
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Save Time</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Answer common questions once (publicly visible). Create vaccination guides. 30% fewer repetitive consultations.
              </p>
              <p className="text-primary font-semibold">
                💪 Result: 5-7 hours saved/week
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Build Authority</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Share case studies. Write articles. Get media recognition. Speaking invitations from associations.
              </p>
              <p className="text-primary font-semibold">
                💪 Result: Regional expert status
              </p>
            </div>
          </div>

          <div className="mt-16 text-center bg-primary/5 p-8 rounded-2xl border border-primary/20 max-w-4xl mx-auto">
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Extra Revenue: <span className="text-primary">₹30,000-1,50,000/Year</span>
            </p>
            <p className="text-muted-foreground">
              2-3 new clients/month at avg ₹2,000/consultation = ₹48,000-72,000/year minimum
            </p>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              Vets Growing Their Practice on PoultryCo
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-muted/30 p-8 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  Dr.R
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Dr. Ravi Kumar, BVSc</h4>
                  <p className="text-sm text-muted-foreground">Namakkal | 8 years experience</p>
                </div>
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                "In 2 months, I got 8 new clients from PoultryCo. All because of my verified profile and 5-star reviews. Now farmers from 30km away call me."
              </p>
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-foreground">15 → 45</div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">+100%</div>
                  <div className="text-sm text-muted-foreground">Growth</div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-8 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  Dr.P
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Dr. Priya S., MVSc</h4>
                  <p className="text-sm text-muted-foreground">Coimbatore | Layer Specialist</p>
                </div>
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                "I answered 20 questions publicly in my first month. Farmers see my expertise. Now I&apos;m the go-to layer specialist in the region."
              </p>
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg">
                <div>
                  <div className="text-2xl font-bold text-foreground">25 → 70</div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">+180%</div>
                  <div className="text-sm text-muted-foreground">Growth</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              Start Growing in <span className="text-primary">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Create Your Profile</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add credentials (BVSc, MVSc), specialization, service area. Upload degree for verification. Takes 15 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Get Verified</h3>
              <p className="text-muted-foreground leading-relaxed">
                We verify your degree. You get "Verified Veterinarian" badge. Farmers trust verified profiles 10x more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Start Getting Clients</h3>
              <p className="text-muted-foreground leading-relaxed">
                Answer questions. Build reputation. Farmers find you through search. Expect 3-5 inquiries/week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-heading">
              Questions from Veterinarians
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-muted/30 p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">Will this replace in-person consultations?</h3>
              <p className="text-muted-foreground leading-relaxed">
                No! It&apos;s a discovery tool. 80%+ cases still need physical exams. This helps farmers find you. You still provide hands-on care.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">What if I&apos;m too busy already?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Start small. Answer 2-3 questions/week to build reputation. Many successful vets spend just 30 minutes/day and get significant client growth.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">Do you take commission on my consultations?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Never. 0% commission. Platform is discovery tool. You set your fees. Farmers pay you directly. We don&apos;t touch your earnings.
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">How do you verify veterinarians?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload BVSc/MVSc degree + license. We verify with university/council. Only verified vets get "Verified Veterinarian" badge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Build the Practice You Deserve
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              5,000+ farmers are searching for qualified vets right now. Your competitors are already here. Be discovered today.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6"
              asChild
            >
              <Link href="/register">
                Create Your Profile - It&apos;s Free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="text-sm mt-4 opacity-75">
              Free forever. 0% commission. Just opportunities to grow.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

