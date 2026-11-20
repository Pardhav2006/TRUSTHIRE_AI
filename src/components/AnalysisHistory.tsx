import React, { useEffect, useState } from 'react';
import { Download, Eye, Loader2, Search, X } from 'lucide-react';
import { api } from '../services/api';
import type {
  CallAnalysisResult,
  HistoryRecord,
  JobAdAnalysisResult,
  ResumeAnalysisResult,
} from '../types/trusthire';

export const AnalysisHistory: React.FC = () => {
  const [items, setItems] = useState<HistoryRecord[]>([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDetail, setSelectedDetail] = useState<
    JobAdAnalysisResult | CallAnalysisResult | ResumeAnalysisResult | null
  >(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadHistory = async (type: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getHistory(type);
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load analysis history.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(typeFilter);
  }, [typeFilter]);

  const handleViewReport = async (detailRefId: string) => {
    setLoadingDetail(true);
    try {
      const res = await api.getReportDetail(detailRefId);
      setSelectedDetail(res.detail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not fetch report details.'
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.subject.toLowerCase().includes(q) ||
      item.resultSummary.toLowerCase().includes(q) ||
      item.classification.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Analysis History &amp; Reports
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review previous job advertisement screenings, recruitment call
          analyses, and resume evaluations.
        </p>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
          {[
            'All',
            'Job Advertisement',
            'Recruitment Call',
            'Resume Analysis',
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTypeFilter(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                typeFilter === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-sky-600 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* History Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-600 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            <span>Loading history records...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No matching analysis records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date &amp; Time</th>
                  <th className="px-5 py-3 font-semibold">Analysis Type</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Result</th>
                  <th className="px-5 py-3 font-semibold">Risk / Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap tabular-nums">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {row.type}
                      {row.isDemo && (
                        <span className="ml-1.5 font-mono text-[11px] font-semibold text-sky-700">
                          [DEMO]
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 max-w-[260px] truncate">
                        {row.subject}
                      </p>
                      <p className="text-xs text-slate-500 max-w-[260px] truncate">
                        {row.resultSummary}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                      {row.riskOrScoreLabel}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {row.classification}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewReport(row.detailRefId)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Report</span>
                        </button>
                        <a
                          href={api.getDownloadReportUrl(row.detailRefId, 'txt')}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>TXT</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {(selectedDetail || loadingDetail) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Analysis Report Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close report"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail || !selectedDetail ? (
              <div className="py-12 text-center text-sm text-slate-600">
                Loading report...
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <p className="text-xs text-slate-500">
                  Report ID: {selectedDetail.id} ·{' '}
                  {selectedDetail.isDemo ? '[DEMO SAMPLE]' : selectedDetail.analysisEngine}
                </p>

                {'fraudRiskPercentage' in selectedDetail && (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {selectedDetail.input.jobTitle} —{' '}
                        {selectedDetail.input.companyName}
                      </p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                        {selectedDetail.fraudRiskPercentage}% Risk ·{' '}
                        {selectedDetail.classification}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Reasons
                      </p>
                      <ul className="mt-1 list-disc pl-5 space-y-1">
                        {selectedDetail.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {'callRiskPercentage' in selectedDetail && (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {selectedDetail.fileName} ({selectedDetail.fileFormat})
                      </p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                        Call Risk: {selectedDetail.callRiskPercentage}% ·{' '}
                        {selectedDetail.riskCategory}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Transcript
                      </p>
                      <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed">
                        {selectedDetail.transcript}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Detected Warning Signs
                      </p>
                      <ul className="mt-1 space-y-2">
                        {selectedDetail.suspiciousStatements.map((s) => (
                          <li
                            key={s.id}
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs"
                          >
                            <span className="font-semibold text-red-900">
                              {s.category}:
                            </span>{' '}
                            &ldquo;{s.sentence}&rdquo; — {s.explanation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {'completenessScore' in selectedDetail && (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {selectedDetail.profile.candidateName} —{' '}
                        {selectedDetail.fileName}
                      </p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                        Completeness: {selectedDetail.completenessScore}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Technical Skills
                      </p>
                      <p className="mt-1 text-xs">
                        {selectedDetail.profile.technicalSkills.join(', ')}
                      </p>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <a
                    href={api.getDownloadReportUrl(selectedDetail.id, 'txt')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Full Report</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
