import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-py bg-gradient-to-b from-background to-muted/30">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              🚀 Launching at PTSE 2026 - Get Early Access Now
            </div>

            {/* Heading */}
            <h1 className="heading-xl text-balance">
              The World&apos;s First{" "}
              <span className="text-gradient">Professional Network</span>{" "}
              for the Poultry Industry
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with thousands of poultry professionals, discover opportunities,
              and grow your business. Join the revolution transforming how the global
              poultry industry connects and collaborates.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="primary" asChild>
                <Link href="/early-access">
                  Get Early Access
                  <svg
                    className="ml-2 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Explore Features</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by leading organizations in the poultry industry
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-lg font-semibold">NECC</div>
                <div className="text-lg font-semibold">IEC</div>
                <div className="text-lg font-semibold">WATT Global Media</div>
                <div className="text-lg font-semibold">VIV Worldwide</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50M+</div>
              <div className="text-sm opacity-90">Professionals Worldwide</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">195</div>
              <div className="text-sm opacity-90">Countries & Regions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$300B</div>
              <div className="text-sm opacity-90">Global Industry Value</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">0</div>
              <div className="text-sm opacity-90">Dedicated Platforms... Until Now</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Problem Section */}
      <section className="section-py">
        <Container size="narrow">
          <div className="text-center space-y-6 mb-16">
            <h2 className="heading-lg">
              The Poultry Industry Deserves Better
            </h2>
            <p className="text-xl text-muted-foreground">
              While other industries thrive with dedicated platforms, poultry
              professionals struggle with fragmented networks and limited opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-xl font-semibold">Fragmented Networks</h3>
              <p className="text-muted-foreground">
                Professionals scattered across generic platforms with no industry focus
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-xl font-semibold">Limited Opportunities</h3>
              <p className="text-muted-foreground">
                Hard to find relevant jobs, events, and business connections
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">❌</span>
              </div>
              <h3 className="text-xl font-semibold">Inefficient Tools</h3>
              <p className="text-muted-foreground">
                No specialized tools designed for poultry industry needs
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Solution Section */}
      <section className="section-py bg-muted/30">
        <Container size="narrow">
          <div className="text-center space-y-6 mb-16">
            <h2 className="heading-lg">
              Introducing <span className="text-gradient">PoultryCo</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              The all-in-one platform built specifically for the global poultry industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background rounded-2xl p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-semibold">Smart Networking</h3>
              <p className="text-muted-foreground">
                Connect with the right people at the right time. Multi-role profiles
                for individuals, businesses, and organizations.
              </p>
            </div>

            <div className="bg-background rounded-2xl p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-2xl font-semibold">Job Board</h3>
              <p className="text-muted-foreground">
                Find and post jobs across all poultry sectors. From farm managers
                to veterinarians, feed specialists to business executives.
              </p>
            </div>

            <div className="bg-background rounded-2xl p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-2xl font-semibold">Events Platform</h3>
              <p className="text-muted-foreground">
                Discover industry events worldwide. PTSE, VIV, IPPE, and hundreds
                more local events all in one place.
              </p>
            </div>

            <div className="bg-background rounded-2xl p-8 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛠️</span>
              </div>
              <h3 className="text-2xl font-semibold">Industry Tools</h3>
              <p className="text-muted-foreground">
                Access specialized calculators, converters, and tools designed
                specifically for poultry professionals.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section-py">
        <Container>
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-12 text-center text-white">
            <h2 className="heading-lg mb-6">
              Join the Future of Poultry Networking
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Be among the first 10,000 founding members to get exclusive benefits
              and lifetime perks. Limited spots available.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/early-access">
                Claim Your Spot Now
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

