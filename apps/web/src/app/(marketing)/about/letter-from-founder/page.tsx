import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Letter from the Founder | Janagaran",
  description: "A personal note on why PoultryCo exists. The debt to mother's birds. The obligation to serve the industry that raised me.",
  keywords: ["founder letter", "Janagaran", "PoultryCo founder", "why PoultryCo"],
  openGraph: {
    title: "Letter from the Founder | A Personal Note",
    description: "Why I'm leading PoultryCo. The debt. The obligation. The commitment.",
    type: "article",
  },
};

export default function LetterFromFounderPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-heading">
              A Letter to the Poultry Community
            </h1>
            <p className="text-xl text-muted-foreground">
              From Janagaran, Founder of PoultryCare ERP & Initiative Leader of PoultryCo
            </p>
          </div>
        </div>
      </section>

      {/* LETTER CONTENT */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-10 md:p-12 rounded-3xl border-2 border-primary/20 shadow-xl">
              <p className="text-xl font-semibold text-foreground mb-8">Dear Friend,</p>

              <div className="prose prose-lg max-w-none space-y-6">
                <p className="text-lg text-foreground/80 leading-relaxed">
                  Let me tell you a story you probably won't find in typical startup origin tales. It's not about a Silicon Valley garage or a brilliant "aha" moment. It's about birds. Specifically, about the hens my mother raised in our backyard in a small village in Tamil Nadu.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  Those birds were more than livestock. They were our <strong>family's hope</strong>. Every egg they laid, every chick they hatched—that was grocery money, school fees, a future that seemed impossible. They were the foundation that held our lives together.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  I was the first person in my entire family to go to college. Not just any college—College of Engineering, Guindy. A dream so big that most people in our village didn't dare dream it. But my mother dared. And those birds made it possible.
                </p>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">The Weight of Success</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  I did what was expected. Built a career in technology. Worked on enterprise ERP systems across UAE, Oman, Malaysia, and several other countries. By conventional measures, I'd "made it." First-generation graduate. International career. Corporate success.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  But there was always a question I couldn't answer: <strong className="text-primary">My mother's birds gave me this opportunity. What am I giving back to the industry that raised me?</strong>
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  That question kept me awake at night. It followed me through every corporate meeting, every successful project delivery, every achievement that should have felt complete but somehow didn't.
                </p>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">COVID Forced My Hand</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  When the pandemic hit, I returned to my village. Not by choice initially—circumstances forced it. But maybe I needed that force. Maybe I'd been avoiding what I knew I had to do.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  That's when I spent real time with my friend Prabharan. He runs a serious commercial poultry operation. Not backyard farming like my mother did—he's managing <strong>7 lakh birds</strong>. That's 700,000 birds. A ₹1 Crore+ annual turnover operation with 10 staff members.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  And he was managing all of it <strong>on paper.</strong>
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  Let that sink in. In 2020-2021, while the world ran on cloud software, while single-owner tea shops used digital POS systems, a multi-crore poultry operation was using pen, paper, and late-night manual calculations.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  I watched Prabharan struggle. Late nights after 12-hour farm days, trying to manually track everything. No historical data. No way to learn from past cycles. Just survival, day after day.
                </p>

                <div className="bg-primary/5 p-8 rounded-xl border-l-4 border-primary my-8">
                  <p className="text-lg text-foreground/90 font-semibold italic">
                    The irony was crushing. I'd been building sophisticated ERPs for corporations who threw six-figure budgets at software. Meanwhile, farmers producing actual food for millions—farmers like my mother—couldn't access even basic tools.
                  </p>
                </div>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">We Built PoultryCare Together</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  That's when PoultryCare ERP was born in 2022. Prabharan became an invaluable advisory board member and mentor. I brought the technology experience. He brought decades of farming wisdom. We built it together from the ground up.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  It worked. Today, PoultryCare serves <strong className="text-primary">35+ enterprise clients across 8 countries</strong>—Oman, Kenya, Tanzania, Nigeria, and others. We handle operations managing 12 lakh+ birds in layer farms, 800+ integrator farms, and feed mills with up to ₹1,000 Crore annual turnover.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  Farmers who adopted it saw real results. Better tracking. Optimized operations. Data-driven decisions.
                </p>

                <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-500 my-8">
                  <p className="text-lg text-foreground/90">
                    <strong>But our success revealed a harder truth.</strong> We were serving the privileged few who could afford enterprise solutions. The broader industry—the 60% independent farmers who needed help most—remained trapped.
                  </p>
                </div>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">The Bicycle Moment</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  Jobs once referenced research proving that <strong>bicycles transformed humans from 47th to 1st in efficiency</strong> among all species. Not through evolution. Through a tool that multiplied existing capability.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  I asked myself: <strong className="text-primary">What's the bicycle for the poultry industry?</strong>
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  The answer hit me: <strong>Every stakeholder under one roof.</strong>
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  Individual farmers can't afford transformation alone. But what if they didn't have to? What if we assembled all the components—farmers, vets, vendors, researchers—into one ecosystem?
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  <strong>That's when PTIC was born.</strong>
                </p>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">The Moment That Made It Real</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  At PTSE 1st Edition on <strong>June 29, 2024</strong>, at Hotel Golden Palace in Namakkal, 800+ industry stakeholders gathered. I stood on that stage and announced PTIC's formation.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  Then something happened that changed everything.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  A veteran farmer stood up. Mr. Singaraj—30+ years in poultry, founding chairman of Ponni Group, NECC Namakkal chairman. A voice the industry respects.
                </p>

                <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-8 rounded-2xl border-2 border-primary/30 my-8">
                  <p className="text-xl text-foreground/90 italic">
                    "We lose thousands of birds to heat stroke. The information exists—somewhere in WhatsApp groups, somewhere with experts we cannot reach."
                  </p>
                  <p className="text-muted-foreground mt-4 text-center">
                    — Mr. Singaraj, PTSE 1st Edition
                  </p>
                </div>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  The room went silent.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  That wasn't one farmer's problem. <strong className="text-primary">That was the entire industry crying out through one respected voice.</strong>
                </p>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">The Promise I Made</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  At PTSE 2nd Edition on <strong>January 25, 2025</strong>, at Hotel Le Meridien in Coimbatore, with Mr. Sivarajah (Mission Director and CEO of StartupTN) as chief guest, I stood on that same stage and made a <strong className="text-primary">public promise</strong>:
                </p>

                <div className="bg-primary/10 p-8 rounded-2xl border-l-4 border-primary my-8 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    We will build the bridge Mr. Singaraj asked for.
                  </p>
                  <p className="text-foreground/80 mt-4">
                    February 2026. PTSE 3rd Edition. We're delivering.
                  </p>
                </div>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">What I'm Asking From You</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  I'm not asking you to invest money. I'm not asking you to take financial risk.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  <strong className="text-primary">I'm asking you to join this platform and contribute your expertise.</strong>
                </p>

                <ul className="space-y-3 my-6">
                  <li className="flex items-start gap-3 text-foreground/80">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Share what you know freely</span>
                  </li>
                  <li className="flex items-start gap-3 text-foreground/80">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Help farmers who face what you've already solved</span>
                  </li>
                  <li className="flex items-start gap-3 text-foreground/80">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Build your reputation through genuine contribution</span>
                  </li>
                  <li className="flex items-start gap-3 text-foreground/80">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Grow with the community</span>
                  </li>
                </ul>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  <strong>Individual success creates collective prosperity.</strong> That's not marketing speak. That's the fundamental philosophy of <strong className="text-primary">Grow Together®</strong>.
                </p>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">The Accountability Date</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  <strong className="text-primary">February 2026. PTSE 3rd Edition.</strong>
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  We made a promise. We set a timeline. We're accountable.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  That date isn't just a launch event. <strong>It's proof that when the industry calls out in pain, someone listens, someone builds, someone delivers.</strong>
                </p>

                <h3 className="text-2xl font-bold text-foreground mt-10 mb-6">From Backyard Birds to Industry Transformation</h3>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  My journey began with a mother's birds in a rural backyard. It led through corporate success and PoultryCare ERP serving operations across 8 countries. It crystallized with PTIC's formation. And now it's building that reality through PoultryCo.
                </p>

                <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-8 rounded-2xl border-2 border-primary/30 my-10">
                  <p className="text-xl text-foreground/90 font-semibold">
                    <strong className="text-primary">This is why I'm leading PoultryCo.</strong>
                  </p>
                  <p className="text-lg text-foreground/80 mt-4">
                    Not as a business opportunity.<br/>
                    As an obligation to the birds that raised me.<br/>
                    As a debt to the mother who dared to dream.<br/>
                    As a bridge for the industry that's been waiting.
                  </p>
                </div>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  Join us. Not as users. <strong className="text-primary">As co-builders.</strong>
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed mb-10">
                  This transformation happens together, or not at all.
                </p>

                <p className="text-lg text-foreground/80 leading-relaxed">
                  With gratitude and commitment,
                </p>

                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-xl font-bold text-foreground mb-2">Janagaran</p>
                  <p className="text-sm text-muted-foreground">
                    Founder, PoultryCare ERP (35+ clients, 8+ countries)<br/>
                    Co-founder & Promoter, PoultryTech Innovation Council (PTIC)<br/>
                    Initiative Leader, PoultryCo Platform
                  </p>
                </div>

                <div className="bg-primary/5 p-6 rounded-xl mt-8 italic">
                  <p className="text-foreground/80">
                    <strong>P.S.</strong> If my mother's backyard hens could fund an engineering education, imagine what an entire industry working together could achieve. That's not hope. That's the mathematics of collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Join Us in Repaying This Debt
            </h2>
            <p className="text-xl text-foreground/80 mb-8">
              Every farmer who joins helps another farmer. Every vet who contributes saves birds. Every connection made multiplies value. This is how we transform together.
            </p>
            <Button size="lg" variant="primary" className="px-8 py-6" asChild>
              <Link href="/register">
                Join as Co-Builder
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

