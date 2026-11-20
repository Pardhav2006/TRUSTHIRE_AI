import { GoogleGenAI, Type } from '@google/genai';
import type {
  CallAnalysisResult,
  CallRiskCategory,
  JobAdAnalysisResult,
  JobAdInput,
  ResumeAnalysisResult,
  RiskClassification,
} from '../src/types/trusthire';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Add your key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function analyzeJobAdWithAI(
  input: JobAdInput,
  extractedDocText?: string,
  pdfBase64?: string
): Promise<Omit<JobAdAnalysisResult, 'id' | 'createdAt' | 'isDemo'>> {
  const ai = getGeminiClient();

  const fullDescription = [input.description, extractedDocText]
    .filter(Boolean)
    .join('\n\n--- Uploaded Document Content ---\n');

  const prompt = `Analyze the following job advertisement for recruitment fraud risk.
Evaluate:
1. Job title clarity and realism
2. Company identity and consistency with the recruiter email domain (e.g., free webmail like @gmail.com/@yahoo.com claiming to be a major corporation)
3. Job description quality, vagueness, or scam indicators
4. Unrealistic salary promises compared to role/requirements
5. Required qualifications vs. guaranteed job promises ("no interview", "100% placement")
6. Any demands for registration fees, security deposits, training fees, laptop charges, OTPs, Aadhaar/PAN upfront, or banking details

Important rules:
- Treat the score as a statistical/AI risk estimate (0-100), never an accusation of guilt.
- Classify strictly as one of: "Potentially Genuine", "Suspicious", or "Potentially Fraudulent".
- Extract exact suspicious keywords or phrases verbatim from the input if present.

Job Title: ${input.jobTitle}
Company Name: ${input.companyName}
Recruiter Email: ${input.recruiterEmail || 'Not provided'}
Location: ${input.location || 'Not provided'}
Salary Details: ${input.salaryDetails || 'Not provided'}
Job Description:
${fullDescription}`;

  const contents = pdfBase64
    ? {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          },
          { text: prompt },
        ],
      }
    : prompt;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents,
    config: {
      systemInstruction:
        'You are a recruitment fraud risk analyst for TrustHire AI. Provide accurate, evidence-based risk assessments in strict JSON format. Never exaggerate or fabricate phrases not found in the input.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fraudRiskPercentage: {
            type: Type.INTEGER,
            description: 'Estimated fraud risk score between 0 and 100.',
          },
          classification: {
            type: Type.STRING,
            description:
              'Must be exactly one of: Potentially Genuine, Suspicious, Potentially Fraudulent.',
          },
          reasons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Clear analytical reasons explaining the risk score.',
          },
          suspiciousKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              'Exact suspicious words or short phrases detected in the advertisement.',
          },
          domainConsistencyNote: {
            type: Type.STRING,
            description:
              'Assessment of recruiter email domain relative to the stated company.',
          },
          safetyRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Practical safety steps for the candidate.',
          },
        },
        required: [
          'fraudRiskPercentage',
          'classification',
          'reasons',
          'suspiciousKeywords',
          'domainConsistencyNote',
          'safetyRecommendations',
        ],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim());
  const riskPct = Math.max(0, Math.min(100, Number(parsed.fraudRiskPercentage) || 0));

  let classification: RiskClassification = 'Suspicious';
  if (
    parsed.classification === 'Potentially Genuine' ||
    parsed.classification === 'Suspicious' ||
    parsed.classification === 'Potentially Fraudulent'
  ) {
    classification = parsed.classification;
  } else if (riskPct < 35) {
    classification = 'Potentially Genuine';
  } else if (riskPct >= 70) {
    classification = 'Potentially Fraudulent';
  }

  return {
    analysisEngine: 'Gemini AI NLP Risk Classifier (Server-Side)',
    input,
    fraudRiskPercentage: riskPct,
    classification,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
    suspiciousKeywords: Array.isArray(parsed.suspiciousKeywords)
      ? parsed.suspiciousKeywords
      : [],
    domainConsistencyNote:
      parsed.domainConsistencyNote || 'Email domain check completed.',
    safetyRecommendations: Array.isArray(parsed.safetyRecommendations)
      ? parsed.safetyRecommendations
      : [],
    disclaimer:
      'Risk estimate generated by AI analysis. Always verify the employer via official corporate websites and career portals before sharing documents or attending interviews.',
  };
}

