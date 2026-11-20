import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Code,
  BookOpen,
  Video,
  FileCode2,
  FolderGit2,
  Sparkles,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

/**
 * Returns distinct styling and icon based on learning resource platform
 */
const getPlatformBadge = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('youtube') || p.includes('video')) {
    return {
      badgeClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      label: 'YouTube',
      icon: Video
    };
  }
  if (p.includes('coursera') || p.includes('course') || p.includes('class')) {
    return {
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      label: 'Coursera',
      icon: BookOpen
    };
  }
  if (p.includes('doc') || p.includes('official') || p.includes('api')) {
    return {
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
      label: 'Official Docs',
      icon: FileCode2
    };
  }
  // GitHub / Interactive code repo
  return {
    badgeClass: 'bg-gray-900 text-white border-gray-800 hover:bg-black',
    label: 'GitHub / Code',
    icon: FolderGit2
  };
};

export const MilestoneTimelineCard = ({
  milestone,
  index = 0,
  isCompleted = false,
  onToggleComplete
}) => {
  if (!milestone) return null;

  return (
    <div
      className={`relative flex flex-col md:flex-row gap-5 p-6 rounded-2xl bg-white border transition-all duration-200 shadow-2xs hover:shadow-sm ${
        isCompleted
          ? 'border-emerald-300 bg-emerald-50/20'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* 1. LEFT TIMELINE NODE & SPRINT BADGES */}
      <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-3 md:w-44 shrink-0 pb-3 md:pb-0 md:pr-4 md:border-r border-gray-100">
        <div className="space-y-1.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border transition-colors ${
              isCompleted
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-gray-900 text-white border-gray-900'
            }`}
          >
            {milestone.week || `Sprint ${index + 1}`}
          </span>

          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 pt-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{milestone.duration || '10–12 hrs/week'}</span>
          </div>
        </div>

        {/* Milestone Completion Status Pill */}
        <div className="mt-auto pt-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sprint Completed</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200">
              <Circle className="w-3.5 h-3.5 text-gray-400" />
              <span>In Progress</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. MAIN CARD BODY */}
      <div className="flex-1 space-y-5">
        {/* Header & Interactive Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span>{milestone.title}</span>
              {isCompleted && (
                <span className="badge badge-xs bg-emerald-100 text-emerald-800 border-none font-semibold">
                  Verified
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              {milestone.description}
            </p>
          </div>

          {/* Interactive Checkbox Action Button */}
          <button
            type="button"
            onClick={() => onToggleComplete?.(milestone.id)}
            className={`btn btn-sm rounded-xl font-semibold gap-2 transition-all shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-gray-400" />
                <span>Mark as Done</span>
              </>
            )}
          </button>
        </div>

        {/* Core Sprint Topics / Competency Pills */}
        {milestone.topics && milestone.topics.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Core Competencies & Focus Areas:
            </span>
            <div className="flex flex-wrap gap-2">
              {milestone.topics.map((topic, tIdx) => (
                <span
                  key={tIdx}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  }`}
                >
                  <CheckCircle2 className={`w-3 h-3 ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>{topic}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hands-On Capstone Deliverable Callout */}
        {milestone.capstoneProject && (
          <div className="p-4 rounded-xl bg-gray-50/90 border border-gray-200/90 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>Hands-On Capstone Deliverable: {milestone.capstoneProject.title}</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                Proof of Work
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {milestone.capstoneProject.deliverable}
            </p>

            {milestone.capstoneProject.proofOfWork && (
              <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span><strong>Verification Benchmark:</strong> {milestone.capstoneProject.proofOfWork}</span>
              </div>
            )}
          </div>
        )}

        {/* Curated Multi-Platform Learning Resources Grid */}
        {milestone.resources && milestone.resources.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Curated Multi-Platform Learning Resources ({milestone.resources.length})
              </span>
              <span className="text-[11px] text-gray-400">
                Verified Tutorials & Docs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {milestone.resources.map((res, rIdx) => {
                const { badgeClass, label, icon: PlatformIcon } = getPlatformBadge(res.platform);

                return (
                  <a
                    key={rIdx}
                    href={res.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between p-3 rounded-xl bg-white border border-gray-200 hover:border-gray-400 hover:shadow-2xs transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${badgeClass}`}>
                        <PlatformIcon className="w-3 h-3" />
                        <span>{label}</span>
                      </span>

                      {res.timeEst && (
                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {res.timeEst}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {res.title}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-gray-400 group-hover:text-gray-900 transition-colors">
                      <span>Access Resource</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneTimelineCard;
