import React, { useState } from 'react';
import {
  AudioLines,
  BookOpen,
  Briefcase,
  FileSearch,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  User,
  X,
} from 'lucide-react';
import type { AppRoute, UserAccount } from '../types/trusthire';
import { BrandLogo } from './BrandLogo';

interface DashboardLayoutProps {
  currentRoute: AppRoute;
  user: UserAccount;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: {
  route: AppRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'job-fraud', label: 'Job Fraud Detection', icon: ShieldAlert },
  {
    route: 'call-fraud',
    label: 'Recruitment Call Detection',
    icon: AudioLines,
  },
  { route: 'resume-analysis', label: 'Resume Analysis', icon: FileSearch },
  {
    route: 'job-recommendations',
    label: 'Job Recommendations',
    icon: Briefcase,
  },
  { route: 'history', label: 'Analysis History', icon: History },
  { route: 'about', label: 'About Project', icon: BookOpen },
  { route: 'profile', label: 'Profile', icon: User },
];

const ROUTE_TITLES: Record<AppRoute, string> = {
  landing: 'Home',
  auth: 'Account',
  dashboard: 'Dashboard Overview',
  'job-fraud': 'Fake Job Advertisement Detection',
  'call-fraud': 'Fake Recruitment Call Detection',
  'resume-analysis': 'AI Resume Analysis & Extraction',
  'job-recommendations': 'Job Recommendations (TF-IDF)',
  history: 'Analysis History',
  about: 'About TrustHire AI',
  profile: 'User Profile & Session',
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentRoute,
  user,
  onNavigate,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSidebarNav = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between bg-[#0B192C] text-slate-200">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              if (isMobile) setSidebarOpen(false);
              onNavigate('landing');
            }}
            className="text-left focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <BrandLogo variant="light" size="sm" />
          </button>
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="mt-4 space-y-1 px-3" aria-label="Workspace Navigation">
          {NAV_ITEMS.map((item) => {
            const active = currentRoute === item.route;
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => {
                  onNavigate(item.route);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-sky-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 p-3 space-y-1">
        <button
          type="button"
          onClick={() => {
            if (isMobile) setSidebarOpen(false);
            onNavigate('landing');
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
        >
          <Home className="h-4 w-4 text-slate-400" />
          <span>Public Home Page</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/60 hover:text-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 border-r border-slate-800">
        <div className="sticky top-0 h-screen">{renderSidebarNav(false)}</div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-68 max-w-xs h-full">
            {renderSidebarNav(true)}
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex lg:hidden items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">
                TrustHire AI Workspace / {ROUTE_TITLES[currentRoute]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left hover:bg-slate-100 transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0B192C] text-xs font-semibold text-sky-300">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden sm:block text-xs">
                <span className="block font-semibold text-slate-900 max-w-[140px] truncate">
                  {user.name}
                </span>
                <span className="block text-slate-500 max-w-[140px] truncate">
                  {user.email}
                </span>
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
