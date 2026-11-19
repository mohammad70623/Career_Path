import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Briefcase,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  BookmarkCheck,
  RefreshCw,
  Sparkles,
  AlertOctagon,
  Eye,
  SlidersHorizontal,
  DollarSign,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCareer } from '../context/CareerContext';
import { MLFraudScannerCard } from '../components/jobs/MLFraudScannerCard';
import { searchLiveJobsWithGuard } from '../services/api';

export const LiveJobsPage = () => {
  const {
    cvData,
    jobFilters,
    updateFilter,
    resetFilters,
    liveJobs,
    setLiveJobs,
    saveJobToApplications,
    isJobSaved,
    scamStats
  } = useCareer();

  const [searchQuery, setSearchQuery] = useState('');
  const [safetyFilter, setSafetyFilter] = useState('all'); // 'all' | 'safe' | 'flagged'
  const [isFetching, setIsFetching] = useState(false);
  const [expandedSignalsJobId, setExpandedSignalsJobId] = useState(null);

  // High Scam Risk Warning Modal State
  const [warningModalJob, setWarningModalJob] = useState(null);

  // Initial load: Fetch live jobs broadly (useFilters = false) if list is empty
  useEffect(() => {
    if (!liveJobs || liveJobs.length === 0) {
      handleFetchLiveJobs(false);
    }
  }, []);

  // Compute live telemetry metrics
  const telemetry = useMemo(() => {
    const total = liveJobs.length;
    const safeCount = liveJobs.filter((j) => j.safetyStatus === 'safe').length;
    const flaggedCount = liveJobs.filter((j) => j.safetyStatus === 'scam' || j.safetyStatus === 'warning').length;
    const totalMatch = liveJobs.reduce((acc, curr) => acc + (curr.cvMatchScore || 80), 0);
    const avgMatch = total > 0 ? Math.round(totalMatch / total) : 92;

    return {
      total,
      safeCount,
      flaggedCount,
      avgMatch
    };
  }, [liveJobs]);

  // Filter jobs by safety status and keyword
  const filteredJobs = useMemo(() => {
    return liveJobs.filter((job) => {
      // Safety Filter
      if (safetyFilter === 'safe' && job.safetyStatus !== 'safe') return false;
      if (safetyFilter === 'flagged' && job.safetyStatus === 'safe') return false;

      // Keyword Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title?.toLowerCase().includes(query);
        const matchesCompany = job.company?.toLowerCase().includes(query);
        const matchesLocation = job.location?.toLowerCase().includes(query);
        const matchesDesc = job.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [liveJobs, safetyFilter, searchQuery]);

  // Re-fetch live jobs using API / Dynamic ML Generator
  const handleFetchLiveJobs = async (useFilters = false) => {
    setIsFetching(true);
    const targetLabel = useFilters
      ? `${jobFilters.industry || cvData.targetRole || 'Engineering'} in ${jobFilters.city || jobFilters.country || 'Global'}`
      : `${cvData.targetRole || 'Engineering'}`;
    const toastId = toast.loading(`Scanning live verified openings for ${targetLabel}...`, { id: 'job-fetch' });

    try {
      const results = await searchLiveJobsWithGuard(cvData, jobFilters, useFilters);
      if (Array.isArray(results) && results.length > 0) {
        setLiveJobs(results);
        toast.success(`Discovered ${results.length} live jobs (${results.filter(j => j.safetyStatus === 'safe').length} verified safe)`, {
          id: toastId,
          icon: '✨'
        });
      } else {
        throw new Error('No jobs returned');
      }
    } catch (error) {
      console.warn('[Fetch Jobs Error]', error.message);
      toast.error('Using current verified listing cache.', { id: toastId });
    } finally {
      setIsFetching(false);
    }
  };

  const toggleSignals = (jobId) => {
    setExpandedSignalsJobId((prev) => (prev === jobId ? null : jobId));
  };

  const handleApplyClick = (job) => {
    if (job.safetyStatus === 'scam') {
      setWarningModalJob(job);
    } else {
      window.open(job.applyUrl || '#', '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirmProceedAnyway = () => {
    if (warningModalJob?.applyUrl) {
      window.open(warningModalJob.applyUrl, '_blank', 'noopener,noreferrer');
    }
    setWarningModalJob(null);
  };

  const handleSaveJob = (job) => {
    const success = saveJobToApplications(job);
    if (success) {
      toast.success(`Saved "${job.title}" to Applications tracker!`, { icon: '💼' });
    } else {
      toast('Job already saved in Applications tracker', { icon: '📌' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 1. TOP TELEMETRY & CONTEXT HEADER */}
      <div className="card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-sm font-semibold tracking-wider uppercase bg-gray-900 text-white">
                Live Jobs & ML Guard
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Tavily Crawl + ML Guard Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Verified Job Radar & Scam Shield
            </h1>

            <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
              Curated openings matching your CV as <strong className="text-gray-900">{cvData.targetRole || 'Software Specialist'}</strong> in{' '}
              <strong className="text-gray-900">{jobFilters.city}, {jobFilters.country}</strong>. All listings are automatically audited against advance-fee scams, telegram redirects, and phantom employers.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleFetchLiveJobs(false)}
              disabled={isFetching}
              className="btn btn-sm bg-gray-900 hover:bg-black text-white rounded-xl px-4 h-10 font-semibold gap-2 shadow-xs transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Fetch Live Verified Jobs</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Discovered Listings
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {telemetry.total} <span className="text-xs font-normal text-gray-500">Jobs</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Safe
            </p>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              {telemetry.safeCount} <span className="text-xs font-normal text-emerald-600/80">Listings</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Scams Flagged
            </p>
            <p className="text-xl font-bold text-rose-700 mt-1">
              {telemetry.flaggedCount} <span className="text-xs font-normal text-rose-600/80">Blocked</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Average CV Match
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {telemetry.avgMatch}% <span className="text-xs font-normal text-gray-500">Fit</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. REFINEMENT & TARGETING FILTERS BAR */}
      <div className="card bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Live Search Targeting & Geographic Filters
            </span>
            <span className="text-[11px] text-gray-500 font-medium hidden md:inline">
              (Directs Tavily crawler & market salary benchmarks)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetFilters();
                handleFetchLiveJobs(false);
              }}
              disabled={isFetching}
              className="btn btn-xs btn-ghost text-gray-600 hover:text-gray-900 text-[11px] gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to All</span>
            </button>

            <button
              type="button"
              onClick={() => handleFetchLiveJobs(true)}
              disabled={isFetching}
              className="btn btn-xs bg-gray-900 hover:bg-black text-white font-semibold rounded-lg px-3.5 h-7 gap-1.5 shadow-2xs transition-all disabled:opacity-60"
            >
              <Filter className="w-3 h-3 text-emerald-400" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          {/* Country */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-600 block">
              Country
            </label>
            <select
              value={jobFilters.country || 'Bangladesh'}
              onChange={(e) => updateFilter('country', e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="Bangladesh">Bangladesh</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="Canada">Canada</option>
              <option value="Singapore">Singapore</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
              <option value="Global">Global / Remote</option>
            </select>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-600 block">
              City / State
            </label>
            <input
              type="text"
              value={jobFilters.city || ''}
              onChange={(e) => updateFilter('city', e.target.value)}
              placeholder="e.g. Dhaka, New York, Berlin"
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Industry / Sector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-600 block">
              Industry Sector
            </label>
            <select
              value={jobFilters.industry || 'IT & Software'}
              onChange={(e) => updateFilter('industry', e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="All">All Sectors</option>
              <option value="IT & Software">IT & Software</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Banking & Finance">Banking & Finance</option>
              <option value="Engineering">Engineering</option>
              <option value="Education">Education</option>
              <option value="Business & Management">Business & Management</option>
              <option value="Research & Science">Research & Science</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
              <option value="Design & Creative">Design & Creative</option>
              <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
            </select>
          </div>

          {/* Job Type / Work Mode */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-600 block">
              Work Mode / Type
            </label>
            <select
              value={jobFilters.jobType || 'All'}
              onChange={(e) => updateFilter('jobType', e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="All">All Modes</option>
              <option value="Full-time • Remote">Remote</option>
              <option value="Full-time • Hybrid">Hybrid</option>
              <option value="Full-time • On-site">On-site</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SAFETY FILTER & KEYWORD CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs">
        {/* Safety Filter Pill Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSafetyFilter('all')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              safetyFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Listings ({liveJobs.length})
          </button>
          <button
            onClick={() => setSafetyFilter('safe')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              safetyFilter === 'safe'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Safe ({telemetry.safeCount})
          </button>
          <button
            onClick={() => setSafetyFilter('flagged')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              safetyFilter === 'flagged'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Flagged / Suspicious ({telemetry.flaggedCount})
          </button>
        </div>

        {/* Keyword Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, company, or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-gray-50/50"
          />
        </div>
      </div>

      {/* 3. MAIN SPLIT LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Verified Job Feed (col-span-7) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              Live Discovery Feed ({filteredJobs.length})
            </h2>
            <span className="text-xs text-gray-500">
              Sorted by CV Match & Safety Score
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                No matching jobs found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try switching the safety filter to "All Listings" or adjusting your search keywords.
              </p>
              <button
                onClick={() => {
                  setSafetyFilter('all');
                  setSearchQuery('');
                }}
                className="btn btn-xs btn-outline border-gray-300 text-gray-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSafe = job.safetyStatus === 'safe';
              const isScam = job.safetyStatus === 'scam';
              const isSignalsExpanded = expandedSignalsJobId === job.id;
              const alreadySaved = isJobSaved(job.id);

              return (
                <div
                  key={job.id}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all ${
                    isScam
                      ? 'border-rose-300/80 hover:border-rose-400'
                      : isSafe
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  {/* Top Card Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {job.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap pt-0.5">
                        <span className="font-semibold text-gray-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {job.postedAt}
                        </span>
                      </div>
                    </div>

                    {/* CV Match & ML Safety Badges */}
                    <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-900 text-white">
                        {job.cvMatchScore}% CV Match
                      </span>

                      {/* Safety Badge */}
                      {isSafe ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Safe • {100 - job.fraudProbability}% Trust</span>
                        </span>
                      ) : isScam ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>Scam Alert • {job.fraudProbability}% Risk</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Caution • {job.fraudProbability}% Risk</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Chips: Salary, Type, Source */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-900 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                      {job.salary}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-600">
                      {job.jobType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium text-gray-500 bg-gray-100">
                      via {job.source}
                    </span>
                  </div>

                  {/* Job Description Snippet */}
                  <p className="text-xs text-gray-600 leading-relaxed mt-2.5 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Expandable ML Risk Signals Drawer */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => toggleSignals(job.id)}
                      className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Inspect ML Risk Signals ({job.riskSignals?.length || 0})</span>
                      {isSignalsExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isSignalsExpanded && (
                      <div className="mt-2.5 p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 animate-fadeIn text-xs">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                          Model Signal Breakdown:
                        </span>
                        <div className="space-y-1.5">
                          {job.riskSignals && job.riskSignals.length > 0 ? (
                            job.riskSignals.map((signal, sIdx) => (
                              <div
                                key={sIdx}
                                className={`flex items-start gap-2 p-2 rounded-lg leading-relaxed ${
                                  signal.type === 'risk'
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {signal.type === 'risk' ? (
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                )}
                                <span>{signal.text}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic">
                              No explicit anomalies identified. Standard corporate listing.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleSaveJob(job)}
                      className={`btn btn-xs rounded-lg gap-1.5 font-semibold transition-all ${
                        alreadySaved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'btn-outline border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {alreadySaved ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Saved in Tracker</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Save to Applications</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyClick(job)}
                      className={`btn btn-xs rounded-lg gap-1 font-semibold transition-all ${
                        isScam
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-gray-900 hover:bg-black text-white'
                      }`}
                    >
                      <span>{isScam ? 'Scam Alert • Review' : 'Apply Externally'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive ML Fraud Scanner Panel (col-span-5) */}
        <div className="xl:col-span-5 xl:sticky xl:top-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              On-Demand Post Auditor
            </h2>
            <span className="text-xs text-gray-500">
              Paste Any External Job
            </span>
          </div>

          <MLFraudScannerCard />
        </div>
      </div>

      {/* 4. SAFETY WARNING MODAL FOR HIGH SCAM RISK POSTS */}
      {warningModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-rose-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="badge badge-sm font-bold bg-rose-600 text-white uppercase tracking-wider">
                  Critical Safety Intercept
                </span>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  High Scam Risk Detected ({warningModalJob.fraudProbability}%)
                </h3>
                <p className="text-xs text-gray-600">
                  ML Guard has flagged <strong>{warningModalJob.company}</strong> as an unverified or potentially fraudulent recruitment listing.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
              <span className="font-bold block">Severe Anomalies Identified:</span>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                {warningModalJob.riskSignals
                  ?.filter((s) => s.type === 'risk')
                  .map((sig, idx) => (
                    <li key={idx}>{sig.text}</li>
                  ))}
              </ul>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 leading-relaxed">
              <strong>Our Recommendation:</strong> Legitimate employers will never demand registration fees, starter kit payments, or direct personal correspondence exclusively to private Telegram channels before formal contracting.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWarningModalJob(null)}
                className="btn btn-sm bg-gray-900 hover:bg-black text-white rounded-xl px-4 font-semibold text-xs"
              >
                Go Back (Recommended)
              </button>

              <button
                type="button"
                onClick={handleConfirmProceedAnyway}
                className="btn btn-sm btn-ghost text-rose-700 hover:bg-rose-50 text-xs font-semibold"
              >
                Proceed Anyway ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveJobsPage;
