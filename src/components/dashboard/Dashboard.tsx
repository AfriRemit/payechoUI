import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10 md:pt-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-10"
        >
          {/* Header */}
          <motion.div variants={item} className="max-w-3xl">
            <p className="text-sm font-medium text-accent-green mb-2">
              Merchant dashboard · Base · USDC
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-primary leading-tight mb-3">
              Your onchain revenue home.
            </h1>
            <p className="text-sm md:text-base text-secondary leading-relaxed">
              Connect your wallet, create your merchant profile, and start accepting fraud‑proof USDC
              payments with instant voice confirmation. Every payment builds your onchain revenue
              history and credit score.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Onboarding steps */}
            <motion.div
              variants={item}
              className="lg:col-span-2 bg-secondary rounded-xl border border-white/10 p-5 md:p-6 shadow-card-dark"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-primary">
                  Get started as a merchant
                </h2>
                <span className="inline-flex items-center rounded-full bg-tertiary/70 px-3 py-1 text-xs font-medium text-secondary border border-white/5">
                  Step 1 of 3
                </span>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-xs font-semibold text-white shadow-glow">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-0.5">
                      Connect your Base wallet
                    </p>
                    <p className="text-xs md:text-sm text-secondary">
                      Use the <span className="font-medium text-primary">Become a Merchant</span>{' '}
                      button in the header to connect a wallet on Base. This wallet will own your
                      Merchant Vault.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-primary border border-white/10">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-0.5">
                      Create your merchant profile
                    </p>
                    <p className="text-xs md:text-sm text-secondary">
                      Add your business name, category, location, and contact details. This powers
                      your onchain identity and future credit scoring.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-primary border border-white/10">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-0.5">
                      Generate your QR & start accepting USDC
                    </p>
                    <p className="text-xs md:text-sm text-secondary">
                      We’ll generate a unique QR linked to your Merchant Vault. Show it at checkout,
                      get instant voice confirmation, and see every payment in your onchain ledger.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-accent-green px-5 py-2.5 text-xs md:text-sm font-medium text-white hover:bg-accent-green-hover transition-colors shadow-glow"
                >
                  Continue onboarding
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-5 py-2.5 text-xs md:text-sm font-medium text-primary hover:bg-white/5 transition-colors"
                >
                  Preview dashboard
                </button>
              </div>
            </motion.div>

            {/* Status + highlights */}
            <motion.div
              variants={item}
              className="space-y-4"
            >
              <div className="bg-secondary rounded-xl border border-white/10 p-4 md:p-5 shadow-card-dark">
                <p className="text-xs font-medium text-secondary mb-1">
                  Onboarding status
                </p>
                <p className="text-base md:text-lg font-semibold text-primary mb-2">
                  Merchant setup in progress
                </p>
                <div className="w-full h-2 rounded-full bg-tertiary overflow-hidden mb-3">
                  <div className="h-full w-1/3 bg-accent-green rounded-full" />
                </div>
                <ul className="space-y-1.5 text-xs text-secondary">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
                    Home & branding ready
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    Merchant onboarding flow — in progress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    Live payment feed & credit score — coming next
                  </li>
                </ul>
              </div>

              <div className="bg-secondary rounded-xl border border-white/10 p-4 md:p-5 shadow-card-dark">
                <p className="text-xs font-medium text-secondary mb-1">
                  What you’ll see here
                </p>
                <ul className="space-y-1.5 text-xs md:text-sm text-secondary">
                  <li>• Live USDC balance and savings split</li>
                  <li>• Instant payment feed with voice confirmations</li>
                  <li>• Credit score, tier, and lending eligibility</li>
                  <li>• Exportable onchain revenue statements</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