export async function transcribeAndAnalyzeCallWithAI(
  audioBase64: string,
  mimeType: string,
  fileName: string,
  fileFormat: string,
  durationSeconds: number,
  languageHint: string
): Promise<Omit<CallAnalysisResult, 'id' | 'createdAt' | 'isDemo'>> {
  const ai = getGeminiClient();

  // Step 1: Speech-to-text transcription using gemini-3.5-transcribe
  const transcribeResponse = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: `Transcribe this recruitment phone call recording verbatim. Language context: ${languageHint}. Support English, Tamil, Hindi, and mixed-language speech accurately. Format with speaker turns where identifiable (e.g., Recruiter: ..., Candidate: ...).`,
        },
      ],
    },
  });

  const transcript = (transcribeResponse.text ?? '').trim();
  if (!transcript) {
    throw new Error(
      'Unable to extract speech transcript from the uploaded audio file. Please ensure the recording contains audible speech.'
    );
  }

  // Step 2: Conversational fraud detection & sentence-level highlighting
  const analysisResponse = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Analyze this recruitment call transcript for fraudulent recruitment indicators.

Check specifically for:
- Registration Fee Demand
- Interview Fee Demand
- Training Fee Before Employment
- Guaranteed Job Without Interview
- OTP or Bank Detail Request
- Advance Payment Demand
- Suspicious Payment Link
- Fake Company Identity Claim
- Urgency & Pressure Tactic
- Confidential Personal Info Request

For each suspicious sentence, return the EXACT verbatim sentence or clause as it appears in the transcript so the UI can highlight it inline.

Transcript:
${transcript}`,
    config: {
      systemInstruction:
        'You are an NLP recruitment call fraud detector. Return strict JSON. Never fabricate sentences not present in the transcript. Treat scores as risk estimates requiring independent verification.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedLanguages: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          callRiskPercentage: {
            type: Type.INTEGER,
          },
          riskCategory: {
            type: Type.STRING,
            description: 'Must be Low Risk, Suspicious, or High Risk.',
          },
          suspiciousStatements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sentence: { type: Type.STRING },
                category: { type: Type.STRING },
                severity: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['sentence', 'category', 'severity', 'explanation'],
            },
          },
          safetyActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'detectedLanguages',
          'callRiskPercentage',
          'riskCategory',
          'suspiciousStatements',
          'safetyActions',
        ],
      },
    },
  });

  const parsed = JSON.parse((analysisResponse.text ?? '{}').trim());
  const riskPct = Math.max(0, Math.min(100, Number(parsed.callRiskPercentage) || 0));

  let riskCategory: CallRiskCategory = 'Suspicious';
  if (
    parsed.riskCategory === 'Low Risk' ||
    parsed.riskCategory === 'Suspicious' ||
    parsed.riskCategory === 'High Risk'
  ) {
    riskCategory = parsed.riskCategory;
  } else if (riskPct < 35) {
    riskCategory = 'Low Risk';
  } else if (riskPct >= 70) {
    riskCategory = 'High Risk';
  }

  const statements = Array.isArray(parsed.suspiciousStatements)
    ? parsed.suspiciousStatements.map((s: any, idx: number) => ({
        id: `stmt-${idx + 1}`,
        sentence: String(s.sentence || ''),
        category: s.category || 'Urgency & Pressure Tactic',
        severity:
          s.severity === 'High' || s.severity === 'Medium' || s.severity === 'Low'
            ? s.severity
            : 'Medium',
        explanation: String(s.explanation || ''),
      }))
    : [];

  return {
    analysisEngine: 'Gemini Speech Transcription + NLP Fraud Classifier',
    fileName,
    fileFormat,
    durationSeconds,
    detectedLanguages:
      Array.isArray(parsed.detectedLanguages) && parsed.detectedLanguages.length > 0
        ? parsed.detectedLanguages
        : [languageHint || 'English'],
    callRiskPercentage: riskPct,
    riskCategory,
    transcript,
    suspiciousStatementsCount: statements.length,
    suspiciousStatements: statements,
    safetyActions: Array.isArray(parsed.safetyActions)
      ? parsed.safetyActions
      : [
          'Do not make any UPI, bank transfer, or registration fee payments before independent verification.',
        ],
    disclaimer:
      'Automated call transcript and risk estimate. Confirm recruiter identity via official company HR directories.',
  };
}

export async function generateDemoScamAudioWav(): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-lite-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Hello candidate, congratulations from Global Tech Solutions HR desk. Your software engineer offer is confirmed without any technical interview. To lock your offer letter today, please pay 2000 rupees refundable registration fee using the payment link within 30 minutes and share your Aadhaar number.',
            speechMetadata: {
              style: 'Fast-paced urgent telemarketer recruiter voice',
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Charon' },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Failed to generate sample recruitment audio clip.');
  }
  return base64Audio;
}

export async function analyzeResumeWithAI(params: {
  fileName: string;
  fileType: string;
  rawText?: string;
  pdfBase64?: string;
}): Promise<Omit<ResumeAnalysisResult, 'id' | 'createdAt' | 'isDemo'>> {
  const ai = getGeminiClient();

  const instructionPrompt = `Extract structured candidate information from this resume and evaluate resume quality.
