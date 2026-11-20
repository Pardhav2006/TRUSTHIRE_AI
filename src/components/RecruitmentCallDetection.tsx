import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  AudioLines,
  CheckCircle2,
  Download,
  FileAudio,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { api } from '../services/api';
import type { CallAnalysisResult, SuspiciousStatement } from '../types/trusthire';

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function base64ToWavFile(base64: string, fileName: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/wav' });
  return new File([blob], fileName, { type: 'audio/wav' });
}

interface HighlightedSegment {
  text: string;
  statement?: SuspiciousStatement;
}

function splitTranscriptBySuspiciousSentences(
  transcript: string,
  statements: SuspiciousStatement[]
): HighlightedSegment[] {
  if (!transcript || statements.length === 0) {
    return [{ text: transcript }];
  }

  let segments: HighlightedSegment[] = [{ text: transcript }];

  for (const stmt of statements) {
    const target = stmt.sentence.trim();
    if (!target || target.length < 4) continue;

    const nextSegments: HighlightedSegment[] = [];
    for (const seg of segments) {
      if (seg.statement) {
        nextSegments.push(seg);
        continue;
      }
      const lowerText = seg.text.toLowerCase();
      const lowerTarget = target.toLowerCase();
      const idx = lowerText.indexOf(lowerTarget);
      if (idx === -1) {
        nextSegments.push(seg);
        continue;
      }
      if (idx > 0) {
        nextSegments.push({ text: seg.text.slice(0, idx) });
      }
      nextSegments.push({
        text: seg.text.slice(idx, idx + target.length),
        statement: stmt,
      });
      const after = seg.text.slice(idx + target.length);
      if (after) {
        nextSegments.push({ text: after });
      }
    }
    segments = nextSegments;
  }

  return segments;
}

