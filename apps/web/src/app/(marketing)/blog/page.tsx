import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, guides, and stories from the poultry industry.",
};

export default function BlogPage() {
  // Placeholder blog posts - will be replaced with real content/MDX
  const posts = [
    {
      title: "Introducing PoultryCo: The Future of Poultry Networking",
      excerpt: "Today, we're excited to announce PoultryCo, the world's first professional networking platform built specifically for the global poultry industry.",
      category: "Company News",
      date: "2024-10-20",
      readTime: "5 min read",
      featured: true,
    },
    {
      title: "Why the Poultry Industry Needs Its Own Platform",
      excerpt: "With 50 million professionals and a $300 billion global value, why doesn't the poultry industry have a dedicated networking platform? Let's explore.",
      category: "Industry Insights",
      date: "2024-10-18",
      readTime: "7 min read",
    },
    {
      title: "5 Challenges Every Poultry Professional Faces (And How We're Solving Them)",
      excerpt: "From fragmented networks to limited opportunities, we break down the biggest challenges facing poultry professionals today.",
      category: "Problem Awareness",
      date: "2024-10-15",
      readTime: "6 min read",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="section-py bg-gradient-to-b from-background to-muted/30">
        <Container size="narrow">
          <div className="text-center space-y-6">
            <h1 className="heading-xl">
              <span className="text-gradient">Insights</span> from the Industry
            </h1>
            <p className="text-xl text-muted-foreground">
              Guides, stories, and updates from the world of poultry.
            </p>
          </div>
        </Container>
      </section>

      {/* Blog Posts */}
      <section className="section-py">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card
                key={index}
                variant="bordered"
                hover
                className="flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="default">{post.category}</Badge>
                    {post.featured && (
                      <Badge variant="warning">⭐ Featured</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(post.date).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric" 
                    })}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link
                    href="#"
                    className="text-primary font-semibold hover:underline inline-flex items-center"
                  >
                    Read More
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-16 text-center">
            <div className="bg-muted/50 rounded-2xl p-12">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-bold mb-4">More Content Coming Soon</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We&apos;re working on creating valuable content for the poultry community.
                Subscribe to our newsletter to get notified when we publish new articles.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

