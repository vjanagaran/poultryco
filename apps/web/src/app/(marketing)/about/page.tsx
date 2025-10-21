import type { Metadata } from "next";
import Link from "next/link";
import { Container, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about PoultryCo's mission to connect and empower the global poultry industry.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-py bg-gradient-to-b from-background to-muted/30">
        <Container size="narrow">
          <div className="text-center space-y-6">
            <h1 className="heading-xl">
              Building the Future of{" "}
              <span className="text-gradient">Poultry Networking</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We&apos;re on a mission to connect and empower every professional
              in the global poultry industry.
            </p>
          </div>
        </Container>
      </section>

      {/* Our Story */}
      <section className="section-py">
        <Container size="narrow">
          <div className="space-y-8">
            <div>
              <h2 className="heading-md mb-6">Our Story</h2>
              <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground">
                <p>
                  The poultry industry is one of the world&apos;s most vital sectors,
                  feeding billions and employing millions across 195 countries. Yet,
                  despite its $300 billion global value and 50 million professionals,
                  it has never had a dedicated platform to connect, collaborate, and grow.
                </p>
                <p>
                  PoultryCo was born from a simple observation: while tech professionals
                  have LinkedIn, designers have Behance, and developers have GitHub, poultry
                  professionals have been left behind with generic platforms that don&apos;t
                  understand their unique needs.
                </p>
                <p>
                  We set out to change that. Built by people who understand the industry,
                  PoultryCo is designed from the ground up to serve the specific needs of
                  poultry professionals—from smallholder farmers in rural India to CEOs
                  of multinational corporations.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Values */}
      <section className="section-py bg-muted/30">
        <Container>
          <h2 className="heading-md text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background rounded-xl p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Yet Local</h3>
              <p className="text-muted-foreground">
                Connecting the world while respecting local practices and cultures
              </p>
            </div>

            <div className="bg-background rounded-xl p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Inclusive</h3>
              <p className="text-muted-foreground">
                For everyone from smallholder farmers to industry leaders
              </p>
            </div>

            <div className="bg-background rounded-xl p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                Leveraging technology to solve real industry problems
              </p>
            </div>

            <div className="bg-background rounded-xl p-8">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Community First</h3>
              <p className="text-muted-foreground">
                Built with and for the poultry community, not investors
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What We Do */}
      <section className="section-py">
        <Container>
          <h2 className="heading-md text-center mb-12">What We&apos;re Building</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Professional Networking</h3>
                <p className="text-muted-foreground">
                  Multi-role profiles for individuals, businesses, and organizations.
                  Connect based on location, expertise, role, and interests.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Job Marketplace</h3>
                <p className="text-muted-foreground">
                  Find and post opportunities across all sectors—from farm management
                  to veterinary services, feed manufacturing to equipment supply.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Events Platform</h3>
                <p className="text-muted-foreground">
                  Discover global and local events. From PTSE and VIV to regional
                  seminars and farm visits—all in one place.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Industry Tools</h3>
                <p className="text-muted-foreground">
                  Essential calculators and converters designed for poultry professionals.
                  Feed formulation, growth projections, and more.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Knowledge Hub</h3>
                <p className="text-muted-foreground">
                  Learn from experts, share best practices, and stay updated with
                  the latest research and industry trends.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Business Growth</h3>
                <p className="text-muted-foreground">
                  Find suppliers, customers, and partners. List products, services,
                  and equipment for the global marketplace.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Backed By */}
      <section className="section-py bg-muted/30">
        <Container size="narrow">
          <h2 className="heading-md text-center mb-8">Backed by Industry Leaders</h2>
          <p className="text-center text-muted-foreground mb-12">
            Supported and endorsed by the organizations that shape the global poultry industry
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="flex items-center justify-center p-6 bg-background rounded-xl">
              <span className="text-xl font-bold text-muted-foreground">NECC India</span>
            </div>
            <div className="flex items-center justify-center p-6 bg-background rounded-xl">
              <span className="text-xl font-bold text-muted-foreground">IEC</span>
            </div>
            <div className="flex items-center justify-center p-6 bg-background rounded-xl">
              <span className="text-xl font-bold text-muted-foreground">WATT Global</span>
            </div>
            <div className="flex items-center justify-center p-6 bg-background rounded-xl">
              <span className="text-xl font-bold text-muted-foreground">VIV Worldwide</span>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="section-py">
        <Container>
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-12 text-center text-white">
            <h2 className="heading-lg mb-6">Join Us on This Journey</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Be part of building the platform that will transform how the poultry
              industry connects and collaborates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/early-access">Get Early Access</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">Partner With Us</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

