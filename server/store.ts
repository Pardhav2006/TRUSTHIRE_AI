import type {
  CallAnalysisResult,
  DashboardSummary,
  HistoryRecord,
  JobAdAnalysisResult,
  ResumeAnalysisResult,
  UserAccount,
} from '../src/types/trusthire';
import { recommendJobsWithTfIdf } from './tfidfMatcher';

// Clearly-labeled DEMO baseline examples so evaluators see realistic initial metrics
// without mistaking demonstration samples for real user runs.
const DEMO_JOB_AD: JobAdAnalysisResult = {
  id: 'demo-job-1',
  createdAt: '2026-11-16T09:15:00.000Z',
  isDemo: true,
  analysisEngine: 'DEMO Sample Record (Reference Illustration)',
  input: {
    jobTitle: 'Junior Python & Data Executive (Work From Home)',
    companyName: 'Apex Horizon Infotech Pvt Ltd',
    recruiterEmail: 'hr.apexhorizon.jobs99@gmail.com',
    location: 'Remote / Pan-India',
    salaryDetails: '₹65,000 - ₹90,000/month (No experience required)',
    description:
      'Urgent hiring! Guaranteed job offer without technical interview. Freshers welcome. Selected candidates must pay ₹1,850 refundable laptop security and registration fee today via UPI to receive offer letter.',
  },
  fraudRiskPercentage: 89,
  classification: 'Potentially Fraudulent',
  reasons: [
    'Explicit request for a refundable ₹1,850 registration and security fee prior to onboarding.',
    'Guaranteed employment promised without technical screening or structured interviews.',
    'Recruiter uses a generic free webmail domain (@gmail.com) while claiming to represent a private limited firm.',
    'Disproportionately high entry-level salary paired with urgency pressure ("today").',
  ],
  suspiciousKeywords: [
    'Guaranteed job offer without technical interview',
    'pay ₹1,850 refundable laptop security and registration fee',
    'Urgent hiring',
    'via UPI',
  ],
  domainConsistencyNote:
    'Recruiter email (@gmail.com) does not match an official corporate domain for Apex Horizon Infotech Pvt Ltd.',
  safetyRecommendations: [
    'Never pay registration, security, or training deposits for employment.',
    'Verify company registration on official MCA / corporate career portals before replying.',
    'Do not send identity documents or UPI transfers based on unverified email offers.',
  ],
  disclaimer:
    'DEMO illustration record. Run live analysis on any advertisement to evaluate with AI.',
};

const DEMO_CALL_ANALYSIS: CallAnalysisResult = {
  id: 'demo-call-1',
  createdAt: '2026-11-16T10:30:00.000Z',
  isDemo: true,
  analysisEngine: 'DEMO Sample Record (Reference Illustration)',
  fileName: 'demo_recruitment_call_sample.wav',
  fileFormat: 'WAV',
  durationSeconds: 38,
  detectedLanguages: ['English'],
  callRiskPercentage: 87,
  riskCategory: 'High Risk',
  transcript:
    'Recruiter: Hello, am I speaking with the shortlisted candidate? Congratulations, your job is confirmed with NexaCore Technologies for ₹55,000 per month. No second round interview is required. Pay ₹2,000 for registration within 20 minutes using the link sent on WhatsApp, and reply with your bank OTP to activate your payroll.',
  suspiciousStatementsCount: 3,
  suspiciousStatements: [
    {
      id: 'demo-stmt-1',
      sentence: 'No second round interview is required.',
      category: 'Guaranteed Job Without Interview',
      severity: 'High',
      explanation:
        'Legitimate employers conduct structured technical and HR evaluations before confirming employment.',
    },
    {
      id: 'demo-stmt-2',
      sentence:
        'Pay ₹2,000 for registration within 20 minutes using the link sent on WhatsApp',
      category: 'Registration Fee Demand',
      severity: 'High',
      explanation:
        'Upfront payment demands combined with artificial 20-minute urgency are hallmarks of recruitment scams.',
    },
    {
      id: 'demo-stmt-3',
      sentence: 'reply with your bank OTP to activate your payroll.',
      category: 'OTP or Bank Detail Request',
      severity: 'High',
      explanation:
        'Employers never require banking OTPs to set up payroll; sharing an OTP enables unauthorized account access.',
    },
  ],
  safetyActions: [
    'Do not make payments or share confidential information until the recruiter and company are independently verified.',
    'Disconnect calls demanding immediate UPI transfers or banking OTPs.',
    'Report suspicious numbers to national cybercrime helplines if financial fraud is attempted.',
  ],
  disclaimer:
    'DEMO illustration record for presentation reference. Upload an MP3, WAV, or M4A call recording to run live transcription and detection.',
};

