import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { JsonRpcProvider } from 'ethers';
import { BASE_SEPOLIA_RPC } from '../lib/base-rpc';
import { useOnboarding } from '../contexts/OnboardingContext';
import { toast } from 'react-toastify';
import { apiPostJson } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { setPostLoginRedirect } from '../lib/postLoginRedirect';

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
  const { address, getToken, isAuthenticated, ready, login } = useAuth();
  const [baseName, setBaseName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    language: 'English',
  });

  useEffect(() => {
    if (!address) {
      setBaseName(null);
      return;
    }
    let cancelled = false;
    const provider = new JsonRpcProvider(BASE_SEPOLIA_RPC);
    provider
      .lookupAddress(address)
      .then((name) => { if (!cancelled) setBaseName(name || null); })
      .catch(() => { if (!cancelled) setBaseName(null); });
    return () => { cancelled = true; };
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error('Log in first to get your wallet address.');
      return;
    }
    setSubmitting(true);
    try {
      let token = await getToken();
      if (!token) {
        await new Promise((r) => setTimeout(r, 800));
        token = await getToken();
      }
      if (!token) {
        toast.error('Session expired. Please log in again, then try Register.');
        return;
      }

      const result = await apiPostJson<{ vaultAddress?: string; txHash?: string; error?: string }>(
        '/api/merchants/register-onchain',
        {},
        { token },
      );
      if (!result.vaultAddress) {
        throw new Error((result as { error?: string }).error || 'Registration failed. Please try again later.');
      }

      const profile = await apiPostJson<{ error?: string }>(
        '/api/merchants/register',
        {
          name: form.businessName,
          category: form.category,
          location: form.location,
          phone: form.phone,
          email: form.email,
          preferredLanguage: form.language,
          vaultAddress: result.vaultAddress,
        },
        { token },
      );
      if (profile && 'error' in profile && profile.error) {
        throw new Error(profile.error);
      }

      completeOnboarding();
      toast.success('Merchant registered onchain. Profile saved.');
      navigate('/register/success');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Registration failed';
      let msg = raw;
      if (err instanceof TypeError && raw === 'Failed to fetch') {
        msg = 'Unable to connect. Please check your connection and try again.';
      } else if (/something went wrong|discord\.com/i.test(raw) && raw.length > 120) {
        msg = 'Registration failed. Please try again later.';
      }
      toast.error(msg);
      console.error('[Register]', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (ready && !isAuthenticated) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-secondary rounded-xl border border-white/10 p-8">
            <h1 className="text-xl font-semibold text-primary mb-2">Log in to become a merchant</h1>
            <p className="text-secondary text-sm mb-6">
              Sign in with your wallet, email, or social account. We’ll then take you to the registration form.
            </p>
            <button
              type="button"
              onClick={() => {
                setPostLoginRedirect('/register');
                login();
              }}
              className="rounded-full bg-accent-green px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-green-hover transition-colors"
            >
              Log in
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
        <p className="text-secondary">Loading…</p>
      </main>
    );
  }

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
            Your wallet will be registered with the shared payment pool (BankVault) so you can receive USDC. All fields are required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-lg bg-tertiary/80 border border-white/10 p-4 space-y-2">
              <p className="text-sm font-medium text-primary">Wallet & Base name</p>
              {address ? (
                <>
                  <p className="text-xs text-secondary">Connected: {address.slice(0, 6)}…{address.slice(-4)}</p>
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
                <p className="text-xs text-secondary">Log in above to see your wallet. We’ll create an embedded wallet if you sign up with email or social.</p>
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
            <p className="text-[11px] text-secondary/70">
              Your wallet will be registered with the shared payment pool so you can receive USDC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !address}
                className="flex-1 rounded-full bg-accent-green px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Registering merchant…' : 'Register merchant & get QR'}
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
