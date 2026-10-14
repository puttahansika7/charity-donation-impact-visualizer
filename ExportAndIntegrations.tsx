import React, { useState } from 'react';
import {
  Download,
  Database,
  Github,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Terminal,
  FileSpreadsheet,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { DonationRecord, ImpactSummaryStats } from '../types/donation';
import { getSupabaseConfigStatus, SUPABASE_SETUP_SQL } from '../lib/supabase';

interface ExportAndIntegrationsProps {
  donations: DonationRecord[];
  stats: ImpactSummaryStats;
  onExportCSV: () => void;
  onResetSampleData: () => void;
}

export const ExportAndIntegrations: React.FC<ExportAndIntegrationsProps> = ({
  donations,
  stats,
  onExportCSV,
  onResetSampleData,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'supabase' | 'github'>('export');
  const supabaseStatus = getSupabaseConfigStatus();

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'export'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          CSV Export & Data
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'supabase'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Supabase Database
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'github'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          GitHub & Deployment
        </button>
      </div>

      {/* TAB 1: CSV Export & Ledger Controls */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Export Donation Impact Report (CSV)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal spreadsheet format compatible with Excel, Google Sheets, and Salesforce Non-Profit Cloud.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Records to Export:</span>
                <strong className="font-mono tabular-nums text-slate-900">{donations.length} entries</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cumulative Capital:</span>
                <strong className="font-mono tabular-nums text-emerald-700">
                  ${stats.totalDonations.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Program Incurred Outflow:</span>
                <strong className="font-mono tabular-nums text-amber-700">
                  ${stats.totalExpenses.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Export Scope:</span>
                <span className="text-slate-700 font-medium">All Donors, Programs, Dates, & Impact Receipts</span>
              </div>
            </div>

            <button
              onClick={onExportCSV}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Comprehensive CSV Report</span>
            </button>
          </div>

          {/* Reset / Ledger Seed Control */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sample Data & Persistence Control
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Records are automatically saved to your browser session. Restore default benchmark data anytime.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 text-slate-600">
                <p>
                  The initial dataset contains <strong>20 realistic donations</strong> representing individual givers, corporate matches, and philanthropic foundation endowments.
                </p>
                <p className="text-[11px] text-slate-400">
                  Clicking "Restore Initial Sample Data" resets any modified or deleted records to the benchmark dataset.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset all donation records to initial realistic sample data?')) {
                  onResetSampleData();
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Initial Sample Data</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Supabase Integration Panel */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Status Indicator */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  supabaseStatus.isConfigured
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Supabase PostgreSQL Readiness
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      supabaseStatus.isConfigured
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {supabaseStatus.isConfigured ? 'Connected' : 'Schema Ready'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {supabaseStatus.statusMessage}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>SQL Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Supabase SQL</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              3-Step Supabase Cloud Provisioning Guide
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">1. Create Project</span>
                <p className="text-slate-600">
                  Log in to <span className="font-semibold">supabase.com</span> and create a new project in your preferred cloud region.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">2. Execute SQL Script</span>
                <p className="text-slate-600">
                  Open the <strong>SQL Editor</strong> in Supabase, paste the schema script below, and click <strong>Run</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">3. Add Environment Keys</span>
                <p className="text-slate-600">
                  Copy your Project URL and public anon key into <code className="text-emerald-800 font-mono">.env</code> as <code className="text-emerald-800 font-mono">VITE_SUPABASE_URL</code>.
                </p>
              </div>
            </div>

            {/* SQL Preview Box */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  PostgreSQL Table & RLS Schema (supabase/schema.sql)
                </span>
                <button
                  onClick={handleCopySql}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  {copiedSql ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GitHub Deployment Ready */}
      {activeTab === 'github' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                GitHub Repository & Production Deployment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-stack architecture configured with zero API key leaks and production Vite/Express builds.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Security Guarantee */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Frontend API Key Exposure</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                All Gemini AI analytics calls execute strictly via server-side Express proxy endpoints (<code className="font-mono text-emerald-950 bg-emerald-100 px-1 py-0.5 rounded">/api/ai-insights</code>). Your <code className="font-mono text-emerald-950 bg-emerald-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is never included in client JavaScript bundles.
              </p>
            </div>

            {/* Build & Run Commands */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>Standard Build Pipeline</span>
              </div>
              <div className="font-mono text-[11px] bg-slate-900 text-slate-200 p-2.5 rounded-md space-y-1">
                <div># Install dependencies</div>
                <div className="text-emerald-400">npm install</div>
                <div># Start dev server with Gemini proxy</div>
                <div className="text-emerald-400">npm run dev</div>
                <div># Production static build</div>
                <div className="text-emerald-400">npm run build</div>
              </div>
            </div>
          </div>

          {/* Hosting Options */}
          <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
            <h4 className="font-bold text-slate-800">Recommended Production Hosts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900">Google Cloud Run</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Serverless container deploying Node.js with built-in auto-scaling and Gemini security.
                </div>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900">Vercel / Render</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Standard Node.js or SSR hosting with automatic Git push deployments.
                </div>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900">Supabase + Cloudflare</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  High-speed global CDN edge hosting backed by Supabase PostgreSQL.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
