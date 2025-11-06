"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsAndPrivacyScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const TermsAndPrivacyScreen: React.FC<TermsAndPrivacyScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('auth')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Back to authentication">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Terms & Privacy Policy</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-700 dark:text-gray-200">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Seedstreet Africa – Privacy Policy</h3>
          <p className="text-sm mb-4">
            **Effective Date: October 2025**
          </p>
          <p className="text-sm mb-4">
            At Seedstreet Africa (“Seedstreet”, “we”, “us”, or “our”), your trust means everything to us. This Privacy Policy explains how we collect, use, share, and protect information when you use our website, mobile app, and related digital services (collectively, the “Platform”).
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">1. Information We Collect</h4>
          <p className="text-sm mb-2">We collect the following types of information:</p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>**Account Information:** Name, email, phone number, startup or investor details, and profile data provided during sign-up.</li>
            <li>**Usage Data:** Device information, IP address, browser type, and analytics data collected via Firebase and other tools.</li>
            <li>**Listings & Activity:** Information you upload or share, including startup listings, bios, documents, or investment preferences.</li>
            <li>**Communications:** Messages sent through in-app chats, contact forms, or email.</li>
            <li>**Cookies & Tracking:** We use cookies, local storage, and analytics to improve your experience and platform performance.</li>
          </ul>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">2. How We Use Your Information</h4>
          <p className="text-sm mb-2">We use your data to:</p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>Operate and maintain the Seedstreet Platform.</li>
            <li>Facilitate startup–investor discovery and communication.</li>
            <li>Personalize content, recommendations, and updates.</li>
            <li>Enhance platform performance and security.</li>
            <li>Comply with legal and regulatory obligations.</li>
          </ul>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">3. Data Sharing</h4>
          <p className="text-sm mb-2">We never sell your data. We may share limited data with:</p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>Service Providers (e.g., Firebase, analytics, hosting).</li>
            <li>Regulatory authorities when legally required.</li>
            <li>Business partners if you opt-in or consent to specific collaborations.</li>
          </ul>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">4. Data Security</h4>
          <p className="text-sm mb-4">
            We employ encryption, access controls, and secure storage protocols to protect your data. However, no digital system is completely risk-free; you acknowledge and accept this residual risk.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">5. Data Retention</h4>
          <p className="text-sm mb-4">
            We retain user data for as long as your account remains active or as necessary to provide our services and comply with applicable law.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">6. Your Rights</h4>
          <p className="text-sm mb-2">Depending on your location, you may:</p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>Request access, correction, or deletion of your data.</li>
            <li>Withdraw consent for certain processing activities.</li>
            <li>Contact us to request portability or restriction of processing.</li>
          </ul>
          <p className="text-sm mb-4">
            For all privacy-related inquiries, email us at <a href="mailto:seedstreetapp@gmail.com" className="underline text-purple-700 dark:text-purple-400">seedstreetapp@gmail.com</a>.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">7. International Transfers</h4>
          <p className="text-sm mb-4">
            Your data may be processed across multiple countries. We ensure appropriate safeguards consistent with international data protection laws.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">8. Updates to This Policy</h4>
          <p className="text-sm mb-4">
            We may periodically update this Privacy Policy. We’ll notify you of significant changes by email or platform notification.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Seedstreet Africa – Terms of Use</h3>
          <p className="text-sm mb-4">
            **Effective Date: October 2025**
          </p>
          <p className="text-sm mb-4">
            Welcome to Seedstreet Africa, a digital platform connecting startups and investors across Africa and beyond. By using our Platform, you agree to these Terms of Use. Please read carefully.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">1. Acceptance of Terms</h4>
          <p className="text-sm mb-4">
            By accessing or using the Seedstreet Platform, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">2. Use of the Platform</h4>
          <p className="text-sm mb-2">You may use Seedstreet only for lawful purposes. You agree not to:</p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>Misrepresent your identity or affiliation.</li>
            <li>Upload harmful, misleading, or copyrighted content without authorization.</li>
            <li>Interfere with the operation or security of the Platform.</li>
            <li>Use Seedstreet for financial solicitation outside approved guidelines.</li>
          </ul>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">3. Accounts</h4>
          <p className="text-sm mb-4">
            You are responsible for maintaining the confidentiality of your account credentials. Any action performed through your account is considered authorized by you.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">4. Content Ownership</h4>
          <p className="text-sm mb-4">
            You retain ownership of the content you upload. However, by uploading, you grant Seedstreet a worldwide, non-exclusive license to display and distribute your content for platform functionality and promotion.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">5. Intellectual Property</h4>
          <p className="text-sm mb-4">
            All trademarks, logos, designs, and software belong to Seedstreet Africa or its licensors. You may not copy, modify, or redistribute platform assets without written permission.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">6. Investment Disclaimer</h4>
          <p className="text-sm mb-4">
            Seedstreet is not a registered broker-dealer, financial advisor, or exchange. All listings and startup information are for educational and discovery purposes only. Investments are at the user’s sole discretion and risk.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">7. Limitation of Liability</h4>
          <p className="text-sm mb-4">
            Seedstreet Africa is not liable for indirect, incidental, or consequential damages arising from the use of our Platform. We do not guarantee investment outcomes or business success.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">8. Termination</h4>
          <p className="text-sm mb-4">
            We reserve the right to suspend or terminate any account that violates these Terms.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">9. Governing Law</h4>
          <p className="text-sm mb-4">
            These Terms are governed by international standards, including GDPR and applicable digital commerce laws. Disputes will be handled through arbitration or mutually agreed mediation.
          </p>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3 dark:text-gray-50">10. Contact</h4>
          <p className="text-sm mb-4">
            For questions, support, or complaints, contact us at:<br />
            📩 <a href="mailto:seedstreetapp@gmail.com" className="underline text-purple-700 dark:text-purple-400">seedstreetapp@gmail.com</a><br />
            🌍 <a href="https://www.use-seedstreet.vercel.app" target="_blank" rel="noopener noreferrer" className="underline text-purple-700 dark:text-purple-400">www.use-seedstreet.vercel.app</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyScreen;