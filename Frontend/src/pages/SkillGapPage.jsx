import React, { useState, useEffect, useMemo } from 'react';
import {
  Milestone,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Plus,
  RefreshCw,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  MapPin,
  ExternalLink,
  Target,
  BarChart3,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCareer } from '../context/CareerContext';
import { MilestoneTimelineCard } from '../components/roadmap/MilestoneTimelineCard';
import { generateSkillGapRoadmap } from '../services/api';

export const SkillGapPage = () => {
  const {
    cvData,
    jobFilters,
    careerPaths,
    selectedRoadmapPath,
    setSelectedRoadmapPath,
    roadmapsByRole,
    setRoadmapsByRole,
    completedMilestones,
    toggleMilestone,
    syncSkillToCV
  } = useCareer();

  const [activeFilterTab, setActiveFilterTab] = useState('all'); // 'all' | 'remaining' | 'completed'
  const [isGenerating, setIsGenerating] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Derive available career paths list
  const availablePaths = useMemo(() => {
    if (careerPaths?.paths && Array.isArray(careerPaths.paths) && careerPaths.paths.length > 0) {
      return careerPaths.paths;
    }
    // Baseline universal career paths if /career-paths hasn't been visited yet
    return [
      {
        rank: 1,
        title: cvData.targetRole || 'Senior Machine Learning & Platform Engineer',
        trackCategory: 'Core Domain Role',
        matchScore: 94,
        salaryRange: jobFilters.country === 'Bangladesh' ? 'BDT 160K – 260K / mo' : '$125,000 – $185,000 / yr',
        demandLevel: 'High Demand / Rapid Growth',
        missingSkills: ['Distributed Training (DeepSpeed / FSDP)', 'Triton Inference Server', 'Qdrant Vector DB', 'Kubernetes HPA']
      },
      {
        rank: 2,
        title: 'Distributed Systems & Cloud Backend Architect',
        trackCategory: 'Adjacent & Interdisciplinary',
        matchScore: 88,
        salaryRange: jobFilters.country === 'Bangladesh' ? 'BDT 140K – 240K / mo' : '$120,000 – $170,000 / yr',
        demandLevel: 'Steady Demand',
        missingSkills: ['Redis Cluster & Sentinel', 'Apache Kafka Streams', 'Terraform Cloud IaC']
      },
      {
        rank: 3,
        title: 'AI Research & Foundation Model Engineer',
        trackCategory: 'Academic & Research Track',
        matchScore: 84,
        salaryRange: jobFilters.country === 'Bangladesh' ? 'BDT 180K – 300K / mo' : '$140,000 – $210,000 / yr',
        demandLevel: 'High Demand',
        missingSkills: ['FlashAttention-2', 'Quantized Model Distillation', 'Contrastive Alignment']
      }
    ];
  }, [careerPaths, cvData.targetRole, jobFilters.country]);

  // Determine currently active role title
  const activeRoleTitle = useMemo(() => {
    if (selectedRoadmapPath) {
      return typeof selectedRoadmapPath === 'object'
        ? (selectedRoadmapPath.title || '')
        : selectedRoadmapPath;
    }
    return availablePaths[0]?.title || cvData.targetRole || 'Senior Machine Learning & Platform Engineer';
  }, [selectedRoadmapPath, availablePaths, cvData.targetRole]);

  // Determine currently active path object
  const activePathObject = useMemo(() => {
    if (typeof selectedRoadmapPath === 'object' && selectedRoadmapPath?.title) {
      return selectedRoadmapPath;
    }
    return (
      availablePaths.find((p) => p.title.toLowerCase() === activeRoleTitle.toLowerCase()) || {
        title: activeRoleTitle,
        trackCategory: 'Custom Target Track',
        matchScore: 90,
        demandLevel: 'High Demand',
        salaryRange: jobFilters.country === 'Bangladesh' ? 'BDT 150K – 250K / mo' : '$110,000 – $175,000 / yr',
        missingSkills: ['Advanced System Design', 'High-Concurrency Scaling', 'Cloud Architecture']
      }
    );
  }, [availablePaths, activeRoleTitle, selectedRoadmapPath, jobFilters.country]);

  // Fetch or generate roadmap for current role
  const loadRoadmapForRole = async (targetPath, forceRefresh = false) => {
    const roleKey = typeof targetPath === 'string' ? targetPath : targetPath.title;

    if (!forceRefresh && roadmapsByRole[roleKey]) {
      return roadmapsByRole[roleKey];
    }

    setIsGenerating(true);
    const toastId = toast.loading(`Synthesizing live skill gap & roadmap for ${roleKey}...`, { id: 'roadmap-gen' });

    try {
      const data = await generateSkillGapRoadmap(cvData, targetPath, jobFilters);
      if (data && data.milestones) {
        setRoadmapsByRole((prev) => ({
          ...prev,
          [roleKey]: data
        }));
        toast.success(`8-Week Roadmap Ready for ${roleKey}!`, {
          id: toastId,
          icon: '✨'
        });
        return data;
      }
    } catch (err) {
      console.warn('[SkillGapPage] Generation warning:', err.message);
      toast.error('Using dynamic baseline roadmap.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // Load roadmap on initial render or active role switch
  useEffect(() => {
    loadRoadmapForRole(activePathObject);
  }, [activeRoleTitle]);

  const activeRoadmap = roadmapsByRole[activeRoleTitle] || null;

  // Filter milestones by tab
  const filteredMilestones = useMemo(() => {
    if (!activeRoadmap?.milestones) return [];
    if (activeFilterTab === 'remaining') {
      return activeRoadmap.milestones.filter((m) => !completedMilestones[m.id]);
    }
    if (activeFilterTab === 'completed') {
      return activeRoadmap.milestones.filter((m) => !!completedMilestones[m.id]);
    }
    return activeRoadmap.milestones;
  }, [activeRoadmap, activeFilterTab, completedMilestones]);

  // Mastery Progress Metrics
  const progressMetrics = useMemo(() => {
    const total = activeRoadmap?.milestones?.length || 4;
    const completedCount = (activeRoadmap?.milestones || []).filter(
      (m) => !!completedMilestones[m.id]
    ).length;
    const pct = Math.round((completedCount / total) * 100);
    const remainingWeeks = Math.max(0, (total - completedCount) * 2);
    const hoursCompleted = completedCount * 11;

    return {
      total,
      completedCount,
      pct,
      remainingWeeks,
      hoursCompleted
    };
  }, [activeRoadmap, completedMilestones]);

  const handleSelectPath = (path) => {
    setSelectedRoadmapPath(path);
    setShowCustomInput(false);
  };

  const handleAddCustomRole = (e) => {
    e.preventDefault();
    if (!customRoleInput.trim()) return;
    const newTitle = customRoleInput.trim();
    setSelectedRoadmapPath(newTitle);
    setCustomRoleInput('');
    setShowCustomInput(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* 1. TOP HEADER & TELEMETRY */}
      <div className="card bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-sm font-semibold tracking-wider uppercase bg-gray-900 text-white">
                Skill Gap & Dynamic Roadmap
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Tavily Live Skill Pulse Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Interactive Career Mastery Engine
            </h1>

            <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
              Algorithmic gap analysis comparing your CV against real-world market requisitions for{' '}
              <strong className="text-gray-900">{activeRoleTitle}</strong> in{' '}
              <strong className="text-gray-900">{jobFilters.city}, {jobFilters.country}</strong>. Track your 8-week sprint roadmap, build capstone deliverables, and sync mastered skills directly into your CV.
            </p>
          </div>

          {/* Regenerate Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadRoadmapForRole(activePathObject, true)}
              disabled={isGenerating}
              className="btn btn-sm bg-gray-900 hover:bg-black text-white rounded-xl px-4 h-10 font-semibold gap-2 shadow-xs transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Live Market Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* LAYER 1: CAREER TRAJECTORY SWITCHER & LIVE MASTERY TRACKER */}
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-gray-500" />
              Select Target Career Trajectory ({availablePaths.length} Recommended)
            </span>
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-emerald-600" />
              <span>Custom Target Role</span>
            </button>
          </div>

          {/* Custom Role Input Dropdown Drawer */}
          {showCustomInput && (
            <form onSubmit={handleAddCustomRole} className="flex items-center gap-2 max-w-md p-3 bg-gray-50 rounded-xl border border-gray-200 animate-fadeIn">
              <input
                type="text"
                placeholder="e.g. Senior Cloud SRE Lead"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <button type="submit" className="btn btn-xs bg-gray-900 hover:bg-black text-white px-3 font-semibold">
                Set Track
              </button>
            </form>
          )}

          {/* Horizontal Scrollable Role Pill Bar */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {availablePaths.map((path, idx) => {
              const isSelected = path.title.toLowerCase() === activeRoleTitle.toLowerCase();
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPath(path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                    isSelected
                      ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                      : 'bg-gray-50/80 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    #{path.rank || idx + 1}
                  </span>
                  <span>{path.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-emerald-500 text-white font-bold' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {path.matchScore || 90}% Match
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Mastery Progress Bar Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-3 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Overall Roadmap Progress
                  </span>
                  <span className="badge badge-sm bg-emerald-100 text-emerald-800 font-bold border-none">
                    {progressMetrics.completedCount} of {progressMetrics.total} Sprints Completed
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Targeting job readiness for <strong>{activeRoleTitle}</strong> ({activePathObject.salaryRange})
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="text-right">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Estimated Readiness</p>
                  <p className="text-sm font-bold text-gray-900">
                    {progressMetrics.remainingWeeks === 0 ? '✨ 100% Ready for Application' : `${progressMetrics.remainingWeeks} Weeks Remaining`}
                  </p>
                </div>
                <span className="text-2xl font-bold text-emerald-600">
                  {progressMetrics.pct}%
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressMetrics.pct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 2: TAVILY MARKET TREND PULSE & 3-COLUMN SKILL DIFFERENTIAL MATRIX */}
      <div className="space-y-4">
        {/* Market Trend Pulse Banner */}
        {activeRoadmap?.marketTrendPulse && (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Live Market Trend Pulse & Hiring Velocity
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {activeRoadmap.marketTrendPulse.hiringVelocity}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {activeRoadmap.marketTrendPulse.overview}
            </p>

            {/* Top Hiring Hubs */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-gray-500">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                Primary Hiring Hubs:
              </span>
              {activeRoadmap.marketTrendPulse.topHiringHubs?.map((hub, hIdx) => (
                <span key={hIdx} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[11px]">
                  {hub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3-Column Skill Differential Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Verified CV Strengths */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Verified CV Strengths
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Matches {activeRoleTitle} prerequisites
                    </p>
                  </div>
                </div>
                <span className="badge badge-sm bg-emerald-100 text-emerald-800 font-bold border-none">
                  {activeRoadmap?.skillDifferential?.verifiedSkills?.length || 4} Verified
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {activeRoadmap?.skillDifferential?.verifiedSkills?.map((skill, sIdx) => (
                  <div key={sIdx} className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 block flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {skill.name}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        {skill.evidence || skill.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded shrink-0">
                      {skill.proficiency || 'Mastered'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-emerald-700/80 font-medium pt-2 border-t border-gray-100">
              ✓ Fully aligned with applicant tracking systems and recruiter screens.
            </p>
          </div>

          {/* Card 2: Critical Missing Gaps (+ Sync to CV) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Critical Missing Gaps
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Top obstacles to executive hiring
                    </p>
                  </div>
                </div>
                <span className="badge badge-sm bg-amber-100 text-amber-800 font-bold border-none">
                  {activeRoadmap?.skillDifferential?.criticalMissingGaps?.length || 3} Gaps
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {activeRoadmap?.skillDifferential?.criticalMissingGaps?.map((gap, gIdx) => (
                  <div key={gIdx} className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/80 flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-0.5 flex-1">
                      <span className="font-bold text-gray-900 block">
                        {gap.name}
                      </span>
                      <span className="text-[11px] text-gray-500 block leading-snug">
                        {gap.reason}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => syncSkillToCV(gap.name)}
                      title="Add to CV skills once mastered"
                      className="btn btn-xs btn-outline border-amber-300 text-amber-800 hover:bg-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-bold shrink-0 gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-700" />
                      <span>Sync CV</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-amber-800/80 font-medium pt-2 border-t border-gray-100">
              ⚡ Add to CV after completing the corresponding sprint capstone project.
            </p>
          </div>

          {/* Card 3: Emerging / High-Leverage Skills */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800">
                    <Flame className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Emerging High-Leverage
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Tools that command top-tier compensation
                    </p>
                  </div>
                </div>
                <span className="badge badge-sm bg-gray-100 text-gray-800 font-bold border-none">
                  Modern Edge
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {activeRoadmap?.skillDifferential?.emergingSkills?.map((skill, eIdx) => (
                  <div key={eIdx} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-2 text-xs">
                    <div className="space-y-0.5 flex-1">
                      <span className="font-bold text-gray-900 block">
                        {skill.name}
                      </span>
                      <span className="text-[11px] text-gray-500 block leading-snug">
                        {skill.reason}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => syncSkillToCV(skill.name)}
                      title="Add to CV skills once mastered"
                      className="btn btn-xs btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg px-2 py-0.5 text-[10px] font-bold shrink-0 gap-1"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                      <span>Sync CV</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100">
              🚀 Differentiates candidate from 95% of standard applicants during technical rounds.
            </p>
          </div>
        </div>
      </div>

      {/* LAYER 3: WEEK-BY-WEEK INTERACTIVE LEARNING ROADMAP */}
      <div className="space-y-4">
        {/* Navigation & Sprint Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2">
            <Milestone className="w-4 h-4 text-gray-900" />
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              8-Week Milestone Action Plan ({filteredMilestones.length} Sprints)
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilterTab('all')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                activeFilterTab === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Weeks ({activeRoadmap?.milestones?.length || 4})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('remaining')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                activeFilterTab === 'remaining'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Remaining ({progressMetrics.total - progressMetrics.completedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('completed')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                activeFilterTab === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed ({progressMetrics.completedCount})</span>
            </button>
          </div>
        </div>

        {/* Milestone Cards List */}
        {filteredMilestones.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">
              No sprints matching this filter
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {activeFilterTab === 'remaining'
                ? 'Congratulations! You have completed all scheduled sprints for this roadmap.'
                : 'No milestones marked completed yet. Click "Mark as Done" on any sprint above as you progress.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveFilterTab('all')}
              className="btn btn-xs btn-outline border-gray-300 text-gray-700 font-semibold"
            >
              View All Sprints
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMilestones.map((milestone, idx) => (
              <MilestoneTimelineCard
                key={milestone.id}
                milestone={milestone}
                index={idx}
                isCompleted={!!completedMilestones[milestone.id]}
                onToggleComplete={toggleMilestone}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapPage;
