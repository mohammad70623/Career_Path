import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  ShieldCheck,
  Milestone,
  Send,
  MessagesSquare,
  Radar,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true
  },
  {
    to: '/my-cv',
    label: 'My CV',
    icon: FileText
  },
  {
    to: '/career-paths',
    label: 'Career Paths',
    icon: GitBranch
  },
  {
    to: '/jobs',
    label: 'Live Jobs & ML Guard',
    icon: ShieldCheck
  },
  {
    to: '/skill-gap',
    label: 'Skill Gap & Roadmap',
    icon: Milestone
  },
  {
    to: '/applications',
    label: 'Applications',
    icon: Send
  },
  {
    to: '/interview',
    label: 'Mock Interview',
    icon: MessagesSquare
  },
  {
    to: '/radar-progress',
    label: 'Company Radar & Progress',
    icon: Radar
  }
];

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between bg-base-200 border-r border-base-300 select-none z-20">
      {/* Top Header / Branding */}
      <div className="flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-content flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-primary">
                  NextJob
                </span>
                <span className="badge badge-xs bg-primary/10 text-primary border-none font-semibold px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-base-content/50 uppercase tracking-wider">
                AI Career Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-primary-content shadow-xs'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-300/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-primary-content' : 'text-base-content/60'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Minimal Bottom Status Card */}
      <div className="p-4 border-t border-base-300 bg-base-200">
        <div className="rounded-xl border border-base-300 bg-base-100 p-3.5 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Active Pipeline
            </span>
          </div>
          <p className="text-xs font-semibold text-primary truncate">
            ML Guard • Tavily Live • OpenAI
          </p>
          <p className="text-[11px] text-base-content/50 mt-0.5">
            Real-time verification ready
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
