import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  FileSearch,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Upload,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import type { ResumeAnalysisResult } from '../types/trusthire';
import { ChartCanvas } from './ChartCanvas';

interface ResumeAnalysisProps {
  onViewRecommendations: (skills: string[]) => void;
}

const DEMO_RESUME_TEXT = `RAHUL SUBRAMANIAN
Email: rahul.subramanian@example.edu | Phone: +91 98765 43210
College: Velammal Institute of Engineering & Technology
Degree: B.Tech in Electronics and Computer Engineering (2022 - 2026), CGPA: 8.6/10

TECHNICAL SKILLS
Programming Languages: Python, C, C++, Java, SQL, Verilog
Web & Databases: HTML, CSS, JavaScript, MySQL
AI & Engineering: Machine Learning, Artificial Intelligence, Data Science, Embedded Systems, VLSI, FPGA

PROJECTS
1. Smart Recruitment Fraud Classifier (Python, Scikit-learn, NLP)
Built a TF-IDF and Random Forest classification prototype to detect suspicious job text patterns.
2. FPGA Signal Filtering Core (Verilog, FPGA, Embedded Systems)
Designed and simulated a low-latency digital filter pipeline on Xilinx FPGA hardware.

INTERNSHIPS
Embedded Software Intern — CoreTech Automation (June 2025 - August 2025)
Developed C/C++ sensor interface drivers and automated Python test scripts.

CERTIFICATIONS
- Python for Data Science and Machine Learning
- Digital VLSI Design Verification`;

