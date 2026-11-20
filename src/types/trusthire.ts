export type AuthView = 'login' | 'register' | 'forgot-password';

export type AppRoute =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'job-fraud'
  | 'call-fraud'
  | 'resume-analysis'
  | 'job-recommendations'
  | 'history'
  | 'about'
  | 'profile';

export type RiskClassification =
  | 'Potentially Genuine'
  | 'Suspicious'
  | 'Potentially Fraudulent';

export type CallRiskCategory = 'Low Risk' | 'Suspicious' | 'High Risk';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  targetRole?: string;
  createdAt: string;
  authMode: 'session-preview';
}

export interface JobAdInput {
  jobTitle: string;
  companyName: string;
  recruiterEmail: string;
  location: string;
  salaryDetails: string;
  description: string;
  documentName?: string;
}

export interface JobAdAnalysisResult {
  id: string;
  createdAt: string;
  isDemo: boolean;
  analysisEngine: string;
  input: JobAdInput;
  fraudRiskPercentage: number;
  classification: RiskClassification;
  reasons: string[];
  suspiciousKeywords: string[];
  domainConsistencyNote: string;
  safetyRecommendations: string[];
  disclaimer: string;
}

export interface SuspiciousStatement {
  id: string;
  sentence: string;
  category:
    | 'Registration Fee Demand'
    | 'Interview Fee Demand'
    | 'Training Fee Before Employment'
    | 'Guaranteed Job Without Interview'
    | 'OTP or Bank Detail Request'
    | 'Advance Payment Demand'
    | 'Suspicious Payment Link'
    | 'Fake Company Identity Claim'
    | 'Urgency & Pressure Tactic'
    | 'Confidential Personal Info Request';
  severity: 'High' | 'Medium' | 'Low';
  explanation: string;
}

export interface CallAnalysisResult {
  id: string;
  createdAt: string;
  isDemo: boolean;
  analysisEngine: string;
  fileName: string;
  fileFormat: string;
  durationSeconds: number;
  detectedLanguages: string[];
  callRiskPercentage: number;
  riskCategory: CallRiskCategory;
  transcript: string;
  suspiciousStatementsCount: number;
  suspiciousStatements: SuspiciousStatement[];
  safetyActions: string[];
  disclaimer: string;
}

export interface ResumeProject {
  title: string;
  description: string;
  technologies: string[];
}

export interface ResumeProfile {
  candidateName: string;
  email: string;
  phone: string;
  education: string[];
  collegeOrUniversity: string;
  technicalSkills: string[];
  programmingLanguages: string[];
  projects: ResumeProject[];
  internshipExperience: string[];
  certifications: string[];
  workExperience: string[];
}

export interface ResumeAnalysisResult {
  id: string;
  createdAt: string;
  isDemo: boolean;
  analysisEngine: string;
  fileName: string;
  fileType: string;
  profile: ResumeProfile;
  completenessScore: number;
  skillCoverageSummary: string;
  educationSummary: string;
  projectRelevanceSummary: string;
  internshipSummary: string;
  missingSkills: string[];
  improvementSuggestions: string[];
  skillCategoryScores: {
    programming: number;
    webAndDatabase: number;
    aiAndDataScience: number;
    coreEngineeringAndHardware: number;
  };
}

export interface JobRecommendation {
  id: string;
  title: string;
  companyOrPortal: string;
  requiredSkills: string[];
  matchingSkills: string[];
  missingSkills: string[];
  location: string;
  jobType: 'Full-Time' | 'Internship';
  experienceLevel: 'Intern' | 'Entry Level / Fresher' | '1-3 Years';
  matchPercentage: number;
  officialApplicationUrl: string;
  portalLabel: string;
  isSampleCatalog: boolean;
  summary: string;
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  type: 'Job Advertisement' | 'Recruitment Call' | 'Resume Analysis';
  subject: string;
  resultSummary: string;
  riskOrScoreLabel: string;
  riskScoreValue: number;
  classification: string;
  isDemo: boolean;
  detailRefId: string;
}

export interface DashboardSummary {
  stats: {
    jobAdsAnalyzed: number;
    callsAnalyzed: number;
    resumesAnalyzed: number;
    recommendedJobsCount: number;
  };
  riskBreakdown: {
    genuine: number;
    suspicious: number;
    fraudulent: number;
  };
  moduleActivity: {
    labels: string[];
    jobAds: number[];
    calls: number[];
    resumes: number[];
  };
  recentHistory: HistoryRecord[];
  latestResume: ResumeAnalysisResult | null;
  topRecommendations: JobRecommendation[];
}
