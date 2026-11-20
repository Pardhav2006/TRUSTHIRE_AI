import type { JobRecommendation } from '../src/types/trusthire';

interface CatalogJob {
  id: string;
  title: string;
  companyOrPortal: string;
  requiredSkills: string[];
  location: string;
  jobType: 'Full-Time' | 'Internship';
  experienceLevel: 'Intern' | 'Entry Level / Fresher' | '1-3 Years';
  officialApplicationUrl: string;
  portalLabel: string;
  summary: string;
  corpusKeywords: string[];
}

// Curated sample career role catalog linked strictly to real verified public job portals
// (no fabricated live vacancy URLs).
const JOB_CATALOG: CatalogJob[] = [
  {
    id: 'job-py-dev',
    title: 'Python Developer',
    companyOrPortal: 'Python Software Foundation & Partner Portals',
    requiredSkills: ['Python', 'SQL', 'Django', 'REST API', 'Git', 'Docker'],
    location: 'Bengaluru / Remote',
    jobType: 'Full-Time',
    experienceLevel: 'Entry Level / Fresher',
    officialApplicationUrl: 'https://www.python.org/jobs/',
    portalLabel: 'Official Python.org Job Board',
    summary:
      'Build scalable backend APIs, data pipelines, and automation services using Python and relational databases.',
    corpusKeywords: [
      'python',
      'sql',
      'django',
      'flask',
      'rest api',
      'backend',
      'git',
      'docker',
      'mysql',
      'postgresql',
    ],
  },
  {
    id: 'job-jr-data-analyst',
    title: 'Junior Data Analyst',
    companyOrPortal: 'Verified Data & Analytics Roles',
    requiredSkills: ['Python', 'SQL', 'Data Science', 'Pandas', 'Excel', 'Statistics'],
    location: 'Hyderabad / Hybrid',
    jobType: 'Full-Time',
    experienceLevel: 'Entry Level / Fresher',
    officialApplicationUrl:
      'https://www.linkedin.com/jobs/search/?keywords=Junior%20Data%20Analyst',
    portalLabel: 'LinkedIn Jobs Search',
    summary:
      'Clean, query, and visualize structured datasets to deliver operational and business KPI reporting.',
    corpusKeywords: [
      'python',
      'sql',
      'data science',
      'data analysis',
      'pandas',
      'numpy',
      'excel',
      'tableau',
      'power bi',
      'statistics',
    ],
  },
  {
    id: 'job-ml-intern',
    title: 'Machine Learning Intern',
    companyOrPortal: 'AI & Research Engineering Internships',
    requiredSkills: [
      'Python',
      'Machine Learning',
      'Artificial Intelligence',
      'Scikit-learn',
      'NLP',
      'Data Science',
    ],
    location: 'Chennai / Remote',
    jobType: 'Internship',
    experienceLevel: 'Intern',
    officialApplicationUrl:
      'https://internshala.com/internships/machine-learning-internship/',
    portalLabel: 'Internshala Verified Listings',
    summary:
      'Assist ML engineers in feature engineering, TF-IDF vectorization, NLP classification, and model evaluation.',
    corpusKeywords: [
      'python',
      'machine learning',
      'artificial intelligence',
      'ai',
      'ml',
      'nlp',
      'scikit-learn',
      'tensorflow',
      'pytorch',
      'data science',
    ],
  },
  {
    id: 'job-fullstack-js',
    title: 'Full Stack Web Developer',
    companyOrPortal: 'Web Engineering Career Portal',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL'],
    location: 'Pune / Hybrid',
    jobType: 'Full-Time',
    experienceLevel: 'Entry Level / Fresher',
    officialApplicationUrl:
      'https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Web%20Developer%20Fresher',
    portalLabel: 'LinkedIn Jobs Search',
    summary:
      'Design responsive user interfaces and integrate RESTful backend services with modern web frameworks.',
    corpusKeywords: [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
      'node.js',
      'sql',
      'bootstrap',
      'tailwind',
      'rest api',
    ],
  },
  {
    id: 'job-java-sde',
    title: 'Associate Java Software Engineer',
    companyOrPortal: 'Enterprise Software Engineering Portal',
    requiredSkills: ['Java', 'SQL', 'Spring Boot', 'Data Structures', 'Git', 'OOP'],
    location: 'Bengaluru / Chennai',
    jobType: 'Full-Time',
    experienceLevel: '1-3 Years',
    officialApplicationUrl:
      'https://www.linkedin.com/jobs/search/?keywords=Associate%20Java%20Developer',
    portalLabel: 'LinkedIn Jobs Search',
    summary:
      'Develop enterprise microservices, relational database schemas, and unit-tested backend components in Java.',
    corpusKeywords: [
      'java',
      'sql',
      'spring boot',
      'oop',
      'data structures',
      'algorithms',
      'mysql',
      'git',
      'microservices',
    ],
  },
  {
    id: 'job-embedded-eng',
    title: 'Embedded Systems Engineer',
    companyOrPortal: 'Core Electronics & Firmware Careers',
    requiredSkills: ['C', 'C++', 'Embedded Systems', 'Microcontrollers', 'RTOS', 'UART/SPI'],
    location: 'Bengaluru / Pune',
    jobType: 'Full-Time',
    experienceLevel: 'Entry Level / Fresher',
    officialApplicationUrl:
      'https://www.linkedin.com/jobs/search/?keywords=Embedded%20Systems%20Engineer',
    portalLabel: 'LinkedIn Jobs Search',
    summary:
      'Write bare-metal and RTOS firmware in C/C++, debug hardware interfaces, and optimize microcontroller drivers.',
    corpusKeywords: [
      'c',
      'c++',
      'embedded systems',
      'firmware',
      'microcontroller',
      'arm',
      'rtos',
      'iot',
      'uart',
      'spi',
      'i2c',
    ],
  },
  {
    id: 'job-vlsi-intern',
    title: 'VLSI & RTL Design Intern',
    companyOrPortal: 'Semiconductor & Hardware Engineering',
    requiredSkills: ['VLSI', 'Verilog', 'FPGA', 'Digital Electronics', 'C', 'SystemVerilog'],
    location: 'Hyderabad / Bengaluru',
    jobType: 'Internship',
    experienceLevel: 'Intern',
    officialApplicationUrl:
      'https://www.linkedin.com/jobs/search/?keywords=VLSI%20Verilog%20Intern',
    portalLabel: 'LinkedIn Jobs Search',
    summary:
      'Simulate RTL modules in Verilog, perform FPGA synthesis & timing verification, and automate testbenches.',
    corpusKeywords: [
      'vlsi',
      'verilog',
      'fpga',
      'systemverilog',
      'vhdl',
      'rtl',
      'digital electronics',
      'asic',
      'c',
      'python',
    ],
  },
  {
    id: 'job-ai-nlp-eng',
    title: 'NLP & Applied AI Engineer',
    companyOrPortal: 'Applied AI & Language Systems',
    requiredSkills: [
      'Python',
      'Artificial Intelligence',
      'Machine Learning',
      'NLP',
      'spaCy',
      'SQL',
    ],
    location: 'Remote / Bengaluru',
    jobType: 'Full-Time',
    experienceLevel: '1-3 Years',
    officialApplicationUrl:
      'https://www.linkedin.com/jobs/search/?keywords=NLP%20Applied%20AI%20Engineer',
    portalLabel: 'LinkedIn Jobs Search',
    summary:
      'Build text classification pipelines, speech-to-text integrations, and semantic search engines in Python.',
    corpusKeywords: [
      'python',
      'nlp',
      'spacy',
      'nltk',
      'artificial intelligence',
      'machine learning',
      'tf-idf',
      'transformers',
      'whisper',
      'sql',
    ],
  },
  {
    id: 'job-sde-intern',
    title: 'Software Development Intern',
    companyOrPortal: 'Campus & Student Engineering Internships',
    requiredSkills: ['Python', 'Java', 'C++', 'HTML', 'CSS', 'JavaScript', 'Git'],
    location: 'Remote / Pan-India',
    jobType: 'Internship',
    experienceLevel: 'Intern',
    officialApplicationUrl:
      'https://internshala.com/internships/software-development-internship/',
    portalLabel: 'Internshala Verified Listings',
    summary:
      'Collaborate with engineering mentors on full-stack web modules, automated tests, and API integrations.',
    corpusKeywords: [
      'python',
      'java',
      'c++',
      'c',
      'html',
      'css',
      'javascript',
      'git',
      'sql',
      'react',
    ],
  },
];

