import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Why Not Just WhatsApp | Professional Knowledge vs Chat Chaos",
  description: "WhatsApp groups lose information in scroll. PoultryCo makes your expertise permanent, searchable, and reputation-building. Here's why professionals choose platforms.",
  keywords: ["WhatsApp alternative", "professional platform vs WhatsApp", "poultry knowledge sharing", "expert reputation building"],
  openGraph: {
    title: "Why Not Just WhatsApp | PoultryCo",
    description: "Your expertise deserves better than disappearing in group chat.",
    type: "article",
  },
};

export default function NotWhatsAppPage() {
  return (
    <>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 lg:py-20 relative z-20">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading leading-[1.1]">
              Your Expertise Deserves{" "}
              <span className="text-primary">Better Than WhatsApp</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl leading-relaxed">
              Answer a question in WhatsApp—50 people see it once. Answer on PoultryCo—5,000 people find it forever. Your knowledge deserves permanence.
            </p>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-base mb-8 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Permanent. Searchable. Reputation-building.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" variant="primary" className="px-8 py-6 text-lg shadow-xl" asChild>
                <Link href="/register">
                  Build Permanent Expertise
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" asChild>
                <Link href="#comparison">See the Difference</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="comparison" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-heading text-center">
              WhatsApp vs PoultryCo: Side by Side
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted/50 p-8 rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.654a11.882 11.882 0 005.713 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">WhatsApp Groups</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <p className="text-sm text-muted-foreground">Information lost in scroll (no search)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <p className="text-sm text-muted-foreground">Limited to 256 members per group</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <p className="text-sm text-muted-foreground">No verification (anyone can claim expertise)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <p className="text-sm text-muted-foreground">Temporary (messages disappear)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <p className="text-sm text-muted-foreground">No reputation building</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">❌</span>
                    <p className="text-sm text-muted-foreground">Chaos increases with members</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/30 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">PoultryCo Stream</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <p className="text-sm text-foreground/80"><strong>Searchable forever</strong> (find answers anytime)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <p className="text-sm text-foreground/80"><strong>Unlimited community</strong> (5,000+ members, growing)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <p className="text-sm text-foreground/80"><strong>Verified experts</strong> (blue badges, credentials)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <p className="text-sm text-foreground/80"><strong>Permanent content</strong> (builds your reputation)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <p className="text-sm text-foreground/80"><strong>Profile-linked</strong> (people see your expertise)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <p className="text-sm text-foreground/80"><strong>Quality improves</strong> (more members = better content)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
              Build Reputation, Not Just Help Once
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Every answer you give on PoultryCo becomes part of your professional portfolio. Farmers searching months later will find your expertise. That's how you build regional recognition.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6" asChild>
              <Link href="/register">
                Start Building Your Reputation
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

