import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Researchers and Academics | PoultryCo",
  description: "Access real farm data from 5,000+ users. Field research participants. Publication opportunities. Collaboration with PTIC. Research funding available.",
  keywords: ["poultry research", "agricultural research data", "farm research India", "poultry academic collaboration"],
  openGraph: {
    title: "For Researchers and Academics | PoultryCo",
    description: "Real-world data. 5,000+ users. Publication opportunities. Research collaboration.",
    type: "website",
  },
};

export default function ResearchersPage() {
  return (
    <>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Real Data.{" "}
              <span className="text-primary">Real Research</span>. Real Impact.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8">
              Access farmer behavior data, market trends, disease patterns from 5,000+ users. Field research participants. Publication opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Access Research Data
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">10-15 Publications. Real-World Impact.</h2>
            <p className="text-lg opacity-90 mb-8">
              AI/ML on real data. Behavioral economics. Technology adoption. Disease surveillance. Action research that matters.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary font-bold px-8 py-6" asChild>
              <Link href="/register">Apply for Research Collaboration</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