const DEMO_RESUME_ANALYSIS: ResumeAnalysisResult = {
  id: 'demo-resume-1',
  createdAt: '2026-11-16T11:05:00.000Z',
  isDemo: true,
  analysisEngine: 'DEMO Sample Record (Reference Illustration)',
  fileName: 'Demo_Student_Resume_CS.pdf',
  fileType: 'PDF',
  profile: {
    candidateName: 'Ananya Krishnan',
    email: 'ananya.krishnan.cs@example.edu',
    phone: '+91 98400 12345',
    education: ['B.E. Computer Science and Engineering (2022–2026) — CGPA 8.7/10'],
    collegeOrUniversity: 'National Institute of Engineering & Technology',
    technicalSkills: [
      'Python',
      'SQL',
      'Machine Learning',
      'Artificial Intelligence',
      'Data Science',
      'HTML',
      'CSS',
      'JavaScript',
      'Git',
      'Scikit-learn',
    ],
    programmingLanguages: ['Python', 'Java', 'C', 'JavaScript', 'SQL'],
    projects: [
      {
        title: 'Phishing URL & Job Scam Classifier',
        description:
          'Built a TF-IDF + Random Forest text classifier achieving balanced precision on public scam text benchmarks.',
        technologies: ['Python', 'Scikit-learn', 'NLP', 'Flask'],
      },
      {
        title: 'Student Placement Portal',
        description:
          'Developed a responsive full-stack web dashboard with SQL schema design and role-based filtering.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'SQL'],
      },
    ],
    internshipExperience: [
      'Data Science Intern — Analysed structured survey datasets in Python & Pandas (8 weeks)',
    ],
    certifications: [
      'Supervised Machine Learning Foundations',
      'SQL Relational Database Design',
    ],
    workExperience: [],
  },
  completenessScore: 84,
  skillCoverageSummary:
    'Strong foundation across Python, SQL, Machine Learning, and web technologies suitable for entry-level software and data roles.',
  educationSummary:
    'Final-year B.E. Computer Science student with consistent academic standing.',
  projectRelevanceSummary:
    'Applied NLP and full-stack web projects align well with Python Developer, Junior Data Analyst, and ML Intern openings.',
  internshipSummary:
    'Includes one 8-week Data Science internship demonstrating practical Pandas and Python experience.',
  missingSkills: ['Docker', 'REST API Testing', 'Cloud Deployment (AWS/GCP)', 'Unit Testing (pytest)'],
  improvementSuggestions: [
    'Quantify project outcomes with concrete evaluation metrics (e.g., F1-score, latency, dataset size).',
    'Add containerization (Docker) and automated unit testing (pytest) to strengthen production readiness.',
    'Include GitHub repository links next to each academic project.',
  ],
  skillCategoryScores: {
    programming: 88,
    webAndDatabase: 78,
    aiAndDataScience: 82,
    coreEngineeringAndHardware: 42,
  },
};

class TrustHireStore {
  users: Map<string, UserAccount & { passwordHash: string }> = new Map();
  jobAnalyses: JobAdAnalysisResult[] = [DEMO_JOB_AD];
  callAnalyses: CallAnalysisResult[] = [DEMO_CALL_ANALYSIS];
  resumeAnalyses: ResumeAnalysisResult[] = [DEMO_RESUME_ANALYSIS];
  history: HistoryRecord[] = [
    {
      id: 'hist-demo-1',
      createdAt: DEMO_JOB_AD.createdAt,
      type: 'Job Advertisement',
      subject: `${DEMO_JOB_AD.input.jobTitle} — ${DEMO_JOB_AD.input.companyName}`,
      resultSummary: 'Registration fee demand & free webmail recruiter domain flagged',
      riskOrScoreLabel: '89% Risk',
      riskScoreValue: 89,
      classification: DEMO_JOB_AD.classification,
      isDemo: true,
      detailRefId: DEMO_JOB_AD.id,
    },
    {
      id: 'hist-demo-2',
      createdAt: DEMO_CALL_ANALYSIS.createdAt,
      type: 'Recruitment Call',
      subject: DEMO_CALL_ANALYSIS.fileName,
      resultSummary: '3 suspicious statements (Registration Fee, No Interview, OTP)',
      riskOrScoreLabel: '87% Risk',
      riskScoreValue: 87,
      classification: DEMO_CALL_ANALYSIS.riskCategory,
      isDemo: true,
      detailRefId: DEMO_CALL_ANALYSIS.id,
    },
    {
      id: 'hist-demo-3',
      createdAt: DEMO_RESUME_ANALYSIS.createdAt,
      type: 'Resume Analysis',
      subject: DEMO_RESUME_ANALYSIS.fileName,
      resultSummary: `${DEMO_RESUME_ANALYSIS.profile.technicalSkills.length} skills extracted · Completeness ${DEMO_RESUME_ANALYSIS.completenessScore}%`,
      riskOrScoreLabel: `${DEMO_RESUME_ANALYSIS.completenessScore}% Score`,
      riskScoreValue: DEMO_RESUME_ANALYSIS.completenessScore,
      classification: 'Profile Analysed',
      isDemo: true,
      detailRefId: DEMO_RESUME_ANALYSIS.id,
    },
  ];

