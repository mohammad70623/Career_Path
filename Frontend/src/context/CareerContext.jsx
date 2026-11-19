import React, { createContext, useContext, useState } from 'react';
import {
  GLOBAL_LOCATIONS,
  getCountriesForRegion,
  getStatesForCountry,
  getCitiesForState,
  getDefaultGeoForRegion
} from '../data/globalLocations';

/**
 * 14 Universal Industry Sectors for Multi-Sector AI CV Analysis
 */
export const UNIVERSAL_SECTORS = [
  'IT & Software',
  'Healthcare',
  'Banking & Finance',
  'Engineering',
  'Education',
  'Legal',
  'Business & Management',
  'Research & Science',
  'Hospitality',
  'Manufacturing',
  'Marketing & Sales',
  'Agriculture & Environment',
  'Logistics & Supply Chain',
  'Design & Creative'
];

/**
 * Structured Baseline Work Experience Array
 */
export const initialExperience = [
  {
    id: 'exp-1',
    role: 'Lead Machine Learning Engineer',
    company: 'NeuralFin Intelligence Labs',
    duration: '2023 - Present',
    location: 'Dhaka, Bangladesh',
    description: `• Architected end-to-end real-time fraud risk classification platform processing 150,000+ daily financial events at sub-40ms P99 latency.
• Engineered generative synthetic anomaly pipelines utilizing contrastive loss, accelerating rare-fraud recall from 76% to 95.4%.
• Spearheaded Triton inference optimizations on Kubernetes auto-scaling clusters, achieving 34% reduction in GPU infrastructure costs.`
  },
  {
    id: 'exp-2',
    role: 'Senior AI & Data Systems Engineer',
    company: 'Quantum Analytics Asia',
    duration: '2021 - 2023',
    location: 'Dhaka, Bangladesh',
    description: `• Deployed domain-adapted conversational AI copilot and recommendation systems, enhancing client user engagement by 48%.
• Implemented automated model observability, data drift alerts, and CI/CD validation gates in PyTorch, reducing deployment downtime by 40%.`
  }
];

/**
 * Structured Baseline Key Projects Array
 */
export const initialProjects = [
  {
    id: 'proj-1',
    title: 'GuardianML — Real-Time Transaction Anomaly Detector',
    techStack: 'PyTorch, FastAPI, Redis, Kafka, Docker',
    link: 'https://github.com/mohammad-alamin/guardian-ml',
    description: `• Engineered an event-driven anomaly detector processing streaming fintech transaction logs with 99.4% precision.
• Built explainable AI dashboards using SHAP & LIME to provide audit-ready justifications for flagged transactions.`
  },
  {
    id: 'proj-2',
    title: 'NextGen Job Scraper & Scam Verifier',
    techStack: 'Python, BeautifulSoup, Tavily API, OpenAI GPT-4o, React',
    link: 'https://github.com/mohammad-alamin/job-verifier',
    description: `• Created an autonomous multi-source job intelligence crawler cross-referencing ghost postings against national company registries.
• Reduced applicant exposure to fraudulent recruitment operations by over 85% across South Asian job portals.`
  }
];

/**
 * Formats an array of structured experience objects into standard resume text blocks
 */
export const formatExperienceToString = (list) => {
  if (!Array.isArray(list)) return typeof list === 'string' ? list : '';
  return list.map((item) => {
    const header = [item.role, item.company, item.duration, item.location].filter(Boolean).join(' | ');
    const desc = item.description || '';
    return header ? `${header}\n${desc}`.trim() : desc.trim();
  }).filter(Boolean).join('\n\n');
};

/**
 * Formats an array of structured project objects into standard resume text blocks
 */
export const formatProjectsToString = (list) => {
  if (!Array.isArray(list)) return typeof list === 'string' ? list : '';
  return list.map((item) => {
    const parts = [];
    if (item.title) parts.push(item.title);
    if (item.techStack) parts.push(`Stack: ${item.techStack}`);
    if (item.link) parts.push(item.link);
    const header = parts.join(' | ');
    const desc = item.description || '';
    return header ? `${header}\n${desc}`.trim() : desc.trim();
  }).filter(Boolean).join('\n\n');
};

