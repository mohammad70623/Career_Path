import React, { createContext, useContext, useState } from 'react';

/**
 * Professional Baseline CV Data Schema with Multi-Level Education Support:
 * fullName, targetRole, email, phone, location,
 * linkedin, github, portfolio, summary,
 * skills (comma-separated string),
 * experience (text/bullets),
 * projects (text/bullets),
 * education: Array of { id, level, major, institution, year, grade },
 * certifications (text/bullets)
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

export const CareerContext = createContext(null);

export const CareerProvider = ({ children }) => {
  // Shared app states
  const [cvData, setCvData] = useState(initialCvData);
  const [selectedRegion, setSelectedRegion] = useState('South Asia');
  const [selectedCountry, setSelectedCountry] = useState('Bangladesh');
  const [selectedJob, setSelectedJob] = useState(null);
  const [roadmapSteps, setRoadmapSteps] = useState([]);
  const [applicationDrafts, setApplicationDrafts] = useState([]);

  // Helper method to safely update any top-level key of cvData
  const updateCvField = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetCvData = () => {
    setCvData(initialCvData);
  };

  const value = {
    // Complete CV State & handlers
    cvData,
    setCvData,
    updateCvField,
    resetCvData,

    // Regional & Country selection
    selectedRegion,
    setSelectedRegion,
    selectedCountry,
    setSelectedCountry,

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
