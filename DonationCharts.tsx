import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Users,
  Info,
} from 'lucide-react';
import { CategoryMetric, MonthlyMetric } from '../types/donation';

interface DonationChartsProps {
  monthlyData: MonthlyMetric[];
  categoryData: CategoryMetric[];
  onSelectCategoryFilter?: (category: string) => void;
  selectedCategoryFilter?: string;
}

export const DonationCharts: React.FC<DonationChartsProps> = ({
  monthlyData,
  categoryData,
  onSelectCategoryFilter,
  selectedCategoryFilter,
}) => {
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryMetric | null>(null);
  const [activeTab, setActiveTab] = useState<'financials' | 'impact'>('financials');

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

  // Find max value for monthly chart scaling
  const maxMonthlyVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.donations, m.expenses)),
    10000
  );

  // Total donations across categories for percentages
  const totalCatDonations = categoryData.reduce((acc, c) => acc + c.totalDonations, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Chart Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Financial & Impact Visualizer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time trajectory of philanthropic capital inflows, field disbursements, and verified community outcomes.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'financials'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Financial Flow
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'impact'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Beneficiary Reach
          </button>
        </div>
      </div>

      {/* Grid of Two Dominant Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Monthly Donations & Program Expenses (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeTab === 'financials'
                      ? 'Monthly Inflows vs. Program Outflows'
                      : 'Beneficiaries Served by Month'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                      Donations Received
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                      Program Expenses
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>2026 Fiscal Year</span>
              </div>
            </div>

            {/* Interactive SVG / Bar Chart Container */}
            <div className="relative h-64 w-full pt-4 pb-6">
              {/* Y-Axis Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400">
                <div className="border-b border-slate-100 flex justify-between pb-0.5">
                  <span>{formatCurrency(maxMonthlyVal)}</span>
                </div>
                <div className="border-b border-slate-100 flex justify-between pb-0.5">
                  <span>{formatCurrency(maxMonthlyVal * 0.75)}</span>
                </div>
                <div className="border-b border-slate-100 flex justify-between pb-0.5">
                  <span>{formatCurrency(maxMonthlyVal * 0.5)}</span>
                </div>
                <div className="border-b border-slate-100 flex justify-between pb-0.5">
                  <span>{formatCurrency(maxMonthlyVal * 0.25)}</span>
                </div>
                <div className="border-b border-slate-200 pb-0.5" />
              </div>

              {/* Bar Columns */}
              <div className="relative h-full flex items-end justify-between gap-1 sm:gap-2 px-6 z-10">
                {monthlyData.map((item, index) => {
                  const donationHeight = Math.max((item.donations / maxMonthlyVal) * 100, 2);
                  const expenseHeight = Math.max((item.expenses / maxMonthlyVal) * 100, 2);
                  const isHovered = hoveredMonthIndex === index;

                  return (
                    <div
                      key={item.month}
                      className="group flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIndex(index)}
                      onMouseLeave={() => setHoveredMonthIndex(null)}
                    >
                      {/* Interactive Bars Container */}
                      <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                        {/* Donation Bar */}
                        <div
                          style={{ height: `${donationHeight}%` }}
                          className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                            isHovered
                              ? 'bg-emerald-500 shadow-md ring-2 ring-emerald-300'
                              : 'bg-emerald-600'
                          }`}
                        />
                        {/* Expense Bar */}
                        <div
                          style={{ height: `${expenseHeight}%` }}
                          className={`w-1/2 rounded-t-sm transition-all duration-200 ${
                            isHovered
                              ? 'bg-amber-400 shadow-md ring-2 ring-amber-300'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>

                      {/* Month Label */}
                      <span
                        className={`text-[11px] font-medium mt-2 whitespace-nowrap transition-colors ${
                          isHovered ? 'text-emerald-700 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {item.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Month Hover Card / Detail Strip */}
          <div className="mt-2 pt-3 border-t border-slate-100 min-h-[48px] flex items-center justify-between text-xs">
            {hoveredMonthIndex !== null && monthlyData[hoveredMonthIndex] ? (
              <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">
                  {monthlyData[hoveredMonthIndex].label}
                </span>
                <div className="flex items-center gap-4 text-slate-600">
                  <span>
                    Donations:{' '}
                    <strong className="text-emerald-700 font-mono tabular-nums">
                      {formatCurrency(monthlyData[hoveredMonthIndex].donations)}
                    </strong>
                  </span>
                  <span>
                    Expenses:{' '}
                    <strong className="text-amber-700 font-mono tabular-nums">
                      {formatCurrency(monthlyData[hoveredMonthIndex].expenses)}
                    </strong>
                  </span>
                  <span>
                    Beneficiaries:{' '}
                    <strong className="text-slate-900 font-mono tabular-nums">
                      {formatNumber(monthlyData[hoveredMonthIndex].beneficiaries)}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Hover over any month to view detailed financial delta and beneficiary impact.</span>
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Charity Category Allocation (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Category Allocation Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any category to filter the donation records.
                  </p>
                </div>
              </div>

              {selectedCategoryFilter && (
                <button
                  onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('all')}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Circular Proportional Gauge & List */}
            <div className="space-y-3">
              {categoryData.map((cat) => {
                const isSelected = selectedCategoryFilter === cat.category;
                const isHovered = hoveredCategory?.category === cat.category;

                return (
                  <div
                    key={cat.category}
                    onClick={() => onSelectCategoryFilter && onSelectCategoryFilter(cat.category)}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                        : isHovered
                        ? 'border-slate-300 bg-slate-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-800">{cat.category}</span>
                        <span className="text-slate-400 font-mono tabular-nums">
                          ({cat.donationCount})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {formatCurrency(cat.totalDonations)}
                        </span>
                        <span className="font-mono tabular-nums text-slate-500 text-[11px] w-12 text-right">
                          {cat.percentageOfTotal.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Proportion */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${cat.percentageOfTotal}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>

                    {/* Secondary Metrics Strip */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Expenses: {formatCurrency(cat.totalExpenses)}</span>
                      <span>{formatNumber(cat.totalBeneficiaries)} people reached</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Total Categories: {categoryData.length}</span>
            <span className="font-mono tabular-nums font-medium text-slate-700">
              100% Capital Accounted
            </span>
          </div>
        </div>
      </div>

      {/* CHART 3: Beneficiary Reach & Unit Cost Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Beneficiary Impact & Unit Efficiency by Sector
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates how many lives are transformed per $1,000 of program funding across categories.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Audited Outcome Statistics</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryData.map((cat) => {
            const costPerPerson = cat.totalBeneficiaries > 0
              ? cat.totalExpenses / cat.totalBeneficiaries
              : 0;
            const peoplePerThousand = cat.totalExpenses > 0
              ? (cat.totalBeneficiaries / cat.totalExpenses) * 1000
              : 0;

            return (
              <div
                key={`metric-${cat.category}`}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">{cat.category}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm font-mono tabular-nums"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    ${costPerPerson.toFixed(2)} / person
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Beneficiaries Reached:</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {formatNumber(cat.totalBeneficiaries)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Reach per $1,000 Expended:</span>
                    <span className="font-mono tabular-nums font-medium text-emerald-700">
                      ~{peoplePerThousand.toFixed(0)} people
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
