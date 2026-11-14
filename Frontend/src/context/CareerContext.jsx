import React, { createContext, useContext, useState } from 'react';

/**
 * Initial baseline CV Data state matching the required schema:
 * fullName, targetRole, education, skills, experience
 */
const initialCvData = {
  fullName: 'Mohammad Al-Amin',
  targetRole: 'AI / Machine Learning Engineer',
  education: [
    {
      id: 'edu-1',
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'Leading University',
      year: '2020 - 2024',
      details: 'Specialization in Applied AI, Neural Networks & Machine Learning Systems'
    }
  ],
  skills: [
    'Python',
    'PyTorch',
    'FastAPI',
    'Scikit-Learn',
    'React',
    'Docker',
    'PostgreSQL',
    'Tailwind CSS'
  ],
  experience: [
    {
      id: 'exp-1',
      title: 'Machine Learning Engineer Intern',
      company: 'NextGen Intelligent Labs',
      period: '2024 - Present',
      description: 'Built high-throughput text classification and fraud detection models.'
    }
  ]
};

export const CareerContext = createContext(null);

export const CareerProvider = ({ children }) => {
  // Shared app states as required
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
    // CV State
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

// Convenient alias
export const useCareer = useCareerContext;

export default CareerContext;
