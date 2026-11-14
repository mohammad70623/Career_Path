import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Building2,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Briefcase,
  DollarSign,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';

import { useCareer } from '../context/CareerContext';
import {
  GLOBAL_REGIONS,
  JOB_TYPES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  INDUSTRIES,
  SALARY_RANGES,
  WORK_AUTHORIZATIONS,
  getCountriesForRegion,
  getStatesForCountry,
  getCitiesForState
} from '../data/globalLocations';

export const GlobalFilterBar = ({ className = '' }) => {
  const { jobFilters, updateFilter, resetFilters } = useCareer();
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState(true);

  // Dynamic cascading option lists based on selected region & country
  const availableCountries = getCountriesForRegion(jobFilters.region);
  const availableStates = getStatesForCountry(jobFilters.region, jobFilters.country);
  const availableCities = getCitiesForState(jobFilters.region, jobFilters.country, jobFilters.state);

  // Compute number of non-default active criteria
  const activeCriteriaCount = [
    jobFilters.jobType !== 'All',
    jobFilters.employment !== 'All',
    jobFilters.experience !== 'All',
    jobFilters.industry !== 'All',
    jobFilters.salary !== 'Any Salary',
    jobFilters.workAuth !== 'Any'
  ].filter(Boolean).length;

  return (
    <div
      className={`bg-base-100 border border-base-300 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 ${className}`}
    >
      {/* ROW 1: 6 Continent / Region Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-300/80">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Global Region
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {GLOBAL_REGIONS.map((region) => {
            const isActive = jobFilters.region === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => updateFilter('region', region)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-primary-content font-semibold shadow-xs'
                    : 'bg-base-200/80 text-base-content/75 hover:bg-base-300 hover:text-base-content font-medium'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      {/* ROW 2: Cascading Geo Dropdowns (Country -> State/Province -> City) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Country */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-base-content/70 uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-accent" />
            <span>Country</span>
          </label>
          <select
            value={jobFilters.country}
            onChange={(e) => updateFilter('country', e.target.value)}
            className="select select-sm w-full bg-base-100 border border-base-300 rounded-xl text-xs font-semibold text-primary focus:border-primary focus:outline-hidden"
          >
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* State / Province */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-base-content/70 uppercase tracking-wider">
            <Building2 className="w-3 h-3 text-secondary" />
            <span>State / Division</span>
          </label>
          <select
            value={jobFilters.state}
            onChange={(e) => updateFilter('state', e.target.value)}
            className="select select-sm w-full bg-base-100 border border-base-300 rounded-xl text-xs font-semibold text-primary focus:border-primary focus:outline-hidden"
          >
            {availableStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-base-content/70 uppercase tracking-wider">
            <CompassIcon className="w-3 h-3 text-primary" />
            <span>Metropolitan City</span>
          </label>
          <select
            value={jobFilters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="select select-sm w-full bg-base-100 border border-base-300 rounded-xl text-xs font-semibold text-primary focus:border-primary focus:outline-hidden"
          >
            {availableCities.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ROW 3: Collapsible 6-Parameter Job Criteria Grid */}
      <div className="pt-2 border-t border-base-300/60">
        <div className="flex items-center justify-between pb-2.5">
          <button
            type="button"
            onClick={() => setIsCriteriaExpanded(!isCriteriaExpanded)}
            className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider hover:opacity-80 transition-opacity"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
            <span>Job Parameters & Employment Filters</span>
            <span className="badge badge-xs bg-base-200 text-base-content/70 border border-base-300 font-mono px-1.5">
              6 Filters
            </span>
            {isCriteriaExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-base-content/50" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-base-content/50" />
            )}
          </button>

          {activeCriteriaCount > 0 && (
            <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
              {activeCriteriaCount} Custom {activeCriteriaCount === 1 ? 'Filter' : 'Filters'} Active
            </span>
          )}
        </div>

        {isCriteriaExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            {/* 1. Job Type */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-wider">
                Work Mode
              </label>
              <select
                value={jobFilters.jobType}
                onChange={(e) => updateFilter('jobType', e.target.value)}
                className="select select-xs w-full bg-base-100 border border-base-300 rounded-lg text-xs font-medium text-primary focus:border-primary focus:outline-hidden"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Employment */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-wider">
                Employment
              </label>
              <select
                value={jobFilters.employment}
                onChange={(e) => updateFilter('employment', e.target.value)}
                className="select select-xs w-full bg-base-100 border border-base-300 rounded-lg text-xs font-medium text-primary focus:border-primary focus:outline-hidden"
              >
                {EMPLOYMENT_TYPES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Experience */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-wider">
                Seniority
              </label>
              <select
                value={jobFilters.experience}
                onChange={(e) => updateFilter('experience', e.target.value)}
                className="select select-xs w-full bg-base-100 border border-base-300 rounded-lg text-xs font-medium text-primary focus:border-primary focus:outline-hidden"
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Industry */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-wider">
                Industry
              </label>
              <select
                value={jobFilters.industry}
                onChange={(e) => updateFilter('industry', e.target.value)}
                className="select select-xs w-full bg-base-100 border border-base-300 rounded-lg text-xs font-medium text-primary focus:border-primary focus:outline-hidden"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Salary */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-wider">
                Target Salary
              </label>
              <select
                value={jobFilters.salary}
                onChange={(e) => updateFilter('salary', e.target.value)}
                className="select select-xs w-full bg-base-100 border border-base-300 rounded-lg text-xs font-medium text-primary focus:border-primary focus:outline-hidden"
              >
                {SALARY_RANGES.map((sal) => (
                  <option key={sal} value={sal}>
                    {sal}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Work Authorization */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-wider truncate">
                Visa / Work Permit
              </label>
              <select
                value={jobFilters.workAuth}
                onChange={(e) => updateFilter('workAuth', e.target.value)}
                className="select select-xs w-full bg-base-100 border border-base-300 rounded-lg text-xs font-medium text-primary focus:border-primary focus:outline-hidden"
              >
                {WORK_AUTHORIZATIONS.map((wa) => (
                  <option key={wa} value={wa}>
                    {wa}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SUMMARY BAR: Active Location Breadcrumb & Reset Action */}
      <div className="pt-3 border-t border-base-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-base-content/75">
          <span className="font-semibold text-primary">Target:</span>
          <span className="font-medium text-base-content bg-base-200/90 px-2 py-0.5 rounded-md border border-base-300/60">
            {jobFilters.city}, {jobFilters.state}, {jobFilters.country} ({jobFilters.region})
          </span>
          {jobFilters.industry !== 'All' && (
            <span className="badge badge-sm bg-base-200 border-base-300 text-base-content/70">
              {jobFilters.industry}
            </span>
          )}
          {jobFilters.jobType !== 'All' && (
            <span className="badge badge-sm bg-base-200 border-base-300 text-base-content/70">
              {jobFilters.jobType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content hover:bg-base-200 gap-1.5 font-medium rounded-lg"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Clean helper icon component
const CompassIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export default GlobalFilterBar;
