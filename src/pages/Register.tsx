import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useActiveAccount } from 'thirdweb/react';
import { JsonRpcProvider } from 'ethers';
import { BASE_SEPOLIA_RPC } from '../lib/base-rpc';
import { useOnboarding } from '../contexts/OnboardingContext';

const CATEGORIES = [
  'Retail',
  'Food & Beverage',
  'Services',
  'Market / Stall',
  'Transport',
  'Other',
];

const LANGUAGES = ['English', 'Twi', 'French', 'Swahili'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const account = useActiveAccount();
  const [baseName, setBaseName] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    language: 'English',
  });

  useEffect(() => {
    if (!account?.address) {
      setBaseName(null);
      return;
    }
    let cancelled = false;
    const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
    provider
      .lookupAddress(account.address)
      .then((name) => { if (!cancelled) setBaseName(name || null); })
      .catch(() => { if (!cancelled) setBaseName(null); });
    return () => { cancelled = true; };
  }, [account?.address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In the real app this will POST to the backend to create the RewardBank account.
    completeOnboarding();
    navigate('/register/success');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="bg-secondary rounded-xl border border-white/10 p-6 md:p-8">
          <p className="text-sm font-medium text-accent-green mb-2">Step 2 of 3</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-2">
            Create your merchant profile
          </h1>
          <p className="text-secondary text-sm mb-6">
            This powers your onchain identity and future credit scoring. All fields are required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-lg bg-tertiary/80 border border-white/10 p-4 space-y-2">
              <p className="text-sm font-medium text-primary">Wallet & Base name</p>
              {account ? (
                <>
                  <p className="text-xs text-secondary">
                    Connected: {account.address.slice(0, 6)}…{account.address.slice(-4)}
                  </p>
                  <p className="text-xs text-secondary">
                    Base name: {baseName ?? '—'}
                  </p>
                  {!baseName && (
                    <p className="text-xs text-secondary/80">
                      Your Base name (e.g. ada.base.eth) links this profile to your onchain identity.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-secondary">Connect your wallet to see your Base name.</p>
              )}
            </div>
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-primary mb-1.5">
                Business name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                value={form.businessName}
                onChange={handleChange}
                placeholder={baseName ? `e.g. ${baseName}` : "e.g. Ada's Shop"}
                className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary placeholder:text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-primary mb-1.5">
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-primary mb-1.5">
                Location (city / region)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Accra, Ghana"
                className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary placeholder:text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1.5">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+233..."
                className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary placeholder:text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary placeholder:text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              />
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-primary mb-1.5">
                Preferred language
              </label>
              <select
                id="language"
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-accent-green px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-green-hover transition-colors"
              >
                Continue → Deploy vault & get QR
              </button>
              <Link
                to="/dashboard"
                className="rounded-full border border-white/15 bg-transparent px-5 py-2.5 text-sm font-medium text-primary hover:bg-white/5 transition-colors text-center"
              >
                Back
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
};

export default Register;
