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
          <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-50">Important Legal Information</h3>
          <p className="mb-4">
            **Disclaimer:** This is a placeholder for your Terms of Service and Privacy Policy.
            **You MUST replace this content with legally sound documents drafted by a legal professional.**
            Failure to do so may result in legal liabilities.
          </p>
          <p className="mb-4">
            Your Terms of Service should outline the rules and guidelines for using your application,
            user responsibilities, intellectual property rights, disclaimers, and limitations of liability.
          </p>
          <p className="mb-4">
            Your Privacy Policy should clearly explain what personal data you collect, why you collect it,
            how it's used, who it's shared with, and how users can manage their data. It should also
            address data security measures and compliance with relevant privacy laws (e.g., GDPR, CCPA).
          </p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            Please consult with a legal expert to ensure your policies are comprehensive and compliant.
          </p>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4 dark:text-gray-50">Terms of Service (Placeholder)</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm">
            **1. Acceptance of Terms:** By accessing and using Seedstreet, you agree to be bound by these Terms of Service.
            <br /><br />
            **2. User Conduct:** You agree to use Seedstreet responsibly and not to engage in any unlawful or prohibited activities.
            <br /><br />
            **3. Intellectual Property:** All content and materials on Seedstreet are the property of Seedstreet or its licensors.
            <br /><br />
            **4. Disclaimers:** Seedstreet is provided "as is" without warranties of any kind.
            <br /><br />
            **5. Limitation of Liability:** Seedstreet shall not be liable for any damages arising from your use of the service.
            <br /><br />
            **6. Governing Law:** These terms are governed by the laws of [Your Jurisdiction].
            <br /><br />
            *(... more terms here ...)*
          </p>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4 dark:text-gray-50">Privacy Policy (Placeholder)</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm">
            **1. Data Collection:** We collect personal information such as email, name, and usage data.
            <br /><br />
            **2. Use of Data:** Your data is used to provide and improve our services, communicate with you, and for security.
            <br /><br />
            **3. Data Sharing:** We do not sell your personal data. We may share data with trusted third-party service providers.
            <br /><br />
            **4. Data Security:** We implement reasonable security measures to protect your data.
            <br /><br />
            **5. Your Rights:** You have the right to access, correct, or delete your personal data.
            <br /><br />
            **6. Cookies:** We use cookies to enhance your experience.
            <br /><br />
            *(... more privacy details here ...)*
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyScreen;