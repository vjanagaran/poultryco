import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | PoultryCo',
  description: 'Learn how PoultryCo protects your privacy and handles your personal data. Our commitment to data security and transparency.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to PoultryCo ("we," "our," or "us"). We are committed to protecting your privacy and 
              ensuring you have a positive experience on our platform. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our professional networking 
              platform for the poultry industry, available at{' '}
              <a href="https://www.poultryco.net" className="text-primary hover:underline">
                www.poultryco.net
              </a>{' '}
              (the "Platform"), including our mobile applications.
            </p>
            <p className="text-gray-700 mb-4">
              By using PoultryCo, you agree to the collection and use of information in accordance with this 
              Privacy Policy. If you do not agree with our policies and practices, please do not use our Platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Information You Provide Directly</h3>
            <p className="text-gray-700 mb-3">We collect information that you voluntarily provide to us:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Account Information:</strong> Full name, email address, password, phone number
              </li>
              <li>
                <strong>Profile Information:</strong> Professional headline, bio, location (city, state, country), 
                profile photo, cover photo, website links
              </li>
              <li>
                <strong>Professional Roles:</strong> Your roles in the poultry industry (farmer, veterinarian, 
                nutritionist, supplier, consultant, etc.), experience level, specializations
              </li>
              <li>
                <strong>Business Information:</strong> Business name, description, type, size, products/services, 
                team members, verification documents
              </li>
              <li>
                <strong>Organization Information:</strong> Organization name, type, member information, 
                event details
              </li>
              <li>
                <strong>Content:</strong> Posts, comments, messages, photos, videos, and other content you create 
                or share on the Platform
              </li>
              <li>
                <strong>Communications:</strong> Information you provide when you contact us for support, 
                feedback, or inquiries
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Information Collected Automatically</h3>
            <p className="text-gray-700 mb-3">When you use our Platform, we automatically collect:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Usage Data:</strong> Pages viewed, features used, time spent on the Platform, 
                search queries, connections made
              </li>
              <li>
                <strong>Device Information:</strong> Device type, operating system, browser type, 
                unique device identifiers, IP address
              </li>
              <li>
                <strong>Location Data:</strong> General location based on IP address (not precise GPS location 
                unless you explicitly enable it)
              </li>
              <li>
                <strong>Cookies and Similar Technologies:</strong> Session cookies, preference cookies, 
                analytics cookies (see Section 6)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Information from Third Parties</h3>
            <p className="text-gray-700 mb-3">We may receive information from:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Social Authentication:</strong> If you sign up or log in using Google or other OAuth 
                providers, we receive your name, email address, and profile photo as permitted by your settings
              </li>
              <li>
                <strong>Business Verification Services:</strong> Information to verify business credentials 
                and authenticity
              </li>
              <li>
                <strong>Other Users:</strong> Information about you from other users, such as when they 
                tag you, mention you, or add you to their network
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use the information we collect for the following purposes:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Provide and Improve Services</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Create and manage your account</li>
              <li>Enable you to create professional profiles and connect with other poultry professionals</li>
              <li>Facilitate networking, knowledge sharing, and business opportunities</li>
              <li>Display your profile to other users based on search and discovery features</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Analyze usage patterns to improve Platform features and user experience</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Communication</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Send you service-related notifications (account activity, security alerts)</li>
              <li>Send you platform updates, new features, and community highlights</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Send marketing communications (you can opt-out anytime)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Safety and Security</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Verify identities and prevent fraud</li>
              <li>Detect and prevent spam, abuse, and other harmful activities</li>
              <li>Enforce our Terms of Service and Community Guidelines</li>
              <li>Protect the rights, property, and safety of PoultryCo, our users, and the public</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Legal Compliance</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Comply with legal obligations and respond to lawful requests</li>
              <li>Establish, exercise, or defend legal claims</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.5 Research and Analytics</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Analyze aggregate user behavior to understand industry trends</li>
              <li>Conduct research to improve the poultry industry ecosystem</li>
              <li>Create anonymized, aggregated statistics about Platform usage</li>
            </ul>
          </section>

          {/* How We Share Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Share Your Information</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Public Information</h3>
            <p className="text-gray-700 mb-3">
              By default, certain information on your profile is public and visible to all users:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your name, profile photo, headline, and location (city/country)</li>
              <li>Your professional roles and public posts</li>
              <li>Your business and organization affiliations (if public)</li>
              <li>Your connections (if you choose to make them public)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can control the visibility of certain information in your privacy settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 With Your Connections</h3>
            <p className="text-gray-700 mb-4">
              Information you share with your network (posts, updates, messages) is visible to your connections 
              based on your privacy settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Service Providers</h3>
            <p className="text-gray-700 mb-3">We share information with trusted third-party service providers who help us operate the Platform:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>AWS:</strong> Cloud infrastructure, database, authentication, and file storage services</li>
              <li><strong>CDN Providers:</strong> Content delivery for images and media</li>
              <li><strong>Analytics Services:</strong> Google Analytics and similar tools to understand Platform usage</li>
              <li><strong>Email Services:</strong> Transactional and marketing email delivery</li>
              <li><strong>Payment Processors:</strong> If you make purchases (future feature)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              These providers are contractually obligated to protect your information and use it only for 
              the services they provide to us.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Business Transfers</h3>
            <p className="text-gray-700 mb-4">
              If PoultryCo is involved in a merger, acquisition, or sale of assets, your information may be 
              transferred. We will notify you before your information becomes subject to a different privacy policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.5 Legal Requirements</h3>
            <p className="text-gray-700 mb-3">We may disclose your information if required to do so by law or in response to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Valid legal processes (subpoenas, court orders)</li>
              <li>Requests from government authorities</li>
              <li>Emergencies involving potential harm to persons or property</li>
              <li>Violations of our Terms of Service or policies</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.6 Aggregated Data</h3>
            <p className="text-gray-700 mb-4">
              We may share aggregated, anonymized data that does not identify you personally with researchers, 
              partners, or the public to advance the poultry industry.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-3">
              We take the security of your information seriously and implement appropriate technical and 
              organizational measures to protect it:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Encryption:</strong> Data is encrypted in transit using SSL/TLS and at rest using industry-standard encryption</li>
              <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
              <li><strong>Authentication:</strong> Secure password hashing and optional two-factor authentication</li>
              <li><strong>Infrastructure:</strong> Hosted on secure, SOC 2 compliant AWS infrastructure</li>
              <li><strong>Regular Audits:</strong> Periodic security assessments and updates</li>
              <li><strong>Incident Response:</strong> Procedures in place to respond to security breaches</li>
            </ul>
            <p className="text-gray-700 mb-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee its absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as your account is active or as needed to 
              provide you services. You can request deletion of your account at any time.
            </p>
            <p className="text-gray-700 mb-3">Upon account deletion:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your profile and personal information will be permanently deleted within 30 days</li>
              <li>Your public posts may remain visible but will be anonymized</li>
              <li>Backup copies may persist for up to 90 days for disaster recovery purposes</li>
              <li>We may retain certain information as required by law or for legitimate business purposes 
                (e.g., preventing fraud, resolving disputes)</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 What Are Cookies?</h3>
            <p className="text-gray-700 mb-4">
              Cookies are small text files stored on your device that help us provide and improve our services.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for the Platform to function (authentication, security)
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings and preferences
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how you use the Platform (Google Analytics)
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (if applicable)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Managing Cookies</h3>
            <p className="text-gray-700 mb-4">
              You can control cookies through your browser settings. Note that blocking essential cookies 
              may affect Platform functionality.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Access and Portability</h3>
            <p className="text-gray-700 mb-4">
              You can access and download your personal information from your account settings. 
              We will provide your data in a structured, commonly used format.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Correction and Updates</h3>
            <p className="text-gray-700 mb-4">
              You can update your profile information, preferences, and settings at any time through your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Deletion</h3>
            <p className="text-gray-700 mb-4">
              You can request deletion of your account and personal information. Go to Settings → Account → 
              Delete Account, or contact us at{' '}
              <a href="mailto:privacy@poultryco.net" className="text-primary hover:underline">
                privacy@poultryco.net
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.4 Marketing Communications</h3>
            <p className="text-gray-700 mb-4">
              You can opt-out of marketing emails by clicking "Unsubscribe" in any email or updating your 
              email preferences in your account settings. You will still receive essential service notifications.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.5 Privacy Settings</h3>
            <p className="text-gray-700 mb-4">
              Control who can see your profile information, posts, and connections through your privacy settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.6 Do Not Track</h3>
            <p className="text-gray-700 mb-4">
              Some browsers include a "Do Not Track" feature. Our Platform does not currently respond to 
              Do Not Track signals.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              PoultryCo is designed for professional use and is not intended for children under 16 years of age. 
              We do not knowingly collect personal information from children under 16. If we discover that we 
              have collected information from a child under 16, we will delete it immediately.
            </p>
            <p className="text-gray-700 mb-4">
              If you believe we have collected information from a child under 16, please contact us at{' '}
              <a href="mailto:privacy@poultryco.net" className="text-primary hover:underline">
                privacy@poultryco.net
              </a>.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              PoultryCo operates globally. Your information may be transferred to and processed in countries 
              other than your country of residence, including the United States and countries where our service 
              providers operate.
            </p>
            <p className="text-gray-700 mb-4">
              These countries may have different data protection laws than your country. We ensure appropriate 
              safeguards are in place to protect your information in accordance with this Privacy Policy and 
              applicable laws.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 European Economic Area (EEA)</h3>
            <p className="text-gray-700 mb-4">
              If you are in the EEA, we comply with GDPR requirements. You have additional rights under GDPR, 
              including the right to object to processing and the right to lodge a complaint with a supervisory authority.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Links and Services</h2>
            <p className="text-gray-700 mb-4">
              Our Platform may contain links to third-party websites, services, or content. We are not responsible 
              for the privacy practices of these third parties. We encourage you to review their privacy policies 
              before providing any information.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
              legal requirements, or other factors. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Posting the updated policy on this page with a new "Last Updated" date</li>
              <li>Sending you an email notification (for significant changes)</li>
              <li>Displaying a prominent notice on the Platform</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Your continued use of the Platform after changes become effective constitutes acceptance of the 
              updated Privacy Policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-3">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <p className="text-gray-800 mb-2">
                <strong>PoultryCo Privacy Team</strong>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@poultryco.net" className="text-primary hover:underline">
                  privacy@poultryco.net
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Website:</strong>{' '}
                <a href="https://www.poultryco.net/contact" className="text-primary hover:underline">
                  www.poultryco.net/contact
                </a>
              </p>
              <p className="text-gray-700">
                We will respond to your inquiry within 30 days.
              </p>
            </div>
          </section>

          {/* Data Protection Officer */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Data Protection Officer</h2>
            <p className="text-gray-700 mb-4">
              For users in the European Economic Area (EEA), you can contact our Data Protection Officer at{' '}
              <a href="mailto:dpo@poultryco.net" className="text-primary hover:underline">
                dpo@poultryco.net
              </a>{' '}
              for questions about data protection and privacy.
            </p>
          </section>

          {/* Commitment */}
          <section className="mb-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-gray-700 mb-4">
              At PoultryCo, we believe that trust is the foundation of our professional community. We are 
              committed to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Being transparent about what data we collect and how we use it</li>
              <li>Giving you control over your information</li>
              <li>Protecting your data with industry-leading security measures</li>
              <li>Never selling your personal information to third parties</li>
              <li>Continuously improving our privacy practices</li>
            </ul>
            <p className="text-gray-700">
              Your privacy matters to us. Thank you for trusting PoultryCo with your professional journey.
            </p>
          </section>

          {/* Quick Links */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/contact" className="text-primary hover:underline">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/settings/email-preferences" className="text-primary hover:underline">
                  Email Preferences
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

