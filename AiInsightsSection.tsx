import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Send,
  Lightbulb,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  DonationRecord,
  ImpactSummaryStats,
  CategoryMetric,
  AiInsightResponse,
} from '../types/donation';

interface AiInsightsSectionProps {
  donations: DonationRecord[];
  stats: ImpactSummaryStats;
  categoryData: CategoryMetric[];
}

export const AiInsightsSection: React.FC<AiInsightsSectionProps> = ({
  donations,
  stats,
  categoryData,
}) => {
  const [insight, setInsight] = useState<AiInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);

  const fetchInsights = async (promptOverride?: string) => {
    setIsLoading(true);
    setError(null);
    if (!promptOverride) {
      setCustomAnswer(null);
    }

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: stats,
          categoryBreakdown: categoryData.map((c) => ({
            category: c.category,
            totalDonations: c.totalDonations,
            totalExpenses: c.totalExpenses,
            beneficiaries: c.totalBeneficiaries,
            donationCount: c.donationCount,
          })),
          recentDonations: donations.slice(0, 6).map((d) => ({
            donorName: d.donorName,
            donorType: d.donorType,
            amount: d.amount,
            expenseAmount: d.expenseAmount,
            category: d.category,
            campaign: d.campaign,
            beneficiaries: d.beneficiariesHelped,
            date: d.date,
          })),
          customPrompt: promptOverride || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI insights (${response.status})`);
      }

      const data: AiInsightResponse = await response.json();
      setInsight(data);

      if (promptOverride && data.summary) {
        setCustomAnswer(data.summary);
      }
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      setError(err?.message || 'Could not connect to AI analytics service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [stats.recordCount]);

  const presetQuestions = [
    'Evaluate Q3-Q4 Fund Deployment Rate and Cash Reserves',
    'Identify Cost Optimization Opportunities in High-Expense Programs',
    'Draft a 3-Sentence Annual Impact Letter for Major Donors',
    'Analyze Which Cause Delivers the Highest Beneficiary Reach per $1,000',
  ];

  const handlePresetClick = (q: string) => {
    setCustomPrompt(q);
    fetchInsights(q);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    fetchInsights(customPrompt.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-900/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Gemini 3.8 Flash Impact Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Impact & Financial Health Insights
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Automated synthesis analyzing your ${stats.totalDonations.toLocaleString()} capital pool, field disbursements, and reach across {stats.totalBeneficiaries.toLocaleString()} verified beneficiaries.
            </p>
          </div>

          <button
            onClick={() => fetchInsights()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Re-Run Impact Audit'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Card */}
      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-rose-900">Unable to generate Gemini insights</h4>
            <p>{error}</p>
            <button
              onClick={() => fetchInsights()}
              className="mt-2 text-xs font-semibold text-rose-900 underline"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : isLoading && !insight ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Analyzing Philanthropic Performance & Unit ROI...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Gemini is evaluating multi-month expense ratios, beneficiary outcomes, and strategic capital reserves.
            </p>
          </div>
        </div>
      ) : insight ? (
        <div className="space-y-6">
          {/* Executive Overview & Score Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Efficiency Gauge (3 cols) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Capital Efficiency Rating
              </span>
              <div className="my-3 flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-emerald-700">
                  {insight.efficiencyScore || 91}
                </span>
                <span className="text-base text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                {insight.efficiencyScore >= 85
                  ? 'Exceeds standard 80% non-profit program deployment criteria.'
                  : 'Program allocation balanced with operating reserves.'}
              </p>
              {insight.isFallback && (
                <span className="mt-3 text-[10px] text-slate-400 font-mono">
                  Calculated using local financial algorithms
                </span>
              )}
            </div>

            {/* Executive Summary (8 cols) */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Executive Briefing
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Live Financial Ledger</span>
              </div>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                {insight.summary}
              </p>

              {customAnswer && (
                <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Focused Analysis: "{customPrompt}"
                  </span>
                  {customAnswer}
                </div>
              )}
            </div>
          </div>

          {/* Key Findings & Recommendations Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Findings */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Key Financial & Impact Observations
                </h3>
              </div>

              <ul className="space-y-3">
                {(insight.keyFindings || []).map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Strategic Non-Profit Recommendations
                </h3>
              </div>

              <ul className="space-y-3">
                {(insight.strategicRecommendations || []).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Public Transparency Narrative */}
          {insight.impactMilestoneNarrative && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Donor Transparency & Annual Report Copy</span>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "{insight.impactMilestoneNarrative}"
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Interactive AI Query Box & Prompt Presets */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Interactive Impact Inquiries
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Ask specific financial or programmatic questions
          </span>
        </div>

        {/* Preset Question Buttons */}
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(q)}
              className="text-left px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="e.g. How does our Clean Water program compare against Food & Nutrition in cost efficiency?"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !customPrompt.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
