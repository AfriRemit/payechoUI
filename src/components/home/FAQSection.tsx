import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is Payecho?',
      answer: 'Payecho is merchant infrastructure for fraud-proof QR payments on Base. Every payment becomes an onchain revenue ledger that can power credit scoring and embedded finance.'
    },
    {
      question: 'How does the voice confirmation work?',
      answer: 'When a USDC payment is confirmed onchain, Payecho detects the PaymentReceived event and immediately plays an AI voice message announcing the amount and the running total for the day.'
    },
    {
      question: 'Is Payecho a bank or a payment processor?',
      answer: 'No. Payecho is protocol infrastructure and merchant tooling built on Base. Settlement happens onchain; Payecho helps merchants present QR checkout and manage their onchain revenue history.'
    },
    {
      question: 'What token do customers pay with?',
      answer: 'USDC is the primary payment token. It\'s designed to be stable and is widely supported across wallets and exchanges.'
    },
    {
      question: 'How does Payecho help merchants access capital?',
      answer: 'Over time, onchain revenue data can be used to compute a transparent credit score. That score can unlock auto-savings rules and revenue-based micro-loans with automatic repayment hooks.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-6 py-16 bg-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Content - FAQ List */}
        <div className="bg-secondary rounded-2xl p-6">
          <h3 className="text-xl font-bold text-primary mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-4 text-left hover:text-accent-green transition-colors duration-200"
                >
                  <span className="text-primary font-medium">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-secondary transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="pb-4">
                    <p className="text-secondary leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-medium text-primary leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-secondary leading-relaxed">
              Got questions? Here's the quick overview of how Payecho works and what it's building toward.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src="/assets/3D  of a Shiny Blue Question Mark 1.svg"
              alt=""
              className="w-96 h-96 sm:w-[30rem] sm:h-[30rem] lg:w-[42rem] lg:h-[42rem] max-w-full object-contain"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
