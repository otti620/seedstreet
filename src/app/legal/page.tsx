"use client";

import React from 'react';
import Link from 'next/link';

const LegalPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 md:p-12 max-w-3xl bg-white shadow-lg rounded-lg my-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center bg-gradient-to-r from-purple-700 to-teal-600 bg-clip-text text-transparent">
        Terms of Service & Privacy Policy
      </h1>
      <p className="text-sm text-gray-600 text-center mb-8">
        Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-10">
        {/* Terms of Service */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Welcome to Seedstreet! (Terms of Service)</h2>
          <p className="text-gray-700 mb-4">
            Hey there! We're thrilled to have you join the Seedstreet community. These Terms of Service are here to make sure we all understand how things work when you use our platform. By signing up, logging in, or just browsing, you're agreeing to these terms. If anything here doesn't sit right with you, no worries, but it means you shouldn't use Seedstreet.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.1 Your Account & Responsibilities</h3>
          <p className="text-gray-700 mb-4">
            When you create an account, you're telling us that the information you provide is accurate and complete. Please keep your password safe – you're responsible for all activity that happens under your account. If you notice anything fishy, let us know right away! You must be at least 18 years old to use Seedstreet.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.2 What You Can & Can't Do (User Conduct)</h3>
          <p className="text-gray-700 mb-4">
            Seedstreet is a place for positive connections and growth. Please be respectful and kind to other users. Here's a quick rundown of what's not cool:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Don't post anything illegal, harmful, threatening, abusive, or harassing.</li>
              <li>No spamming, phishing, or trying to trick other users.</li>
              <li>Don't impersonate anyone or misrepresent your affiliation with any person or entity.</li>
              <li>Don't try to mess with our platform's security or functionality.</li>
              <li>Keep your content relevant to startups, investing, and community building.</li>
            </ul>
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.3 Your Content on Seedstreet</h3>
          <p className="text-gray-700 mb-4">
            You own the content you post on Seedstreet (like your startup pitch, community posts, messages). By posting it, you give us permission to display it on our platform, share it with other users, and use it to improve our services. Please make sure you have the rights to any content you share. We reserve the right to remove any content that violates these terms.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.4 Our Stuff (Intellectual Property)</h3>
          <p className="text-gray-700 mb-4">
            The Seedstreet name, logo, design, and all the cool tech behind our platform belong to us. You can use them as part of using our service, but please don't copy, modify, or try to reverse-engineer them.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.5 Things We Can't Promise (Disclaimers)</h3>
          <p className="text-gray-700 mb-4">
            Seedstreet is provided "as is." While we work hard to make it awesome, we can't guarantee that it will always be perfect, uninterrupted, or error-free. We're not responsible for any investment decisions you make based on information found on Seedstreet – always do your own research!
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.6 Limiting Our Liability</h3>
          <p className="text-gray-700 mb-4">
            To the fullest extent permitted by law, Seedstreet (and its team) won't be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the service; (b) any conduct or content of any third party on the service; (c) any content obtained from the service; and (d) unauthorized access, use or alteration of your transmissions or content.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.7 Ending Your Journey (Termination)</h3>
          <p className="text-gray-700 mb-4">
            You can stop using Seedstreet anytime. We also reserve the right to suspend or terminate your account if you violate these terms or if we believe your actions are harmful to the community.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.8 The Rules of the Game (Governing Law)</h3>
          <p className="text-gray-700 mb-4">
            These terms are governed by the laws of [Your Jurisdiction, e.g., the State of Delaware, USA], without regard to its conflict of law provisions.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">1.9 Changes to These Terms</h3>
          <p className="text-gray-700">
            We might update these terms from time to time. We'll let you know about any significant changes, and your continued use of Seedstreet means you accept the new terms.
          </p>
        </section>

        {/* Privacy Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Your Privacy at Seedstreet (Privacy Policy)</h2>
          <p className="text-gray-700 mb-4">
            Your privacy is super important to us. This policy explains what information we collect, why we collect it, and how we use and protect it. We aim to be as transparent as possible!
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">2.1 What Information We Collect</h3>
          <p className="text-gray-700 mb-4">
            We collect a few different types of information to make Seedstreet work and improve your experience:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                <strong>Information you give us:</strong> This includes things like your name, email, password (encrypted, of course!), role (investor/founder), bio, location, phone number, and any content you post (startup pitches, community posts, messages).
              </li>
              <li>
                <strong>Usage data:</strong> We automatically collect information about how you interact with our platform, like which pages you visit, how long you spend on them, and what features you use. This helps us understand what's working and what needs improvement.
              </li>
              <li>
                <strong>Device information:</strong> We might collect basic info about the device you're using (e.g., type of device, operating system) to ensure our app works well for everyone.
              </li>
            </ul>
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">2.2 How We Use Your Information</h3>
          <p className="text-gray-700 mb-4">
            We use your information to:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Provide and maintain Seedstreet (e.g., create your profile, display your content).</li>
              <li>Personalize your experience (e.g., show you relevant startups or community posts).</li>
              <li>Communicate with you (e.g., send important updates, notifications, respond to your inquiries).</li>
              <li>Improve our services (e.g., analyze usage patterns to make Seedstreet better).</li>
              <li>Ensure security and prevent fraud.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">2.3 How We Share Your Information</h3>
          <p className="text-gray-700 mb-4">
            We're careful about sharing your data. Here's when we might:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                <strong>With other users:</strong> Your public profile information (name, role, startup details if you're a founder) and content you post will be visible to other Seedstreet users.
              </li>
              <li>
                <strong>With service providers:</strong> We use trusted third-party services (like Supabase for our database and authentication) to help us run Seedstreet. They only get access to the information they need to perform their services and are bound by confidentiality agreements.
              </li>
              <li>
                <strong>For legal reasons:</strong> If required by law, we may disclose your information to comply with a subpoena, court order, or other legal process.
              </li>
              <li>
                <strong>Business transfers:</strong> If Seedstreet is involved in a merger, acquisition, or asset sale, your personal data may be transferred.
              </li>
            </ul>
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">2.4 Keeping Your Data Safe (Security)</h3>
          <p className="text-gray-700 mb-4">
            We use industry-standard security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we can't guarantee absolute security.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">2.5 Your Rights</h3>
          <p className="text-gray-700 mb-4">
            You have rights regarding your personal data:
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><strong>Access:</strong> You can request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> You can ask us to correct any inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> You can request that we delete your personal data, subject to certain legal obligations.</li>
              <li><strong>Opt-out:</strong> You can opt-out of certain communications or data processing.</li>
            </ul>
            To exercise any of these rights, please contact us using the details below.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">2.6 Children's Privacy</h3>
          <p className="text-gray-700 mb-4">
            Seedstreet is not intended for anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2">2.7 Changes to This Privacy Policy</h3>
          <p className="text-gray-700">
            Just like our Terms, we might update this Privacy Policy. We'll let you know about important changes, and your continued use of Seedstreet means you accept the updated policy.
          </p>
        </section>

        {/* Contact Us */}
        <section className="text-center pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Got Questions? Reach Out!</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms or our Privacy Policy, please don't hesitate to contact us:
          </p>
          <p className="text-lg font-medium text-purple-700">
            Email: <a href="mailto:support@seedstreet.com" className="underline hover:text-teal-600">support@seedstreet.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LegalPage;