/**
 * Parses freeform experience string blocks into structured experience objects
 */
export const parseExperienceFromString = (text) => {
  if (Array.isArray(text)) return text;
  if (!text || typeof text !== 'string') return [];
  const blocks = text.trim().split(/\n\s*\n+/).filter(Boolean);
  return blocks.map((block, idx) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const headerLine = lines[0] || '';
    const parts = headerLine.split('|').map((p) => p.trim());
    return {
      id: `exp-${Date.now()}-${idx}`,
      role: parts[0] || '',
      company: parts[1] || '',
      duration: parts[2] || '',
      location: parts[3] || '',
      description: lines.slice(1).join('\n')
    };
  });
};

/**
 * Parses freeform projects string blocks into structured project objects
 */
export const parseProjectsFromString = (text) => {
  if (Array.isArray(text)) return text;
  if (!text || typeof text !== 'string') return [];
  const blocks = text.trim().split(/\n\s*\n+/).filter(Boolean);
  return blocks.map((block, idx) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const headerLine = lines[0] || '';
    const parts = headerLine.split('|').map((p) => p.trim());
    const title = parts[0] || '';
    let techStack = '';
    let link = '';
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.toLowerCase().startsWith('stack:')) {
        techStack = part.replace(/^stack:\s*/i, '').trim();
      } else if (part.startsWith('http') || part.includes('github') || part.includes('.com')) {
        link = part.trim();
      } else if (!techStack) {
        techStack = part.trim();
      }
    }
    return {
      id: `proj-${Date.now()}-${idx}`,
      title,
      techStack,
      link,
      description: lines.slice(1).join('\n')
    };
  });
};

/**
 * Professional Baseline CV Data Schema with Multi-Level Education Support
 */
export const initialCvData = {
  fullName: 'Mohammad Al-Amin',
  targetRole: 'Senior AI / Machine Learning Engineer',
  email: 'mohammad.alamin.ai@example.com',
  phone: '+880 1712 345678',
  location: 'Dhaka, Bangladesh',
  linkedin: 'https://linkedin.com/in/mohammad-alamin-ai',
  github: 'https://github.com/mohammad-alamin',
  portfolio: 'https://alamin-ai.dev',
  summary:
    'Results-driven Machine Learning Engineer with 3+ years of experience designing, fine-tuning, and deploying high-throughput neural architectures, real-time fraud detection systems, and LLM-powered enterprise workflows. Proficient in PyTorch, distributed training, FastAPI microservices, and end-to-end MLOps pipelines.',
  skills:
    'Python, PyTorch, TensorFlow, FastAPI, Scikit-Learn, Hugging Face Transformers, Docker, Kubernetes, AWS SageMaker, PostgreSQL, LangChain, Vector DBs (Qdrant)',
  experience: initialExperience,
  projects: initialProjects,
  education: [
    {
      id: 'edu-1',
      level: "B.Sc. / Bachelor's (Honours)",
      major: 'Computer Science and Engineering',
      institution: 'Leading University',
      year: '2020 - 2024',
      grade: 'CGPA: 3.88 / 4.00'
    },
    {
      id: 'edu-2',
      level: 'HSC / Alim / Equivalent',
      major: 'Science',
      institution: 'Sylhet Govt. College',
      year: '2019',
      grade: 'GPA: 5.00 / 5.00'
    },
    {
      id: 'edu-3',
      level: 'SSC / Dakhil / Equivalent',
      major: 'Science',
      institution: 'Sylhet Govt. Pilot High School',
      year: '2017',
      grade: 'GPA: 5.00 / 5.00'
    }
  ],
  certifications: `AWS Certified Machine Learning – Specialty (2024)
DeepLearning.AI — Deep Learning & Generative AI Specialization (2023)
Stanford Online — Machine Learning Systems Engineering (2023)`,
  rawText: ''
};

/**
 * 10-Point Enterprise Job Filter Baseline
 */
