import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  Plus,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import type { JobRecommendation } from '../types/trusthire';

interface JobRecommendationsProps {
  initialSkills?: string[];
  onGoToResume: () => void;
}

export const JobRecommendations: React.FC<JobRecommendationsProps> = ({
  initialSkills,
  onGoToResume,
}) => {
  const [skills, setSkills] = useState<string[]>(initialSkills ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');

  const [recommendations, setRecommendations] = useState<JobRecommendation[]>(
    []
  );
  const [sourceResumeLabel, setSourceResumeLabel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async (activeSkills?: string[]) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getJobRecommendations({
        skills:
          activeSkills && activeSkills.length > 0 ? activeSkills : undefined,
        role: roleFilter || undefined,
        location: locationFilter || undefined,
        skill: skillFilter || undefined,
        jobType: jobTypeFilter,
        experienceLevel: experienceFilter,
      });
      setRecommendations(res.recommendations);
      if (!activeSkills || activeSkills.length === 0) {
        setSkills(res.candidateSkills);
      }
      if (res.sourceResume) {
        setSourceResumeLabel(
          `${res.sourceResume.candidateName} (${res.sourceResume.fileName}${
            res.sourceResume.isDemo ? ' · DEMO' : ''
          })`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to calculate job recommendations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(initialSkills);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobTypeFilter, experienceFilter]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newSkill.trim();
    if (!cleaned) return;
    if (skills.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
      setNewSkill('');
      return;
    }
    const updated = [...skills, cleaned];
    setSkills(updated);
    setNewSkill('');
    fetchRecommendations(updated);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    fetchRecommendations(updated);
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations(skills);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Module 2B: TF-IDF &amp; Cosine Similarity Job Recommendations
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ranks career tracks and internships by comparing your extracted
            skills against role requirements using TF-IDF vectorization.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToResume}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          Upload New Resume
        </button>
      </div>

      {/* Active Candidate Skill Profile */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Candidate Skill Vector
            </h2>
            <p className="text-xs text-slate-500">
              {sourceResumeLabel
                ? `Active profile: ${sourceResumeLabel}`
                : 'Add or remove technical skills below to recalculate TF-IDF match scores.'}
            </p>
          </div>
          <form onSubmit={handleAddSkill} className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g., Verilog, SQL)"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-sky-600 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-[#0B192C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-sky-700 hover:text-red-600"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <form
        onSubmit={handleApplyFilters}
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3">
          <Filter className="h-3.5 w-3.5 text-sky-600" />
          <span>Filter Recommendations</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            type="text"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder="Job role (e.g., Python)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none"
          />
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Location (e.g., Bengaluru)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none"
          />
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Required skill (e.g., SQL)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none"
          />
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-600 focus:outline-none"
          >
            <option value="All">All Job Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
          </select>
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-600 focus:outline-none"
          >
            <option value="All">All Experience Levels</option>
            <option value="Intern">Intern</option>
            <option value="Entry Level / Fresher">Entry Level / Fresher</option>
            <option value="1-3 Years">1-3 Years</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-[#0B192C] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Notice on verified official career portals */}
      <div className="rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-3 text-xs text-slate-700">
        <span className="font-mono font-semibold text-sky-800 mr-2">
          [SAMPLE CATALOG]
        </span>
        Role descriptions below are benchmark templates ranked live by TF-IDF +
        Cosine Similarity. &ldquo;Apply Now&rdquo; opens verified public career
        portals (LinkedIn Jobs Search, Python.org Jobs, or Internshala) rather
        than fabricated direct vacancy URLs.
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-600 gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
          <span>Computing TF-IDF &amp; Cosine Similarity scores...</span>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
          No job roles match your current filter criteria. Clear filters to view
          all ranked opportunities.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {recommendations.map((job) => (
            <div
              key={job.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 hover:border-sky-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      {job.jobType} · {job.experienceLevel} ·{' '}
                      {job.companyOrPortal}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                      {job.title}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xl font-bold text-sky-700 tabular-nums">
                      {job.matchPercentage}%
                    </span>
                    <span className="block text-[11px] font-medium text-slate-500">
                      TF-IDF Match
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-sky-600"
                    style={{ width: `${job.matchPercentage}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-600">{job.summary}</p>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">
                      Matching Skills:{' '}
                    </span>
                    {job.matchingSkills.length === 0 ? (
                      <span className="text-slate-500">None yet</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">
                        {job.matchingSkills.join(', ')}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Missing Skills:{' '}
                    </span>
                    {job.missingSkills.length === 0 ? (
                      <span className="text-emerald-700 font-medium">
                        All core skills covered
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium">
                        {job.missingSkills.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  <span>{job.portalLabel}</span>
                </span>
                <a
                  href={job.officialApplicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
