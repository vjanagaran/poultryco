import type { Metadata } from "next";
import { Container, Badge } from "@/components/ui";
import { EarlyAccessForm } from "@/components/forms/EarlyAccessForm";
import { daysUntil } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Get Early Access",
  description: "Join the first 10,000 founding members and get exclusive lifetime benefits.",
};

export default function EarlyAccessPage() {
  const daysToLaunch = daysUntil(siteConfig.launchDate);

  return (
    <>
      {/* Hero Section */}
      <section className="section-py bg-gradient-to-b from-background to-muted/30">
        <Container size="narrow">
          <div className="text-center space-y-6 mb-12">
            {/* Urgency Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              ⏰ Only {daysToLaunch} days until launch - Limited spots available
            </div>

            {/* Heading */}
            <h1 className="heading-xl">
              Become a <span className="text-gradient">Founding Member</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground">
              Join the first 10,000 members and get exclusive lifetime benefits.
              Be part of the revolution transforming the global poultry industry.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Founding Member Badge</h3>
              <p className="text-muted-foreground text-sm">
                Display your special badge showing you were among the first
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lifetime Premium</h3>
              <p className="text-muted-foreground text-sm">
                Get premium features free for life (worth $99/year)
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Shape the Platform</h3>
              <p className="text-muted-foreground text-sm">
                Direct access to founders and influence product development
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-background rounded-2xl shadow-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-center mb-8">
              Reserve Your Spot Now
            </h2>
            <EarlyAccessForm />
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-semibold"
                  >
                    {i}K
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">5,000+</strong> professionals already registered
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="success">✓ NECC India</Badge>
              <Badge variant="success">✓ IEC</Badge>
              <Badge variant="success">✓ WATT Global Media</Badge>
              <Badge variant="success">✓ VIV Worldwide</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* Founding Member Tiers */}
      <section className="section-py bg-muted/30">
        <Container>
          <div className="text-center space-y-6 mb-12">
            <h2 className="heading-lg">Founding Member Tiers</h2>
            <p className="text-xl text-muted-foreground">
              Different tiers, different perks. All lifetime benefits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tier 1 */}
            <div className="bg-gradient-to-b from-yellow-50 to-background rounded-2xl p-8 border-2 border-yellow-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-500 text-white">
                  Most Exclusive
                </Badge>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Early Bird</h3>
                <div className="text-4xl font-bold text-primary mb-2">FREE</div>
                <p className="text-sm text-muted-foreground">First 1,000 members</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Pioneer badge + special recognition</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Lifetime premium features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Founding member call with CEO</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Priority support forever</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Featured in launch campaign</span>
                </li>
              </ul>
              <p className="text-sm text-center font-semibold text-yellow-700">
                847 spots remaining
              </p>
            </div>

            {/* Tier 2 */}
            <div className="bg-background rounded-2xl p-8 border-2 border-primary">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Founding Member</h3>
                <div className="text-4xl font-bold text-primary mb-2">FREE</div>
                <p className="text-sm text-muted-foreground">Next 4,000 members</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Founding member badge</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Lifetime premium features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Early feature access</span>
                </li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="bg-background rounded-2xl p-8 border border-border">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Launch Member</h3>
                <div className="text-4xl font-bold text-primary mb-2">FREE</div>
                <p className="text-sm text-muted-foreground">Next 5,000 members</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Launch member badge</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">1 year premium free</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm">Early access to platform</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="section-py">
        <Container size="narrow">
          <h2 className="heading-lg text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-background rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold mb-2">
                When will the platform launch?
              </h3>
              <p className="text-muted-foreground">
                We&apos;re launching at PTSE 2026 in January. Early access members will
                get access 30 days before the public launch.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold mb-2">
                Is early access really free?
              </h3>
              <p className="text-muted-foreground">
                Yes! 100% free. We want to build PoultryCo with the community,
                not just for the community. Your feedback is invaluable.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold mb-2">
                What are premium features?
              </h3>
              <p className="text-muted-foreground">
                Premium features include advanced search filters, unlimited connections,
                priority in job applications, featured profile placement, detailed analytics,
                and more.
              </p>
            </div>

            <div className="bg-background rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold mb-2">
                Can I invite my colleagues?
              </h3>
              <p className="text-muted-foreground">
                Absolutely! Founding members get unlimited invites. The more quality
                members we have, the better the network for everyone.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