export const initialJobFilters = {
  region: 'Asia',
  country: 'Bangladesh',
  state: 'Dhaka Division',
  city: 'Dhaka',
  jobType: 'All',
  employment: 'All',
  experience: 'All',
  industry: 'IT & Software',
  salary: 'Any Salary',
  workAuth: 'Any'
};

/**
 * Authentic Baseline Discovered Jobs for Live Jobs & ML Guard Feed
 */
export const initialLiveJobs = [
  {
    id: 'job-live-1',
    title: 'Senior Machine Learning & Systems Engineer',
    company: 'Brain Station 23',
    location: 'Dhaka, Bangladesh',
    salary: 'BDT 160,000 – 240,000 / mo',
    jobType: 'Full-time • Hybrid',
    postedAt: '3 hours ago',
    source: 'Corporate Careers',
    applyUrl: 'https://brainstation-23.com/careers',
    cvMatchScore: 96,
    fraudProbability: 4,
    safetyStatus: 'safe',
    riskSignals: [
      { type: 'trust', text: 'Verified corporate domain (brainstation-23.com)' },
      { type: 'trust', text: 'Physical office registered at Mohakhali C/A, Dhaka' },
      { type: 'trust', text: 'Salary aligned with South Asian senior engineering benchmarks' },
      { type: 'trust', text: 'Clear technical requirements (PyTorch, FastAPI, Docker, Kubernetes)' }
    ],
    description: 'We are seeking an experienced ML Engineer to design and deploy real-time low-latency financial fraud detection and recommendation models. The role involves managing distributed PyTorch pipelines and deploying on Triton/Kubernetes.'
  },
  {
    id: 'job-live-2',
    title: 'Lead AI Platform Architect',
    company: 'bKash Limited',
    location: 'Dhaka, Bangladesh',
    salary: 'BDT 190,000 – 320,000 / mo',
    jobType: 'Full-time • On-site',
    postedAt: '1 day ago',
    source: 'LinkedIn Talent',
    applyUrl: 'https://bkash.com/career',
    cvMatchScore: 92,
    fraudProbability: 2,
    safetyStatus: 'safe',
    riskSignals: [
      { type: 'trust', text: 'Tier-1 regulated financial institution' },
      { type: 'trust', text: 'Official enterprise recruiting portal' },
      { type: 'trust', text: 'Standard multi-stage technical and behavioral review' }
    ],
    description: 'Lead the next generation of scalable AI microservices for Bangladesh\'s largest MFS platform. You will spearhead high-throughput transaction anomaly modeling and mentor junior data science squads.'
  },
  {
    id: 'job-live-3',
    title: 'Remote Data Entry & Form Filling (Registration Fee Mandatory)',
    company: 'Online Freelance Direct Network',
    location: 'Remote / Telegram Only',
    salary: 'BDT 90,000 – 150,000 / week',
    jobType: 'Part-time • Remote',
    postedAt: '4 hours ago',
    source: 'Telegram Channel',
    applyUrl: 'https://t.me/freelance_fast_cash_bd',
    cvMatchScore: 34,
    fraudProbability: 88,
    safetyStatus: 'scam',
    riskSignals: [
      { type: 'risk', text: 'Severe Red Flag: Candidate required to pay refundable registration & software activation fee ($25 / BDT 3,000)' },
      { type: 'risk', text: 'Recruiter communication restricted exclusively to Telegram channel' },
      { type: 'risk', text: 'Unrealistic compensation (BDT 150,000/week for basic data entry without technical prerequisites)' },
      { type: 'risk', text: 'Anonymous organization with zero registered corporate records or physical presence' }
    ],
    description: 'URGENT HIRING: Earn up to 150K weekly from home! Simple copy paste and form submission work. No technical experience required. To activate assignment software, candidate must send 3000 BDT security deposit via bKash/Nagad.'
  },
  {
    id: 'job-live-4',
    title: 'Data & Computer Vision Engineer',
    company: 'ShopUp Labs',
    location: 'Dhaka, Bangladesh',
    salary: 'BDT 140,000 – 220,000 / mo',
    jobType: 'Full-time • Hybrid',
    postedAt: '2 days ago',
    source: 'Bdjobs Verified',
    applyUrl: 'https://shopup.com.bd',
    cvMatchScore: 89,
    fraudProbability: 6,
    safetyStatus: 'safe',
    riskSignals: [
      { type: 'trust', text: 'Verified logistics enterprise with active venture backing' },
      { type: 'trust', text: 'Published LinkedIn employee roster (>500 staff)' },
      { type: 'trust', text: 'Standard corporate interview process without fee requests' }
    ],
    description: 'Seeking a CV & deep learning specialist to automate warehouse package scanning and route optimization algorithms utilizing OpenCV and YOLO.'
  },
  {
    id: 'job-live-5',
    title: 'Global AI Model Evaluator ($500/Day via WhatsApp)',
    company: 'International Data Talent Inc',
    location: 'Remote / Global',
    salary: '$3,500 / week',
    jobType: 'Contract • Remote',
    postedAt: '6 hours ago',
    source: 'WhatsApp Invite',
    applyUrl: 'https://wa.me/message/FAKEJOBSCAMP9',
    cvMatchScore: 42,
    fraudProbability: 92,
    safetyStatus: 'scam',
    riskSignals: [
      { type: 'risk', text: 'Unsolicited WhatsApp recruiter outreach from non-business phone number' },
      { type: 'risk', text: 'Free webmail contact address (talent_recruit_global24@gmail.com)' },
      { type: 'risk', text: 'Promises $500 daily for clicking tasks without formal contract' },
      { type: 'risk', text: 'Demands cryptocurrency wallet connection for task settlement' }
    ],
    description: 'Work from home 2 hours daily evaluating AI responses. Immediate payment $500/day. Message our hiring manager directly on WhatsApp. Complete 3 trial tasks to receive your first payout.'
  },
  {
    id: 'job-live-6',
    title: 'Applied AI & Python Developer',
    company: 'Optimizely Asia Tech Hub',
    location: 'Dhaka, Bangladesh',
    salary: 'BDT 150,000 – 260,000 / mo',
    jobType: 'Full-time • Hybrid',
    postedAt: '3 days ago',
    source: 'Greenhouse Board',
    applyUrl: 'https://boards.greenhouse.io/optimizely',
    cvMatchScore: 94,
    fraudProbability: 3,
    safetyStatus: 'safe',
    riskSignals: [
      { type: 'trust', text: 'Public SaaS company with global enterprise presence' },
      { type: 'trust', text: 'Official Greenhouse applicant tracking system link' },
      { type: 'trust', text: 'Competitive health insurance, provident fund, and stock options' }
    ],
    description: 'Build enterprise experimentation and personalization engines using Python, FastAPI, and AWS. Ideal for engineers with experience in high-concurrency microservices and real-time experimentation.'
  }
];

