import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  Loader2,
  RefreshCw,
  Milestone,
  Compass,
  GraduationCap,
  Award,
  Filter
} from 'lucide-react';

import { useCareer } from '../context/CareerContext';
import { GlobalFilterBar } from '../components/GlobalFilterBar';
import { predictCareerPaths } from '../services/api';

const TRACK_FILTER_OPTIONS = [
  { id: 'all', label: 'All Tracks' },
  { id: 'core', label: 'Core Domain' },
  { id: 'academic', label: 'Academic & Research' },
  { id: 'specialization', label: 'Specialization' },
  { id: 'adjacent', label: 'Adjacent & Leadership' }
];

export const CareerPathsPage = () => {
  const navigate = useNavigate();
  const {
    cvData,
    uploadedFile,
    jobFilters,
    careerTrajectories,
    setCareerTrajectories,
    cvVersion,
    setSelectedRoadmapPath
  } = useCareer();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('all');
  const lastFetchedVersion = useRef(null);

  // Trigger live all-department career prediction
  const handleGeneratePaths = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Synthesizing universal all-department trajectory & Tavily live market data...', { id: 'career-pred' });

    try {
      const response = await predictCareerPaths(cvData, jobFilters, uploadedFile);

      if (response && response.paths && response.paths.length > 0) {
        // Enforce strict highest-to-lowest sorting by matchScore
        const sortedPaths = [...response.paths].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        sortedPaths.forEach((p, idx) => {
          p.rank = idx + 1;
          p.id = p.id || `path-${idx + 1}`;
        });

        const updatedResult = {
          ...response,
          paths: sortedPaths
        };

        setCareerTrajectories(updatedResult);
        lastFetchedVersion.current = cvVersion;
        toast.success(`Generated ${sortedPaths.length} ranked trajectories across ${response.detectedDiscipline || 'your discipline'}!`, {
          id: toastId,
          icon: '✨'
        });
      } else {
        throw new Error('Empty trajectory array returned');
      }
    } catch (error) {
      console.warn('[CareerPaths] Prediction notice:', error.message);
      toast.dismiss(toastId);
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically fetch fresh career recommendations whenever CV is updated or uploaded (cvVersion changes)
  useEffect(() => {
    const needsGeneration =
      !careerTrajectories ||
      !careerTrajectories.paths ||
      careerTrajectories.paths.length === 0 ||
      lastFetchedVersion.current !== cvVersion;

    if (needsGeneration) {
      lastFetchedVersion.current = cvVersion;
      handleGeneratePaths();
    }
  }, [cvVersion, careerTrajectories]);

  const paths = careerTrajectories?.paths || [];
  const detectedDiscipline = careerTrajectories?.detectedDiscipline || 'Universal Cross-Disciplinary Systems';
  const academicEligibilityNote = careerTrajectories?.academicEligibilityNote || '';
  const candidateSummary = careerTrajectories?.candidateSummary || `Candidate profile indicates strong technical velocity in ${cvData.targetRole || 'Professional Practice'} with verified academic credentials.`;
  const marketInsight = careerTrajectories?.marketInsight || `Active hiring demand observed in ${jobFilters.city}, ${jobFilters.country} (${jobFilters.region}) for ${jobFilters.industry} specialists.`;

  // Compute category counts for filter pills
  const trackCounts = useMemo(() => {
    const counts = {
      all: paths.length,
      core: 0,
      academic: 0,
      specialization: 0,
      adjacent: 0
    };

    paths.forEach((p) => {
      const cat = (p.trackCategory || '').toLowerCase();
      const title = (p.title || '').toLowerCase();

      if (cat.includes('core')) counts.core += 1;
      if (cat.includes('academic') || cat.includes('research') || title.includes('lecturer') || title.includes('faculty')) counts.academic += 1;
      if (cat.includes('specialization') || cat.includes('technical') || cat.includes('data')) counts.specialization += 1;
      if (cat.includes('adjacent') || cat.includes('management') || cat.includes('strategy') || cat.includes('leadership') || cat.includes('interdisciplinary')) counts.adjacent += 1;
    });

    return counts;
  }, [paths]);

  // Filter paths while strictly preserving the highest-to-lowest matchScore rank
  const filteredPaths = useMemo(() => {
    if (selectedTrack === 'all') return paths;

    return paths.filter((p) => {
      const cat = (p.trackCategory || '').toLowerCase();
      const title = (p.title || '').toLowerCase();

      if (selectedTrack === 'core') {
        return cat.includes('core');
      }
      if (selectedTrack === 'academic') {
        return cat.includes('academic') || cat.includes('research') || title.includes('lecturer') || title.includes('faculty');
      }
      if (selectedTrack === 'specialization') {
        return cat.includes('specialization') || cat.includes('technical') || cat.includes('data');
      }
      if (selectedTrack === 'adjacent') {
        return cat.includes('adjacent') || cat.includes('management') || cat.includes('strategy') || cat.includes('leadership') || cat.includes('interdisciplinary');
      }
      return true;
    });
  }, [paths, selectedTrack]);

  // Color-coded badge for Track Category
  const renderTrackBadge = (trackCategory = '') => {
    const lower = trackCategory.toLowerCase();
    if (lower.includes('academic') || lower.includes('research')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{trackCategory}</span>
        </span>
      );
    }
    if (lower.includes('core')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{trackCategory}</span>
        </span>
      );
    }
    if (lower.includes('specialization') || lower.includes('data')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{trackCategory}</span>
        </span>
      );
    }
    if (lower.includes('management') || lower.includes('strategy')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300">
          <Award className="w-3.5 h-3.5" />
          <span>{trackCategory}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <Layers className="w-3.5 h-3.5" />
        <span>{trackCategory}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-base-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-sm font-semibold tracking-wider uppercase bg-primary text-primary-content">
              Feature 02 // Universal Trajectory Engine
            </span>
            <span className="text-xs text-base-content/50 font-mono">
              /career-paths
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Algorithmic Career Path Recommendations
          </h1>
          <p className="text-sm text-base-content/65 mt-0.5">
            100% dynamic, all-department trajectory discovery strictly ranked by match score from your verified CV credentials.
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
                <span>Synthesizing Trajectories...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>Generate AI Career Paths</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Filter Bar (10-Point Parameter Ribbon) */}
      <GlobalFilterBar onFilterChange={handleGeneratePaths} />

      {/* Executive Summary & Live Market Insight Banner */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-base-300/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              <Compass className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-primary">
                  AI Candidate Profile Synthesis
                </h3>
                {/* Detected Academic/Professional Discipline Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-content shadow-2xs">
                  <GraduationCap className="w-3.5 h-3.5 text-accent" />
                  <span>Discipline: {detectedDiscipline}</span>
                </span>
                <span className="badge badge-xs bg-base-200 text-base-content/70 font-mono font-medium">
                  {cvData.targetRole || 'Candidate'}
                </span>
              </div>
              <p className="text-xs text-base-content/80 leading-relaxed max-w-4xl">
                {candidateSummary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span>Tavily Market Intelligence Active</span>
            </span>
          </div>
        </div>

        {/* Academic Standing & CGPA Assessment Callout */}
        {academicEligibilityNote && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-xs text-emerald-950">
            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-900">Academic Standing & CGPA Assessment: </span>
              <span className="text-emerald-800 leading-relaxed">{academicEligibilityNote}</span>
            </div>
          </div>
        )}

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

      {/* Track Filter Pill Bar (All Tracks, Core Domain, Academic & Research, Specialization, Adjacent & Leadership) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-base-content/50" />
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
            Filter Trajectory Tracks:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-base-100 p-1.5 rounded-xl border border-base-300 shadow-2xs">
          {TRACK_FILTER_OPTIONS.map((opt) => {
            const count = trackCounts[opt.id] ?? 0;
            const isActive = selectedTrack === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedTrack(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-primary-content shadow-xs'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-primary-content/20 text-primary-content' : 'bg-base-200 text-base-content/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isGenerating && paths.length === 0 && (
        <div className="card bg-base-100 border border-base-300 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto" />
          <div>
            <h3 className="text-base font-bold text-primary">Synthesizing All-Department Trajectories...</h3>
            <p className="text-xs text-base-content/60 mt-1 max-w-md mx-auto">
              Evaluating your degree, CGPA, academic distinctions, verified skills, and Tavily market demand in{' '}
              <strong>{jobFilters.city}, {jobFilters.country}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Ranked Career Path Cards Grid (Strict Highest-to-Lowest Order Top-to-Bottom) */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPaths.length === 0 && !isGenerating ? (
          <div className="card bg-base-100 border border-base-300 rounded-2xl p-8 text-center shadow-sm space-y-3">
            <Compass className="w-8 h-8 text-base-content/40 mx-auto" />
            <h3 className="text-sm font-bold text-primary">No trajectories match the selected track filter</h3>
            <p className="text-xs text-base-content/60">
              Switch back to "All Tracks" to review all {paths.length} recommended career roles.
            </p>
            <button
              type="button"
              onClick={() => setSelectedTrack('all')}
              className="btn btn-xs btn-outline border-base-300 text-primary mx-auto"
            >
              Reset to All Tracks
            </button>
          </div>
        ) : (
          filteredPaths.map((path) => (
            <div
              key={path.id || path.rank}
              className="card bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm hover:border-base-content/30 transition-all duration-200 space-y-4"
            >
              {/* Card Header: Rank, Title, Track Tag, Match Badge & Salary */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-base-300/80">
                <div className="flex items-start gap-3.5">
                  {/* Sequential Rank Badge #1, #2, #3... */}
                  <div className="w-8 h-8 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-xs mt-0.5">
                    #{path.rank || 1}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Match Score Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{path.matchScore}% Match</span>
                      </span>

                      {/* Track Category Pill */}
                      {renderTrackBadge(path.trackCategory)}
                    </div>

                    <h2 className="text-xl font-bold text-primary tracking-tight">
                      {path.title}
                    </h2>
                  </div>
                </div>

                {/* Compensation & Demand Badges */}
                <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 shrink-0 self-start sm:self-auto">
                  <span className="text-sm font-bold text-primary font-mono">
                    {path.salaryRange}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {path.demandLevel}
                  </span>
                </div>
              </div>

              {/* Reasoning & Academic/Domain Evidence */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                  Trajectory Analysis & Candidate Evidence
                </p>
                <p className="text-xs text-base-content/85 leading-relaxed">
                  {path.reasoning}
                </p>
              </div>

              {/* Matched vs Missing Skills Grid */}
              <div className="pt-3 border-t border-base-300/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
                <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/70 flex items-start gap-2.5 text-xs">
                  <Milestone className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-primary">Recommended Action: </span>
                    <span className="text-base-content/75">{path.recommendedNextStep}</span>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-base-300/60 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-base-content/60">
                  Targeting: <strong className="text-base-content">{jobFilters.city}, {jobFilters.country}</strong> • Industry:{' '}
                  <strong className="text-base-content">{jobFilters.industry}</strong>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (setSelectedRoadmapPath) {
                        setSelectedRoadmapPath(path);
                      }
                      navigate('/skill-gap');
                    }}
                    className="btn btn-sm btn-ghost text-base-content/75 hover:text-base-content hover:bg-base-200"
                  >
                    View Skill Gap
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/jobs')}
                    className="btn btn-sm btn-primary rounded-xl gap-1.5 font-semibold shadow-xs"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>See Live Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CareerPathsPage;
