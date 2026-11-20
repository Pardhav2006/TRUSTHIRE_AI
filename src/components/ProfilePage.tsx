import React, { useState } from 'react';
import { CheckCircle2, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { UserAccount } from '../types/trusthire';

interface ProfilePageProps {
  user: UserAccount;
  onUpdateUser: (user: UserAccount) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [institution, setInstitution] = useState(user.institution ?? '');
  const [targetRole, setTargetRole] = useState(user.targetRole ?? '');
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setError('');
    setSavedMsg('');
    setSaving(true);
    try {
      const res = await api.updateProfile({
        email: user.email,
        name: name.trim(),
        institution: institution.trim(),
        targetRole: targetRole.trim(),
        role: role.trim(),
      });
      onUpdateUser(res.user);
      setSavedMsg('Session profile updated.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Profile &amp; Account Session
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your student profile details and current preview session.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B192C] font-display text-base font-bold text-sky-300">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-900">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">
                {user.email} · Session Preview Mode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {savedMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                College / Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g., Department of CSE"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Target Career Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Python Developer / Data Analyst"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Candidate Category
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
          <span>
            Session Note: Authentication currently runs in session-preview mode
            via <code className="font-mono">/api/auth/*</code>. Connect the
            Python Django <code className="font-mono">accounts</code> app and
            MySQL database for persistent encrypted credentials.
          </span>
        </div>
      </div>
    </div>
  );
};
