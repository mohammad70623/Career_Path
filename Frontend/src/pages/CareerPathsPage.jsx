import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { useCareer } from '../context/CareerContext';
import { GlobalFilterBar } from '../components/GlobalFilterBar';

export const CareerPathsPage = () => {
  const navigate = useNavigate();
  const { cvData, jobFilters } = useCareer();

  // Dynamic career paths tailored to active jobFilters
  const careerPaths = [
    {
      id: 'path-1',
      title: 'AI / Machine Learning Engineer',
      matchScore: 92,
      tier: 'Primary Strong Match',
      growthRate: '+38% YoY Demand',
      avgSalary: jobFilters.salary !== 'Any Salary' ? jobFilters.salary : '$2,500 – $6,000 / mo',
      locationDemand: `High Demand in ${jobFilters.city}, ${jobFilters.country}`,
      description:
        'Architect, optimize, and deploy high-throughput deep neural networks, transformer inference services, and automated fraud classification pipelines.',
      matchedSkills: ['Python', 'PyTorch', 'FastAPI', 'Scikit-Learn', 'Docker', 'PostgreSQL'],
      missingSkills: ['TensorRT Inference', 'MLOps (Kubeflow)', 'Distributed Ray', 'Triton Server'],
      marketInsights: `${jobFilters.city} ecosystem is accelerating AI adoption for fraud prevention and predictive customer scoring.`
    },
    {
      id: 'path-2',
      title: 'Full-Stack Developer & Systems Architect',
      matchScore: 87,
      tier: 'Secondary Transferable Match',
      growthRate: '+29% YoY Demand',
      avgSalary: jobFilters.salary !== 'Any Salary' ? jobFilters.salary : '$1,800 – $4,500 / mo',
      locationDemand: `Strong Demand across ${jobFilters.state}`,
      description:
        'Engineer responsive frontend clients and resilient microservices with unified state synchronization and secure REST/gRPC interfaces.',
      matchedSkills: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      missingSkills: ['Next.js 15 (App Router)', 'GraphQL', 'Redis Caching', 'CI/CD Pipelines'],
      marketInsights: `High volume of remote and hybrid engineering positions open in ${jobFilters.country}.`
    },
    {
      id: 'path-3',
      title: 'Data Analyst & BI Specialist',
      matchScore: 81,
      tier: 'Analytical Core Match',
      growthRate: '+22% YoY Demand',
      avgSalary: jobFilters.salary !== 'Any Salary' ? jobFilters.salary : '$1,200 – $3,200 / mo',
      locationDemand: `Steady Demand in ${jobFilters.region}`,
      description:
        'Extract actionable intelligence from large-scale database stores, engineer automated KPI dashboards, and deliver statistical decision models.',
      matchedSkills: ['Python', 'PostgreSQL', 'Scikit-Learn'],
      missingSkills: ['Tableau / PowerBI', 'dbt (Data Build Tool)', 'Snowflake', 'Advanced SQL Windowing'],
      marketInsights: `FinTech and enterprise data operations require local audit compliance and regulatory reporting in ${jobFilters.city}.`
    }
  ];

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
            Cross-analyzing candidate competency vector against live market demand across{' '}
            <strong className="text-base-content">
              {jobFilters.city}, {jobFilters.country}
            </strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-base-300 bg-base-100 text-xs font-semibold text-primary shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Vector Matcher Active</span>
        </div>
      </div>

      {/* Global Filter Bar (10-Point Parameter Ribbon) */}
      <GlobalFilterBar />

      {/* Profile Vector Summary Banner */}
      <div className="p-4 rounded-2xl bg-base-100 border border-base-300 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-sm shadow-xs">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">
                {cvData.fullName || 'Candidate'}
              </span>
              <span className="text-xs text-base-content/60">
                • {cvData.targetRole}
              </span>
            </div>
            <p className="text-xs text-base-content/70 mt-0.5">
              3 high-probability trajectories discovered for <span className="font-semibold text-base-content">{jobFilters.city}, {jobFilters.country}</span> in <span className="font-semibold text-base-content">{jobFilters.industry}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => navigate('/skill-gap')}
            className="btn btn-sm btn-outline border-base-300 text-primary hover:bg-primary hover:text-primary-content gap-1.5"
          >
            <span>Analyze Skill Gap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Career Path Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {careerPaths.map((path) => (
          <div
            key={path.id}
            className="card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm hover:border-base-content/30 transition-all duration-200"
          >
            {/* Card Header: Role Title, Match Badge, and Salary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-300/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{path.matchScore}% Match</span>
                  </span>
                  <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                    {path.tier}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-primary tracking-tight">
                  {path.title}
                </h2>
              </div>

              {/* Compensation & Growth Badges */}
              <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1">
                <span className="text-sm font-bold text-primary">
                  {path.avgSalary}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {path.growthRate}
                </span>
              </div>
            </div>

            {/* Description & Location Demand Tag */}
            <div className="py-4 space-y-3">
              <p className="text-sm text-base-content/80 leading-relaxed max-w-4xl">
                {path.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-primary font-medium bg-base-200/90 px-2.5 py-1 rounded-md border border-base-300/60">
                  <Building2 className="w-3.5 h-3.5 text-secondary" />
                  <span>{path.locationDemand}</span>
                </span>
                <span className="text-base-content/60 italic">
                  — {path.marketInsights}
                </span>
              </div>
            </div>

            {/* Competency Vector: Matched vs Missing Skills */}
            <div className="pt-4 border-t border-base-300/80 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  <span>Verified Competencies (Already Matched)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {path.matchedSkills.map((skill, idx) => (
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
                  {path.missingSkills.map((skill, idx) => (
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

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-base-300/60 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-base-content/60">
                Mode: <strong className="text-base-content">{jobFilters.jobType}</strong> • Auth:{' '}
                <strong className="text-base-content">{jobFilters.workAuth}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleViewSkillGap(path.title)}
                  className="btn btn-sm btn-ghost text-base-content/75 hover:text-base-content hover:bg-base-200"
                >
                  View Roadmap
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
