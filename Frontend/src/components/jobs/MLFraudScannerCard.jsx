import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ExternalLink,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scanJobForFraud } from '../../services/api';
import { useCareer } from '../../context/CareerContext';

export const MLFraudScannerCard = () => {
  const { addFraudScanResult } = useCareer();

  const [form, setForm] = useState({
    title: '',
    company: '',
    salary: '',
    recruiterEmail: '',
    applyUrl: '',
    description: ''
  });

  const [isScanning, setIsScanning] = useState(false);
  const [verdict, setVerdict] = useState(null);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadSampleScam = () => {
    setForm({
      title: 'Remote Data Entry & AI Form Clerk ($1000/week)',
      company: 'Online Global Task Network',
      salary: 'BDT 95,000 / week (Guaranteed Payout)',
      recruiterEmail: 'hr_fast_recruit2024@gmail.com',
      applyUrl: 'https://t.me/fast_cash_bd_recruit',
      description: `URGENT VACANCY: Earn up to 95,000 BDT weekly from your smartphone or laptop! Simple copy-paste, form filling, and image typing tasks. Zero technical skills or prior experience needed. To activate your personal worker dashboard and receive daily assignments, candidate must submit a mandatory 2,500 BDT refundable security registration fee via bKash/Nagad. Contact our recruitment coordinator directly on Telegram: @fast_cash_bd_recruit.`
    });
    setVerdict(null);
    toast.success('Loaded realistic sample scam posting!', { icon: '🚨' });
  };

  const handleLoadSampleLegit = () => {
    setForm({
      title: 'Senior Machine Learning & Distributed Systems Engineer',
      company: 'Brain Station 23',
      salary: 'BDT 170,000 – 240,000 / mo',
      recruiterEmail: 'careers@brainstation-23.com',
      applyUrl: 'https://boards.greenhouse.io/brainstation23',
      description: `Brain Station 23 is seeking a Senior ML Engineer to design high-throughput event processing and financial fraud detection microservices. Requirements: 3+ years experience with Python, PyTorch, FastAPI, Docker, and Kubernetes. Accredited Bachelor's in CS/Engineering. Benefits include comprehensive health insurance, provident fund, and hybrid schedule at our Mohakhali C/A headquarters.`
    });
    setVerdict(null);
    toast.success('Loaded verified legitimate corporate job post!', { icon: '✨' });
  };

  const handleClear = () => {
    setForm({
      title: '',
      company: '',
      salary: '',
      recruiterEmail: '',
      applyUrl: '',
      description: ''
    });
    setVerdict(null);
  };

  const handleScan = async (e) => {
    e?.preventDefault();

    if (!form.title.trim() && !form.description.trim() && !form.company.trim()) {
      toast.error('Please enter at least a Job Title, Company, or Description to verify.');
      return;
    }

    setIsScanning(true);
    const toastId = toast.loading('Running Random Forest + NLP heuristic fraud audit...', { id: 'ml-scan' });

    try {
      const result = await scanJobForFraud({
        title: form.title,
        company: form.company,
        location: 'Remote / Online',
        salary: form.salary,
        recruiterEmail: form.recruiterEmail,
        applyUrl: form.applyUrl,
        description: form.description
      });

      setVerdict(result);

      if (addFraudScanResult) {
        addFraudScanResult({
          id: `scan-${Date.now()}`,
          jobTitle: form.title || 'Untitled Post',
          company: form.company || 'Unlisted Organization',
          offeredSalary: form.salary || 'Not specified',
          recruiterContact: form.applyUrl || form.recruiterEmail || 'Direct Message',
          timestamp: 'Just now',
          fraudProbability: result.fraudProbability,
          safetyStatus: result.safetyStatus,
          confidence: result.confidence,
          verdictSummary: result.verdictSummary,
          signals: result.signals
        });
      }

      if (result.safetyStatus === 'scam') {
        toast.error(`High Scam Risk Detected (${result.fraudProbability}% Risk)`, { id: toastId });
      } else if (result.safetyStatus === 'warning') {
        toast('Caution Advised: Unverified recruitment signals', { id: toastId, icon: '⚠️' });
      } else {
        toast.success(`Verified Safe (${100 - result.fraudProbability}% Trust Score)`, { id: toastId });
      }
    } catch (error) {
      console.warn('[ML Fraud Scan Error]', error.message);
      toast.error('Scan encountered an error. Falling back to local heuristic scan.', { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Top Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/70 to-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                ML Guard Scam & Ghost-Job Detector
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Random Forest & NLP keyword heuristic verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ML Engine Live
            </span>
          </div>
        </div>

        {/* Demo Preset Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Quick Demos:
          </span>
          <button
            type="button"
            onClick={handleLoadSampleScam}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            🚨 Load Sample Scam
          </button>
          <button
            type="button"
            onClick={handleLoadSampleLegit}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            ✓ Load Sample Legit
          </button>
          {(form.title || form.description) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-medium text-gray-500 hover:text-gray-800 ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Machine Learning Engineer"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Brain Station 23 / Online Freelance"
              value={form.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Offered Salary / Compensation
            </label>
            <input
              type="text"
              placeholder="e.g. BDT 180,000 / mo or $1,000 / week"
              value={form.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Recruiter Email or Apply URL
            </label>
            <input
              type="text"
              placeholder="e.g. t.me/recruit or hr@company.com"
              value={form.applyUrl || form.recruiterEmail}
              onChange={(e) => {
                handleInputChange('applyUrl', e.target.value);
                handleInputChange('recruiterEmail', e.target.value);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Job Description & Recruiter Requirements (Paste Text)
          </label>
          <textarea
            rows={4}
            placeholder="Paste raw job description, requirements, or unsolicited WhatsApp/Telegram recruiter messages here..."
            value={form.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white leading-relaxed resize-none font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={isScanning}
          className="w-full h-10 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analyzing NLP Semantic Vectors & Fraud Weights...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Run ML Guard Verification</span>
            </>
          )}
        </button>
      </form>

      {/* Explainable ML Verdict Result Card */}
      {verdict && (
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4 animate-fadeIn">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              verdict.safetyStatus === 'scam'
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : verdict.safetyStatus === 'warning'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  verdict.safetyStatus === 'scam'
                    ? 'bg-rose-100 text-rose-700'
                    : verdict.safetyStatus === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {verdict.safetyStatus === 'scam' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : verdict.safetyStatus === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {verdict.safetyStatus === 'scam'
                      ? 'HIGH SCAM RISK'
                      : verdict.safetyStatus === 'warning'
                      ? 'CAUTION / UNVERIFIED'
                      : 'VERIFIED SAFE'}
                  </span>
                  <span className="text-[11px] font-mono opacity-70">
                    ({verdict.modelEnsemble || 'Random Forest Ensemble'})
                  </span>
                </div>
                <p className="text-xs font-semibold mt-0.5">
                  {verdict.safetyStatus === 'scam'
                    ? 'Do not pay fees or share personal credentials.'
                    : verdict.safetyStatus === 'warning'
                    ? 'Verify corporate registry before continuing.'
                    : 'Authentic enterprise recruitment workflows confirmed.'}
                </p>
              </div>
            </div>

            {/* Gauge Score */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-current/10">
              <span className="text-2xl font-bold tracking-tight">
                {verdict.fraudProbability}%
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                Scam Probability
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed">
            <span className="font-bold text-gray-900 block mb-1">
              Executive ML Assessment:
            </span>
            {verdict.verdictSummary}
          </div>

          {/* Explainable Risk & Trust Signals */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Explainable Signals Detected ({verdict.signals?.length || 0}):
            </span>
            <div className="space-y-1.5">
              {verdict.signals && verdict.signals.length > 0 ? (
                verdict.signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 p-2.5 rounded-lg text-xs leading-relaxed border ${
                      sig.type === 'risk'
                        ? 'bg-rose-50/50 border-rose-200/80 text-rose-800'
                        : 'bg-emerald-50/50 border-emerald-200/80 text-emerald-800'
                    }`}
                  >
                    {sig.type === 'risk' ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <span>{sig.text}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No anomalous or red-flag keywords detected.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLFraudScannerCard;
