import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  ShieldCheck,
  Milestone,
  Send,
  MessagesSquare,
  Radar,
  ArrowRight,
  Globe,
  BellRing,
  CheckCircle2
} from 'lucide-react';

import { CareerProvider, useCareer } from './context/CareerContext';
import { Sidebar } from './components/Sidebar';
import { MyCVPage } from './pages/MyCVPage';

/**
 * Reusable luxury-styled placeholder view for testing routing & theme foundation.
 */
const RoutePlaceholder = ({
  badge,
  title,
  description,
  icon: Icon,
  routePath
}) => {
  const {
    cvData,
    selectedRegion,
    selectedCountry,
    setSelectedCountry
  } = useCareer();

  const handleTestToast = () => {
    toast.success(`Active on ${title}. Step 1 Foundation verified!`, {
      icon: '✨'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Breadcrumb & Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-base-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-sm font-semibold tracking-wider uppercase bg-primary text-primary-content">
              {badge}
            </span>
            <span className="text-xs text-base-content/50 font-mono">
              {routePath}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {title}
          </h1>
          <p className="text-sm text-base-content/65 mt-0.5">
            {description}
          </p>
        </div>

        {/* Global Context Indicators & Quick Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-base-300 bg-base-100 text-xs font-medium text-base-content/80 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-accent" />
            <span>
              {selectedCountry} ({selectedRegion})
            </span>
          </div>

          <button
            onClick={handleTestToast}
            className="btn btn-sm btn-primary gap-1.5 shadow-xs"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Test Toast</span>
          </button>
        </div>
      </div>

      {/* Main Luxury Content Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl p-6 md:p-8 transition-all">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-base-200 border border-base-300 text-primary">
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-primary">
                Module Foundation Status
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>
            <p className="text-sm text-base-content/70 leading-relaxed max-w-2xl">
              This module is wired into <strong className="text-base-content">CareerContext</strong>,
              styled with the <code className="text-xs font-mono bg-base-200 px-1 py-0.5 rounded">nextjob-luxury</code> DaisyUI theme,
              and ready for inner feature integration.
            </p>
          </div>
        </div>

        {/* Informational Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-base-300">
          <div className="p-4 rounded-xl bg-base-200/60 border border-base-300">
            <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
              Target Candidate
            </p>
            <p className="text-sm font-bold text-primary mt-1 truncate">
              {cvData.fullName || 'Candidate Unspecified'}
            </p>
            <p className="text-xs text-base-content/60 mt-0.5 truncate">
              {cvData.targetRole}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-base-200/60 border border-base-300">
            <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
              Regional Jurisdiction
            </p>
            <p className="text-sm font-bold text-primary mt-1">
              {selectedCountry}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setSelectedCountry('Bangladesh')}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  selectedCountry === 'Bangladesh'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-300 text-base-content/70 hover:text-base-content'
                }`}
              >
                BD
              </button>
              <button
                onClick={() => setSelectedCountry('India')}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  selectedCountry === 'India'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-300 text-base-content/70 hover:text-base-content'
                }`}
              >
                IN
              </button>
              <button
                onClick={() => setSelectedCountry('Pakistan')}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  selectedCountry === 'Pakistan'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-300 text-base-content/70 hover:text-base-content'
                }`}
              >
                PK
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-base-200/60 border border-base-300">
            <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
              Verification Engine
            </p>
            <p className="text-sm font-bold text-accent mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
              ML Guard Active
            </p>
            <p className="text-xs text-base-content/60 mt-0.5">
              Tavily Live + OpenAI Guardrails
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Route View Placeholders for non-CV routes
const DashboardView = () => (
  <RoutePlaceholder
    badge="Route 01 / 08"
    title="Dashboard"
    description="Holistic command center for AI career trajectory, job market pulse, and real-time fraud alerts."
    icon={LayoutDashboard}
    routePath="/"
  />
);

const CareerPathsView = () => (
  <RoutePlaceholder
    badge="Route 03 / 08"
    title="Career Paths"
    description="Algorithmic career path recommendation based on candidate profile and global market demands."
    icon={GitBranch}
    routePath="/career-paths"
  />
);

const JobsView = () => (
  <RoutePlaceholder
    badge="Route 04 / 08"
    title="Live Jobs & ML Guard"
    description="Tavily live job discovery coupled with machine learning scam & ghost job risk scoring."
    icon={ShieldCheck}
    routePath="/jobs"
  />
);

const SkillGapView = () => (
  <RoutePlaceholder
    badge="Route 05 / 08"
    title="Skill Gap & Roadmap"
    description="Target role skill differential analysis and personalized weekly milestone action plan."
    icon={Milestone}
    routePath="/skill-gap"
  />
);

const ApplicationsView = () => (
  <RoutePlaceholder
    badge="Route 06 / 08"
    title="Applications"
    description="Job application tracker with AI-tailored cover letter generator and status pipeline."
    icon={Send}
    routePath="/applications"
  />
);

const InterviewView = () => (
  <RoutePlaceholder
    badge="Route 07 / 08"
    title="Mock Interview"
    description="AI-driven technical and behavioral interview simulation with instant rubric feedback."
    icon={MessagesSquare}
    routePath="/interview"
  />
);

const RadarProgressView = () => (
  <RoutePlaceholder
    badge="Route 08 / 08"
    title="Radar & Progress"
    description="Target company hiring radar, tech stack breakdown, and career goal completion analytics."
    icon={Radar}
    routePath="/radar-progress"
  />
);

export function App() {
  return (
    <CareerProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-base-200 text-base-content antialiased">
          {/* Persistent Left Sidebar */}
          <Sidebar />

          {/* Spacious Main Area */}
          <main className="flex-1 bg-base-200 min-h-screen p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/my-cv" element={<MyCVPage />} />
              <Route path="/career-paths" element={<CareerPathsView />} />
              <Route path="/jobs" element={<JobsView />} />
              <Route path="/skill-gap" element={<SkillGapView />} />
              <Route path="/applications" element={<ApplicationsView />} />
              <Route path="/interview" element={<InterviewView />} />
              <Route path="/radar-progress" element={<RadarProgressView />} />
              {/* Fallback to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#111827',
              color: '#FFFFFF',
              borderRadius: '0.75rem',
              border: '1px solid #374151',
              fontSize: '0.875rem'
            }
          }}
        />
      </BrowserRouter>
    </CareerProvider>
  );
}

export default App;
