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
