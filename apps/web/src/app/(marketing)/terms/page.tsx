import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | PoultryCo',
  description: 'Read the terms and conditions for using PoultryCo, the professional networking platform for the poultry industry.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last Updated: October 31, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to PoultryCo</h2>
            <p className="text-gray-700 mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and PoultryCo 
              ("we," "our," or "us") governing your access to and use of the PoultryCo platform, including our 
              website at{' '}
              <a href="https://www.poultryco.net" className="text-primary hover:underline">
                www.poultryco.net
              </a>{' '}
              and our mobile applications (collectively, the "Platform").
            </p>
            <p className="text-gray-700 mb-4">
              <strong>BY ACCESSING OR USING THE PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS.</strong> If you 
              do not agree to these Terms, you may not access or use the Platform.
            </p>
            <p className="text-gray-700 mb-4">
              Please also review our{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>, which explains how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* About PoultryCo */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. About PoultryCo</h2>
            <p className="text-gray-700 mb-4">
              PoultryCo is a professional networking platform designed specifically for the global poultry industry. 
              We connect farmers, veterinarians, nutritionists, suppliers, consultants, businesses, and organizations 
              to foster collaboration, knowledge sharing, and business growth.
            </p>
            <p className="text-gray-700 mb-4">
              The Platform provides features including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Professional profile creation and management</li>
              <li>Networking and connection with industry professionals</li>
              <li>Content creation and sharing (posts, articles, media)</li>
              <li>Business and organization profiles</li>
              <li>Messaging and communication tools</li>
              <li>Industry events, jobs, and opportunities</li>
              <li>Educational resources and knowledge sharing</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility and Account Registration</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Age Requirement</h3>
            <p className="text-gray-700 mb-4">
              You must be at least 16 years of age to use the Platform. By using the Platform, you represent and 
              warrant that you meet this age requirement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Professional Use</h3>
            <p className="text-gray-700 mb-4">
              PoultryCo is intended for professional use by individuals and entities involved in the poultry industry. 
              You agree to use the Platform for legitimate professional and business purposes only.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Account Creation</h3>
            <p className="text-gray-700 mb-4">
              To access most features, you must create an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept all responsibility for activity under your account</li>
              <li>Immediately notify us of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 One Account Per Person</h3>
            <p className="text-gray-700 mb-4">
              You may only maintain one personal account. You may not create an account on behalf of another person 
              without their explicit permission. Businesses and organizations may create separate business/organization accounts.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.5 Account Termination</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account if you violate these Terms or engage in 
              activities that harm the Platform, other users, or our business interests.
            </p>
          </section>

          {/* User Conduct */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct and Community Guidelines</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Acceptable Use</h3>
            <p className="text-gray-700 mb-4">You agree to use the Platform in a professional, respectful manner. You must NOT:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Post false, misleading, or deceptive information</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Post spam, advertisements, or unsolicited commercial content</li>
              <li>Share content that is illegal, obscene, defamatory, or violates intellectual property rights</li>
              <li>Interfere with the Platform's operation or security</li>
              <li>Use automated tools (bots, scrapers) without authorization</li>
              <li>Collect or harvest user information without consent</li>
              <li>Share content that violates export control or sanctions laws</li>
              <li>Engage in any activity that violates applicable laws or regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Professional Standards</h3>
            <p className="text-gray-700 mb-4">
              As a professional platform, we expect users to maintain high standards of conduct:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Provide accurate information about your professional background</li>
              <li>Respect intellectual property and give credit where due</li>
              <li>Maintain confidentiality when sharing sensitive information</li>
              <li>Engage in constructive, respectful discussions</li>
              <li>Report violations of these Terms or Community Guidelines</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Content Standards</h3>
            <p className="text-gray-700 mb-4">
              Content you post must:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Be relevant to the poultry industry and professional networking</li>
              <li>Comply with applicable laws and regulations</li>
              <li>Respect the privacy and rights of others</li>
              <li>Be free from hate speech, discrimination, or violence</li>
              <li>Not contain adult or sexually explicit content</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Consequences of Violations</h3>
            <p className="text-gray-700 mb-4">
              Violations of these guidelines may result in:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Content removal</li>
              <li>Warning notices</li>
              <li>Temporary suspension</li>
              <li>Permanent account termination</li>
              <li>Legal action if warranted</li>
            </ul>
          </section>

          {/* Content and Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Content and Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Your Content</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of all content you post on the Platform ("Your Content"). By posting content, 
              you grant PoultryCo a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, 
              adapt, publish, translate, distribute, and display Your Content in connection with operating and 
              improving the Platform.
            </p>
            <p className="text-gray-700 mb-4">
              This license continues even after you delete your content or close your account, to the extent 
              your content has been shared with others and they have not deleted it, or for backup and legal purposes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 PoultryCo's Content</h3>
            <p className="text-gray-700 mb-4">
              The Platform and its contents (excluding Your Content), including but not limited to text, graphics, 
              logos, icons, images, software, and design, are owned by PoultryCo or our licensors and are protected 
              by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-700 mb-4">
              You may not copy, modify, distribute, sell, or exploit any part of the Platform without our 
              prior written consent.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Copyright Infringement</h3>
            <p className="text-gray-700 mb-4">
              We respect intellectual property rights. If you believe content on the Platform infringes your 
              copyright, please notify us at{' '}
              <a href="mailto:dmca@poultryco.net" className="text-primary hover:underline">
                dmca@poultryco.net
              </a>{' '}
              with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Description of the copyrighted work</li>
              <li>Location of the infringing content on our Platform</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief that use is unauthorized</li>
              <li>A statement that the information is accurate and you are authorized to act</li>
              <li>Your physical or electronic signature</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Trademark</h3>
            <p className="text-gray-700 mb-4">
              "PoultryCo," our logo, and other marks are trademarks of PoultryCo. You may not use our trademarks 
              without our prior written permission.
            </p>
          </section>

          {/* Privacy and Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>{' '}
              explains how we collect, use, and protect your information. By using the Platform, you consent to 
              our collection and use of information as described in the Privacy Policy.
            </p>
            <p className="text-gray-700 mb-4">
              Key points:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>We collect information you provide and information about how you use the Platform</li>
              <li>We use this information to provide, improve, and personalize our services</li>
              <li>We do not sell your personal information to third parties</li>
              <li>You have control over your privacy settings and data</li>
              <li>We implement security measures to protect your data</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services and Links</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Third-Party Authentication</h3>
            <p className="text-gray-700 mb-4">
              We offer authentication through third-party services (Google, etc.). Your use of these services 
              is subject to their respective terms and privacy policies. We are not responsible for the practices 
              of these third parties.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Third-Party Links</h3>
            <p className="text-gray-700 mb-4">
              The Platform may contain links to third-party websites, services, or content. We do not endorse, 
              control, or assume responsibility for any third-party content. Your use of third-party services is 
              at your own risk.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Integration Services</h3>
            <p className="text-gray-700 mb-4">
              We use third-party services to operate the Platform, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Supabase:</strong> Database, authentication, and storage</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
              <li><strong>Google Analytics:</strong> Usage analytics</li>
              <li><strong>Email Services:</strong> Transactional and marketing emails</li>
            </ul>
          </section>

          {/* Payments and Subscriptions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payments and Subscriptions (Future)</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Free Access</h3>
            <p className="text-gray-700 mb-4">
              Currently, PoultryCo is offered free of charge. We may introduce premium features, subscriptions, 
              or paid services in the future.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Future Premium Features</h3>
            <p className="text-gray-700 mb-4">
              If we introduce paid features:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>We will provide clear pricing and terms before purchase</li>
              <li>Payments will be processed through secure third-party payment processors</li>
              <li>Subscriptions will auto-renew unless cancelled</li>
              <li>Refunds will be handled according to our refund policy</li>
              <li>Existing users will be notified in advance of any pricing changes</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Warranties</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 "As Is" Basis</h3>
            <p className="text-gray-700 mb-4">
              THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 User Content</h3>
            <p className="text-gray-700 mb-4">
              We do not verify the accuracy, completeness, or reliability of user-generated content. You are 
              responsible for evaluating the accuracy and reliability of any information, advice, or content 
              on the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.3 Professional Advice</h3>
            <p className="text-gray-700 mb-4">
              <strong>IMPORTANT:</strong> Content on the Platform, including advice from other users, does not 
              constitute professional veterinary, medical, legal, financial, or other professional advice. Always 
              consult qualified professionals for specific advice related to your circumstances.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.4 No Guarantee of Results</h3>
            <p className="text-gray-700 mb-4">
              We do not guarantee that use of the Platform will result in business opportunities, connections, 
              knowledge gain, or any specific outcomes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">8.5 Service Availability</h3>
            <p className="text-gray-700 mb-4">
              We do not guarantee that the Platform will be available at all times or free from errors, bugs, or 
              interruptions. We may modify, suspend, or discontinue any aspect of the Platform at any time.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, POULTRYCO AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS 
              SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                Any indirect, incidental, special, consequential, or punitive damages arising from your use of 
                or inability to use the Platform
              </li>
              <li>
                Any damages resulting from user content, interactions with other users, or third-party services
              </li>
              <li>
                Loss of profits, revenue, data, or business opportunities
              </li>
              <li>
                Any damages caused by errors, bugs, viruses, or unauthorized access to your account
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE PLATFORM 
              SHALL NOT EXCEED $100 USD OR THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS, WHICHEVER IS GREATER.
            </p>
            <p className="text-gray-700 mb-4">
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the 
              above limitations may not apply to you.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify, defend, and hold harmless PoultryCo and its officers, directors, employees, 
              agents, and affiliates from any claims, damages, losses, liabilities, and expenses (including 
              reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your Content posted on the Platform</li>
              <li>Your conduct in connection with the Platform</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution and Governing Law</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Informal Resolution</h3>
            <p className="text-gray-700 mb-4">
              If you have a dispute with PoultryCo, please contact us at{' '}
              <a href="mailto:legal@poultryco.net" className="text-primary hover:underline">
                legal@poultryco.net
              </a>{' '}
              to attempt to resolve it informally before pursuing formal legal action.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Governing Law</h3>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Jurisdiction</h3>
            <p className="text-gray-700 mb-4">
              You agree to submit to the exclusive jurisdiction of the courts located in [Your Jurisdiction] 
              to resolve any dispute arising from these Terms or the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.4 Arbitration (Optional)</h3>
            <p className="text-gray-700 mb-4">
              For disputes that cannot be resolved informally, parties may agree to binding arbitration as an 
              alternative to court proceedings.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to These Terms</h2>
            <p className="text-gray-700 mb-4">
              We may modify these Terms from time to time. When we make material changes, we will:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Update the "Last Updated" date at the top of this page</li>
              <li>Notify you via email or through the Platform</li>
              <li>Give you an opportunity to review the changes before they take effect</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Your continued use of the Platform after changes take effect constitutes acceptance of the 
              modified Terms. If you do not agree to the changes, you must stop using the Platform and may 
              delete your account.
            </p>
          </section>

          {/* General Provisions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.1 Entire Agreement</h3>
            <p className="text-gray-700 mb-4">
              These Terms, together with our Privacy Policy and any other policies referenced herein, constitute 
              the entire agreement between you and PoultryCo regarding the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.2 Severability</h3>
            <p className="text-gray-700 mb-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
              will remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.3 Waiver</h3>
            <p className="text-gray-700 mb-4">
              Our failure to enforce any right or provision of these Terms does not constitute a waiver of such 
              right or provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.4 Assignment</h3>
            <p className="text-gray-700 mb-4">
              You may not assign or transfer these Terms or your account without our prior written consent. 
              We may assign these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.5 Force Majeure</h3>
            <p className="text-gray-700 mb-4">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our 
              reasonable control, including acts of God, war, terrorism, pandemic, riots, governmental action, 
              or technical failures.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">13.6 Survival</h3>
            <p className="text-gray-700 mb-4">
              Provisions that by their nature should survive termination (including disclaimers, limitations of 
              liability, and indemnification) shall survive termination of these Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-3">
              If you have questions about these Terms or need to contact us for any reason related to the Platform:
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <p className="text-gray-800 mb-2">
                <strong>PoultryCo Legal Team</strong>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>General Inquiries:</strong>{' '}
                <a href="mailto:team@poultryco.net" className="text-primary hover:underline">
                  team@poultryco.net
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Legal Matters:</strong>{' '}
                <a href="mailto:legal@poultryco.net" className="text-primary hover:underline">
                  legal@poultryco.net
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Privacy Concerns:</strong>{' '}
                <a href="mailto:privacy@poultryco.net" className="text-primary hover:underline">
                  privacy@poultryco.net
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Copyright/DMCA:</strong>{' '}
                <a href="mailto:dmca@poultryco.net" className="text-primary hover:underline">
                  dmca@poultryco.net
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Website:</strong>{' '}
                <a href="https://www.poultryco.net/contact" className="text-primary hover:underline">
                  www.poultryco.net/contact
                </a>
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acknowledgment of Understanding</h2>
            <p className="text-gray-700 mb-4">
              BY USING POULTRYCO, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY 
              THESE TERMS OF SERVICE.
            </p>
            <p className="text-gray-700">
              Thank you for being part of the PoultryCo community. Together, we're building a stronger, more 
              connected poultry industry.
            </p>
          </section>

          {/* Quick Links */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/contact" className="text-primary hover:underline">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/about" className="text-primary hover:underline">
                  About PoultryCo
                </a>
              </li>
            </ul>
          </section>

          {/* Version History */}
          <section className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Version History</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Version 1.0</strong> - October 31, 2025 - Initial Terms of Service
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

