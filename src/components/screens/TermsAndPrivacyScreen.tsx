"use client";

import React from 'react';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScreenParams } from '@/types'; // Import ScreenParams from shared types

interface TermsAndPrivacyScreenProps {
  setCurrentScreen: (screen: string, params?: ScreenParams) => void;
}

const TermsAndPrivacyScreen: React.FC<TermsAndPrivacyScreenProps> = ({ setCurrentScreen }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentScreen('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex-1 dark:text-gray-50">Terms & Privacy</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-50">
            <FileText className="w-5 h-5 text-purple-700 dark:text-purple-400" /> Terms of Service
          </h3>
          <div className="text-gray-700 space-y-4 text-sm dark:text-gray-200">
            <p>
              Welcome to Seedstreet! These Terms of Service ("Terms") govern your access to and use of the Seedstreet website, mobile applications, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
            <p>
              <strong>1. Acceptance of Terms:</strong> By creating an account, accessing, or using the Service, you signify your agreement to these Terms. If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p>
              <strong>2. Changes to Terms:</strong> We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on the Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
            </p>
            <p>
              <strong>3. User Conduct:</strong> You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Service.
            </p>
            <p>
              <strong>4. Intellectual Property:</strong> All content on the Service, including text, graphics, logos, images, and software, is the property of Seedstreet or its content suppliers and protected by international copyright laws.
            </p>
            <p>
              <strong>5. Disclaimer of Warranties:</strong> The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. Seedstreet does not warrant that the Service will be uninterrupted, error-free, or secure.
            </p>
            <p>
              <strong>6. Limitation of Liability:</strong> In no event shall Seedstreet be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Service.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-50">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Privacy Policy
          </h3>
          <div className="text-gray-700 space-y-4 text-sm dark:text-gray-200">
            <p>
              Your privacy is important to us. This Privacy Policy explains how Seedstreet collects, uses, and discloses information about you.
            </p>
            <p>
              <strong>1. Information We Collect:</strong> We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, role, and any other information you choose to provide.
            </p>
            <p>
              <strong>2. How We Use Your Information:</strong> We use the information we collect to provide, maintain, and improve our Service, to communicate with you, to personalize your experience, and to monitor and analyze trends, usage, and activities in connection with our Service.
            </p>
            <p>
              <strong>3. Information Sharing:</strong> We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf. We may also disclose information in response to legal process or requests.
            </p>
            <p>
              <strong>4. Data Security:</strong> We take reasonable measures to protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
            <p>
              <strong>5. Your Choices:</strong> You may update, correct, or delete information about you at any time by logging into your account. You may also opt out of receiving promotional communications from us.
            </p>
            <p>
              <strong>6. Contact Us:</strong> If you have any questions about this Privacy Policy, please contact us at ottigospel@gmail.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndPrivacyScreen;