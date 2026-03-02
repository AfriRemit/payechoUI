import React from "react";
const GlassShield = "/assets/Frosted Glass Shield Icon 1.svg";

const SecuritySection: React.FC = () => {
  return (
    <section className="px-6 py-16 bg-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-medium text-primary leading-tight">
            Stop fraud at the moment it happens.
          </h2>
          <p className="text-xl text-secondary leading-relaxed">
            Payecho doesn’t ask merchants to “trust an SMS” or a screenshot.
            It verifies payments onchain and confirms them immediately—visually and with AI voice—so the merchant can serve confidently.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-secondary/20 p-5">
              <div className="text-sm text-secondary">Source of truth</div>
              <div className="text-lg font-semibold text-primary mt-1">Base transaction</div>
              <div className="text-sm text-secondary mt-1">Verifiable onchain events for every payment.</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-secondary/20 p-5">
              <div className="text-sm text-secondary">Confirmation UX</div>
              <div className="text-lg font-semibold text-primary mt-1">Voice + realtime</div>
              <div className="text-sm text-secondary mt-1">Announced within seconds of confirmation.</div>
            </div>
          </div>
        
        </div>

        {/* Right Content - 3D Shiny Blue Shield Image */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Main image container with metallic effect */}
            <img
              src={GlassShield}
              alt="Frosted Glass Shield"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
