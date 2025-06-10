import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();

  return (
    <main className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Link to="/settings" className="p-2 -ml-2 text-gray-700 hover:text-oxfordBlue">
                    <ChevronLeft size={28} />
                </Link>
                <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">
                    {t("settings.privacy_policy.title")}
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8 prose prose-sm md:prose lg:prose-lg max-w-none">
              <p className="mb-4 text-sm md:text-base">Last updated: April 26, 2025</p>

              <p className="mb-2 text-sm md:text-base">
                At DaGalow, we respect your privacy and are committed to protecting your
                personal data. This Privacy Policy explains how we collect, use, and
                safeguard your information when you use our website and services.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">1. Information We Collect</h4>
              <p className="mb-2 text-sm md:text-base">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
                <li>Personal information (name, email address, phone number)</li>
                <li>Profile information</li>
                <li>Payment and transaction information</li>
                <li>Communications you send to us</li>
                <li>Usage information and interaction with our services</li>
              </ul>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">
                2. How We Use Your Information
              </h4>
              <p className="mb-2 text-sm md:text-base">We use your information to:</p>
              <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Personalize your experience</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">3. Sharing of Information</h4>
              <p className="mb-2 text-sm md:text-base">We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
                <li>Service providers who perform services on our behalf</li>
                <li>Payment processors</li>
                <li>Professional advisors</li>
                <li>When required by law or to protect rights</li>
              </ul>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">4. Your Rights</h4>
              <p className="mb-2 text-sm md:text-base">
                Depending on your location, you may have rights to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
                <li>Access personal data we hold about you</li>
                <li>Request correction of your personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent</li>
              </ul>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">5. Contact Us</h4>
              <p className="mb-4 text-sm md:text-base">
                If you have any questions about this Privacy Policy, please contact us
                at privacy@dagalow.com
              </p>
            </div>
        </div>
    </main>
  );
};

export default PrivacyPolicyPage;