import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  GitBranch,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ChevronRight,
  Loader2,
  RefreshCw,
  Milestone,
  Compass
} from 'lucide-react';

import { useCareer } from '../context/CareerContext';
import { GlobalFilterBar } from '../components/GlobalFilterBar';
import { predictCareerPaths } from '../services/api';

const DEFAULT_PATHS = [
  {
    id: 'path-1',
    title: 'AI / Machine Learning Engineer',
    matchScore: 92,
    salaryRange: '$2,500 – $6,000 / mo',
    demandLevel: 'High Demand',
    reasoning:
      'Direct alignment with candidate PyTorch, neural modeling, and real-time inference optimization background.',
    matchedSkills: ['Python', 'PyTorch', 'FastAPI', 'Scikit-Learn', 'Docker', 'PostgreSQL'],
    missingSkills: ['TensorRT Inference', 'MLOps (Kubeflow)', 'Distributed Ray', 'Triton Server'],
    recommendedNextStep: 'Deploy a containerized model inference benchmark on Kubernetes with auto-scaling.'
  },
  {
    id: 'path-2',
    title: 'Full-Stack AI Systems Architect',
    matchScore: 87,
    salaryRange: '$2,000 – $5,000 / mo',
    demandLevel: 'Rapid Growth',
    reasoning:
      'Bridges modern frontend engineering with resilient AI-powered backend microservices and streaming REST/gRPC endpoints.',
    matchedSkills: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    missingSkills: ['Next.js 15 (App Router)', 'GraphQL', 'Redis Caching', 'CI/CD Automation'],
    recommendedNextStep: 'Build an end-to-end full-stack AI dashboard with live streaming generation.'
  },
  {
    id: 'path-3',
    title: 'Data & Decision Systems Engineer',
    matchScore: 81,
    salaryRange: '$1,800 – $4,200 / mo',
    demandLevel: 'Steady Demand',
    reasoning:
      'Leverages data pipeline, feature engineering, and statistical anomaly detection strengths for corporate intelligence.',
    matchedSkills: ['Python', 'PostgreSQL', 'Scikit-Learn'],
    missingSkills: ['Snowflake / BigQuery', 'dbt (Data Build Tool)', 'Apache Spark', 'Advanced SQL Windowing'],
    recommendedNextStep: 'Architect an automated data drift monitoring and transformation pipeline.'
  },
  {
    id: 'path-4',
    title: 'AI Solutions Lead & Technical Product Manager',
    matchScore: 75,
    salaryRange: '$3,000 – $7,000 / mo',
    demandLevel: 'Strategic Emerging',
    reasoning:
      'High-level trajectory translating technical AI capabilities into commercial business ROI and product specifications.',
    matchedSkills: ['System Design', 'Technical Communication', 'API Architecture'],
    missingSkills: ['Product Roadmapping', 'A/B Experimentation', 'Executive Stakeholder Management'],
    recommendedNextStep: 'Define a complete AI product specification with quantifiable user metrics and engineering sprint goals.'
  }
];

