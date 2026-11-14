import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  ShieldCheck,
  Milestone,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Building2,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

import { useCareer } from '../context/CareerContext';

/**
 * Weekly ML Verification & Fraud Blocking Dataset
 */
const AUDIT_TREND_DATA = [
  { name: 'Mon', verified: 38, blocked: 4 },
  { name: 'Tue', verified: 52, blocked: 6 },
  { name: 'Wed', verified: 61, blocked: 3 },
  { name: 'Thu', verified: 74, blocked: 7 },
  { name: 'Fri', verified: 92, blocked: 5 },
  { name: 'Sat', verified: 68, blocked: 2 },
  { name: 'Sun', verified: 84, blocked: 4 }
];

/**
 * Recent verified jobs audit feed
 */
const RECENT_AUDITS = [
  {
    id: 'audit-1',
    role: 'Lead AI / MLOps Engineer',
    company: 'Apex FinTech Systems',
    location: 'Dhaka, Bangladesh',
    matchScore: 95,
    verdict: 'Looks legitimate',
    riskLevel: 'low',
    details: 'Verified corporate domain, registered trade license & matching pay benchmark.'
  },
  {
    id: 'audit-2',
    role: 'Staff ML Infrastructure Engineer',
    company: 'Horizon Cloud Labs',
    location: 'Remote (USA / Global)',
    matchScore: 89,
    verdict: 'Looks legitimate',
    riskLevel: 'low',
    details: 'Authenticated GitHub organization & verifiable LinkedIn executive profiles.'
  },
  {
    id: 'audit-3',
    role: 'Crypto Arbitrage Trader & QA Tester',
    company: 'Overseas FastPay Group',
    location: 'Remote / Unverified',
    matchScore: 42,
    verdict: 'Possible risk',
    riskLevel: 'high',
    details: 'Unregistered domain registered 5 days ago; solicits WhatsApp interview & deposit.'
  },
  {
    id: 'audit-4',
    role: 'Computer Vision Research Specialist',
    company: 'DeepSight Imaging',
    location: 'Bengaluru, India',
    matchScore: 86,
    verdict: 'Looks legitimate',
    riskLevel: 'low',
    details: 'Established R&D center with verified patent filings and peer reviews.'
  }
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { cvData, jobFilters, roadmapSteps } = useCareer();

  // Dynamic ATS Score Calculation based on cvData
  const calculateAtsScore = () => {
    let score = 40;
    if (cvData.fullName && cvData.fullName.trim().length > 2) score += 6;
    if (cvData.targetRole && cvData.targetRole.trim().length > 2) score += 6;
    if (cvData.email && cvData.email.includes('@')) score += 6;
    if (cvData.phone && cvData.phone.trim().length > 5) score += 6;
    if (cvData.location && cvData.location.trim().length > 2) score += 4;
    if (cvData.linkedin || cvData.github) score += 6;
    if (cvData.summary && cvData.summary.trim().length > 40) score += 10;

    const skillsCount = typeof cvData.skills === 'string'
      ? cvData.skills.split(',').filter(Boolean).length
      : (Array.isArray(cvData.skills) ? cvData.skills.length : 0);
    if (skillsCount >= 8) score += 8;
    else if (skillsCount >= 4) score += 4;

    if (cvData.experience && cvData.experience.length > 50) score += 8;
    if (cvData.projects && cvData.projects.length > 40) score += 8;

    if (Array.isArray(cvData.education) && cvData.education.length >= 2) score += 8;
    else if (Array.isArray(cvData.education) && cvData.education.length === 1) score += 4;

    if (cvData.certifications && cvData.certifications.length > 10) score += 6;

    return Math.min(score, 98);
  };

  const atsScore = calculateAtsScore();

  // Dynamic Roadmap Steps Progress
  const totalRoadmapSteps = roadmapSteps && roadmapSteps.length > 0 ? roadmapSteps.length : 6;
  const completedRoadmapSteps = roadmapSteps && roadmapSteps.length > 0
    ? roadmapSteps.filter((s) => s.completed).length
    : 4;
  const roadmapProgressPct = Math.round((completedRoadmapSteps / totalRoadmapSteps) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* 1. TOP WELCOME & QUICK ACTION CARD */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-sm font-semibold tracking-wider uppercase bg-primary text-primary-content">
                Command Center
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                ML Guard Operational
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Welcome back, {cvData.fullName || 'Candidate'}
            </h1>

            <p className="text-sm text-base-content/75 max-w-2xl leading-relaxed">
              Targeting <strong className="text-primary">{cvData.targetRole || 'AI / Machine Learning Engineer'}</strong> roles across{' '}
              <span className="font-semibold text-base-content">
                {jobFilters.city}, {jobFilters.country}
              </span>{' '}
              ({jobFilters.region}) in <span className="font-semibold text-base-content">{jobFilters.industry}</span>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/my-cv')}
              className="btn btn-sm btn-outline border-base-300 text-primary hover:bg-base-200 gap-1.5 font-semibold px-4 h-10 shadow-2xs"
            >
              <FileText className="w-4 h-4 text-base-content/70" />
              <span>Edit / Upload CV</span>
            </button>

            <button
              onClick={() => navigate('/jobs')}
              className="btn btn-sm btn-primary rounded-xl text-primary-content gap-2 font-semibold px-4 h-10 shadow-xs"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Live Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: CV ATS Readiness */}
        <div className="card bg-base-100 border border-base-300 rounded-2xl p-5 shadow-2xs hover:border-base-content/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              CV ATS Readiness
            </span>
            <div className="w-8 h-8 rounded-lg bg-base-200 border border-base-300/80 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              {atsScore}
            </span>
            <span className="text-xs font-semibold text-base-content/50">/ 100</span>
            <span className="badge badge-xs bg-accent/10 text-accent font-semibold ml-auto">
              Optimized
            </span>
          </div>
          <p className="text-[11px] text-base-content/60 mt-2 truncate">
            Multi-level academic & skills hierarchy parsed
          </p>
        </div>

        {/* KPI 2: Live Regional Jobs */}
        <div className="card bg-base-100 border border-base-300 rounded-2xl p-5 shadow-2xs hover:border-base-content/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Live Regional Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-base-200 border border-base-300/80 flex items-center justify-center text-primary">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              142
            </span>
            <span className="text-xs font-semibold text-base-content/50">Vacancies</span>
            <span className="badge badge-xs bg-primary/10 text-primary font-semibold ml-auto">
              Tavily Live
            </span>
          </div>
          <p className="text-[11px] text-base-content/60 mt-2 truncate">
            Active in {jobFilters.city}, {jobFilters.country}
          </p>
        </div>

        {/* KPI 3: ML Fraud Guard */}
        <div className="card bg-base-100 border border-base-300 rounded-2xl p-5 shadow-2xs hover:border-base-content/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              ML Fraud Guard
            </span>
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-accent">
              3 Scams
            </span>
            <span className="text-xs font-semibold text-base-content/60">Blocked</span>
            <span className="badge badge-xs bg-accent/15 text-accent font-semibold ml-auto">
              14 Scans
            </span>
          </div>
          <p className="text-[11px] text-base-content/60 mt-2 truncate">
            Sub-40ms heuristic scam classifier
          </p>
        </div>

        {/* KPI 4: Skill Roadmap Progress */}
        <div className="card bg-base-100 border border-base-300 rounded-2xl p-5 shadow-2xs hover:border-base-content/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Roadmap Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-base-200 border border-base-300/80 flex items-center justify-center text-primary">
              <Milestone className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              {roadmapProgressPct}%
            </span>
            <span className="text-xs font-semibold text-base-content/60">
              ({completedRoadmapSteps}/{totalRoadmapSteps})
            </span>
            <span className="badge badge-xs bg-secondary/15 text-secondary font-semibold ml-auto">
              On Track
            </span>
          </div>
          <div className="w-full bg-base-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${roadmapProgressPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SPLIT BENTO GRID (Chart on Left, Criteria on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (lg:col-span-7) — Recharts AreaChart */}
        <div className="lg:col-span-7 card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-base-300/80">
              <div>
                <h3 className="text-base font-bold text-primary tracking-tight">
                  Weekly Verified Jobs vs. Fraud Blocked
                </h3>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Tavily live ingestion vs. ML fraud filter in {jobFilters.region}
                </p>
              </div>

              {/* Chart Legend Badges */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                  Verified Jobs
                </span>
                <span className="flex items-center gap-1.5 text-accent">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
                  Scams Blocked
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={AUDIT_TREND_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="verifiedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '0.75rem',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="verified"
                    name="Verified Vacancies"
                    stroke="#111827"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#verifiedGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="blocked"
                    name="Fraud Flagged"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#blockedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-base-300/80 flex items-center justify-between text-xs text-base-content/60">
            <span>Model Version: ML-Guard-v2.4 (99.2% Accuracy)</span>
            <span className="font-semibold text-primary">Tavily Streaming Active</span>
          </div>
        </div>

        {/* Right Column (lg:col-span-5) — Active Target Criteria Card */}
        <div className="lg:col-span-5 card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-base-300/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-primary tracking-tight">
                  Active Target Criteria
                </h3>
              </div>

              <button
                type="button"
                onClick={() => navigate('/career-paths')}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <span>Adjust Filters</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Parameter Key-Value Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Global Region</span>
                <span className="font-bold text-primary">{jobFilters.region}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Country & State</span>
                <span className="font-bold text-primary">
                  {jobFilters.country} ({jobFilters.state})
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Metropolitan City</span>
                <span className="font-bold text-primary">{jobFilters.city}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Work Mode</span>
                <span className="font-bold text-primary">{jobFilters.jobType}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Seniority Level</span>
                <span className="font-bold text-primary">{jobFilters.experience}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Target Industry</span>
                <span className="font-bold text-primary">{jobFilters.industry}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Salary Expectation</span>
                <span className="font-bold text-primary">{jobFilters.salary}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-base-content/60">Visa / Authorization</span>
                <span className="font-bold text-primary truncate max-w-[180px]">
                  {jobFilters.workAuth}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-base-300/80">
            <button
              onClick={() => navigate('/career-paths')}
              className="btn btn-sm btn-outline border-base-300 w-full text-primary hover:bg-primary hover:text-primary-content rounded-xl font-semibold gap-1.5"
            >
              <span>Explore Trajectories for this Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM RECENT ML + TAVILY AUDITS TABLE */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300/80">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <h3 className="text-base font-bold text-primary tracking-tight">
                Recent ML Guard & Tavily Live Audits
              </h3>
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Live verification stream protecting candidate applications in {jobFilters.country}
            </p>
          </div>

          <button
            onClick={() => navigate('/jobs')}
            className="btn btn-xs btn-outline border-base-300 text-primary hover:bg-primary hover:text-primary-content gap-1 font-semibold rounded-lg self-start sm:self-auto"
          >
            <span>View All Jobs</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="table table-sm w-full text-xs">
            <thead>
              <tr className="border-b border-base-300 text-base-content/60 font-bold uppercase tracking-wider text-[11px]">
                <th>Job Role & Position</th>
                <th>Company Entity</th>
                <th>Location</th>
                <th>Vector Match</th>
                <th>ML Verdict</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_AUDITS.map((item) => {
                const isLegit = item.verdict === 'Looks legitimate';
                return (
                  <tr key={item.id} className="border-b border-base-200 hover:bg-base-200/40 transition-colors">
                    <td className="font-bold text-primary">
                      {item.role}
                    </td>
                    <td className="font-medium text-base-content/80">
                      {item.company}
                    </td>
                    <td className="text-base-content/65">
                      {item.location}
                    </td>
                    <td>
                      <span className="font-semibold text-primary font-mono">
                        {item.matchScore}%
                      </span>
                    </td>
                    <td>
                      {isLegit ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Looks legitimate</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Possible risk</span>
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => navigate('/jobs')}
                        className="btn btn-ghost btn-xs text-primary hover:bg-base-200 font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
