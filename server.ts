import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import mammoth from 'mammoth';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  analyzeJobAdWithAI,
  analyzeResumeWithAI,
  generateDemoScamAudioWav,
  transcribeAndAnalyzeCallWithAI,
} from './server/gemini';
import {
  DEMO_CALL_ANALYSIS,
  DEMO_JOB_AD,
  DEMO_RESUME_ANALYSIS,
  store,
} from './server/store';
import { recommendJobsWithTfIdf } from './server/tfidfMatcher';
import type {
  CallAnalysisResult,
  JobAdAnalysisResult,
  ResumeAnalysisResult,
  UserAccount,
} from './src/types/trusthire';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max for audio & documents
  },
});

function resolveAudioMimeType(fileName: string, originalMime?: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.mp3') return 'audio/mp3';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.ogg') return 'audio/ogg';
  if (ext === '.webm') return 'audio/webm';
  if (originalMime && originalMime.startsWith('audio/')) return originalMime;
  return 'audio/mp3';
}

function formatReportAsText(detail: JobAdAnalysisResult | CallAnalysisResult | ResumeAnalysisResult): string {
  const lines: string[] = [
    '============================================================',
    'TRUSTHIRE AI — ANALYSIS REPORT',
    '============================================================',
    `Report ID: ${detail.id}`,
    `Generated: ${detail.createdAt}`,
    `Mode: ${detail.isDemo ? 'DEMO SAMPLE RECORD' : detail.analysisEngine}`,
    '',
  ];

  if ('fraudRiskPercentage' in detail) {
    lines.push('MODULE: Fake Job Advertisement Detection');
    lines.push(`Job Title: ${detail.input.jobTitle}`);
    lines.push(`Company: ${detail.input.companyName}`);
    lines.push(`Recruiter Email: ${detail.input.recruiterEmail || 'Not provided'}`);
    lines.push(`Location: ${detail.input.location || 'Not provided'}`);
    lines.push(`Salary Details: ${detail.input.salaryDetails || 'Not provided'}`);
    lines.push(`Fraud Risk Estimate: ${detail.fraudRiskPercentage}%`);
    lines.push(`Classification: ${detail.classification}`);
    lines.push(`Email Domain Check: ${detail.domainConsistencyNote}`);
    lines.push('');
    lines.push('Reasons:');
    detail.reasons.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
    lines.push('');
    lines.push('Suspicious Keywords / Phrases:');
    if (detail.suspiciousKeywords.length === 0) {
      lines.push('  None detected.');
    } else {
      detail.suspiciousKeywords.forEach((k) => lines.push(`  - ${k}`));
    }
    lines.push('');
    lines.push('Safety Recommendations:');
    detail.safetyRecommendations.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
    lines.push('');
    lines.push(`Disclaimer: ${detail.disclaimer}`);
  } else if ('callRiskPercentage' in detail) {
    lines.push('MODULE: Fake Recruitment Call Detection');
    lines.push(`Audio File: ${detail.fileName} (${detail.fileFormat})`);
    lines.push(`Duration: ${detail.durationSeconds}s`);
    lines.push(`Languages: ${detail.detectedLanguages.join(', ')}`);
    lines.push(`Call Risk Estimate: ${detail.callRiskPercentage}%`);
    lines.push(`Risk Category: ${detail.riskCategory}`);
    lines.push(`Suspicious Statements Detected: ${detail.suspiciousStatementsCount}`);
    lines.push('');
    lines.push('Transcript:');
    lines.push(detail.transcript);
    lines.push('');
    lines.push('Detected Warning Signs:');
    if (detail.suspiciousStatements.length === 0) {
      lines.push('  None detected.');
    } else {
      detail.suspiciousStatements.forEach((s, i) => {
        lines.push(`  ${i + 1}. [${s.category} | ${s.severity}] "${s.sentence}"`);
        lines.push(`     Explanation: ${s.explanation}`);
      });
    }
    lines.push('');
    lines.push('Recommended Safety Actions:');
    detail.safetyActions.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
    lines.push('');
    lines.push(`Disclaimer: ${detail.disclaimer}`);
  } else {
    lines.push('MODULE: Resume Analysis & Profile Extraction');
    lines.push(`Resume File: ${detail.fileName} (${detail.fileType})`);
    lines.push(`Candidate: ${detail.profile.candidateName}`);
    lines.push(`Email: ${detail.profile.email} | Phone: ${detail.profile.phone}`);
    lines.push(`Institution: ${detail.profile.collegeOrUniversity}`);
    lines.push(`Completeness Score: ${detail.completenessScore}%`);
    lines.push('');
    lines.push(`Technical Skills: ${detail.profile.technicalSkills.join(', ')}`);
    lines.push(`Programming Languages: ${detail.profile.programmingLanguages.join(', ')}`);
    lines.push('');
    lines.push('Missing High-Demand Skills:');
    detail.missingSkills.forEach((s) => lines.push(`  - ${s}`));
    lines.push('');
    lines.push('Improvement Suggestions:');
    detail.improvementSuggestions.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
  }

  lines.push('============================================================');
  return lines.join('\n');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // --- Accounts API (Django-ready contract: /api/auth/*) ---
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, institution, targetRole } = req.body ?? {};
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    if (String(password).length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (store.users.has(normalizedEmail)) {
      res.status(409).json({ error: 'An account with this email already exists in the current session.' });
      return;
    }

    const userRecord = {
      id: `usr-${Date.now()}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: String(password),
      role: 'Job Seeker / Student',
      institution: institution ? String(institution).trim() : '',
      targetRole: targetRole ? String(targetRole).trim() : '',
      createdAt: new Date().toISOString(),
      authMode: 'session-preview' as const,
    };
    store.users.set(normalizedEmail, userRecord);

    const { passwordHash: _, ...publicUser } = userRecord;
    res.status(201).json({
      user: publicUser,
      message:
        'Session account created. Connect Django accounts + MySQL for persistent database authentication.',
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = store.users.get(normalizedEmail);
    if (!existing || existing.passwordHash !== String(password)) {
      res.status(401).json({
        error:
          'Invalid email or password. Use the demo evaluator credentials or register a session account.',
      });
      return;
    }
    const { passwordHash: _, ...publicUser } = existing;
    res.json({ user: publicUser });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body ?? {};
    if (!email || !String(email).includes('@')) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    res.json({
      message:
        'Password reset workflow validated (preview mode). Connect Django SMTP email backend to dispatch real reset tokens.',
    });
  });

  app.put('/api/auth/profile', (req, res) => {
    const { email, name, institution, targetRole, role } = req.body ?? {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existing = store.users.get(normalizedEmail);
    if (!existing) {
      const updatedUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: String(name || 'Candidate'),
        email: normalizedEmail || 'student@trusthire.edu',
        role: String(role || 'Student'),
        institution: String(institution || ''),
        targetRole: String(targetRole || ''),
        createdAt: new Date().toISOString(),
        authMode: 'session-preview',
      };
      res.json({ user: updatedUser });
      return;
    }
    existing.name = name ? String(name).trim() : existing.name;
    existing.institution =
      institution !== undefined ? String(institution).trim() : existing.institution;
    existing.targetRole =
      targetRole !== undefined ? String(targetRole).trim() : existing.targetRole;
    existing.role = role ? String(role).trim() : existing.role;
    const { passwordHash: _, ...publicUser } = existing;
    res.json({ user: publicUser });
  });

  // --- Dashboard API (Django-ready contract: /api/dashboard/*) ---
  app.get('/api/dashboard/summary', (_req, res) => {
    res.json(store.getDashboardSummary());
  });

  // --- Module 1A: Job Advertisement Fraud Detection ---
  app.post('/api/fraud/job-ad', upload.single('document'), async (req, res) => {
    try {
      const {
        jobTitle = '',
        companyName = '',
        recruiterEmail = '',
        location = '',
        salaryDetails = '',
        description = '',
      } = req.body ?? {};

      let extractedDocText = '';
      let pdfBase64: string | undefined;
      let documentName: string | undefined;

      if (req.file) {
        documentName = req.file.originalname;
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext === '.pdf') {
          pdfBase64 = req.file.buffer.toString('base64');
        } else if (ext === '.docx') {
          const docxResult = await mammoth.extractRawText({ buffer: req.file.buffer });
          extractedDocText = docxResult.value;
        } else if (ext === '.txt') {
          extractedDocText = req.file.buffer.toString('utf-8');
        } else {
          res.status(400).json({
            error: 'Unsupported job advertisement file format. Upload PDF, DOCX, or TXT.',
          });
          return;
        }
      }

      if (!String(jobTitle).trim() || !String(companyName).trim()) {
        res.status(400).json({
          error: 'Job title and company name are required.',
        });
        return;
      }

      if (!String(description).trim() && !extractedDocText && !pdfBase64) {
        res.status(400).json({
          error: 'Please paste a job description or upload a job advertisement document.',
        });
        return;
      }

      const aiResult = await analyzeJobAdWithAI(
        {
          jobTitle: String(jobTitle).trim(),
          companyName: String(companyName).trim(),
          recruiterEmail: String(recruiterEmail).trim(),
          location: String(location).trim(),
          salaryDetails: String(salaryDetails).trim(),
          description: String(description).trim(),
          documentName,
        },
        extractedDocText,
        pdfBase64
      );

      const saved: JobAdAnalysisResult = {
        ...aiResult,
        id: `job-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isDemo: false,
      };
      store.addJobAnalysis(saved);
      res.json(saved);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze job advertisement.';
      res.status(500).json({ error: message });
    }
  });

  // --- Module 1B: Recruitment Call Detection ---
  app.post('/api/fraud/call-audio', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'Please upload an audio recording (MP3, WAV, or M4A).',
        });
        return;
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const allowedExts = ['.mp3', '.wav', '.m4a', '.webm', '.ogg'];
      if (!allowedExts.includes(ext)) {
        res.status(400).json({
          error: 'Unsupported audio format. Please upload MP3, WAV, or M4A.',
        });
        return;
      }

      const mimeType = resolveAudioMimeType(req.file.originalname, req.file.mimetype);
      const durationSeconds = Math.max(
        1,
        Math.round(Number(req.body?.durationSeconds) || 0)
      );
      const languageHint = String(
        req.body?.languageHint || 'English, Tamil, or Hindi (auto-detect)'
      );

      const audioBase64 = req.file.buffer.toString('base64');
      const aiResult = await transcribeAndAnalyzeCallWithAI(
        audioBase64,
        mimeType,
        req.file.originalname,
        ext.replace('.', '').toUpperCase(),
        durationSeconds,
        languageHint
      );

      const saved: CallAnalysisResult = {
        ...aiResult,
        id: `call-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isDemo: false,
      };
      store.addCallAnalysis(saved);
      res.json(saved);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to transcribe and analyze call audio.';
      res.status(500).json({ error: message });
    }
  });

  // Synthesize a playable sample WAV clip via Gemini TTS so evaluators can test the real
  // audio player + live speech transcription + fraud detection pipeline end-to-end
  app.post('/api/fraud/demo-audio', async (_req, res) => {
    try {
      const base64Wav = await generateDemoScamAudioWav();
      res.json({
        fileName: 'sample_recruitment_call_demo.wav',
        mimeType: 'audio/wav',
        base64Audio: base64Wav,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate sample audio.';
      res.status(500).json({ error: message });
    }
  });

  // --- Module 2A: Resume Analysis ---
  app.post('/api/resume/analyze', upload.single('resume'), async (req, res) => {
    try {
      let fileName = 'Pasted_Resume.txt';
      let fileType = 'TXT';
      let rawText = typeof req.body?.rawText === 'string' ? req.body.rawText : '';
      let pdfBase64: string | undefined;

      if (req.file) {
        fileName = req.file.originalname;
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext === '.pdf') {
          fileType = 'PDF';
          pdfBase64 = req.file.buffer.toString('base64');
        } else if (ext === '.docx') {
          fileType = 'DOCX';
          const extracted = await mammoth.extractRawText({ buffer: req.file.buffer });
          rawText = extracted.value;
        } else if (ext === '.txt') {
          fileType = 'TXT';
          rawText = req.file.buffer.toString('utf-8');
        } else {
          res.status(400).json({
            error: 'Unsupported resume format. Please upload a PDF or DOCX file.',
          });
          return;
        }
      }

      if (!pdfBase64 && !rawText.trim()) {
        res.status(400).json({
          error: 'Please upload a PDF or DOCX resume file to analyze.',
        });
        return;
      }

      const aiResult = await analyzeResumeWithAI({
        fileName,
        fileType,
        rawText,
        pdfBase64,
      });

      const saved: ResumeAnalysisResult = {
        ...aiResult,
        id: `res-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isDemo: false,
      };
      store.addResumeAnalysis(saved);

      const candidateSkills = [
        ...saved.profile.technicalSkills,
        ...saved.profile.programmingLanguages,
      ];
      const recommendations = recommendJobsWithTfIdf(candidateSkills);

      res.json({
        analysis: saved,
        recommendations,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze resume.';
      res.status(500).json({ error: message });
    }
  });

  // --- Module 2B: Job Recommendation Engine (TF-IDF + Cosine Similarity) ---
  app.get('/api/jobs/recommend', (req, res) => {
    const skillsParam = typeof req.query.skills === 'string' ? req.query.skills : '';
    const latestResume = store.getLatestResume();

    const candidateSkills = skillsParam
      ? skillsParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : latestResume
      ? [
          ...latestResume.profile.technicalSkills,
          ...latestResume.profile.programmingLanguages,
        ]
      : ['Python', 'SQL', 'Machine Learning'];

    const recommendations = recommendJobsWithTfIdf(candidateSkills, {
      role: typeof req.query.role === 'string' ? req.query.role : undefined,
      location:
        typeof req.query.location === 'string' ? req.query.location : undefined,
      skill: typeof req.query.skill === 'string' ? req.query.skill : undefined,
      jobType:
        typeof req.query.jobType === 'string' ? req.query.jobType : undefined,
      experienceLevel:
        typeof req.query.experienceLevel === 'string'
          ? req.query.experienceLevel
          : undefined,
    });

    res.json({
      sourceResume: latestResume
        ? {
            id: latestResume.id,
            fileName: latestResume.fileName,
            candidateName: latestResume.profile.candidateName,
            isDemo: latestResume.isDemo,
          }
        : null,
      candidateSkills,
      recommendations,
    });
  });

  // --- Demo Reference Records ---
  app.get('/api/demo/samples', (_req, res) => {
    res.json({
      jobAd: DEMO_JOB_AD,
      callAnalysis: DEMO_CALL_ANALYSIS,
      resumeAnalysis: DEMO_RESUME_ANALYSIS,
    });
  });

  // --- History & Report Downloads ---
  app.get('/api/history', (req, res) => {
    const typeFilter = typeof req.query.type === 'string' ? req.query.type : 'All';
    const items =
      typeFilter === 'All'
        ? store.history
        : store.history.filter((h) => h.type === typeFilter);
    res.json({ items });
  });

  app.get('/api/history/:detailRefId', (req, res) => {
    const detail = store.findReportDetail(req.params.detailRefId);
    if (!detail) {
      res.status(404).json({ error: 'Analysis report not found.' });
      return;
    }
    res.json({ detail });
  });

  app.get('/api/reports/:detailRefId/download', (req, res) => {
    const detail = store.findReportDetail(req.params.detailRefId);
    if (!detail) {
      res.status(404).json({ error: 'Analysis report not found.' });
      return;
    }
    const format = req.query.format === 'json' ? 'json' : 'txt';
    if (format === 'json') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="trusthire-report-${detail.id}.json"`
      );
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(detail, null, 2));
      return;
    }

    const reportText = formatReportAsText(detail);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="trusthire-report-${detail.id}.txt"`
    );
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(reportText);
  });

  // --- Frontend Serving (Vite Dev Middleware vs Production Dist) ---
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustHire AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TrustHire AI server:', err);
  process.exit(1);
});
