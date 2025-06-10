import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const TermsOfServicePage = () => {
  const { t } = useTranslation();

  return (
    <main className="absolute left-0 right-0 top-14 md:top-[96px] lg:top-20 bottom-[48px] lg:bottom-[60px] overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Link to="/settings" className="p-2 -ml-2 text-gray-700 hover:text-oxfordBlue">
                    <ChevronLeft size={28} />
                </Link>
                <h1 className="text-2xl font-bold text-oxfordBlue text-center flex-grow">
                    {t("settings.terms_of_service.title")}
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8 prose prose-sm md:prose lg:prose-lg max-w-none">
              <p className="mb-4 text-sm md:text-base">Last updated: April 26, 2025</p>

              <p className="mb-2 text-sm md:text-base">
                Please read these Terms of Service ("Terms") carefully before using the
                DaGalow website and services operated by DaGalow ("we," "us," or "our").
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">1. Acceptance of Terms</h4>
              <p className="mb-4 text-sm md:text-base">
                By accessing or using our service, you agree to be bound by these Terms.
                If you disagree with any part of the terms, you may not access the
                service.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">2. User Accounts</h4>
              <p className="mb-4 text-sm md:text-base">
                When you create an account with us, you must provide accurate, complete,
                and up-to-date information. You are responsible for safeguarding the
                password and for all activities that occur under your account. You agree
                to notify us immediately of any unauthorized use of your account.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">
                3. Payments and Subscriptions
              </h4>
              <p className="mb-2 text-sm md:text-base">For paid services:</p>
              <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
                <li>
                  You agree to pay all fees or charges to your account based on the
                  fees, charges, and billing terms in effect at the time a fee or charge
                  is due and payable.
                </li>
                <li>You must provide a valid payment method for paying all fees.</li>
                <li>Subscriptions will automatically renew until cancelled.</li>
                <li>
                  Cancellations must be made at least 24 hours before the end of the
                  current billing period.
                </li>
              </ul>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">4. Coaching Services</h4>
              <p className="mb-4 text-sm md:text-base">
                Our coaching services are provided for informational and educational
                purposes only. We do not guarantee specific results. Implementation of
                advice and recommendations is at your own risk and discretion.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">5. Intellectual Property</h4>
              <p className="mb-4 text-sm md:text-base">
                The Service and its original content, features, and functionality are
                and will remain the exclusive property of DaGalow. Our service is
                protected by copyright, trademark, and other laws. Our trademarks may
                not be used in connection with any product or service without our prior
                written consent.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">6. Termination</h4>
              <p className="mb-4 text-sm md:text-base">
                We may terminate or suspend your account immediately, without prior
                notice or liability, for any reason, including without limitation if you
                breach the Terms. Upon termination, your right to use the Service will
                immediately cease.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">
                7. Limitation of Liability
              </h4>
              <p className="mb-4 text-sm md:text-base">
                In no event shall DaGalow, its directors, employees, partners, agents,
                suppliers, or affiliates, be liable for any indirect, incidental,
                special, consequential or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible
                losses.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">8. Changes to Terms</h4>
              <p className="mb-4 text-sm md:text-base">
                We reserve the right to modify or replace these Terms at any time. It is
                your responsibility to review these Terms periodically for changes.
              </p>

              <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">9. Contact Us</h4>
              <p className="mb-4 text-sm md:text-base">
                If you have any questions about these Terms, please contact us at
                terms@dagalow.com
              </p>
            </div>
        </div>
    </main>
  );
};

export default TermsOfServicePage;