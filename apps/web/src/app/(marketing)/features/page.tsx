import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore PoultryCo's comprehensive features designed for the global poultry industry.",
};

export default function FeaturesPage() {
  const features = [
    {
      icon: "👤",
      title: "Professional Profiles",
      description: "Multi-role profiles for individuals, businesses, and organizations. Showcase your expertise, products, and services.",
      benefits: [
        "Personal, business, and organization profiles",
        "Multi-role support (farmer, vet, consultant, etc.)",
        "Verification badges for credibility",
        "Privacy controls for each role",
      ],
    },
    {
      icon: "🤝",
      title: "Smart Networking",
      description: "Connect with the right people at the right time. Advanced filtering by role, location, expertise, and interests.",
      benefits: [
        "Intelligent connection suggestions",
        "Industry-specific filters",
        "Direct messaging and groups",
        "Network analytics and insights",
      ],
    },
    {
      icon: "💼",
      title: "Job Board",
      description: "Find and post opportunities across all poultry sectors. From entry-level to executive positions.",
      benefits: [
        "Jobs across all poultry sectors",
        "Advanced search and filters",
        "Application tracking",
        "Salary insights and trends",
      ],
    },
    {
      icon: "📅",
      title: "Events Platform",
      description: "Discover and manage industry events worldwide. From global conferences to local seminars.",
      benefits: [
        "Global event calendar",
        "Event registration and ticketing",
        "Networking before, during, after",
        "Virtual and hybrid event support",
      ],
    },
    {
      icon: "🛠️",
      title: "Industry Tools",
      description: "Access specialized calculators, converters, and tools designed for poultry professionals.",
      benefits: [
        "Feed formulation calculator",
        "Growth projection tools",
        "Unit converters",
        "ROI calculators",
      ],
    },
    {
      icon: "🏢",
      title: "Organization Hub",
      description: "For associations, cooperatives, and industry bodies to manage members and engage the community.",
      benefits: [
        "Member management",
        "Bulk invitations",
        "Event organization",
        "Communication tools",
      ],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section-py bg-gradient-to-b from-background to-muted/30">
        <Container size="narrow">
          <div className="text-center space-y-6">
            <h1 className="heading-xl">
              Everything You Need to{" "}
              <span className="text-gradient">Succeed</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive platform built specifically for the global poultry
              industry. From networking to job search, events to tools—all in one place.
            </p>
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="section-py">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="bordered"
                hover
                className="p-8"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="section-py bg-muted/30">
        <Container size="narrow">
          <h2 className="heading-lg text-center mb-16">How It Works</h2>
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Sign up and build your professional profile in minutes. Add your
                  roles, expertise, experience, and what you&apos;re looking for.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Connect & Discover</h3>
                <p className="text-muted-foreground">
                  Find and connect with professionals, businesses, and organizations
                  relevant to your work. Join groups and discussions.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Grow Your Business</h3>
                <p className="text-muted-foreground">
                  Find job opportunities, attend events, use industry tools, and
                  collaborate with others to grow your career or business.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison Section */}
      <section className="section-py">
        <Container>
          <h2 className="heading-lg text-center mb-12">
            Why Choose PoultryCo?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4">Feature</th>
                  <th className="text-center p-4">Generic Platforms</th>
                  <th className="text-center p-4 bg-primary/5">
                    <span className="text-primary font-bold">PoultryCo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4">Industry-Specific</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Multi-Role Profiles</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Poultry-Specific Tools</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Industry Events Calendar</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Organization Management</td>
                  <td className="text-center p-4">Limited</td>
                  <td className="text-center p-4 bg-primary/5">✅ Full</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Global + Local Focus</td>
                  <td className="text-center p-4">❌</td>
                  <td className="text-center p-4 bg-primary/5">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section-py">
        <Container>
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-12 text-center text-white">
            <h2 className="heading-lg mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of poultry professionals already signed up for early access.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/early-access">
                Get Early Access Now
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

