import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Origin Story | From Backyard Poultry to Digital Platform",
  description: "The complete story: Mother's birds funded education. 7 lakh birds on paper. A farmer's plea. A public promise. Platform delivery. This is how PoultryCo was born.",
  keywords: ["PoultryCo origin", "PTIC story", "poultry platform history", "founder story", "PTSE"],
  openGraph: {
    title: "Origin Story | From Backyard Poultry to Digital Platform",
    description: "From one farmer's plea to industry transformation. The complete 5-act story.",
    type: "article",
  },
};

export default function OriginStoryPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F0] via-white to-primary/5"></div>
        </div>
        
        <div className="container mx-auto px-6 py-16 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-heading leading-tight">
              From Backyard Poultry to{" "}
              <span className="text-primary">Digital Platform</span>
            </h1>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              The Complete Origin Story: Five Acts of Transformation
            </p>
          </div>
        </div>
      </section>

      {/* ACT 1: ROOTS */}
      <section id="act-1" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                1
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
                Roots: Born Into the Industry I Now Serve
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                In a remote village in Tamil Nadu, a mother raised hens in her backyard. Not as a hobby. Not as a side income. These birds were the <strong>primary source of family income</strong>. They funded groceries. They covered school fees. They made possible what seemed impossible: sending her son to one of India's most prestigious engineering colleges.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                I was that son. The first graduate from my entire family. <strong>College of Engineering, Guindy</strong>—a name that carries weight across India, a dream that rural families whisper about but rarely achieve.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                The path seemed clear: build a corporate career, achieve "success." I followed it. Built enterprise ERP solutions for large corporations. Worked across <strong>UAE, Oman, Malaysia, and multiple countries</strong>. Solved complex business problems for clients who could afford anything.
              </p>

              <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
                <p className="text-lg text-foreground/90 italic">
                  But something felt hollow. Missing the village soul. The metro rush felt empty. <strong className="text-primary">Vague dissatisfaction without clear answer.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT 2: THE RETURN */}
      <section id="act-2" className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                2
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
                The Return: COVID Brought Me Home
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                The pandemic forced many things. For me, it forced a return. Not as defeat, but as <strong>recalibration</strong>. Back to my village. Back to my roots. Back to the questions I'd been avoiding.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                That's when I spent real time with my friend <strong>Prabharan</strong>—a second-generation commercial poultry farmer. Progressive. Educated. Running a serious operation.
              </p>

              <div className="bg-white p-8 rounded-2xl border-2 border-orange-500/30 my-8">
                <p className="text-2xl font-bold text-foreground mb-4">
                  He was managing <span className="text-primary">7 lakh birds</span>. On paper.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Seven hundred thousand birds. A ₹100 Crore+ annual turnover operation. 40+ staff members. Modern sheds. Professional farming.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  <strong>All managed with pen, paper, and late nights.</strong>
                </p>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                I watched him struggle: Lost tracking. Wasted resources. Late nights after 12-hour farm days. No standardized processes. Zero historical data to learn from past cycles.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                I saw the problem intellectually—tech person seeing tech gap.
              </p>

              <h3 className="text-2xl font-bold text-foreground mb-6 mt-10">The Dinner That Changed Everything</h3>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                I shared Prabharan's struggle with my mother over dinner. She listened quietly. Then said something that changed everything:
              </p>

              <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-10 rounded-3xl border-2 border-primary/30 my-10">
                <p className="text-xl text-foreground/90 leading-relaxed mb-6 italic">
                  <strong>"Mahane,</strong> the problems I faced raising those birds to feed you—he's facing the same, just bigger.
                </p>
                <p className="text-xl text-foreground/90 leading-relaxed italic">
                  You got educated because of those birds. You have the skill to heal this pain. <strong className="text-primary">If you don't use it for farmers like him, like I was—what was their sacrifice for?</strong>"
                </p>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                <strong>That moment.</strong>
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                I found my <strong className="text-primary">IKIGAI</strong>—the peace my soul had been searching for. Where profession, passion, vocation, and mission converge:
              </p>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20 my-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-foreground mb-2">What I Love:</p>
                    <p className="text-sm text-muted-foreground">Technology. Problem-solving. Building systems.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">What I'm Good At:</p>
                    <p className="text-sm text-muted-foreground">Enterprise ERPs. Understanding complex operations.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">What the World Needs:</p>
                    <p className="text-sm text-muted-foreground">Farmers drowning in paper. Losing money. Needing tools.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-2">What Connects It All:</p>
                    <p className="text-sm text-muted-foreground">Mother's birds. The debt. The obligation. The sacrifice.</p>
                  </div>
                </div>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Not abstract debt anymore. Not vague guilt. <strong className="text-primary">Clear purpose. Right now. This is why I exist.</strong>
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed">
                From that dinner forward, every choice became simple.
              </p>

              <h3 className="text-2xl font-bold text-foreground mb-4 mt-10">The Birth of PoultryCare ERP</h3>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                In 2022, I founded <strong>PoultryCare ERP</strong>. Prabharan became an invaluable advisory board member and mentor, bringing decades of farming expertise to guide our development. We built it specifically for commercial poultry operations—understanding that technology must serve farming wisdom, not replace it.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                It worked. Today, PoultryCare serves <strong className="text-primary">35+ enterprise clients across 8+ countries</strong> (Oman, Kenya, Tanzania, Nigeria). We handle operations managing <strong>12 lakh+ birds in layer farms</strong>, <strong>800+ integrator farms</strong>, and <strong>feed mills with up to ₹1,000 Crore annual turnover</strong>.
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 my-8 rounded-r-lg">
                <p className="text-lg text-foreground/90">
                  <strong>But our success revealed a harder truth:</strong> We were serving the privileged few who could afford enterprise solutions. The broader industry—the 60% independent farmers who needed help most—remained trapped.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT 3: THE AWAKENING */}
      <section id="act-3" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                3
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
                The Awakening: Understanding the Decade-Long Gap
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Through deep research, I discovered the poultry industry is <strong className="text-primary">almost a decade behind</strong> other industries in technology adoption. Not just ERP adoption. Every automation practice. Every business operation standard.
              </p>

              <h3 className="text-2xl font-bold text-foreground mb-6">The Stark Contrast</h3>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20">
                  <h4 className="font-bold text-foreground mb-4">Other Industries (High Automation)</h4>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li>• Electronics: Hundreds of phones/hour, 24/7 robotic precision</li>
                    <li>• Automotive: One car/minute with automated assembly</li>
                    <li>• E-commerce: Amazon processes tens of thousands packages/hour</li>
                    <li>• Retail: Even ₹1L tea shops use cloud POS systems</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200">
                  <h4 className="font-bold text-foreground mb-4">Poultry Industry (Low Automation)</h4>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li>• Humans cleaning litter daily across sheds</li>
                    <li>• Humans loading feed multiple times per day</li>
                    <li>• Humans handling dead birds, manual counts</li>
                    <li>• <strong>₹100 Cr+ farms with 40+ staff on paper registers</strong></li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-6 mt-10">Why Agriculture is Always Last</h3>

              <p className="text-lg text-foreground/80 leading-relaxed mb-4">
                I mapped the historical technology adoption pattern:
              </p>

              <ol className="space-y-3 text-foreground/80 mb-6">
                <li><strong>Defense & Space</strong> (First) - Unlimited budgets, national priority</li>
                <li><strong>Healthcare</strong> (Second) - Nobody bargains on health and life</li>
                <li><strong>Manufacturing</strong> (Third) - Can price technology into products</li>
                <li><strong>Retail</strong> (Fourth) - MRP system allows cost inclusion</li>
                <li><strong>Agriculture/Poultry</strong> (Last) - And here's why...</li>
              </ol>

              <div className="bg-orange-50 p-8 rounded-2xl border-l-4 border-orange-500 my-8">
                <h4 className="text-xl font-bold text-foreground mb-4">The Limiting Equation</h4>
                <p className="text-foreground/80 mb-4">Farmers have:</p>
                <ul className="space-y-2 text-foreground/80">
                  <li>• <strong>No control over market prices</strong> (commodity pricing)</li>
                  <li>• <strong>No control over productivity</strong> (biological constraints)</li>
                  <li>• <strong>No control over demand/supply</strong> (can't ask hens to stop laying when prices drop)</li>
                </ul>
                <p className="text-foreground/80 mt-4">
                  So individual farmers can't afford R&D alone. Can't bear transformation risk alone. Can't pay enterprise prices for enterprise solutions. <strong>The trap is perfect.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT 4: THE BICYCLE */}
      <section id="act-4" className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                4
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
                The Bicycle: Assembling the Solution
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                And that's when Steve Jobs' bicycle metaphor saved me from despair.
              </p>

              <div className="bg-white p-8 rounded-2xl border-2 border-primary/20 my-8">
                <p className="text-xl text-foreground/90 mb-4 italic">
                  "A bicycle gave humans the ability to transform from 47th rank to 1st in efficiency among all species."
                </p>
                <p className="text-foreground/80">
                  Not through biological evolution. Not through individual strength. <strong className="text-primary">Through a tool that multiplied existing capability.</strong>
                </p>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                I asked myself: <strong>What are the components to assemble a bicycle for the poultry industry?</strong>
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                The answer hit like lightning: <strong className="text-primary">Every stakeholder.</strong>
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Individual farmers can't afford transformation alone. <strong>But what if they didn't have to?</strong>
              </p>

              <div className="bg-primary/5 p-8 rounded-2xl my-8">
                <h4 className="text-xl font-bold text-foreground mb-4">Bringing Every Stakeholder Under One Roof:</h4>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span><strong>Eliminates risk:</strong> Shared learning, collective experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span><strong>Stops leakage:</strong> Direct connections reduce middlemen costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span><strong>Pools skills:</strong> Farmers + Vets + Vendors + Researchers = complete expertise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span><strong>Makes affordable:</strong> Community approach, non-profit structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span><strong>Enables customization:</strong> Specific needs met through collaboration</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-6">The Birth of PTIC</h3>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                In early 2024, I discussed this vision with Prabharan and other associates. We named the theme "PoultryTech" and planned the PoultryTech Summit & Expo (PTSE) as our first pilot initiative.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                We created <strong>PTIC—PoultryTech Innovation Council</strong>—as a <strong className="text-primary">Section 8 non-profit company</strong> under India's Companies Act 2013. Mission-driven, not revenue-driven. Legally prohibited from profit distribution.
              </p>

              <h4 className="text-xl font-bold text-foreground mb-6">Why PTIC Had to Be Non-Profit:</h4>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-white p-6 rounded-xl border border-primary/20">
                  <h5 className="font-bold text-primary mb-2">Trust Without Pressure</h5>
                  <p className="text-sm text-foreground/80">
                    Section 8 removes future monetization burden. Free forever, legally.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-primary/20">
                  <h5 className="font-bold text-primary mb-2">Mission Over Returns</h5>
                  <p className="text-sm text-foreground/80">
                    PTIC reinvests all revenue. No profit extraction to shareholders.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-primary/20">
                  <h5 className="font-bold text-primary mb-2">Pay-It-Forward Culture</h5>
                  <p className="text-sm text-foreground/80">
                    Receive freely. Give freely. Communities grow through reciprocity.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-primary/20">
                  <h5 className="font-bold text-primary mb-2">Serve Based on Need</h5>
                  <p className="text-sm text-foreground/80">
                    Not paying capacity. Profit-free means bias-free.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT 5: FROM VISION TO REALITY */}
      <section id="act-5" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                5
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
                From Vision to Reality: PTSE & PoultryCo
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-foreground mb-6">PTSE 1st Edition (June 29, 2024)</h3>

              <p className="text-lg text-foreground/80 mb-4">
                Hotel Golden Palace, Namakkal<br/>
                800+ Attendees | 30+ Exhibitor Stalls
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                I stood on that stage and announced PTIC's formation—our vision for bringing every stakeholder together.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Then something happened that changed everything.
              </p>

              <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-10 rounded-3xl border-2 border-primary/30 my-8">
                <p className="text-foreground/90 mb-4">
                  A veteran farmer stood up. <strong>Mr. Singaraj</strong>—30+ years in poultry, founding chairman of Ponni Group, NECC Namakkal chairman. A voice the industry respects.
                </p>
                <p className="text-xl text-foreground/90 italic font-semibold mb-4">
                  "We lose thousands of birds to heat stroke. The information we need exists—somewhere in fragmented WhatsApp groups, somewhere with experts we cannot reach. We have solutions, but no way to connect. The industry feeding healthy protein to billions is starving for connection itself."
                </p>
                <p className="text-foreground/80 mt-4">
                  The room went silent.
                </p>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                That wasn't one farmer's problem. <strong className="text-primary">That was the entire independent sector crying out through one respected voice.</strong>
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                That moment triggered PoultryCo's birth.
              </p>

              <h3 className="text-2xl font-bold text-foreground mb-6 mt-10">PTSE 2nd Edition (January 25, 2025)</h3>

              <p className="text-lg text-foreground/80 mb-4">
                Hotel Le Meridien, Coimbatore<br/>
                800+ Attendees | 30+ Exhibitor Stalls<br/>
                Chief Guest: Mr. Sivarajah, Mission Director and CEO of StartupTN<br/>
                Special: PoultryTech Hackathon with StartupTN
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Standing on the same stage where Mr. Singaraj had made his plea, in front of industry stakeholders and government officials, I made a <strong className="text-primary">public commitment</strong>:
              </p>

              <div className="bg-primary/10 p-8 rounded-2xl border-l-4 border-primary my-8 text-center">
                <p className="text-2xl font-bold text-foreground">
                  We will build the bridge Mr. Singaraj asked for.
                </p>
                <p className="text-foreground/80 mt-4">
                  Not quietly. Not tentatively. Publicly. With government backing. With associations watching.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-6 mt-10">PoultryCo: The Answer to the Plea</h3>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                As founder of PoultryCare ERP, I'm a tech stakeholder in this industry. When PTIC formed, it made sense for me to lead the PoultryCo initiative—proving what one committed stakeholder can achieve.
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                In September 2025, five computer science students from KSR College joined us for a 6-month commitment, along with a junior developer coordinator. We're using AI-first development (Cursor + Claude) and modern technology (Expo, React Native, Next.js, AWS ECS, AWS SES).
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Three farmer associations have partnered with us: <strong>TNPFA, BCC, and PFRC</strong>. We're in discussions with five Farmer Producer Organizations.
              </p>

              <div className="bg-primary/5 p-8 rounded-2xl my-8">
                <h4 className="text-xl font-bold text-foreground mb-4">Design Philosophy:</h4>
                <ul className="space-y-2 text-foreground/80">
                  <li>• <strong>Simplest version</strong> of complex enterprise tools</li>
                  <li>• <strong>Free forever</strong> (PTIC mission enables sustainability)</li>
                  <li>• <strong>Mobile-first</strong> (accessible in rural areas with basic smartphones)</li>
                  <li>• <strong>Multi-language</strong> (Tamil, Telugu, Hindi, English)</li>
                  <li>• <strong>Trust-first</strong> (verification systems, quality controls)</li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-6 mt-10">PTSE 3rd Edition (February 2026): Promise Fulfillment</h3>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                This isn't just an app launch. <strong className="text-primary">This is a promise fulfilled.</strong>
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                From veteran farmer's plea (June 2024) → to public commitment (January 2025) → to platform delivery (February 2026).
              </p>

              <p className="text-lg text-foreground/80 leading-relaxed">
                The demonstration will prove: We listened. We built. We're delivering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE VISUALIZATION */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 font-heading text-center">
              Timeline at a Glance
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">Pre-2020</div>
                <p className="text-foreground/80">Born into farming family, mother's poultry funds education through CEG</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">2020-2021</div>
                <p className="text-foreground/80">COVID return to village, meet Prabharan, observe 7 lakh birds on paper</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">2022</div>
                <p className="text-foreground/80">Founded PoultryCare ERP (Prabharan as advisory board member/mentor)</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">2022-2024</div>
                <p className="text-foreground/80">PoultryCare grows to 35+ clients, 8+ countries, ₹1,000 Cr operations</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">Early 2024</div>
                <p className="text-foreground/80">PTIC discussions begin with Prabharan and associates</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-primary/10 rounded-xl border-2 border-primary/30">
                <div className="text-primary font-bold min-w-[120px]">June 29, 2024</div>
                <p className="text-foreground/80"><strong>PTSE 1st Edition, Namakkal</strong> - Mr. Singaraj's plea, PTIC announced</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">Mid-2024</div>
                <p className="text-foreground/80">PTIC officially formed (Section 8 non-profit)</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-primary/10 rounded-xl border-2 border-primary/30">
                <div className="text-primary font-bold min-w-[120px]">Jan 25, 2025</div>
                <p className="text-foreground/80"><strong>PTSE 2nd Edition, Coimbatore</strong> - Public promise with StartupTN</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">Sept 2025</div>
                <p className="text-foreground/80">5 CS students from KSR College join development team</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="text-primary font-bold min-w-[120px]">Nov 2025</div>
                <p className="text-foreground/80">20% complete - foundation, auth, functional modules operational</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-xl border-2 border-primary">
                <div className="text-primary font-bold min-w-[120px]">Feb 2026</div>
                <p className="text-foreground/80"><strong>PTSE 3rd Edition</strong> - Platform launch, promise fulfilled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE DEBT */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/10 to-orange-500/10 p-12 rounded-3xl border-2 border-primary/20">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                This is My Debt to the Birds My Mother Raised
              </h2>
              <p className="text-xl text-foreground/80 leading-relaxed mb-6">
                She invested in my future through her poultry. Those backyard hens funded the education that built my career—first through international corporations, then through PoultryCare ERP serving 35+ clients globally.
              </p>
              <p className="text-xl text-foreground/80 leading-relaxed">
                Now I invest in the industry's future through PoultryCo. Leading this PTIC initiative as a tech stakeholder, proving what's possible when one person commits to transforming their entire industry.
              </p>
              <p className="text-lg text-primary font-semibold mt-6">
                It's not charity—it's obligation.<br/>
                It's not business—it's profession in service of profession.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INVITATION */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Join the Transformation
            </h2>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
              From one farmer's plea to industry transformation. From backyard birds to digital platform. This is our story. Now help us write the next chapter—yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="primary" className="px-8 py-6" asChild>
                <Link href="/register">
                  Be Part of the Journey
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6 border-2" asChild>
                <Link href="/about/letter-from-founder">
                  Read Founder's Personal Letter
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

