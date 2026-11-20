import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import type { JobAdAnalysisResult, JobAdInput } from '../types/trusthire';

const DEMO_SCAM_INPUT: JobAdInput = {
  jobTitle: 'Graduate Python Developer (Immediate Joining)',
  companyName: 'Global Apex Career Solutions',
  recruiterEmail: 'hr.globalapex.recruit2026@gmail.com',
  location: 'Work From Home / Pan-India',
  salaryDetails: '₹75,000 - ₹95,000/month (No experience needed)',
  description:
    'Congratulations! Direct selection without technical interview. Freshers can apply immediately. Guaranteed job offer letter within 2 hours. Candidates must transfer ₹2,500 refundable registration and ID verification fee via UPI before training begins. Send Aadhaar and bank account number to confirm slot.',
};

const DEMO_GENUINE_INPUT: JobAdInput = {
  jobTitle: 'Junior Software Engineer — Backend (Python / SQL)',
  companyName: 'Zoho Corporation',
  recruiterEmail: 'careers@zohocorp.com',
  location: 'Chennai, Tamil Nadu',
  salaryDetails: '₹6.5 LPA - ₹8.5 LPA (As per campus standards)',
  description:
    'We are hiring 2026 Computer Science and IT graduates for our backend engineering team. Required skills: Python, SQL, data structures, REST APIs, and Git. Selection process includes an online coding assessment followed by two technical interviews and an HR discussion. Candidates never pay any fee during our recruitment process.',
};

