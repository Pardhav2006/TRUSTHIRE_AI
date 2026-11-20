import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import type { AuthView, UserAccount } from '../types/trusthire';
import { BrandLogo } from './BrandLogo';

interface AuthPagesProps {
  initialView: AuthView;
  onSuccess: (user: UserAccount) => void;
  onBackHome: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialView,
  onSuccess,
  onBackHome,
}) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const switchView = (next: AuthView) => {
    setView(next);
    setError('');
    setSuccessMsg('');
  };

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (view === 'forgot-password') {
      setLoading(true);
      try {
        const res = await api.forgotPassword(email.trim());
        setSuccessMsg(res.message);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to process request.'
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (view === 'register') {
      if (name.trim().length < 2) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (view === 'login') {
        const res = await api.login({ email: email.trim(), password });
        onSuccess(res.user);
      } else {
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
          institution: institution.trim(),
        });
        onSuccess(res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.login({
        email: 'student@trusthire.edu',
        password: 'trusthire2026',
      });
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-[#0B192C] p-12 text-white">
        <div>
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <div className="mt-10">
            <BrandLogo variant="light" />
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight [text-wrap:balance]">
              Verify Opportunities Before You Apply
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Access job advertisement risk analysis, multilingual recruitment
              call screening, resume parsing, and TF-IDF career matching from
              one unified workspace.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-slate-800 pt-8 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
              <span>
                Flags upfront fee demands, fake interview guarantees, and
                mismatched recruiter email domains.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
              <span>
                Matches extracted resume skills to career openings using TF-IDF
                and Cosine Similarity.
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-4 text-xs leading-relaxed text-slate-300">
          <p className="font-semibold text-sky-300">
            Backend Authentication Architecture Note
          </p>
          <p className="mt-1">
            This preview uses session-scoped endpoints wired to{' '}
            <code className="font-mono text-slate-200">/api/auth/*</code>.
            Persistent user credentials and encrypted sessions connect directly
            to the Python Django <code className="font-mono">accounts</code> app
            and MySQL database.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <BrandLogo variant="dark" size="sm" />
            <button
              type="button"
              onClick={onBackHome}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Home
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {view === 'login' && 'Sign in to TrustHire AI'}
              {view === 'register' && 'Create your student account'}
              {view === 'forgot-password' && 'Reset your password'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              {view === 'login' &&
                'Enter your email and password to open the analysis workspace.'}
              {view === 'register' &&
                'Register to screen job offers, inspect calls, and match your resume.'}
              {view === 'forgot-password' &&
                'Enter your registered email to preview the password reset workflow.'}
            </p>

            {/* Auth Mode Switch Tabs */}
            {view !== 'forgot-password' && (
              <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                    view === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                    view === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {view === 'register' && (
                <>
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Full Name
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Priya Nair"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="auth-institution"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      College / University (Optional)
                    </label>
                    <input
                      id="auth-institution"
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g., Department of Computer Science"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                  required
                />
              </div>

              {view !== 'forgot-password' && (
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    {view === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchView('forgot-password')}
                        className="text-xs font-medium text-sky-700 hover:text-sky-800"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {view === 'register' && (
                <div>
                  <label
                    htmlFor="auth-confirm"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {view === 'login' && 'Sign In'}
                  {view === 'register' && 'Create Session Account'}
                  {view === 'forgot-password' && 'Validate Reset Request'}
                </span>
              </button>
            </form>

            {view === 'forgot-password' && (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="mt-4 w-full text-center text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                Back to Sign In
              </button>
            )}

            {/* Quick Capstone Evaluator Demo Access */}
            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-start gap-2 text-xs text-slate-500 mb-3">
                <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                <span>
                  For project demonstration: sign in immediately with the
                  pre-configured evaluator session.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-semibold text-sky-900 hover:bg-sky-100 transition-colors"
              >
                Continue with Demo Evaluator Account (DEMO)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