function tokenizeSkillsAndText(items: string[]): string[] {
  const tokens: string[] = [];
  for (const raw of items) {
    const clean = raw.toLowerCase().trim();
    if (!clean) continue;
    tokens.push(clean);
    for (const part of clean.split(/[\s,/|()-]+/)) {
      if (part.length >= 1) tokens.push(part);
    }
  }
  return tokens;
}

function buildTfMap(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) {
    map.set(t, (map.get(t) ?? 0) + 1);
  }
  const len = tokens.length || 1;
  for (const [k, v] of map.entries()) {
    map.set(k, v / len);
  }
  return map;
}

function cosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [term, valA] of vecA.entries()) {
    normA += valA * valA;
    const valB = vecB.get(term);
    if (valB !== undefined) {
      dot += valA * valB;
    }
  }
  for (const valB of vecB.values()) {
    normB += valB * valB;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function recommendJobsWithTfIdf(
  candidateSkills: string[],
  filters?: {
    role?: string;
    location?: string;
    skill?: string;
    jobType?: string;
    experienceLevel?: string;
  }
): JobRecommendation[] {
  const normalizedCandidate = candidateSkills
    .map((s) => s.trim())
    .filter(Boolean);
  const candidateLowerSet = new Set(
    normalizedCandidate.map((s) => s.toLowerCase())
  );

  // Build corpus documents (candidate + all jobs) for genuine IDF weighting
  const docTokens = [
    tokenizeSkillsAndText(normalizedCandidate),
    ...JOB_CATALOG.map((job) =>
      tokenizeSkillsAndText([...job.requiredSkills, ...job.corpusKeywords, job.title])
    ),
  ];

  const df = new Map<string, number>();
  for (const tokens of docTokens) {
    const unique = new Set(tokens);
    for (const term of unique) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const totalDocs = docTokens.length;
  const toTfIdf = (tokens: string[]): Map<string, number> => {
    const tf = buildTfMap(tokens);
    const tfidf = new Map<string, number>();
    for (const [term, tfVal] of tf.entries()) {
      const docFreq = df.get(term) ?? 1;
      const idf = Math.log((totalDocs + 1) / (docFreq + 1)) + 1;
      tfidf.set(term, tfVal * idf);
    }
    return tfidf;
  };

  const candidateVec = toTfIdf(docTokens[0]);

  const scored: JobRecommendation[] = JOB_CATALOG.map((job, idx) => {
    const jobVec = toTfIdf(docTokens[idx + 1]);
    const cos = cosineSimilarity(candidateVec, jobVec);

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const reqSkill of job.requiredSkills) {
      const reqLower = reqSkill.toLowerCase();
      const isMatch = Array.from(candidateLowerSet).some(
        (cs) =>
          cs === reqLower ||
          cs.includes(reqLower) ||
          reqLower.includes(cs) ||
          (reqLower === 'artificial intelligence' && cs === 'ai') ||
          (reqLower === 'machine learning' && cs === 'ml')
      );
      if (isMatch) {
        matchingSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    const skillRatio =
      job.requiredSkills.length > 0
        ? matchingSkills.length / job.requiredSkills.length
        : 0;

    // Blend cosine similarity with explicit required-skill overlap for crisp interpretability
    const blended = Math.round(
      Math.min(98, Math.max(12, (cos * 0.55 + skillRatio * 0.45) * 100))
    );

    return {
      id: job.id,
      title: job.title,
      companyOrPortal: job.companyOrPortal,
      requiredSkills: job.requiredSkills,
      matchingSkills,
      missingSkills,
      location: job.location,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      matchPercentage: normalizedCandidate.length === 0 ? 0 : blended,
      officialApplicationUrl: job.officialApplicationUrl,
      portalLabel: job.portalLabel,
      isSampleCatalog: true,
      summary: job.summary,
    };
  });

  return scored
    .filter((job) => {
      if (
        filters?.role &&
        !job.title.toLowerCase().includes(filters.role.toLowerCase())
      ) {
        return false;
      }
      if (
        filters?.location &&
        !job.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      if (
        filters?.skill &&
        !job.requiredSkills.some((s) =>
          s.toLowerCase().includes(filters.skill!.toLowerCase())
        )
      ) {
        return false;
      }
      if (
        filters?.jobType &&
        filters.jobType !== 'All' &&
        job.jobType !== filters.jobType
      ) {
        return false;
      }
      if (
        filters?.experienceLevel &&
        filters.experienceLevel !== 'All' &&
        job.experienceLevel !== filters.experienceLevel
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