export const RecruitmentCallDetection: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [languageHint, setLanguageHint] = useState<string>(
    'Auto-Detect (English / Tamil / Hindi / Mixed)'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDemoAudio, setLoadingDemoAudio] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<CallAnalysisResult | null>(null);
  const [activeStatementId, setActiveStatementId] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptAudioFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['mp3', 'wav', 'm4a', 'webm', 'ogg'].includes(ext)) {
      setError('Unsupported file format. Upload MP3, WAV, or M4A audio.');
      return;
    }
    setError('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setDurationSeconds(0);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptAudioFile(file);
  };

  const handleAnalyzeCall = async () => {
    if (!audioFile) {
      setError('Please upload a recorded recruitment call (MP3, WAV, or M4A).');
      return;
    }
    setError('');
    setLoading(true);
    setLoadingStage('Uploading audio and transcribing speech...');

    const stageTimer = window.setTimeout(() => {
      setLoadingStage(
        'Running NLP fraud detection and suspicious sentence highlighting...'
      );
    }, 1800);

    try {
      const analysis = await api.analyzeCallAudio(
        audioFile,
        durationSeconds,
        languageHint
      );
      setResult(analysis);
      setActiveStatementId(analysis.suspiciousStatements[0]?.id ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze recruitment call recording.'
      );
    } finally {
      window.clearTimeout(stageTimer);
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleGenerateSampleAudio = async () => {
    setError('');
    setLoadingDemoAudio(true);
    try {
      const data = await api.generateDemoScamAudio();
      const wavFile = base64ToWavFile(data.base64Audio, data.fileName);
      acceptAudioFile(wavFile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not generate sample audio clip.'
      );
    } finally {
      setLoadingDemoAudio(false);
    }
  };

  const handleViewReferenceDemo = async () => {
    setError('');
    try {
      const samples = await api.getDemoSamples();
      setResult(samples.callAnalysis);
      setActiveStatementId(
        samples.callAnalysis.suspiciousStatements[0]?.id ?? null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load demo sample.'
      );
    }
  };

  const transcriptSegments = useMemo(() => {
    if (!result) return [];
    return splitTranscriptBySuspiciousSentences(
      result.transcript,
      result.suspiciousStatements
    );
  }, [result]);

  const getRiskBanner = (category: CallAnalysisResult['riskCategory']) => {
    if (category === 'Low Risk') {
      return {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        bar: 'bg-emerald-600',
        Icon: ShieldCheck,
      };
    }
    if (category === 'Suspicious') {
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
            Module 1B: Fake Recruitment Call Detection
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload call recordings (MP3, WAV, M4A) for English, Tamil, and Hindi
            speech transcription and suspicious statement detection.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGenerateSampleAudio}
            disabled={loadingDemoAudio}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-60"
          >
            {loadingDemoAudio && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Generate Sample Scam Audio (.wav) [DEMO]</span>
          </button>
          <button
            type="button"
            onClick={handleViewReferenceDemo}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Reference Result (DEMO)
          </button>
        </div>
      </div>

      {/* Upload & Player Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? 'border-sky-500 bg-sky-50/70'
              : 'border-slate-300 bg-slate-50/60 hover:border-sky-400'
          }`}
        >
          <Upload className="mx-auto h-9 w-9 text-sky-600" />
          <p className="mt-3 font-display text-base font-semibold text-slate-900">
            Drag and drop a recruitment call recording here
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supported formats: MP3, WAV, M4A · Supports English, Tamil, Hindi &amp;
            mixed-language speech
          </p>
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.webm,.ogg,audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) acceptAudioFile(file);
              }}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              Browse Audio File
            </button>
          </div>
        </div>

        {audioFile && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B192C] text-sky-400">
                  <FileAudio className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {audioFile.name}
                  </p>
                  <p className="font-mono text-xs text-slate-500 tabular-nums">
                    {(audioFile.size / 1024).toFixed(1)} KB · Duration:{' '}
                    {durationSeconds > 0
                      ? formatDuration(durationSeconds)
                      : 'Loading...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600">
                  Language:
                </label>
                <select
                  value={languageHint}
                  onChange={(e) => setLanguageHint(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-sky-600 focus:outline-none"
                >
                  <option>Auto-Detect (English / Tamil / Hindi / Mixed)</option>
                  <option>English</option>
                  <option>Tamil</option>
                  <option>Hindi</option>
                  <option>Tamil + English (Tanglish)</option>
                  <option>Hindi + English (Hinglish)</option>
                </select>
              </div>
            </div>

            <audio
              controls
              src={audioUrl}
              onLoadedMetadata={(e) =>
                setDurationSeconds(Math.round(e.currentTarget.duration || 0))
              }
              className="w-full"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Play the recording above or click Analyse Call to transcribe and
                screen for warning signs.
              </span>
              <button
                type="button"
                onClick={handleAnalyzeCall}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{loadingStage || 'Analysing Call...'}</span>
                  </>
                ) : (
                  <>
                    <AudioLines className="h-4 w-4 text-sky-400" />
                    <span>Analyse Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Result Section */}
      {result && (
        <div className="space-y-6">
          {result.isDemo && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900">
              <span className="font-mono font-bold mr-2">[DEMO]</span>
              This is a demonstration example illustrating the expected call
              fraud analysis interface, not a prediction from a live audio
              upload.
            </div>
          )}

          {(() => {
            const banner = getRiskBanner(result.riskCategory);
            const StatusIcon = banner.Icon;
            return (
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      {result.analysisEngine} · {result.fileName} (
                      {result.fileFormat})
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
                      Recruitment Call Fraud Analysis Report
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                      Languages: {result.detectedLanguages.join(', ')} ·
                      Duration: {formatDuration(result.durationSeconds)} ·
                      Suspicious Statements: {result.suspiciousStatementsCount}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={api.getDownloadReportUrl(result.id, 'txt')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Report (.TXT)</span>
                    </a>
                    <a
                      href={api.getDownloadReportUrl(result.id, 'json')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <span>JSON</span>
                    </a>
                  </div>
                </div>

                {/* Top Risk Meter */}
                <div
                  className={`rounded-xl border p-4 ${banner.border} ${banner.bg}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <StatusIcon className={`h-5 w-5 ${banner.text}`} />
                      <span className={`font-display text-lg font-bold ${banner.text}`}>
                        Classification: {result.riskCategory}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-2xl font-bold tabular-nums ${banner.text}`}
                    >
                      Call Risk: {result.callRiskPercentage}%
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full transition-all ${banner.bar}`}
                      style={{ width: `${result.callRiskPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Transcript + Suspicious Sentence Highlighting */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Call Transcript with Suspicious Sentence Highlighting
                      </h3>
                      <span className="text-xs text-slate-500">
                        Click a highlighted segment to inspect
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800">
                      {transcriptSegments.map((seg, idx) =>
                        seg.statement ? (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setActiveStatementId(seg.statement!.id)
                            }
                            className={`mx-0.5 inline rounded px-1.5 py-0.5 text-left font-medium transition-colors ${
                              activeStatementId === seg.statement.id
                                ? 'bg-red-200 text-red-950 ring-2 ring-red-500'
                                : 'bg-red-100 text-red-900 hover:bg-red-200'
                            }`}
                          >
                            {seg.text}
                          </button>
                        ) : (
                          <span key={idx}>{seg.text}</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Warning Explanations */}
                  <div className="lg:col-span-5 space-y-3">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Detected Warning Signs ({result.suspiciousStatementsCount})
                    </h3>

                    {result.suspiciousStatements.length === 0 ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        No explicit fee demands, OTP requests, or coercion
                        phrases were flagged in this transcript.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.suspiciousStatements.map((stmt, idx) => {
                          const isActive = activeStatementId === stmt.id;
                          return (
                            <button
                              key={stmt.id}
                              type="button"
                              onClick={() => setActiveStatementId(stmt.id)}
                              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                                isActive
                                  ? 'border-red-300 bg-red-50/80'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-semibold text-red-800">
                                  {idx + 1}. {stmt.category}
                                </span>
                                <span className="font-mono font-semibold text-slate-600">
                                  {stmt.severity} Severity
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs italic text-slate-800">
                                &ldquo;{stmt.sentence}&rdquo;
                              </p>
                              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                                {stmt.explanation}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Safety Actions */}
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Recommended Safety Actions
                  </h3>
                  <ul className="mt-2.5 space-y-1.5 text-sm text-slate-700">
                    {result.safetyActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-slate-500">
                    {result.disclaimer}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
