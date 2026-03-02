import React from 'react';
const FrameIcon1 = '/assets/transaction.svg';
const FrameIcon2 = '/assets/mdi_security-lock.svg';
const FrameIcon3 = '/assets/Group.svg';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeaturesSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: (
        <img src={FrameIcon1} alt="QR payments" className="w-12 h-12" />
      ),
      title: 'QR payments, USDC-first',
      description: 'Accept USDC via QR on Base. Every payment is verifiable and updates your dashboard in real time.'
    },
    {
      icon: (
        <img src={FrameIcon2} alt="Voice confirmation" className="w-12 h-12" />
      ),
      title: 'AI voice confirmation',
      description: 'Instant announcements when funds land onchain—built to stop screenshot and SMS fraud at the counter.'
    },
    {
      icon: (
        <img src={FrameIcon3} alt="Onchain identity" className="w-12 h-12" />
      ),
      title: 'Onchain identity → capital',
      description: 'Your revenue ledger becomes a credit score. Unlock auto-savings and revenue-based micro-loans over time.'
    }
  ];

  return (
    <section className="px-6 py-16 bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-medium text-primary mb-6">
            Built for merchants. Designed for trust.
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Payecho compounds value as a merchant grows: start with fraud-proof payments,
            build an onchain revenue identity, and unlock embedded finance when you qualify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-colors duration-200">
              <div className="mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                {feature.title}
              </h3>
              <p className="text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