export const JobFraudDetection: React.FC = () => {
  const [form, setForm] = useState<JobAdInput>({
    jobTitle: '',
    companyName: '',
    recruiterEmail: '',
    location: '',
    salaryDetails: '',
    description: '',
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<JobAdAnalysisResult | null>(null);

  const handleLoadDemo = (preset: JobAdInput) => {
    setForm(preset);
    setDocFile(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.jobTitle.trim() || !form.companyName.trim()) {
      setError('Please provide both the Job Title and Company Name.');
      return;
    }
    if (!form.description.trim() && !docFile) {
      setError(
        'Please paste the job description or attach a job advertisement document (PDF, DOCX, or TXT).'
      );
      return;
    }

    setLoading(true);
    try {
      const analysis = await api.analyzeJobAd(form, docFile);
      setResult(analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze job advertisement.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskStyle = (classification: JobAdAnalysisResult['classification']) => {
    if (classification === 'Potentially Genuine') {
      return {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        bar: 'bg-emerald-600',
        Icon: ShieldCheck,
      };
    }
    if (classification === 'Suspicious') {
      return {
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        bar: 'bg-amber-500',
        Icon: AlertTriangle,
      };
    }
    return {
      border: 'border-red-200',
      bg: 'bg-red-50',
      text: 'text-red-800',
      bar: 'bg-red-600',
      Icon: ShieldAlert,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Module 1A: Fake Job Advertisement Detection
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Evaluate job descriptions, salary promises, and recruiter domains
            for recruitment fraud indicators.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleLoadDemo(DEMO_SCAM_INPUT)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Load Sample Ad: Scam Signals (DEMO)
          </button>
          <button
            type="button"
            onClick={() => handleLoadDemo(DEMO_GENUINE_INPUT)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Load Sample Ad: Standard Listing (DEMO)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h2 className="font-display text-base font-bold text-slate-900">
            Job Advertisement Details
          </h2>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="job-title"
                className="block text-xs font-semibold text-slate-700"
              >
                Job Title *
              </label>
              <input
                id="job-title"
                type="text"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="e.g., Junior Python Developer"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="company-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Company Name *
              </label>
              <input
                id="company-name"
                type="text"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                placeholder="e.g., Acme Technologies"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="recruiter-email"
                className="block text-xs font-semibold text-slate-700"
              >
                Recruiter Email
              </label>
              <input
                id="recruiter-email"
                type="email"
                value={form.recruiterEmail}
                onChange={(e) =>
                  setForm({ ...form, recruiterEmail: e.target.value })
                }
                placeholder="hr@company.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="job-location"
                className="block text-xs font-semibold text-slate-700"
              >
                Job Location
              </label>
              <input
                id="job-location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Bengaluru / Remote"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="salary-details"
              className="block text-xs font-semibold text-slate-700"
            >
              Salary Details
            </label>
            <input
              id="salary-details"
              type="text"
              value={form.salaryDetails}
              onChange={(e) =>
                setForm({ ...form, salaryDetails: e.target.value })
              }
              placeholder="e.g., ₹6 LPA or ₹50,000/month"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="job-description"
              className="block text-xs font-semibold text-slate-700"
            >
              Complete Job Description
            </label>
            <textarea
              id="job-description"
              rows={6}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Paste the complete job advertisement text, eligibility criteria, interview process, and onboarding instructions..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Upload Job Advertisement Document (Optional · PDF, DOCX, TXT)
            </label>
            <label className="mt-1 flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-sky-500 hover:bg-sky-50/40 transition-colors">
              <span className="flex items-center gap-2 truncate">
                <FileUp className="h-4 w-4 text-sky-600 shrink-0" />
                <span className="truncate">
                  {docFile
                    ? docFile.name
                    : 'Attach PDF, DOCX, or TXT offer flyer'}
                </span>
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              {docFile && (
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setDocFile(null);
                  }}
                  className="ml-2 text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B192C] px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analysing Advertisement with AI...</span>
              </>
            ) : (
              <span>Analyse Job Advertisement</span>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6">
          {!result ? (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center px-6">
              <ShieldCheck className="h-10 w-10 text-slate-300" />
              <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                Ready for Advertisement Screening
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Enter job posting details or load one of the DEMO presets on the
                top right, then click Analyse Job Advertisement to inspect risk
                signals.
              </p>
            </div>
          ) : (
            (() => {
              const style = getRiskStyle(result.classification);
              const StatusIcon = style.Icon;
              return (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        {result.analysisEngine}
                      </p>
                      <h2 className="mt-1 font-display text-lg font-bold text-slate-900">
                        {result.input.jobTitle}
                      </h2>
                      <p className="text-xs text-slate-600">
                        {result.input.companyName}
                        {result.input.location
                          ? ` · ${result.input.location}`
                          : ''}
                      </p>
                    </div>

                    <a
                      href={api.getDownloadReportUrl(result.id, 'txt')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Report</span>
                    </a>
                  </div>

                  {/* Classification & Risk Meter */}
                  <div
                    className={`rounded-xl border p-4 ${style.border} ${style.bg}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <StatusIcon className={`h-5 w-5 ${style.text}`} />
                        <span className={`font-display font-bold ${style.text}`}>
                          {result.classification}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-2xl font-bold tabular-nums ${style.text}`}
                      >
                        {result.fraudRiskPercentage}% Risk
                      </span>
                    </div>

                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/80">
                      <div
                        className={`h-full transition-all ${style.bar}`}
                        style={{ width: `${result.fraudRiskPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Domain Check */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500">
                      Recruiter Contact &amp; Domain Check
                    </h3>
                    <p className="mt-1 text-sm text-slate-800">
                      {result.domainConsistencyNote}
                    </p>
                  </div>

                  {/* Reasons */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500">
                      Reasons for Risk Estimate
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {result.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-xs text-slate-400 mt-0.5">
                            {idx + 1}.
                          </span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suspicious Phrases */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500">
                      Detected Suspicious Keywords &amp; Phrases
                    </h3>
                    {result.suspiciousKeywords.length === 0 ? (
                      <p className="mt-1.5 text-sm text-slate-600">
                        No explicit scam phrases flagged in the submitted text.
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.suspiciousKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Safety Recommendations */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500">
                      Safety Recommendations
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                      {result.safetyRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="border-t border-slate-100 pt-4 text-xs text-slate-500">
                    {result.disclaimer}
                  </p>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};
