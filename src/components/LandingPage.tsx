import React, { useState } from 'react';
import {
  ArrowRight,
  AudioLines,
  Briefcase,
  CheckCircle2,
  Cpu,
  Database,
  FileSearch,
  Lock,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { AppRoute, AuthView, UserAccount } from '../types/trusthire';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
  currentUser: UserAccount | null;
  onNavigate: (route: AppRoute, authMode?: AuthView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');
  const [legalModal, setLegalModal] = useState<'privacy' | 'contact' | null>(
    null
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.includes('@') || contactMessage.trim().length < 10) {
      setContactError(
        'Enter a valid email address and a brief inquiry (at least 10 characters).'
      );
      return;
    }
    setContactError('');
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
          >
            <BrandLogo variant="dark" />
          </button>

          {/* Zone 2: Concise single-line nav links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#home"
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </button>
            <button
              type="button"
              onClick={() =>
                currentUser
                  ? onNavigate('dashboard')
                  : onNavigate('auth', 'login')
              }
              className="hover:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              {currentUser ? 'Dashboard' : 'Login'}
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                currentUser
                  ? onNavigate('dashboard')
                  : onNavigate('auth', 'register')
              }
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{currentUser ? 'Open Workspace' : 'Get Started'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5"
              >
                How It Works
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('about');
                }}
                className="py-1.5 text-left"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('auth', 'login');
                }}
                className="py-1.5 text-left"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(
                    currentUser ? 'dashboard' : 'auth',
                    currentUser ? undefined : 'register'
                  );
                }}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <span>{currentUser ? 'Open Workspace' : 'Get Started'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="bg-[#0B192C] text-white border-b border-slate-800"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-12 px-6 py-16 lg:grid-cols-12 lg:py-20">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-medium text-sky-300 mb-4">
              Final-Year Engineering Capstone · AI Recruitment Protection
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08] [text-wrap:balance]">
              Your Career Safety Starts Here
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Detect recruitment scams, analyse your resume and discover trusted
              career opportunities with Artificial Intelligence.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  onNavigate(currentUser ? 'dashboard' : 'auth', 'register')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explore Features</span>
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-800 pt-6 text-sm">
              <div>
                <p className="font-mono text-lg font-semibold text-sky-300 tabular-nums">
                  2 Modules
                </p>
                <p className="text-slate-400 mt-0.5">
                  Fraud Guard &amp; Career Match
                </p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-sky-300 tabular-nums">
                  3 Languages
                </p>
                <p className="text-slate-400 mt-0.5">
                  English, Tamil &amp; Hindi Calls
                </p>
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-sky-300 tabular-nums">
                  TF-IDF
                </p>
                <p className="text-slate-400 mt-0.5">
                  Cosine Similarity Ranking
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-stretch">
            <div className="relative w-full overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
              <img
                src="/src/assets/images/hero_career_security_1794901217732.jpg"
                alt="TrustHire AI shield protecting career resume and audio waveform analysis"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover min-h-[280px] lg:min-h-[420px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B192C]/95 via-[#0B192C]/55 to-transparent p-6">
                <p className="text-xs font-medium text-sky-300">
                  Integrated Verification Pipeline
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Real-time job posting risk scoring, multilingual speech call
                  transcription, and resume skill extraction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Main Module Cards */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-sky-700">
            Core Architecture
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl [text-wrap:balance]">
            Two Intelligent Modules Built for Student &amp; Graduate Protection
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Screen suspicious job postings and recruitment phone calls before
            sharing personal information, then map your verified skills to
            matching career roles.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Module 1 Card */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 transition-colors hover:border-sky-300">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-sky-700">
                  01. Fraud Protection Suite
                </span>
                <ShieldCheck className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
                AI-Based Job Fraud Detection
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                Evaluates written job descriptions and recorded recruiter phone
                calls for financial demands, false guarantees, and identity
                impersonation signals.
              </p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Fake job advertisement detection across title, salary,
                    recruiter email domain, and description text.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Fake recruitment call detection with MP3, WAV, and M4A
                    speech-to-text transcription.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Fraud risk percentage estimation with Potentially Genuine,
                    Suspicious, and Potentially Fraudulent tiers.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Inline suspicious statement highlighting with category and
                    severity explanations.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('job-fraud')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Analyse Job Ad</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('call-fraud')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <AudioLines className="h-4 w-4 text-sky-600" />
                <span>Analyse Call Audio</span>
              </button>
            </div>
          </div>

          {/* Module 2 Card */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 transition-colors hover:border-sky-300">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-sky-700">
                  02. Career Intelligence Suite
                </span>
                <Briefcase className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">
                AI-Based Resume Analysis &amp; Job Recommendation
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                Parses PDF and DOCX resumes to extract qualifications, technical
                skills, and project history, then ranks career opportunities via
                TF-IDF and Cosine Similarity.
              </p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Structured resume analysis covering contact profile,
                    academics, internships, certifications, and projects.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Automated skill extraction across Python, Java, C/C++, Web,
                    SQL, AI/ML, Embedded Systems, and VLSI.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Resume completeness scoring with targeted skill-gap and
                    improvement recommendations.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                  <span>
                    Job and internship recommendations ranked by match
                    percentage with role, location, and skill filters.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('resume-analysis')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <FileSearch className="h-4 w-4 text-sky-400" />
                <span>Analyse Resume</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('job-recommendations')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <span>View Job Matches</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-y border-slate-200 bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-sky-700">Workflow</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
              How TrustHire AI Works
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01. Submit Input',
                title: 'Paste Job Ad, Upload Audio or Resume',
                body: 'Provide suspicious job text, upload MP3/WAV/M4A recruiter calls, or attach your PDF/DOCX resume.',
              },
              {
                step: '02. Pre-Process & Transcribe',
                title: 'Speech-to-Text & Document Parsing',
                body: 'Audio recordings in English, Tamil, or Hindi are transcribed while PDF and DOCX documents are structurally parsed.',
              },
              {
                step: '03. NLP & ML Scoring',
                title: 'Risk Classification & TF-IDF Matching',
                body: 'AI classifiers flag payment demands and pressure tactics, while TF-IDF + Cosine Similarity scores role fit.',
              },
              {
                step: '04. Act Safely',
                title: 'Inspect Evidence & Download Reports',
                body: 'Review highlighted warning sentences, safety recommendations, skill gaps, and verified career portal links.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-6"
              >
                <p className="font-mono text-xs font-semibold text-sky-700">
                  {item.step}
                </p>
                <h3 className="mt-3 font-display text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits + Technologies Used */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold text-sky-700">Why TrustHire AI</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
              Key Benefits for Campus Placements &amp; Job Seekers
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Built to safeguard students entering the job market against
              financial fraud, credential harvesting, and mismatched role
              applications.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  icon: Lock,
                  title: 'Early Scam Interception',
                  desc: 'Flags registration fees, fake interview waivers, and OTP requests before candidates incur financial loss.',
                },
                {
                  icon: AudioLines,
                  title: 'Multilingual Call Inspection',
                  desc: 'Supports English, Tamil, and Hindi recruitment calls with sentence-level warning explanations.',
                },
                {
                  icon: FileSearch,
                  title: 'Objective Skill Alignment',
                  desc: 'Surfaces exact matching skills and missing prerequisites using transparent TF-IDF Cosine Similarity.',
                },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B192C] text-sky-400">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Technologies &amp; Target Engineering Stack
                </h3>
                <Cpu className="h-5 w-5 text-sky-600" />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Modular architecture separating the interactive web frontend
                from AI inference, NLP pipelines, and Django/MySQL backend
                endpoints.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    group: 'Frontend & Visualization',
                    items:
                      'React, TypeScript, Tailwind CSS / Bootstrap 5 layout parity, Chart.js',
                  },
                  {
                    group: 'Backend Target Architecture',
                    items:
                      'Express API (Live Preview) · Python Django + MySQL ready contracts',
                  },
                  {
                    group: 'Machine Learning & Ranking',
                    items:
                      'TF-IDF Vectorizer, Cosine Similarity, Random Forest (EMSCAD target)',
                  },
                  {
                    group: 'NLP & Speech Processing',
                    items:
                      'Gemini Speech & NLP Inference · OpenAI Whisper, spaCy & NLTK target pipeline',
                  },
                  {
                    group: 'Resume Document Parsing',
                    items:
                      'PDF multimodal extraction, Mammoth / python-docx & PyMuPDF support',
                  },
                  {
                    group: 'Benchmark Datasets',
                    items:
                      'EMSCAD Job Scams, ICFD-31k Call Corpus, Resume & Job Postings Datasets',
                  },
                ].map((tech) => (
                  <div
                    key={tech.group}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <p className="text-xs font-semibold text-sky-700">
                      {tech.group}
                    </p>
                    <p className="mt-1.5 text-sm text-slate-800">
                      {tech.items}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <Database className="h-4 w-4 text-slate-400" />
                  <span>
                    All AI risk estimates advise independent verification
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-sm font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap shrink-0"
                >
                  Read Full Architecture →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B192C] text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <BrandLogo variant="light" size="sm" />
            <p className="mt-2 text-sm text-slate-400">
              Your Career Safety Starts Here · Final-Year Engineering Capstone
              Project
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="hover:text-white transition-colors"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => {
                setContactSubmitted(false);
                setLegalModal('contact');
              }}
              className="hover:text-white transition-colors"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-slate-500">
              © 2026 TrustHire AI. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* Contact / Privacy Policy Modal */}
      {legalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold">
                {legalModal === 'privacy'
                  ? 'Privacy Policy & Data Handling'
                  : 'Contact Project Team'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {legalModal === 'privacy' ? (
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <p>
                  TrustHire AI processes submitted job advertisements, audio
                  recordings, and resumes strictly to generate fraud risk
                  estimates and skill-matching recommendations.
                </p>
                <p>
                  Uploaded files are processed via server-side API endpoints and
                  are never shared with third-party advertisers. Never upload
                  sensitive financial credentials (OTP, banking PINs, or
                  passwords) into any analysis field.
                </p>
                <p>
                  All classification results are probabilistic risk estimates
                  intended to assist user judgment and do not constitute legal
                  accusations.
                </p>
              </div>
            ) : contactSubmitted ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                Your inquiry has been recorded for the TrustHire AI capstone
                review team. Thank you for reaching out.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-4 space-y-4">
                {contactError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {contactError}
                  </p>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Questions about the TrustHire AI capstone project..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setLegalModal(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Send Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