  constructor() {
    // Seed a default demo evaluator account
    this.users.set('student@trusthire.edu', {
      id: 'usr-demo-1',
      name: 'Capstone Evaluator',
      email: 'student@trusthire.edu',
      passwordHash: 'trusthire2026',
      role: 'Final-Year Engineering Student',
      institution: 'Department of Computer Science & Engineering',
      targetRole: 'Python / ML Engineer',
      createdAt: new Date().toISOString(),
      authMode: 'session-preview',
    });
  }

  addJobAnalysis(result: JobAdAnalysisResult) {
    this.jobAnalyses.unshift(result);
    this.history.unshift({
      id: `hist-${result.id}`,
      createdAt: result.createdAt,
      type: 'Job Advertisement',
      subject: `${result.input.jobTitle} — ${result.input.companyName}`,
      resultSummary:
        result.reasons[0] || `Classified as ${result.classification}`,
      riskOrScoreLabel: `${result.fraudRiskPercentage}% Risk`,
      riskScoreValue: result.fraudRiskPercentage,
      classification: result.classification,
      isDemo: result.isDemo,
      detailRefId: result.id,
    });
  }

  addCallAnalysis(result: CallAnalysisResult) {
    this.callAnalyses.unshift(result);
    this.history.unshift({
      id: `hist-${result.id}`,
      createdAt: result.createdAt,
      type: 'Recruitment Call',
      subject: result.fileName,
      resultSummary: `${result.suspiciousStatementsCount} suspicious statement(s) detected`,
      riskOrScoreLabel: `${result.callRiskPercentage}% Risk`,
      riskScoreValue: result.callRiskPercentage,
      classification: result.riskCategory,
      isDemo: result.isDemo,
      detailRefId: result.id,
    });
  }

  addResumeAnalysis(result: ResumeAnalysisResult) {
    this.resumeAnalyses.unshift(result);
    this.history.unshift({
      id: `hist-${result.id}`,
      createdAt: result.createdAt,
      type: 'Resume Analysis',
      subject: result.fileName,
      resultSummary: `${result.profile.technicalSkills.length} technical skills extracted`,
      riskOrScoreLabel: `${result.completenessScore}% Score`,
      riskScoreValue: result.completenessScore,
      classification: 'Profile Analysed',
      isDemo: result.isDemo,
      detailRefId: result.id,
    });
  }

  getLatestResume(): ResumeAnalysisResult | null {
    return this.resumeAnalyses[0] ?? null;
  }

  getDashboardSummary(): DashboardSummary {
    const latestResume = this.getLatestResume();
    const candidateSkills = latestResume
      ? [
          ...latestResume.profile.technicalSkills,
          ...latestResume.profile.programmingLanguages,
        ]
      : ['Python', 'SQL', 'Machine Learning'];

    const topRecommendations = recommendJobsWithTfIdf(candidateSkills).slice(
      0,
      4
    );

    let genuine = 0;
    let suspicious = 0;
    let fraudulent = 0;

    for (const j of this.jobAnalyses) {
      if (j.classification === 'Potentially Genuine') genuine++;
      else if (j.classification === 'Suspicious') suspicious++;
      else fraudulent++;
    }
    for (const c of this.callAnalyses) {
      if (c.riskCategory === 'Low Risk') genuine++;
      else if (c.riskCategory === 'Suspicious') suspicious++;
      else fraudulent++;
    }

    return {
      stats: {
        jobAdsAnalyzed: this.jobAnalyses.length,
        callsAnalyzed: this.callAnalyses.length,
        resumesAnalyzed: this.resumeAnalyses.length,
        recommendedJobsCount: topRecommendations.filter(
          (j) => j.matchPercentage >= 40
        ).length,
      },
      riskBreakdown: {
        genuine,
        suspicious,
        fraudulent,
      },
      moduleActivity: {
        labels: ['Job Ads', 'Calls', 'Resumes'],
        jobAds: [this.jobAnalyses.length, 0, 0],
        calls: [0, this.callAnalyses.length, 0],
        resumes: [0, 0, this.resumeAnalyses.length],
      },
      recentHistory: this.history.slice(0, 6),
      latestResume,
      topRecommendations,
    };
  }

  findReportDetail(detailRefId: string) {
    return (
      this.jobAnalyses.find((j) => j.id === detailRefId) ||
      this.callAnalyses.find((c) => c.id === detailRefId) ||
      this.resumeAnalyses.find((r) => r.id === detailRefId) ||
      null
    );
  }
}

export const store = new TrustHireStore();
export { DEMO_CALL_ANALYSIS, DEMO_JOB_AD, DEMO_RESUME_ANALYSIS };