export const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({
  onViewRecommendations,
}) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Unsupported resume format. Please upload a PDF or DOCX file.');
      return;
    }
    setError('');
    setResumeFile(file);
  };

  const handleAnalyze = async () => {
    if (!resumeFile && !pastedText.trim()) {
      setError(
        'Please upload a PDF or DOCX resume file (or load the sample resume).'
      );
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.analyzeResume(resumeFile, pastedText);
      setResult(res.analysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to analyse resume.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoResult = async () => {
    setError('');
    try {
      const samples = await api.getDemoSamples();
      setResult(samples.resumeAnalysis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load demo resume.'
      );
    }
  };

  const handleFillSampleText = () => {
    setResumeFile(null);
    setPastedText(DEMO_RESUME_TEXT);
    setError('');
  };

  const skillChartConfig = useMemo(() => {
    const scores = result?.skillCategoryScores ?? {
      programming: 0,
      webAndDatabase: 0,
      aiAndDataScience: 0,
      coreEngineeringAndHardware: 0,
    };
    return {
      type: 'bar' as const,
      data: {
        labels: [
          'Programming',
          'Web & SQL',
          'AI & Data Science',
          'Embedded & VLSI',
        ],
        datasets: [
          {
            label: 'Skill Coverage %',
            data: [
              scores.programming,
              scores.webAndDatabase,
              scores.aiAndDataScience,
              scores.coreEngineeringAndHardware,
            ],
            backgroundColor: ['#0B192C', '#0284C7', '#0EA5E9', '#38BDF8'],
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: { color: '#64748B' },
            grid: { color: '#F1F5F9' },
          },
          y: {
            ticks: { color: '#334155', font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    };
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Module 2A: AI-Based Resume Analysis &amp; Extraction
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload a PDF or DOCX resume to extract skills, qualifications, and
            projects, and identify skill gaps.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleFillSampleText}
            className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100"
          >
            Load Sample Resume Text (DEMO)
          </button>
          <button
            type="button"
            onClick={handleLoadDemoResult}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Reference Output (DEMO)
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) acceptFile(file);
            }}
            className={`lg:col-span-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-sky-500 bg-sky-50/70'
                : 'border-slate-300 bg-slate-50/60 hover:border-sky-400'
            }`}
          >
            <Upload className="h-9 w-9 text-sky-600" />
            <p className="mt-3 font-display text-base font-semibold text-slate-900">
              Drag and drop your resume (PDF or DOCX)
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports multi-page PDF and Word DOCX documents
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) acceptFile(f);
              }}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              Browse Resume File
            </button>

            {resumeFile && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900">
                <FileText className="h-4 w-4 text-sky-700" />
                <span>{resumeFile.name}</span>
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  className="ml-2 font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <label
              htmlFor="resume-raw-text"
              className="text-xs font-semibold text-slate-700"
            >
              Or Paste Resume Content Directly
            </label>
            <textarea
              id="resume-raw-text"
              rows={7}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste resume text here if you prefer not to upload a PDF/DOCX file..."
              className="mt-1.5 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Extracting Skills &amp; Analysing Resume...</span>
              </>
            ) : (
              <>
                <FileSearch className="h-4 w-4 text-sky-400" />
                <span>Analyse Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Results */}
      {result && (
        <div className="space-y-6">
          {result.isDemo && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900">
              <span className="font-mono font-bold mr-2">[DEMO]</span>
              Displaying reference resume extraction output for demonstration.
              Upload a PDF or DOCX resume above to run live extraction.
            </div>
          )}

          {/* Header Summary & CTA to Job Matching */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-500">
                {result.analysisEngine} · {result.fileName}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
                {result.profile.candidateName}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {result.profile.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {result.profile.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  {result.profile.collegeOrUniversity}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onViewRecommendations([
                  ...result.profile.technicalSkills,
                  ...result.profile.programmingLanguages,
                ])
              }
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Match Jobs with These Skills</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Skills + Coverage Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Extracted Technical Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.profile.technicalSkills.length === 0 ? (
                    <span className="text-xs text-slate-500">
                      No technical skills explicitly identified.
                    </span>
                  ) : (
                    result.profile.technicalSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Programming Languages
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.profile.programmingLanguages.length === 0 ? (
                    <span className="text-xs text-slate-500">
                      None extracted.
                    </span>
                  ) : (
                    result.profile.programmingLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-800"
                      >
                        {lang}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Education &amp; Qualifications
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {result.profile.education.map((edu, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Resume Completeness
                  </h3>
                  <span className="font-mono text-xl font-bold text-sky-700 tabular-nums">
                    {result.completenessScore}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-sky-600"
                    style={{ width: `${result.completenessScore}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">
                  Technical Skill Coverage Breakdown
                </h4>
                <ChartCanvas
                  config={skillChartConfig}
                  heightClass="h-44"
                  ariaLabel="Resume technical skill coverage bar chart"
                />
              </div>
            </div>
          </div>

          {/* Projects, Internships, Certifications, Work Experience */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                Extracted Projects
              </h3>
              {result.profile.projects.length === 0 ? (
                <p className="text-sm text-slate-500">No projects listed.</p>
              ) : (
                <div className="space-y-4">
                  {result.profile.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <p className="font-display text-sm font-bold text-slate-900">
                        {proj.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {proj.description}
                      </p>
                      {proj.technologies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {proj.technologies.map((t) => (
                            <span
                              key={t}
                              className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-sky-600" />
                  <span>Internship &amp; Work Experience</span>
                </h3>
                <ul className="mt-2.5 space-y-2 text-sm text-slate-700">
                  {[
                    ...result.profile.internshipExperience,
                    ...result.profile.workExperience,
                  ].length === 0 ? (
                    <li className="text-slate-500">
                      No internship or work experience entries detected.
                    </li>
                  ) : (
                    [
                      ...result.profile.internshipExperience,
                      ...result.profile.workExperience,
                    ].map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{exp}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-sky-600" />
                  <span>Certifications</span>
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-sm text-slate-700">
                  {result.profile.certifications.length === 0 ? (
                    <li className="text-slate-500">
                      No certifications listed.
                    </li>
                  ) : (
                    result.profile.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <span>{cert}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Missing Skills & Resume Improvement Suggestions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <h3 className="font-display text-base font-bold text-slate-900">
              Resume Evaluation &amp; Improvement Suggestions
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold text-slate-800">Skill Coverage</p>
                <p className="mt-1 leading-relaxed text-slate-600">
                  {result.skillCoverageSummary}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold text-slate-800">Education</p>
                <p className="mt-1 leading-relaxed text-slate-600">
                  {result.educationSummary}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold text-slate-800">Project Relevance</p>
                <p className="mt-1 leading-relaxed text-slate-600">
                  {result.projectRelevanceSummary}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <p className="font-semibold text-slate-800">Internships</p>
                <p className="mt-1 leading-relaxed text-slate-600">
                  {result.internshipSummary}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-slate-100 pt-5">
              <div>
                <h4 className="text-xs font-semibold text-slate-500">
                  Recommended Skills to Add
                </h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {result.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500">
                  Actionable Improvement Suggestions
                </h4>
                <ul className="mt-2.5 space-y-2 text-sm text-slate-700">
                  {result.improvementSuggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
