import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { apiGetJson, apiPatchJson } from '../../lib/api';

export interface UserProfileResponse {
  walletAddress: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantProfileResponse {
  address: string;
  name: string;
  category: string;
  location?: string;
  phone?: string;
  email?: string;
  preferredLanguage?: string;
  vaultAddress: string;
  registeredAt: string;
}

export default function Profile() {
  const { getToken, address } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [merchant, setMerchant] = useState<MerchantProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState({
    displayName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      const token = await getToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const [userData, merchantData] = await Promise.all([
          apiGetJson<UserProfileResponse>('/api/profile', { token }),
          address
            ? apiGetJson<MerchantProfileResponse | { error: string }>(
                `/api/merchants/${encodeURIComponent(address)}`,
                { token },
              ).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (!cancelled && userData?.walletAddress) {
          setProfile(userData);
          const m = merchantData && !('error' in merchantData) ? merchantData : null;
          setMerchant(m ?? null);
          setEdit({
            displayName: userData.displayName ?? (m?.name && m.name !== 'Unnamed' ? m.name : '') ?? '',
            email: userData.email ?? m?.email ?? '',
            phone: userData.phone ?? m?.phone ?? '',
          });
        } else if (!cancelled) {
          setProfile(null);
          setError('Profile response missing wallet address');
        }
      } catch (e) {
        if (!cancelled) {
          setProfile(null);
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [getToken, address]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) {
      toast.error('Please log in again.');
      return;
    }
    setSaving(true);
    try {
      const updated = await apiPatchJson<UserProfileResponse>('/api/profile', {
        displayName: edit.displayName || undefined,
        email: edit.email || undefined,
        phone: edit.phone || undefined,
      }, { token });
      setProfile(updated);
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">Profile</h1>
        <div className="bg-secondary rounded-xl border border-white/10 p-8 flex items-center justify-center">
          <p className="text-secondary">Loading…</p>
        </div>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">Profile</h1>
        <div className="bg-secondary rounded-xl border border-white/10 p-8 text-center space-y-3">
          <p className="text-secondary">Could not load profile.</p>
          {error && (
            <p className="text-sm text-red-400/90 font-mono break-all">
              {error}
            </p>
          )}
          <p className="text-sm text-secondary/80">
            Make sure you’re logged in and that <strong>identity tokens</strong> are enabled in your Privy app (Dashboard → User management → Authentication → Advanced). See PRIVY_SETUP.md for steps.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">Profile</h1>
        <p className="text-secondary text-sm mt-1">
          Your account details and PayEcho wallet address.
        </p>
      </div>

      {/* PayEcho wallet address — read-only, created on first login */}
      <div className="bg-secondary rounded-xl border border-white/10 p-6">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-2">
          PayEcho wallet address
        </h2>
        <p className="text-primary font-mono text-sm break-all">
          {profile.walletAddress}
        </p>
        <p className="text-xs text-secondary mt-2">
          This is your wallet address (created when you logged in). Use it to receive payments and link your merchant vault.
        </p>
      </div>

      {/* Merchant details (from registration) */}
      {merchant ? (
        <div className="bg-secondary rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">
            Merchant details
          </h2>
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-secondary">Business name</dt>
              <dd className="text-primary font-medium">{merchant.name}</dd>
            </div>
            <div>
              <dt className="text-secondary">Category</dt>
              <dd className="text-primary">{merchant.category}</dd>
            </div>
            {merchant.location && (
              <div>
                <dt className="text-secondary">Location</dt>
                <dd className="text-primary">{merchant.location}</dd>
              </div>
            )}
            {merchant.preferredLanguage && (
              <div>
                <dt className="text-secondary">Preferred language</dt>
                <dd className="text-primary">{merchant.preferredLanguage}</dd>
              </div>
            )}
            <div>
              <dt className="text-secondary">Payment pool (BankVault)</dt>
              <dd className="text-primary font-mono text-xs break-all">{merchant.vaultAddress}</dd>
            </div>
          </dl>
          <p className="text-xs text-secondary mt-3">
            These were saved when you registered as a merchant. Payments to your QR go to the shared pool above.
          </p>
        </div>
      ) : (
        <div className="bg-secondary/50 rounded-xl border border-white/10 p-6">
          <p className="text-secondary text-sm">
            No merchant profile yet. Complete <strong>Register</strong> (Step 2) to add your business details and get your payment QR.
          </p>
        </div>
      )}

      {/* Editable profile */}
      <form onSubmit={handleSave} className="bg-secondary rounded-xl border border-white/10 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-primary">Your details</h2>

        <div>
          <label htmlFor="profile-displayName" className="block text-sm font-medium text-primary mb-1.5">
            Display name
          </label>
          <input
            id="profile-displayName"
            type="text"
            value={edit.displayName}
            onChange={(e) => setEdit((p) => ({ ...p, displayName: e.target.value }))}
            placeholder="e.g. Ada"
            className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary placeholder:text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-primary mb-1.5">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={edit.email}
            onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary placeholder:text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
          />
        </div>

        <div>
          <label htmlFor="profile-phone" className="block text-sm font-medium text-primary mb-1.5">
            Phone
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={edit.phone}
            onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+233..."
            className="w-full rounded-lg bg-tertiary border border-white/10 px-4 py-2.5 text-primary placeholder:text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/50"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent-green px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </motion.div>
  );
}
