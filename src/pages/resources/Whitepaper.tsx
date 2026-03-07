import { motion } from 'framer-motion';

export default function WhitepaperPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] px-4 py-12 sm:px-6 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-3xl space-y-6"
      >
        <section>
          <h1 className="text-3xl sm:text-4xl font-semibold text-primary mb-3">Download Whitepaper</h1>
          <p className="text-secondary text-sm sm:text-base">
            Get the full Payecho protocol specification: smart contract architecture, payment infrastructure, and merchant
            UX flows.
          </p>
        </section>
        <section className="bg-secondary rounded-xl border border-white/10 p-6">
          <p className="text-xs text-secondary mb-3">
            The current whitepaper is evolving alongside the Base Batch roadmap. You&apos;ll be able to download it
            here once it&apos;s published.
          </p>
          <button
            type="button"
            disabled
            className="mt-2 rounded-full bg-accent-green/40 px-5 py-2 text-xs font-semibold text-white/80 cursor-not-allowed"
          >
            Whitepaper coming soon
          </button>
        </section>
      </motion.div>
    </main>
  );
}