/**
 * Baseline Audit & Scan History for ML Fraud Guard
 */
export const initialFraudScanHistory = [
  {
    id: 'scan-1',
    jobTitle: 'Remote Data Entry & Form Filling',
    company: 'Online Freelance Direct Network',
    offeredSalary: 'BDT 90,000 – 150,000 / week',
    recruiterContact: 't.me/freelance_fast_cash_bd',
    timestamp: 'Today at 01:15 AM',
    fraudProbability: 88,
    safetyStatus: 'scam',
    confidence: 94,
    verdictSummary: 'High probability of fraudulent recruitment. The listing requests upfront payments for software activation and directs communication to a Telegram group.',
    signals: [
      { type: 'risk', text: 'Upfront registration fee demanded via mobile financial services' },
      { type: 'risk', text: 'Telegram redirect channel with anonymous administrators' },
      { type: 'risk', text: 'Compensation deviates 450% above regional market median' }
    ]
  },
  {
    id: 'scan-2',
    jobTitle: 'Senior Machine Learning & Systems Engineer',
    company: 'Brain Station 23',
    offeredSalary: 'BDT 160,000 – 240,000 / mo',
    recruiterContact: 'hr@brainstation-23.com',
    timestamp: 'Yesterday at 04:30 PM',
    fraudProbability: 4,
    safetyStatus: 'safe',
    confidence: 97,
    verdictSummary: 'Verified authentic corporate listing. Organization has established registered legal entity, corporate domain email, and realistic compensation.',
    signals: [
      { type: 'trust', text: 'Official corporate domain email (@brainstation-23.com)' },
      { type: 'trust', text: 'Registered enterprise headquarters in Mohakhali, Dhaka' },
      { type: 'trust', text: 'No upfront fee requests or informal communication channels' }
    ]
  }
];

