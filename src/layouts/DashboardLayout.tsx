import { Link, NavLink, Outlet, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  PiggyBank,
  Banknote,
  BadgeCheck,
  Mic,
} from 'lucide-react';
import { NetworkGuard } from '../components/web3/NetworkGuard';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useDashboardSidebar } from '../contexts/DashboardSidebarContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { WalletButton } from '../components/web3/WalletButton';

const SIDEBAR_LINKS = [
  { to: '/dashboard', label: 'Dashboard', end: true, Icon: LayoutDashboard },
  { to: '/dashboard/transactions', label: 'Transactions', end: false, Icon: Receipt },
  { to: '/dashboard/analytics', label: 'Analytics', end: false, Icon: BarChart3 },
  { to: '/dashboard/savings', label: 'Savings', end: false, Icon: PiggyBank },
  { to: '/dashboard/lending', label: 'Lending', end: false, Icon: Banknote },
  { to: '/dashboard/identity', label: 'Identity', end: false, Icon: BadgeCheck },
  { to: '/dashboard/voice', label: 'Voice', end: false, Icon: Mic },
];

function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <nav className="flex-1 min-h-0 px-3 pt-2 space-y-0.5 overflow-y-auto">
      {SIDEBAR_LINKS.map(({ to, label, end, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'text-accent-green' : 'text-secondary hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${
                  isActive ? 'bg-tertiary text-accent-green border border-white/10' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function DashboardLayout() {
  const dashboardSidebar = useDashboardSidebar();
  const sidebarOpen = dashboardSidebar?.sidebarOpen ?? false;
  const setSidebarOpen = dashboardSidebar?.setSidebarOpen ?? (() => {});
  const { isOnboarded } = useOnboarding();

  // Until the backend is wired, we use onboarding state to decide if the
  // merchant should be allowed into the dashboard flow.
  if (!isOnboarded) {
    return <Navigate to="/register" replace />;
  }

  return (
    <NetworkGuard>
      <div className="min-h-screen bg-primary flex">
        <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 lg:pt-28 lg:pb-6 lg:border-r border-white/10 bg-secondary/80 backdrop-blur-sm">
          <SidebarNav onLinkClick={() => setSidebarOpen(false)} />
          <div className="px-3 pt-4 border-t border-white/10">
            <p className="text-xs text-secondary">Base · USDC</p>
          </div>
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-secondary border-r border-white/10 pt-4 pb-4 lg:hidden"
              >
                {/* Logo way up + close (only close icon) */}
                <div className="flex items-center justify-between gap-2 px-3 pb-3 mb-2 border-b border-white/10 shrink-0">
                  <Link
                    to="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <img src="/assets/Remifi logo.svg" alt="PayEcho" className="w-8 h-8 shrink-0" />
                    <span className="text-lg font-bold text-primary truncate">PayEcho</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close menu"
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-accent-green text-white border-2 border-accent-green hover:bg-accent-green-hover shadow-lg ring-2 ring-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <SidebarNav onLinkClick={() => setSidebarOpen(false)} />
                <div className="px-3 pt-3 mt-auto border-t border-white/10 space-y-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <ThemeToggle />
                    <WalletButton />
                  </div>
                  <p className="text-[11px] text-secondary">Base · USDC</p>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 lg:pl-56 pt-14 lg:pt-14 min-h-screen">
          <div className="px-4 sm:px-6 pt-3 pb-6 md:pt-4 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </NetworkGuard>
  );
}
