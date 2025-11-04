import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Poultry Nutritionists | PoultryCo",
  description: "Showcase your formulation expertise. Connect with farms and feed mills. Build your reputation. Reach 5,000+ potential clients. Free forever.",
  keywords: ["poultry nutritionist", "feed formulation consultant", "poultry nutrition expert", "feed mill consultant India"],
  openGraph: {
    title: "For Poultry Nutritionists | PoultryCo",
    description: "Showcase formulation expertise. Connect with farms and feed mills. Build reputation as regional expert.",
    type: "website",
  },
};

export default function NutritionistsPage() {
  return (
    <>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Your Feed Formulations{" "}
              <span className="text-primary">Deserve Recognition</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              You optimize FCR, reduce costs, improve performance. But <strong className="text-orange-600">farms and feed mills can&apos;t find you.</strong>
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Verified profile. Showcase expertise. Reach 5,000+ clients.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Join as Nutritionist
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              How PoultryCo Helps Nutritionists
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Showcase Expertise</h3>
              <p className="text-muted-foreground">
                Post formulations, write articles, answer questions. Build reputation as regional expert.
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Find Clients</h3>
              <p className="text-muted-foreground">
                Farms and feed mills search for nutritionists. Your verified profile appears. Direct inquiries.
              </p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Collaborate</h3>
              <p className="text-muted-foreground">
                Connect with vets, farmers, feed mills. Holistic approach to farm nutrition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Reach 5,000+ Farms and Feed Mills
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Build your verified profile. Showcase formulations. Get discovered by clients actively seeking nutrition expertise.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Create Your Profile - Free
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