export const CareerContext = createContext(null);

export const CareerProvider = ({ children }) => {
  // Shared app states
  const [cvData, setCvData] = useState(initialCvData);
  const [uploadedFile, setUploadedFile] = useState(null); // { name: string, type: string, url: string, rawText: string } | null
  const [careerTrajectories, setCareerTrajectories] = useState(null);
  const [jobFilters, setJobFilters] = useState(initialJobFilters);
  const [selectedJob, setSelectedJob] = useState(null);
  const [roadmapSteps, setRoadmapSteps] = useState([]);
  const [applicationDrafts, setApplicationDrafts] = useState([]);

  // Live Jobs & ML Scam Guard States
  const [liveJobs, setLiveJobs] = useState(initialLiveJobs);
  const [fraudScanHistory, setFraudScanHistory] = useState(initialFraudScanHistory);
  const [scamStats, setScamStats] = useState({
    verifiedCount: 142,
    blockedCount: 3,
    totalScanned: 14
  });

  // Save a job directly into the Applications Tracker
  const saveJobToApplications = (job) => {
    if (!job) return;
    const alreadySaved = applicationDrafts.some(
      (app) => app.jobId === job.id || (app.title === job.title && app.company === job.company)
    );
    if (alreadySaved) {
      return false;
    }

    const newApp = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      status: 'Draft',
      appliedDate: new Date().toISOString().split('T')[0],
      source: job.source || 'Live Jobs',
      applyUrl: job.applyUrl || '',
      matchScore: job.cvMatchScore || 85
    };

    setApplicationDrafts((prev) => [newApp, ...prev]);
    return true;
  };

  const isJobSaved = (jobId) => {
    return applicationDrafts.some((app) => app.jobId === jobId);
  };

  // Add a newly verified fraud scan result
  const addFraudScanResult = (result) => {
    if (!result) return;
    setFraudScanHistory((prev) => [result, ...prev]);
    setScamStats((prev) => ({
      ...prev,
      totalScanned: prev.totalScanned + 1,
      blockedCount: result.safetyStatus === 'scam' || result.safetyStatus === 'warning' ? prev.blockedCount + 1 : prev.blockedCount,
      verifiedCount: result.safetyStatus === 'safe' ? prev.verifiedCount + 1 : prev.verifiedCount
    }));
  };

  // Universal Multi-Sector AI CV Analysis & Optimization states
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('general'); // 'general' | 'jd_match'
  const [targetSector, setTargetSector] = useState('IT & Software');
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  // Dynamic CV Versioning to automatically invalidate stale caches
  const [cvVersion, setCvVersion] = useState(Date.now());

  // Invalidate stale career trajectories and CV audit caches
  const invalidateCvCaches = () => {
    setCareerTrajectories(null);
    setCvAnalysis(null);
    setCvVersion(Date.now());
  };

  // Helper method to safely update any top-level key of cvData
  const updateCvField = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      [field]: value
    }));
    invalidateCvCaches();
  };

  // One-click apply solution directly to CV section (summary, experience, projects, skills)
  const applyCvSolution = ({ section, replacementText }) => {
    if (!section || replacementText === undefined) return;
    setCvData((prev) => {
      if (section === 'experience') {
        const parsed = parseExperienceFromString(replacementText);
        return {
          ...prev,
          experience: parsed.length > 0 ? parsed : prev.experience
        };
      }
      if (section === 'projects') {
        const parsed = parseProjectsFromString(replacementText);
        return {
          ...prev,
          projects: parsed.length > 0 ? parsed : prev.projects
        };
      }
      return {
        ...prev,
        [section]: replacementText
      };
    });
    invalidateCvCaches();
  };

  // Add missing critical skill directly to CV skills list
  const addSkillToCv = (newSkill) => {
    if (!newSkill || typeof newSkill !== 'string') return;
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    setCvData((prev) => {
      const currentSkills = typeof prev.skills === 'string'
        ? prev.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : Array.isArray(prev.skills)
        ? [...prev.skills]
        : [];

      // Avoid case-insensitive duplicate
      const alreadyExists = currentSkills.some(
        (s) => s.toLowerCase() === trimmed.toLowerCase()
      );
      if (alreadyExists) return prev;

      const updatedSkills = [...currentSkills, trimmed].join(', ');
      return {
        ...prev,
        skills: updatedSkills
      };
    });
    invalidateCvCaches();
  };

  const resetCvData = () => {
    setCvData(initialCvData);
    setUploadedFile(null);
    setCvAnalysis(null);
    setCareerTrajectories(null);
    setCvVersion(Date.now());
  };

  // Helper method to update job filters with intelligent geographic cascading
  const updateFilter = (key, value) => {
    setJobFilters((prev) => {
      if (key === 'region') {
        const { country, state, city } = getDefaultGeoForRegion(value);
        return {
          ...prev,
          region: value,
          country,
          state,
          city
        };
      }

      if (key === 'country') {
        const states = getStatesForCountry(prev.region, value);
        const newState = states[0] || '';
        const cities = getCitiesForState(prev.region, value, newState);
        const newCity = cities[0] || '';
        return {
          ...prev,
          country: value,
          state: newState,
          city: newCity
        };
      }

      if (key === 'state') {
        const cities = getCitiesForState(prev.region, prev.country, value);
        const newCity = cities[0] || '';
        return {
          ...prev,
          state: value,
          city: newCity
        };
      }

      return {
        ...prev,
        [key]: value
      };
    });
  };

  const resetFilters = () => {
    setJobFilters(initialJobFilters);
  };

  const value = {
    // Complete CV State & handlers
    cvData,
    setCvData,
    updateCvField,
    applyCvSolution,
    addSkillToCv,
    resetCvData,

    // Dynamic CV Versioning & Cache Invalidation
    cvVersion,
    setCvVersion,
    invalidateCvCaches,

    // Uploaded Original Document State
    uploadedFile,
    setUploadedFile,

    // Dynamic Career Trajectories (with careerPaths alias)
    careerTrajectories,
    setCareerTrajectories,
    careerPaths: careerTrajectories,
    setCareerPaths: setCareerTrajectories,

    // Dynamic Multi-Entry Experience & Project Formatters
    formatExperienceToString,
    formatProjectsToString,
    parseExperienceFromString,
    parseProjectsFromString,

    // Universal Multi-Sector AI CV Analysis & Optimization State
    cvAnalysis,
    setCvAnalysis,
    analysisMode,
    setAnalysisMode,
    targetSector,
    setTargetSector,
    jobDescriptionText,
    setJobDescriptionText,

    // Enterprise 10-Point Job Filters
    jobFilters,
    setJobFilters,
    updateFilter,
    resetFilters,

    // Backward-compatibility aliases for existing components
    selectedRegion: jobFilters.region,
    selectedCountry: jobFilters.country,
    setSelectedRegion: (r) => updateFilter('region', r),
    setSelectedCountry: (c) => updateFilter('country', c),

    // Job selection & Radar
    selectedJob,
    setSelectedJob,

    // Roadmap & Steps
    roadmapSteps,
    setRoadmapSteps,

    // Live Jobs & ML Scam Guard
    liveJobs,
    setLiveJobs,
    fraudScanHistory,
    setFraudScanHistory,
    scamStats,
    setScamStats,
    saveJobToApplications,
    isJobSaved,
    addFraudScanResult,

    // Application & Cover letter drafts
    applicationDrafts,
    setApplicationDrafts
  };

  return (
    <CareerContext.Provider value={value}>
      {children}
    </CareerContext.Provider>
  );
};

export const useCareerContext = () => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareerContext must be used within a CareerProvider');
  }
  return context;
};

// Ergonomic alias
export const useCareer = useCareerContext;

export default CareerContext;