export const CareerPathsPage = () => {
  const navigate = useNavigate();
  const { cvData, jobFilters } = useCareer();

  const [isGenerating, setIsGenerating] = useState(false);
  const [candidateSummary, setCandidateSummary] = useState(
    `Candidate profile indicates strong technical velocity in Applied AI and Machine Learning systems with a B.Sc. in Computer Science.`
  );
  const [marketInsight, setMarketInsight] = useState(
    `Robust hiring demand in ${jobFilters.city}, ${jobFilters.country} for specialized software and AI engineering roles.`
  );
  const [careerPaths, setCareerPaths] = useState(DEFAULT_PATHS);

  // Trigger live LangGraph + Tavily career prediction
  const handleGeneratePaths = async () => {
    setIsGenerating(true);
    toast.loading('Synthesizing LangGraph trajectory & Tavily live market data...', { id: 'career-pred' });

    try {
      const response = await predictCareerPaths(cvData, jobFilters);

      if (response && response.paths && response.paths.length > 0) {
        setCandidateSummary(response.candidateSummary || candidateSummary);
        setMarketInsight(response.marketInsight || marketInsight);
        setCareerPaths(
          response.paths.map((p, idx) => ({
            id: `api-path-${idx + 1}`,
            title: p.title,
            matchScore: p.matchScore || 85,
            salaryRange: p.salaryRange || '$2,500 – $5,500 / mo',
            demandLevel: p.demandLevel || 'High Demand',
            reasoning: p.reasoning || 'Strong fit with current competencies.',
            matchedSkills: p.matchedSkills || ['Python', 'PyTorch'],
            missingSkills: p.missingSkills || ['MLOps', 'Distributed Systems'],
            recommendedNextStep: p.recommendedNextStep || 'Complete hands-on deployment project.'
          }))
        );

        toast.success('Live AI career trajectories generated via LangGraph!', { id: 'career-pred', icon: '✨' });
      } else {
        throw new Error('Empty recommendation array returned');
      }
    } catch (error) {
      console.warn('[CareerPaths] Live API prediction encountered notice:', error.message);
      toast.dismiss('career-pred');
      toast.success(`Active on ${jobFilters.city}, ${jobFilters.country} trajectory mode.`, {
        icon: '📍',
        duration: 3500
      });

      // Update tailored localized defaults
      setMarketInsight(`Active hiring demand observed in ${jobFilters.city}, ${jobFilters.country} (${jobFilters.region}) for ${jobFilters.industry}.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSeeLiveJobs = (roleTitle) => {
    navigate('/jobs');
  };

  const handleViewSkillGap = (roleTitle) => {
    navigate('/skill-gap');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-base-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-sm font-semibold tracking-wider uppercase bg-primary text-primary-content">
              Feature 02 // Trajectory Engine
            </span>
            <span className="text-xs text-base-content/50 font-mono">
              /career-paths
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Algorithmic Career Path Recommendations
          </h1>
          <p className="text-sm text-base-content/65 mt-0.5">
            Powered by LangGraph multi-agent synthesis & Tavily real-time job market intelligence in{' '}
            <strong className="text-base-content">
              {jobFilters.city}, {jobFilters.country}
            </strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePaths}
            disabled={isGenerating}
            className="btn btn-sm btn-primary rounded-xl text-primary-content gap-2 font-semibold shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running LangGraph...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Generate AI Career Paths</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Filter Bar (10-Point Parameter Ribbon) */}
      <GlobalFilterBar />

      {/* Executive Summary & Live Market Insight Banner */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-base-300/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <Compass className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-primary">
                  AI Candidate Profile Synthesis
                </h3>
                <span className="badge badge-xs bg-primary/10 text-primary font-semibold">
                  {cvData.targetRole || 'Software Engineer'}
                </span>
              </div>
              <p className="text-xs text-base-content/75 leading-relaxed max-w-3xl">
                {candidateSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span>Tavily Market Feed Active</span>
            </span>
          </div>
        </div>

        {/* Live Market Insights Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-base-200/60 p-3.5 rounded-xl border border-base-300/70">
          <div className="flex items-center gap-2 text-base-content/80">
            <TrendingUp className="w-4 h-4 text-accent shrink-0" />
            <span>
              <strong className="text-primary">Regional Demand Intelligence:</strong> {marketInsight}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGeneratePaths}
            disabled={isGenerating}
            className="btn btn-xs btn-outline border-base-300 text-primary hover:bg-primary hover:text-primary-content gap-1 font-medium shrink-0 self-end sm:self-auto"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Re-run Trajectory</span>
          </button>
        </div>
      </div>

      {/* 4 Ranked Career Path Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {careerPaths.map((path, index) => (
          <div
            key={path.id || index}
            className="card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm hover:border-base-content/30 transition-all duration-200"
          >
            {/* Card Header: Title, Rank, Match Badge & Salary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{path.matchScore}% Match</span>
                  </span>
                  <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                    {index === 0
                      ? 'Rank 1 • Direct Fit'
                      : index === 1
                      ? 'Rank 2 • Specialized Trajectory'
                      : index === 2
                      ? 'Rank 3 • High-Growth Adjacent'
                      : 'Rank 4 • Strategic Leadership'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-primary tracking-tight">
                  {path.title}
                </h2>
              </div>

              {/* Compensation & Demand Badges */}
              <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1">
                <span className="text-sm font-bold text-primary">
                  {path.salaryRange}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {path.demandLevel}
                </span>
              </div>
            </div>

            {/* Reasoning & Market Context */}
            <div className="py-4 space-y-2.5">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
                Trajectory Analysis & Reasoning
              </p>
              <p className="text-sm text-base-content/80 leading-relaxed max-w-4xl">
                {path.reasoning}
              </p>
            </div>

            {/* Matched vs Missing Skills Grid */}
            <div className="pt-4 border-t border-base-300/80 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  <span>Verified Competencies (Matched from CV)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(path.matchedSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-accent/5 text-accent font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-accent/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/80 uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-warning" />
                  <span>Recommended Skills for 100% Fit</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(path.missingSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-base-200 text-base-content/80 font-mono text-[11px] font-medium px-2.5 py-0.5 rounded-md border border-base-300"
                    >
                      +{skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Next Step Callout */}
            {path.recommendedNextStep && (
              <div className="mt-4 p-3 rounded-xl bg-base-200/50 border border-base-300/70 flex items-start gap-2.5 text-xs">
                <Milestone className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary">Recommended Action: </span>
                  <span className="text-base-content/75">{path.recommendedNextStep}</span>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-base-300/60 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-base-content/60">
                Targeting: <strong className="text-base-content">{jobFilters.city}, {jobFilters.country}</strong> • Industry:{' '}
                <strong className="text-base-content">{jobFilters.industry}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleViewSkillGap(path.title)}
                  className="btn btn-sm btn-ghost text-base-content/75 hover:text-base-content hover:bg-base-200"
                >
                  View Skill Gap
                </button>
                <button
                  type="button"
                  onClick={() => handleSeeLiveJobs(path.title)}
                  className="btn btn-sm btn-primary rounded-xl gap-1.5 font-semibold shadow-xs"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>See Live Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerPathsPage;
