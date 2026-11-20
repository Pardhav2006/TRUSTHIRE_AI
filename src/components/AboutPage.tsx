import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import type { AppRoute, UserAccount } from '../types/trusthire';
import { BrandLogo } from './BrandLogo';

interface AboutPageProps {
  embedded?: boolean;
  currentUser: UserAccount | null;
  onNavigate: (route: AppRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  embedded = false,
  currentUser,
  onNavigate,
}) => {
  const content = (
    <div className="space-y-10">
      {/* Header Hero */}
      <div className="grid grid-cols-1 items-stretch gap-8 rounded-xl border border-slate-200 bg-white p-6 lg:grid-cols-12 lg:p-8">
        <div className="flex flex-col justify-center lg:col-span-6">
          <p className="text-xs font-semibold text-sky-700">
            Final-Year Engineering Capstone Project
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
            TrustHire AI: AI-Based Job Fraud Detection and Career Recommendation
            System
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            <strong className="text-slate-900">Problem Statement:</strong>{' '}
            Students and job seekers face increasing difficulties identifying
            fraudulent job advertisements and fake recruitment calls. They also
            struggle to identify suitable employment opportunities that match
            their skills and qualifications.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('job-fraud')}
              className="rounded-lg bg-[#0B192C] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Open Fraud Detection
            </button>
            <button
              type="button"
              onClick={() => onNavigate('resume-analysis')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Open Resume Analysis
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <img
            src="/src/assets/images/about_engineering_lab_1794901218375.jpg"
            alt="Engineering research workspace for TrustHire AI capstone"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover min-h-[240px]"
          />
        </div>
      </div>

      {/* 7 Project Objectives */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Project Objectives
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            '01. Detect fraudulent job advertisements using NLP and risk classification.',
            '02. Identify suspicious recruitment calls containing fee demands or coercion.',
            '03. Convert recruitment call recordings (MP3, WAV, M4A) into text transcripts.',
            '04. Highlight suspicious statements in call transcripts with clear explanations.',
            '05. Analyse uploaded PDF and DOCX resumes and extract candidate skills.',
            '06. Recommend relevant jobs and internships via TF-IDF and Cosine Similarity.',
            '07. Help students and graduates make safer, evidence-backed career decisions.',
          ].map((obj) => (
            <div
              key={obj}
              className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Datasets & Target ML Architecture */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-sky-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Benchmark Datasets &amp; Model Design
            </h2>
          </div>
          <div className="space-y-4 text-sm">
            {[
              {
                name: 'EMSCAD — Employment Scam Aegean Dataset',
                desc: 'Used for training and evaluating fake vs. legitimate job advertisement classification using TF-IDF vectorization and Random Forest.',
              },
              {
                name: 'ICFD-31k — Indian Conversational Fraud Dataset',
                desc: 'Provides conversational fraud patterns supplemented with manually labelled recruitment-specific scam call transcripts.',
              },
              {
                name: 'Resume Dataset',
                desc: 'Supports resume parsing, named entity recognition, and technical skill extraction experiments across CS, AI, and core engineering.',
              },
              {
                name: 'Job Postings Dataset',
                desc: 'Benchmarks TF-IDF + Cosine Similarity matching scores between extracted candidate skill sets and role descriptions.',
              },
            ].map((ds) => (
              <div
                key={ds.name}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <p className="font-semibold text-slate-900">{ds.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {ds.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Decoupled Backend &amp; Django App Architecture
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            The frontend communicates exclusively over clean REST API routes,
            allowing seamless transition from the live Node/Express AI preview
            server to the target Python Django + MySQL architecture:
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            {[
              {
                app: 'accounts',
                desc: 'User registration, login, password reset, and session profiles.',
              },
              {
                app: 'dashboard',
                desc: 'Aggregated statistics, recent analysis history, and Chart.js metrics.',
              },
              {
                app: 'fraud_detection',
                desc: 'Job ad analysis (EMSCAD / Random Forest) and Whisper call transcription.',
              },
              {
                app: 'resume_analysis',
                desc: 'PyMuPDF and python-docx parsing, spaCy/NLTK skill extraction.',
              },
              {
                app: 'job_recommendation',
                desc: 'Scikit-learn TF-IDF Vectorizer and Cosine Similarity ranking engine.',
              },
            ].map((mod) => (
              <div
                key={mod.app}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5"
              >
                <p className="font-mono font-semibold text-sky-800">
                  {mod.app}/
                </p>
                <p className="mt-1 text-slate-600">{mod.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-xs leading-relaxed text-sky-900">
            <div className="flex items-center gap-2 font-semibold">
              <Cpu className="h-4 w-4 text-sky-700" />
              <span>Responsible AI &amp; Verification Notice</span>
            </div>
            <p className="mt-1.5">
              All fraud percentages and classifications are probabilistic risk
              estimates designed to help candidates spot red flags. TrustHire AI
              never declares an employer legally fraudulent on model score alone
              and recommends independent verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-left"
          >
            <BrandLogo variant="dark" />
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate(currentUser ? 'dashboard' : 'auth')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              <span>{currentUser ? 'Open Dashboard' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{content}</main>
    </div>
  );
};
