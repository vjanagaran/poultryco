import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Hatchery Operators | PoultryCo",
  description: "Connect with farmers needing DOCs. Showcase quality breeds. Build reputation. Demand forecasting. Free business profile.",
  keywords: ["poultry hatchery", "DOC supplier", "chick hatchery India", "broiler chicks", "layer chicks"],
  openGraph: {
    title: "For Hatchery Operators | PoultryCo",
    description: "Connect with 5,000+ farmers. Showcase quality. Build verified reputation.",
    type: "website",
  },
};

export default function HatcheriesPage() {
  return (
    <>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Connect with Farmers{" "}
              <span className="text-primary">Needing Quality DOCs</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8">
              5,000+ farmers starting new batches every week. Let them find your hatchery, see your quality, and place orders directly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  List Your Hatchery - Free
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
            <h2 className="text-3xl font-bold mb-6">Showcase Your Breeds. Build Reputation.</h2>
            <Button size="lg" variant="secondary" className="bg-white text-primary font-bold px-8 py-6" asChild>
              <Link href="/register">Create Business Profile</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

