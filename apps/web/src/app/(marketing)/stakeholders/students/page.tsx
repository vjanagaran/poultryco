import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Students and Interns | PoultryCo",
  description: "Real projects with 5,000 users. Research opportunities. Internships with stipends. Portfolio-worthy work. Agriculture, vet, engineering students welcome.",
  keywords: ["agriculture internship", "vet student projects", "poultry research", "agri-tech internship India", "real-world projects"],
  openGraph: {
    title: "For Students and Interns | PoultryCo",
    description: "Real projects. Real data. Real impact on your resume. Build features used by 5,000 farmers.",
    type: "website",
  },
};

export default function StudentsPage() {
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
              Real Projects. Real Data.{" "}
              <span className="text-primary">Real Career.</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              College projects = fake datasets. <strong className="text-orange-600">Recruiters know.</strong> Your resume gets ignored. Build something real.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Work on 5,000-user platform. Get published. Earn stipend.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Apply for Internship
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Engineering Students</h3>
              <p className="text-muted-foreground mb-4">
                React Native app development. AI/ML on real farmer data. Portfolio projects recruiters value.
              </p>
              <p className="text-primary font-semibold">₹10-15K/month stipend</p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Agriculture Students</h3>
              <p className="text-muted-foreground mb-4">
                Farm data analysis. Field research. Content creation. Technology adoption studies.
              </p>
              <p className="text-primary font-semibold">Publication co-authorship</p>
            </div>

            <div className="bg-background p-8 rounded-2xl border-2 border-primary/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Vet Students</h3>
              <p className="text-muted-foreground mb-4">
                Telemedicine research. Disease surveillance. Clinical decision support. Rural practice exposure.
              </p>
              <p className="text-primary font-semibold">Research opportunities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Build Real Impact - Get Real Opportunities
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Your work helps 5,000 farmers. Your resume shows measurable social impact. Agri-tech companies recruit from PoultryCo.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Apply for Projects
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

