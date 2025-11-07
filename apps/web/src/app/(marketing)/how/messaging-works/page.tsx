import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "How Messaging Works | Professional Communication",
  description: "1:1 conversations, group chats, business inquiries. Learn when to message privately vs post publicly and build professional relationships.",
  keywords: ["poultry messaging", "professional communication", "networking etiquette", "farmer vet communication"],
  openGraph: {
    title: "How Messaging Works | Professional Communication",
    description: "Private conversations. Professional etiquette. Real relationships.",
    type: "article",
  },
};

export default function MessagingWorksPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20 relative z-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Build{" "}
              <span className="text-primary">Real Relationships</span>{" "}
              Through Messaging
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              When to message privately vs post publicly. Professional communication etiquette. Building lasting connections with vets, suppliers, and peers.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Private when personal. Public when helpful to all.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Start Conversations
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#when">When to Use Messaging</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WHEN TO USE */}
      <section id="when" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Message Privately vs Post Publicly
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/30">
                <h3 className="text-2xl font-bold text-foreground mb-6">Use Private Messaging For:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">Personal Consultations</p>
                      <p className="text-sm text-muted-foreground">Specific farm issues, pricing discussions, business deals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">Building Relationships</p>
                      <p className="text-sm text-muted-foreground">Getting to know peers, following up on connections</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">Sensitive Information</p>
                      <p className="text-sm text-muted-foreground">Farm data, business numbers, private challenges</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">Direct Inquiries</p>
                      <p className="text-sm text-muted-foreground">Product questions to suppliers, service quotes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-8 rounded-2xl border-2 border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6">Use Public Stream For:</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">General Questions</p>
                      <p className="text-sm text-muted-foreground">Disease symptoms, feeding practices—helps others too</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">Sharing Knowledge</p>
                      <p className="text-sm text-muted-foreground">Best practices, lessons learned, success stories</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">Building Reputation</p>
                      <p className="text-sm text-muted-foreground">Answer questions publicly to showcase expertise</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <div>
                      <p className="font-semibold text-foreground">Community Benefit</p>
                      <p className="text-sm text-muted-foreground">When answer helps many, not just one person</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center bg-primary/5 p-6 rounded-2xl">
              <p className="text-lg text-foreground/80">
                <strong>Rule of Thumb:</strong> If 10+ people have the same question, post publicly. If it's specific to your farm, message privately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Professional Communication. Real Results.
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Connect directly with vets for consultations. Message suppliers for quotes. Build relationships that grow your business. Professional networking done right.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Building Relationships
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

