import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  AudioLines,
  Briefcase,
  FileSearch,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import type { AppRoute, DashboardSummary } from '../types/trusthire';
import { ChartCanvas } from './ChartCanvas';

interface DashboardHomeProps {
  onNavigate: (route: AppRoute) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api
      .getDashboardSummary()
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .catch((err) => {
        if (mounted)
          setError(
            err instanceof Error ? err.message : 'Failed to load dashboard.'
          );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const fraudSummaryChartConfig = useMemo(() => {
    const rb = summary?.riskBreakdown ?? {
      genuine: 0,
      suspicious: 0,
      fraudulent: 0,
    };
    return {
      type: 'doughnut' as const,
      data: {
        labels: [
          'Potentially Genuine / Low Risk',
          'Suspicious',
          'Potentially Fraudulent / High Risk',
        ],
        datasets: [
          {
            data: [rb.genuine, rb.suspicious, rb.fraudulent],
            backgroundColor: ['#16A34A', '#D97706', '#DC2626'],
            borderColor: '#FFFFFF',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              boxWidth: 12,
              padding: 16,
              color: '#334155',
              font: { size: 12 },
            },
          },
        },
      },
    };
  }, [summary]);

  const moduleActivityChartConfig = useMemo(() => {
    const stats = summary?.stats;
    return {
      type: 'bar' as const,
      data: {
        labels: [
          'Job Ads Analysed',
          'Calls Analysed',
          'Resumes Analysed',
          'Matched Roles',
        ],
        datasets: [
          {
            label: 'Workspace Count',
            data: [
              stats?.jobAdsAnalyzed ?? 0,
              stats?.callsAnalyzed ?? 0,
              stats?.resumesAnalyzed ?? 0,
              stats?.recommendedJobsCount ?? 0,
            ],
            backgroundColor: ['#0B192C', '#0284C7', '#0EA5E9', '#38BDF8'],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: '#64748B' },
            grid: { color: '#F1F5F9' },
          },
          x: {
            ticks: { color: '#475569', font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    };
  }, [summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-600 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
        <span>Loading TrustHire AI workspace metrics...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Unable to load dashboard summary.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner + Quick Access */}
      <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome to TrustHire AI
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Screen job advertisements and recruitment call recordings for fraud
            indicators, or extract resume skills for TF-IDF job matching.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('job-fraud')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <ShieldAlert className="h-4 w-4 text-sky-400" />
            <span>Detect Job Fraud</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('call-fraud')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <AudioLines className="h-4 w-4 text-sky-600" />
            <span>Analyse Call</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('resume-analysis')}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-100 transition-colors whitespace-nowrap"
          >
            <FileSearch className="h-4 w-4 text-sky-700" />
            <span>Analyse Resume</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Job Advertisements Analysed',
            value: summary.stats.jobAdsAnalyzed,
            sub: 'Module 1A · Text & Doc Screening',
            route: 'job-fraud' as AppRoute,
          },
          {
            label: 'Recruitment Calls Analysed',
            value: summary.stats.callsAnalyzed,
            sub: 'Module 1B · Speech & NLP',
            route: 'call-fraud' as AppRoute,
          },
          {
            label: 'Resumes Analysed',
            value: summary.stats.resumesAnalyzed,
            sub: 'Module 2A · Skill Extraction',
            route: 'resume-analysis' as AppRoute,
          },
          {
            label: 'Recommended Jobs',
            value: summary.stats.recommendedJobsCount,
            sub: 'Module 2B · TF-IDF >= 40% Fit',
            route: 'job-recommendations' as AppRoute,
          },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onNavigate(card.route)}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-sky-300 transition-colors"
          >
            <p className="text-xs font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-sky-700">{card.sub}</p>
          </button>
        ))}
      </div>

      {/* Charts Row (Chart.js) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Fraud Detection Summary
              </h2>
              <p className="text-xs text-slate-500">
                Distribution of analysed job ads and calls across risk tiers
              </p>
            </div>
          </div>
          <ChartCanvas
            config={fraudSummaryChartConfig}
            heightClass="h-64"
            ariaLabel="Fraud detection risk breakdown doughnut chart"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Module Activity Overview
              </h2>
              <p className="text-xs text-slate-500">
                Evaluations completed across fraud and career modules
              </p>
            </div>
          </div>
          <ChartCanvas
            config={moduleActivityChartConfig}
            heightClass="h-64"
            ariaLabel="Module activity bar chart"
          />
        </div>
      </div>

      {/* Bottom Grid: Recent History + Resume & Job Recommendations Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Analysis History */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Recent Analysis History
              </h2>
              <p className="text-xs text-slate-500">
                Includes clearly marked DEMO baseline samples and your live runs
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap"
            >
              View All →
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="pb-2.5 font-medium">Type</th>
                  <th className="pb-2.5 font-medium">Subject</th>
                  <th className="pb-2.5 font-medium text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recentHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 pr-3 text-xs text-slate-600 whitespace-nowrap">
                      {item.type}
                      {item.isDemo && (
                        <span className="ml-1.5 font-mono text-[11px] font-semibold text-sky-700">
                          [DEMO]
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-slate-900 truncate max-w-[240px]">
                        {item.subject}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[240px]">
                        {item.resultSummary}
                      </p>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        {item.riskOrScoreLabel}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {item.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resume Summary + Recommended Jobs Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">
                Resume Analysis Summary
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('resume-analysis')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                Update Resume
              </button>
            </div>

            {summary.latestResume ? (
              <div className="mt-4">
                <p className="text-xs text-slate-500">
                  {summary.latestResume.fileName}
                  {summary.latestResume.isDemo ? ' · DEMO Sample' : ''}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Resume Completeness
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {summary.latestResume.completenessScore}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-sky-600 transition-all"
                    style={{
                      width: `${summary.latestResume.completenessScore}%`,
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {summary.latestResume.profile.technicalSkills
                    .slice(0, 7)
                    .map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Upload a PDF or DOCX resume to extract skills and compute job
                matches.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-sky-600" />
                <h2 className="font-display text-base font-bold text-slate-900">
                  Recommended Jobs Preview
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('job-recommendations')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                Explore All →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {summary.topRecommendations.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-2.5 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {job.jobType} · {job.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('job-recommendations')}
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-sky-700 hover:text-sky-900 shrink-0 tabular-nums"
                  >
                    <span>{job.matchPercentage}% Match</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
