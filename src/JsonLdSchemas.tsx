// JsonLdSchemas.tsx
// This component injects JSON-LD structured data into your React app
// using react-schemaorg and schema-dts for type-safe Schema.org markup.

import React from 'react';
import { JsonLd } from 'react-schemaorg';
import {
  WithContext,
  Organization,
  Service,
  OfferCatalog,
  Offer,
  FAQPage,
  Question,
  Answer,
} from 'schema-dts';

/**
 * JsonLdSchemas: injects Organization, Service (with OfferCatalog), and FAQPage schemas
 * based on your landing page data for danieldagalow.com
 */
const JsonLdSchemas = () => {
  /** Organization schema with email contact and logo in public folder */
  const organization: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Daniel Da'Galow",
    url: window.location.origin,
    logo: `${window.location.origin}/logo.svg`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'danieldagalow@gmail.com',
        contactType: 'Customer Service',
      },
    ],
  };

  /**
   * Consultation service offers with pricing
   */
  const consultationOffers: Offer[] = [
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Consultation 45min' }, price: '67.50', priceCurrency: 'EUR' },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Consultation 60min' }, price: '90.00', priceCurrency: 'EUR' },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Consultation 75min' }, price: '112.50', priceCurrency: 'EUR' },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Consultation 90min' }, price: '135.00', priceCurrency: 'EUR' },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Consultation 105min' }, price: '157.50', priceCurrency: 'EUR' },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Consultation 120min' }, price: '180.00', priceCurrency: 'EUR' },
  ];

  /**
   * Coaching plans offers
   */
  const coachingOffers: Offer[] = [
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Coaching Weekly Plan' }, price: '40.00', priceCurrency: 'EUR' },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Coaching Daily Plan' }, price: '90.00', priceCurrency: 'EUR' },
    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Coaching Priority Plan' }, price: '240.00', priceCurrency: 'EUR' },
  ];

  /**
   * Combined OfferCatalog for all services
   */
  const serviceCatalog: WithContext<OfferCatalog> = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Service Catalog',
    itemListElement: [...consultationOffers, ...coachingOffers],
  };

  /**
   * Service schema wrapping the catalog, with terms of service link
   */
  const serviceSchema: WithContext<Service> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Consultations & Coaching',
    provider: { '@type': 'Organization', name: "Daniel Da'Galow" },
    hasOfferCatalog: serviceCatalog,
    termsOfService: `${window.location.origin}/terms`,
  };

  /**
   * FAQPage schema with all Q&A entries from the landing page
   */
  const faqSchema: WithContext<FAQPage> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: "What coaching tiers do you offer and what's included with each?", acceptedAnswer: { '@type': 'Answer', text: "I offer three distinct coaching tiers to meet your specific needs:\n\n1. Weekly Plan (€40/month): I'll answer your questions once a week. You can submit as many questions as you need, and I'll address them all in a comprehensive weekly response.\n\n2. Daily Plan (€90/month): I provide daily responses to your questions for more continuous guidance and faster progress toward your goals.\n\n3. Priority Plan (€230/month): You'll receive answers as soon as possible with top priority handling. This premium tier ensures you're never waiting for critical advice." } } as Question,
      { '@type': 'Question', name: "How do I know which coaching package is right for me?", acceptedAnswer: { '@type': 'Answer', text: "The right coaching package depends on your goals, timeline, and the level of support you need:\n\n- Choose Weekly if you're looking for guidance on a longer-term project or goal with a flexible timeline.\n- Choose Daily if you need regular accountability and feedback to maintain momentum.\n- Choose Priority if you're making time-sensitive decisions or navigating a critical phase that requires immediate expert input.\n\nYour choice should reflect what coaching area you're seeking help with, whether it's financial guidance, personal training, relationship advice, or any other specialized area." } } as Question,
      { '@type': 'Question', name: "Can I upgrade or downgrade my coaching package?", acceptedAnswer: { '@type': 'Answer', text: "Yes, you can change your subscription tier whenever you want. If your needs change or you discover you need more or less support, simply update your subscription in your account settings. Changes will take effect at your next billing cycle." } } as Question,
      { '@type': 'Question', name: "What communication channels do you use for coaching?", acceptedAnswer: { '@type': 'Answer', text: "All coaching communication takes place via WhatsApp for seamless, convenient interaction. This allows for easy sharing of text, images, voice messages, and documents while maintaining a single, organized thread of our conversations." } } as Question,
      { '@type': 'Question', name: "Why should I use the chatbot before my service?", acceptedAnswer: { '@type': 'Answer', text: "The chatbot is an essential final step in our service process that helps you maximize the value of your investment. By sharing specific information about yourself, your situation, and your goals through the chatbot, you allow me to prepare thoroughly before our interaction begins. This preparation means we can use 100% of our paid time together focusing on solutions rather than gathering basic information. Clients who use the chatbot report significantly more productive sessions and better outcomes, as we can dive straight into the core discussion." } } as Question,
      { '@type': 'Question', name: "How do I book a consultation?", acceptedAnswer: { '@type': 'Answer', text: "Booking a consultation is straightforward:\n1. Select your preferred date on my calendar\n2. Choose a duration that fits your needs (45–120 minutes)\n3. Select a time slot from available hours\n4. Complete your contact information\n5. Process your payment securely through Stripe\n6. Receive confirmation and meeting details" } } as Question,
      { '@type': 'Question', name: "What should I prepare before our consultation?", acceptedAnswer: { '@type': 'Answer', text: "To make the most of our time together, I recommend using the chatbot step in the booking process to provide key information about your situation. This helps me organize your session efficiently, ensuring we maximize your time and investment." } } as Question,
      { '@type': 'Question', name: "Can I reschedule my appointment?", acceptedAnswer: { '@type': 'Answer', text: "Yes, you can cancel or reschedule your appointment if your plans change. Simply log into your account and adjust your booking, or contact me directly." } } as Question,
      { '@type': 'Question', name: "How far in advance should I book a consultation?", acceptedAnswer: { '@type': 'Answer', text: "I recommend booking at least 48 hours in advance to secure your preferred time slot. For urgent matters, you may contact me directly to check for last-minute availability." } } as Question,
      { '@type': 'Question', name: "What happens after our consultation?", acceptedAnswer: { '@type': 'Answer', text: "My consultations are designed as standalone sessions without automatic follow-up. You'll receive the guidance and action steps you need during our time together. If you find you need additional support after implementing the initial advice, you're welcome to schedule another session or consider one of my ongoing coaching packages." } } as Question,
      { '@type': 'Question', name: "What types of analysis do you offer?", acceptedAnswer: { '@type': 'Answer', text: "I offer three specialized analysis services:\n\n- Stock Analysis: Comprehensive evaluation of investments including technical indicators, fundamental analysis, and potential growth trajectories.\n- Company Analysis: In-depth assessment of business models, competitive positioning, financial health, and growth opportunities.\n- Social Media Analysis: Detailed review of social media accounts, engagement metrics, audience demographics, and optimization strategies.\n\nEach analysis is custom-tailored to your specific questions and objectives." } } as Question,
      { '@type': 'Question', name: "What information do I need to provide for an analysis?", acceptedAnswer: { '@type': 'Answer', text: "To ensure a thorough and relevant analysis, please provide:\n- The specific stock symbol, company name, or social media account you want analyzed\n- Your key questions or concerns about the subject\n- Any particular metrics or aspects you're most interested in understanding\n\nThe more specific you are about what you want to know, the more valuable your analysis will be." } } as Question,
      { '@type': 'Question', name: "How will analysis results be delivered?", acceptedAnswer: { '@type': 'Answer', text: "You'll receive a comprehensive PDF report via email containing all findings, insights, and recommendations. This document includes visual elements such as graphs, charts, and comparative tables where applicable." } } as Question,
      { '@type': 'Question', name: "What are the pitch decks you offer?", acceptedAnswer: { '@type': 'Answer', text: "I provide access to my personal pitch decks for companies I'm currently building. These are real-world examples of successful pitches that have attracted investor interest. Available pitch decks include: Perspectiv, Galow.Club, Pizzaria." } } as Question,
      { '@type': 'Question', name: "How do payments work?", acceptedAnswer: { '@type': 'Answer', text: "All payments are processed securely through Stripe. I accept all major credit and debit cards. Coaching subscriptions are billed monthly and automatically renew until canceled. One-time services like consultations and analyses are paid at the time of booking." } } as Question,
    ],
  };

  return (
    <>
      <JsonLd<WithContext<Organization>> item={organization} />
      <JsonLd<WithContext<Service>> item={serviceSchema} />
      <JsonLd<WithContext<FAQPage>> item={faqSchema} />
    </>
  );
};

export default JsonLdSchemas;
