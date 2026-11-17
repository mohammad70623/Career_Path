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
  experience: `Lead Machine Learning Engineer | NeuralFin Intelligence Labs | 2023 - Present | Dhaka, Bangladesh
• Architected end-to-end real-time fraud risk classification platform processing 150,000+ daily financial events at sub-40ms P99 latency.
• Engineered generative synthetic anomaly pipelines utilizing contrastive loss, accelerating rare-fraud recall from 76% to 95.4%.
• Spearheaded Triton inference optimizations on Kubernetes auto-scaling clusters, achieving 34% reduction in GPU infrastructure costs.

Senior AI & Data Systems Engineer | Quantum Analytics Asia | 2021 - 2023 | Dhaka, Bangladesh
• Deployed domain-adapted conversational AI copilot and recommendation systems, enhancing client user engagement by 48%.
• Implemented automated model observability, data drift alerts, and CI/CD validation gates in PyTorch, reducing deployment downtime by 40%.`,
  projects: `GuardianML — Real-Time Transaction Anomaly Detector | Stack: PyTorch, FastAPI, Redis, Kafka, Docker
• Engineered an event-driven anomaly detector processing streaming fintech transaction logs with 99.4% precision.
• Built explainable AI dashboards using SHAP & LIME to provide audit-ready justifications for flagged transactions.

NextGen Job Scraper & Scam Verifier | Stack: Python, BeautifulSoup, Tavily API, OpenAI GPT-4o, React
• Created an autonomous multi-source job intelligence crawler cross-referencing ghost postings against national company registries.
• Reduced applicant exposure to fraudulent recruitment operations by over 85% across South Asian job portals.`,
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
Stanford Online — Machine Learning Systems Engineering (2023)`
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
  const [jobFilters, setJobFilters] = useState(initialJobFilters);
  const [selectedJob, setSelectedJob] = useState(null);
  const [roadmapSteps, setRoadmapSteps] = useState([]);
  const [applicationDrafts, setApplicationDrafts] = useState([]);

  // Universal Multi-Sector AI CV Analysis & Optimization states
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('general'); // 'general' | 'jd_match'
  const [targetSector, setTargetSector] = useState('IT & Software');
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  // Helper method to safely update any top-level key of cvData
  const updateCvField = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // One-click apply solution directly to CV section (summary, experience, projects, skills)
  const applyCvSolution = ({ section, replacementText }) => {
    if (!section || replacementText === undefined) return;
    setCvData((prev) => ({
      ...prev,
      [section]: replacementText
    }));
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
  };

  const resetCvData = () => {
    setCvData(initialCvData);
    setCvAnalysis(null);
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
