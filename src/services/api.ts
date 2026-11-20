import type {
  CallAnalysisResult,
  DashboardSummary,
  HistoryRecord,
  JobAdAnalysisResult,
  JobAdInput,
  JobRecommendation,
  ResumeAnalysisResult,
  UserAccount,
} from '../types/trusthire';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Accounts
  register(payload: {
    name: string;
    email: string;
    password: string;
    institution?: string;
    targetRole?: string;
  }): Promise<{ user: UserAccount; message: string }> {
    return requestJson('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  login(payload: {
    email: string;
    password: string;
  }): Promise<{ user: UserAccount }> {
    return requestJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return requestJson('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  },

  updateProfile(payload: {
    email: string;
    name: string;
    institution?: string;
    targetRole?: string;
    role?: string;
  }): Promise<{ user: UserAccount }> {
    return requestJson('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Dashboard
  getDashboardSummary(): Promise<DashboardSummary> {
    return requestJson('/api/dashboard/summary');
  },

  // Module 1A: Job Advertisement Detection
  analyzeJobAd(
    input: JobAdInput,
    documentFile?: File | null
  ): Promise<JobAdAnalysisResult> {
    const formData = new FormData();
    formData.append('jobTitle', input.jobTitle);
    formData.append('companyName', input.companyName);
    formData.append('recruiterEmail', input.recruiterEmail);
    formData.append('location', input.location);
    formData.append('salaryDetails', input.salaryDetails);
    formData.append('description', input.description);
    if (documentFile) {
      formData.append('document', documentFile);
    }
    return requestJson('/api/fraud/job-ad', {
      method: 'POST',
      body: formData,
    });
  },

  // Module 1B: Recruitment Call Detection
  analyzeCallAudio(
    audioFile: File,
    durationSeconds: number,
    languageHint: string
  ): Promise<CallAnalysisResult> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('durationSeconds', String(durationSeconds));
    formData.append('languageHint', languageHint);
    return requestJson('/api/fraud/call-audio', {
      method: 'POST',
      body: formData,
    });
  },

  generateDemoScamAudio(): Promise<{
    fileName: string;
    mimeType: string;
    base64Audio: string;
  }> {
    return requestJson('/api/fraud/demo-audio', {
      method: 'POST',
    });
  },

  // Module 2A: Resume Analysis
  analyzeResume(
    resumeFile: File | null,
    rawText?: string
  ): Promise<{
    analysis: ResumeAnalysisResult;
    recommendations: JobRecommendation[];
  }> {
    const formData = new FormData();
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    if (rawText) {
      formData.append('rawText', rawText);
    }
    return requestJson('/api/resume/analyze', {
      method: 'POST',
      body: formData,
    });
  },

  // Module 2B: Job Recommendations
  getJobRecommendations(params?: {
    skills?: string[];
    role?: string;
    location?: string;
    skill?: string;
    jobType?: string;
    experienceLevel?: string;
  }): Promise<{
    sourceResume: {
      id: string;
      fileName: string;
      candidateName: string;
      isDemo: boolean;
    } | null;
    candidateSkills: string[];
    recommendations: JobRecommendation[];
  }> {
    const search = new URLSearchParams();
    if (params?.skills && params.skills.length > 0) {
      search.set('skills', params.skills.join(','));
    }
    if (params?.role) search.set('role', params.role);
    if (params?.location) search.set('location', params.location);
    if (params?.skill) search.set('skill', params.skill);
    if (params?.jobType) search.set('jobType', params.jobType);
    if (params?.experienceLevel) {
      search.set('experienceLevel', params.experienceLevel);
    }
    const qs = search.toString();
    return requestJson(`/api/jobs/recommend${qs ? `?${qs}` : ''}`);
  },

  // Demo reference records
  getDemoSamples(): Promise<{
    jobAd: JobAdAnalysisResult;
    callAnalysis: CallAnalysisResult;
    resumeAnalysis: ResumeAnalysisResult;
  }> {
    return requestJson('/api/demo/samples');
  },

  // History & Reports
  getHistory(type = 'All'): Promise<{ items: HistoryRecord[] }> {
    const qs = type !== 'All' ? `?type=${encodeURIComponent(type)}` : '';
    return requestJson(`/api/history${qs}`);
  },

  getReportDetail(detailRefId: string): Promise<{
    detail: JobAdAnalysisResult | CallAnalysisResult | ResumeAnalysisResult;
  }> {
    return requestJson(`/api/history/${encodeURIComponent(detailRefId)}`);
  },

  getDownloadReportUrl(detailRefId: string, format: 'txt' | 'json' = 'txt'): string {
    return `/api/reports/${encodeURIComponent(detailRefId)}/download?format=${format}`;
  },
};