Pay careful attention to technical skills including: Python, Java, C, C++, HTML, CSS, JavaScript, TypeScript, React, Node.js, SQL, Machine Learning, Artificial Intelligence, Data Science, Embedded Systems, VLSI, Verilog, FPGA, Docker, Git, Cloud, etc.
Compute realistic coverage scores (0-100) for:
- programming
- webAndDatabase
- aiAndDataScience
- coreEngineeringAndHardware
And compute overall resume completenessScore (0-100) plus specific missingSkills and actionable improvementSuggestions.`;

  const contents = params.pdfBase64
    ? {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: params.pdfBase64,
            },
          },
          { text: instructionPrompt },
        ],
      }
    : `${instructionPrompt}\n\n--- RESUME CONTENT ---\n${params.rawText ?? ''}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents,
    config: {
      systemInstruction:
        'You are an academic & industry career resume parser and evaluator for TrustHire AI. Extract only facts present in the resume; return empty strings or arrays if fields are missing. Return strict JSON.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          profile: {
            type: Type.OBJECT,
            properties: {
              candidateName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              education: { type: Type.ARRAY, items: { type: Type.STRING } },
              collegeOrUniversity: { type: Type.STRING },
              technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              programmingLanguages: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['title', 'description', 'technologies'],
                },
              },
              internshipExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              workExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'candidateName',
              'email',
              'phone',
              'education',
              'collegeOrUniversity',
              'technicalSkills',
              'programmingLanguages',
              'projects',
              'internshipExperience',
              'certifications',
              'workExperience',
            ],
          },
          completenessScore: { type: Type.INTEGER },
          skillCoverageSummary: { type: Type.STRING },
          educationSummary: { type: Type.STRING },
          projectRelevanceSummary: { type: Type.STRING },
          internshipSummary: { type: Type.STRING },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          skillCategoryScores: {
            type: Type.OBJECT,
            properties: {
              programming: { type: Type.INTEGER },
              webAndDatabase: { type: Type.INTEGER },
              aiAndDataScience: { type: Type.INTEGER },
              coreEngineeringAndHardware: { type: Type.INTEGER },
            },
            required: [
              'programming',
              'webAndDatabase',
              'aiAndDataScience',
              'coreEngineeringAndHardware',
            ],
          },
        },
        required: [
          'profile',
          'completenessScore',
          'skillCoverageSummary',
          'educationSummary',
          'projectRelevanceSummary',
          'internshipSummary',
          'missingSkills',
          'improvementSuggestions',
          'skillCategoryScores',
        ],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim());
  const clamp = (n: unknown) => Math.max(0, Math.min(100, Number(n) || 0));

  return {
    analysisEngine: 'Gemini AI Document Parser & Profile Evaluator',
    fileName: params.fileName,
    fileType: params.fileType,
    profile: {
      candidateName: parsed.profile?.candidateName || 'Not specified in document',
      email: parsed.profile?.email || 'Not specified',
      phone: parsed.profile?.phone || 'Not specified',
      education: parsed.profile?.education ?? [],
      collegeOrUniversity: parsed.profile?.collegeOrUniversity || 'Not specified',
      technicalSkills: parsed.profile?.technicalSkills ?? [],
      programmingLanguages: parsed.profile?.programmingLanguages ?? [],
      projects: parsed.profile?.projects ?? [],
      internshipExperience: parsed.profile?.internshipExperience ?? [],
      certifications: parsed.profile?.certifications ?? [],
      workExperience: parsed.profile?.workExperience ?? [],
    },
    completenessScore: clamp(parsed.completenessScore),
    skillCoverageSummary: parsed.skillCoverageSummary || '',
    educationSummary: parsed.educationSummary || '',
    projectRelevanceSummary: parsed.projectRelevanceSummary || '',
    internshipSummary: parsed.internshipSummary || '',
    missingSkills: parsed.missingSkills ?? [],
    improvementSuggestions: parsed.improvementSuggestions ?? [],
    skillCategoryScores: {
      programming: clamp(parsed.skillCategoryScores?.programming),
      webAndDatabase: clamp(parsed.skillCategoryScores?.webAndDatabase),
      aiAndDataScience: clamp(parsed.skillCategoryScores?.aiAndDataScience),
      coreEngineeringAndHardware: clamp(
        parsed.skillCategoryScores?.coreEngineeringAndHardware
      ),
    },
  };
}
