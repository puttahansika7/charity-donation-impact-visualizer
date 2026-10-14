import React from 'react';
import { DollarSign, TrendingUp, Users, ShieldCheck, ArrowUpRight, Scale } from 'lucide-react';
import { ImpactSummaryStats } from '../types/donation';

interface DashboardKpisProps {
  stats: ImpactSummaryStats;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ stats }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <section className="space-y-4">
      {/* 4 Primary Financial & Impact KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Donations
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(stats.totalDonations)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-emerald-700 font-medium inline-flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
                {stats.recordCount} records
              </span>
              <span aria-hidden="true">·</span>
              <span>Avg {formatCurrency(stats.averageDonation)}</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Program Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(stats.totalExpenses)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-mono tabular-nums font-medium text-slate-700">
                {stats.deploymentRate.toFixed(1)}% deployed
              </span>
              <span aria-hidden="true">·</span>
              <span>Direct field programs</span>
            </div>
          </div>
        </div>

        {/* Net Impact Capital */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Impact Reserve
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(stats.netReserve)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-mono tabular-nums font-medium text-blue-700">
                {((stats.netReserve / (stats.totalDonations || 1)) * 100).toFixed(1)}% liquidity
              </span>
              <span aria-hidden="true">·</span>
              <span>Future contingencies</span>
            </div>
          </div>
        </div>

        {/* Beneficiaries Helped */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Beneficiaries Helped
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatNumber(stats.totalBeneficiaries)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-mono tabular-nums font-medium text-teal-700">
                ${stats.costPerBeneficiary.toFixed(2)}
              </span>
              <span aria-hidden="true">·</span>
              <span>Per individual helped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Efficiency & Operational Transparency Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Nonprofit Financial Integrity Benchmark
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Program efficiency meets GuideStar Platinum transparency standards with 82%+ direct program capital allocation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 w-full md:w-auto">
          <div>
            <div className="text-xs text-slate-400">Program Execution</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono tabular-nums">
              {stats.deploymentRate.toFixed(1)}% of Capital
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Average Unit Cost</div>
            <div className="text-sm font-semibold text-white font-mono tabular-nums">
              ${stats.costPerBeneficiary.toFixed(2)} / Person
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Operating Reserve</div>
            <div className="text-sm font-semibold text-blue-300 font-mono tabular-nums">
              {formatCurrency(stats.netReserve)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
