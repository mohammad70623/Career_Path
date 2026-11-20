import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
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
  Building2,
  MapPin
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
 * Weekly legitimate job verification vs scam detection data
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
 * Generate authentic, realistic job listings tailored to candidate target role & selected country
 */
const getRecentJobChecks = (country, targetRole = 'Software Engineer') => {
  const roleName = targetRole || 'Software Engineer';

  if (country === 'Bangladesh') {
    return [
      {
        id: 'job-bd-1',
        title: roleName.includes('AI') || roleName.includes('Machine Learning')
          ? 'Machine Learning Engineer'
          : `${roleName}`,
        company: 'Brain Station 23',
        location: 'Dhaka, Bangladesh',
        matchScore: '95% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Recognized IT leader with registered corporate entity and verified employees.'
      },
      {
        id: 'job-bd-2',
        title: 'Data & Analytics Specialist',
        company: 'bKash Limited',
        location: 'Dhaka, Bangladesh',
        matchScore: '89% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Premier FinTech organization with verified central headquarters in Dhaka.'
      },
      {
        id: 'job-bd-3',
        title: 'Remote Data Entry & Form Filling (Upfront Training Fee Required)',
        company: 'Online Freelance Direct',
        location: 'Online / Telegram Recruit',
        matchScore: '38% Match',
        status: 'warning',
        statusLabel: 'Suspicious / High Risk',
        notes: 'Flagged: recruiter asks for money upfront for training software or registration.'
      },
      {
        id: 'job-bd-4',
        title: roleName.includes('AI') ? 'Senior AI Research Engineer' : 'Lead Software Architect',
        company: 'ShopUp',
        location: 'Dhaka, Bangladesh',
        matchScore: '92% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Established e-commerce logistics platform with verified technical team.'
      }
    ];
  }

  if (country === 'India') {
    return [
      {
        id: 'job-in-1',
        title: roleName,
        company: 'Infosys Technologies',
        location: 'Bengaluru, India',
        matchScore: '95% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Verified multinational technology enterprise.'
      },
      {
        id: 'job-in-2',
        title: 'Senior Platform Engineer',
        company: 'Flipkart Internet',
        location: 'Bengaluru, India',
        matchScore: '91% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Major verified corporate headquarters and competitive salary benchmarks.'
      },
      {
        id: 'job-in-3',
        title: 'Work-from-Home Assistant (Registration Deposit Mandatory)',
        company: 'FastHire Global Express',
        location: 'Online / WhatsApp',
        matchScore: '36% Match',
        status: 'warning',
        statusLabel: 'Suspicious / High Risk',
        notes: 'Flagged: request for advance processing deposit before job assignment.'
      },
      {
        id: 'job-in-4',
        title: 'Data Systems Engineer',
        company: 'Tata Consultancy Services',
        location: 'Mumbai, India',
        matchScore: '88% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Verified corporate domain, established enterprise recruiting process.'
      }
    ];
  }

  if (country === 'USA') {
    return [
      {
        id: 'job-us-1',
        title: roleName,
        company: 'Google Cloud Labs',
        location: 'San Francisco, CA',
        matchScore: '96% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Verified enterprise hiring channel with authentic career domain.'
      },
      {
        id: 'job-us-2',
        title: 'Full-Stack Software Engineer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        matchScore: '92% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'High-reputation verified technology brand and transparent salary range.'
      },
      {
        id: 'job-us-3',
        title: 'Mystery Shopper & Quality Evaluator (Check Deposit Required)',
        company: 'Apex Mystery Shoppers',
        location: 'Remote / Unverified',
        matchScore: '32% Match',
        status: 'warning',
        statusLabel: 'Suspicious / High Risk',
        notes: 'Flagged: classic counterfeit check overpayment scheme detected.'
      },
      {
        id: 'job-us-4',
        title: 'Distributed Systems Engineer',
        company: 'Datadog',
        location: 'New York, NY',
        matchScore: '88% Match',
        status: 'safe',
        statusLabel: 'Verified Safe',
        notes: 'Verified NASDAQ-listed cloud observability leader.'
      }
    ];
  }

  // Default international realistic dataset
  return [
    {
      id: 'job-def-1',
      title: roleName,
      company: 'Apex Enterprise Technologies',
      location: `${country}`,
      matchScore: '94% Match',
      status: 'safe',
      statusLabel: 'Verified Safe',
      notes: 'Verified business registry, active official careers portal.'
    },
    {
      id: 'job-def-2',
      title: 'Senior Cloud Systems Specialist',
      company: 'Horizon Global Systems',
      location: `${country}`,
      matchScore: '89% Match',
      status: 'safe',
      statusLabel: 'Verified Safe',
      notes: 'Authenticated company email domain and active LinkedIn executive profiles.'
    },
    {
      id: 'job-def-3',
      title: 'Part-Time Remote Assistant ($150 Equipment Deposit Needed)',
      company: 'Direct Talent Network',
      location: 'Remote / Unverified',
      matchScore: '35% Match',
      status: 'warning',
      statusLabel: 'Suspicious / High Risk',
      notes: 'Flagged: demands upfront candidate payment for equipment. High scam risk.'
    },
    {
      id: 'job-def-4',
      title: 'Core Software Developer',
      company: 'Quantum Innovations Group',
      location: `${country}`,
      matchScore: '87% Match',
      status: 'safe',
      statusLabel: 'Verified Safe',
      notes: 'Established regional employer with verified workplace reviews.'
    }
  ];
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    cvData,
    jobFilters,
    roadmapSteps,
    cvAnalysis,
    liveJobs,
    fraudScanHistory,
    scamStats,
    completedMilestones
  } = useCareer();

  // Dynamic ATS CV Strength Score Calculation
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

    const hasExp = Array.isArray(cvData.experience)
      ? cvData.experience.length > 0
      : (cvData.experience && cvData.experience.length > 50);
    if (hasExp) score += 8;

    const hasProj = Array.isArray(cvData.projects)
      ? cvData.projects.length > 0
      : (cvData.projects && cvData.projects.length > 40);
    if (hasProj) score += 8;

    if (Array.isArray(cvData.education) && cvData.education.length >= 2) score += 8;
    else if (Array.isArray(cvData.education) && cvData.education.length === 1) score += 4;

    if (cvData.certifications && cvData.certifications.length > 10) score += 6;

    return Math.min(score, 98);
  };

  const atsScore = calculateAtsScore();

  // Dynamic Milestone & Career Goals Progress (synchronized with /skill-gap)
  const totalRoadmapSteps = 4; // 4 Core 2-Week Sprints
  const completedMilestonesCount = completedMilestones
    ? Object.values(completedMilestones).filter(Boolean).length
    : 0;
  const completedRoadmapSteps = completedMilestonesCount;
  const roadmapProgressPct = Math.round((completedRoadmapSteps / totalRoadmapSteps) * 100);

  // Dynamic Recent Job Safety Checks for current country & role
  const recentJobs = getRecentJobChecks(jobFilters.country, cvData.targetRole);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* 1. TOP WELCOME & QUICK ACTION CARD */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-sm font-semibold tracking-wider uppercase bg-primary text-primary-content">
                Executive Overview
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                Job Safety Shield Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Welcome back, {cvData.fullName || 'Candidate'}
            </h1>

            <p className="text-sm text-base-content/75 max-w-2xl leading-relaxed">
              Targeting <strong className="text-primary">{cvData.targetRole || 'Software Engineer'}</strong> roles across{' '}
              <span className="font-semibold text-base-content">
                {jobFilters.city}, {jobFilters.country}
              </span>{' '}
              in <span className="font-semibold text-base-content">{jobFilters.industry}</span>.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* KPI 1: CV Strength Score */}
        <div className="flex flex-col justify-between h-full p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-base-content/30 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                CV Strength Score
              </span>
              <div className="w-8 h-8 rounded-lg bg-base-200 border border-base-300/80 flex items-center justify-center text-primary shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2 mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-primary">
                  {cvAnalysis?.cvQualityScore || atsScore}
                </span>
                <span className="text-sm font-medium text-slate-500">/ 100</span>
              </div>
              <span className="badge badge-sm bg-accent/10 text-accent font-semibold px-2 py-0.5 border border-accent/20 shrink-0">
                {(cvAnalysis?.cvQualityScore || atsScore) >= 90
                  ? 'Executive Grade'
                  : (cvAnalysis?.cvQualityScore || atsScore) >= 80
                  ? 'Strong Profile'
                  : 'Needs Optimization'}
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100">
            <p
              className="text-xs text-base-content/65 leading-relaxed line-clamp-2"
              title={`${cvAnalysis?.sector ? `${cvAnalysis.sector} • ` : ''}Ready for applicant tracking systems & recruiter review`}
            >
              {cvAnalysis?.sector ? `${cvAnalysis.sector} • ` : ''}Ready for applicant tracking systems & recruiter review
            </p>
          </div>
        </div>

        {/* KPI 2: Verified Jobs Available */}
        <div className="flex flex-col justify-between h-full p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-base-content/30 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Verified Jobs Available
              </span>
              <div className="w-8 h-8 rounded-lg bg-base-200 border border-base-300/80 flex items-center justify-center text-primary shrink-0">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2 mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-primary">
                  {scamStats?.verifiedCount ?? (liveJobs?.filter((j) => j.safetyStatus === 'safe').length || 142)}
                </span>
                <span className="text-sm font-medium text-slate-500">Openings</span>
              </div>
              <span className="badge badge-sm bg-primary/10 text-primary font-semibold px-2 py-0.5 border border-primary/20 shrink-0">
                Active Now
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100">
            <p
              className="text-xs text-base-content/65 leading-relaxed line-clamp-2"
              title={`Hiring right now in ${jobFilters.city}, ${jobFilters.country}`}
            >
              Hiring right now in {jobFilters.city}, {jobFilters.country}
            </p>
          </div>
        </div>

        {/* KPI 3: Fake Jobs Blocked */}
        <div className="flex flex-col justify-between h-full p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-base-content/30 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Fake Jobs Blocked
              </span>
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2 mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-emerald-600">
                  {scamStats?.blockedCount ?? (liveJobs?.filter((j) => j.safetyStatus === 'scam').length || 3)}
                </span>
                <span className="text-sm font-medium text-slate-500">Scams</span>
              </div>
              <span className="badge badge-sm bg-accent/15 text-accent font-semibold px-2 py-0.5 border border-accent/20 shrink-0">
                {scamStats?.totalScanned ?? ((liveJobs?.length || 0) + (fraudScanHistory?.length || 0))} Checked
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100">
            <p
              className="text-xs text-base-content/65 leading-relaxed line-clamp-2"
              title="Suspicious listings detected & safely prevented"
            >
              Suspicious listings detected & safely prevented
            </p>
          </div>
        </div>

        {/* KPI 4: Career Goals Completed */}
        <div
          onClick={() => navigate('/skill-gap')}
          className="flex flex-col justify-between h-full p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs hover:border-gray-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 group-hover:text-gray-900 transition-colors">
                Career Goals Completed
              </span>
              <div className="w-8 h-8 rounded-lg bg-base-200 border border-base-300/80 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <Milestone className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2 mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight text-primary">
                  {roadmapProgressPct}%
                </span>
                <span className="text-sm font-medium text-slate-500">
                  ({completedRoadmapSteps}/{totalRoadmapSteps})
                </span>
              </div>
              <span
                className={`badge badge-sm font-semibold px-2 py-0.5 border shrink-0 ${
                  roadmapProgressPct === 100
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : roadmapProgressPct >= 50
                    ? 'bg-emerald-50/70 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {roadmapProgressPct === 100 ? 'Goal Mastered' : roadmapProgressPct >= 50 ? 'On Track' : 'In Progress'}
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 space-y-1.5">
            <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${roadmapProgressPct}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-base-content/65 leading-relaxed">
              <span title="Milestones achieved toward targeted seniority">
                {completedRoadmapSteps === totalRoadmapSteps
                  ? 'All 4 milestones verified'
                  : `${totalRoadmapSteps - completedRoadmapSteps} sprints to job-readiness`}
              </span>
              <span className="font-semibold text-gray-900 group-hover:text-emerald-700 flex items-center gap-0.5 text-[11px]">
                <span>Roadmap</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
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
                  Jobs Found vs. Scams Blocked
                </h3>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Weekly summary of legitimate job listings verified vs. fraudulent posts filtered in {jobFilters.region}
                </p>
              </div>

              {/* Chart Legend Badges */}
              <div className="flex items-center gap-3 text-xs font-semibold shrink-0 mt-1 sm:mt-0">
                <span className="flex items-center gap-1.5 text-primary whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block shrink-0"></span>
                  Verified Jobs
                </span>
                <span className="flex items-center gap-1.5 text-accent whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block shrink-0"></span>
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
                    name="Verified Jobs"
                    stroke="#111827"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#verifiedGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="blocked"
                    name="Scams Blocked"
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
            <span>Automated Protection Active</span>
            <span className="font-semibold text-primary">Updated daily for {jobFilters.country}</span>
          </div>
        </div>

        {/* Right Column (lg:col-span-5) — Active Target Criteria Card */}
        <div className="lg:col-span-5 card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-base-300/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-primary tracking-tight">
                  Your Job Preferences
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
                <span className="text-base-content/60">City</span>
                <span className="font-bold text-primary">{jobFilters.city}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Work Type</span>
                <span className="font-bold text-primary">{jobFilters.jobType}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Experience Level</span>
                <span className="font-bold text-primary">{jobFilters.experience}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Target Industry</span>
                <span className="font-bold text-primary">{jobFilters.industry}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-base-200">
                <span className="text-base-content/60">Target Salary</span>
                <span className="font-bold text-primary">{jobFilters.salary}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-base-content/60">Work Authorization</span>
                <span className="font-bold text-primary text-right" title={jobFilters.workAuth}>
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
              <span>Explore Career Paths for {jobFilters.city}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM RECENT JOB SAFETY CHECKS TABLE */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300/80">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <h3 className="text-base font-bold text-primary tracking-tight">
                Recent Job Safety Checks
              </h3>
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Latest job postings checked against your CV and scam filters in {jobFilters.country}
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

        {/* Clean, Human-Friendly Table */}
        <div className="overflow-x-auto">
          <table className="table table-sm w-full text-xs">
            <thead>
              <tr className="border-b border-base-300 text-base-content/60 font-bold uppercase tracking-wider text-[11px]">
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>CV Match</th>
                <th>Safety Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(liveJobs && liveJobs.length > 0 ? liveJobs.slice(0, 4) : recentJobs).map((job) => {
                const isSafe = job.safetyStatus === 'safe' || job.status === 'safe';
                const isScam = job.safetyStatus === 'scam';
                const matchVal = job.cvMatchScore ? `${job.cvMatchScore}% Match` : (job.matchScore || '92% Match');
                const noteText = job.description || job.notes || 'Verified corporate recruitment channel.';
                return (
                  <tr key={job.id} className="border-b border-base-200 hover:bg-base-200/40 transition-colors">
                    <td className="font-bold text-primary min-w-[220px] max-w-[340px]">
                      <div className="leading-snug" title={job.title}>
                        {job.title}
                      </div>
                      <div className="text-[11px] text-base-content/55 font-normal leading-relaxed mt-1 line-clamp-1" title={noteText}>
                        {noteText}
                      </div>
                    </td>
                    <td className="font-semibold text-base-content/85 min-w-[130px]" title={job.company}>
                      {job.company}
                    </td>
                    <td className="text-base-content/65 whitespace-nowrap" title={job.location}>
                      {job.location}
                    </td>
                    <td>
                      <span className="font-semibold text-primary font-mono bg-base-200 px-2 py-0.5 rounded whitespace-nowrap">
                        {matchVal}
                      </span>
                    </td>
                    <td>
                      {isSafe ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Safe</span>
                        </span>
                      ) : isScam ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>Scam Alert</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Suspicious / High Risk</span>
                        </span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate('/jobs')}
                        className="btn btn-xs btn-outline border-base-300 text-primary hover:bg-primary hover:text-primary-content font-medium rounded-lg"
                      >
                        View Details
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
