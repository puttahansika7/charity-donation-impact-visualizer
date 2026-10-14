/**
 * Charity Donation Impact Visualizer
 * Comprehensive non-profit financial tracking, interactive charts, and AI-powered donor insights.
 */

import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart3,
  ListFilter,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

import {
  getStoredDonations,
  addDonation,
  updateDonation,
  deleteDonation,
  resetToSampleData,
  calculateSummaryStats,
  calculateCategoryMetrics,
  calculateMonthlyMetrics,
  exportDonationsToCSV,
} from './lib/storage';
import { DonationRecord } from './types/donation';

import { Header } from './components/Header';
import { DashboardKpis } from './components/DashboardKpis';
import { DonationCharts } from './components/DonationCharts';
import { DonationTable } from './components/DonationTable';
import { DonationModal } from './components/DonationModal';
import { DonationDetailModal } from './components/DonationDetailModal';
import { AiInsightsSection } from './components/AiInsightsSection';
import { ExportAndIntegrations } from './components/ExportAndIntegrations';

export default function App() {
  const [donations, setDonations] = useState<DonationRecord[]>(() => getStoredDonations());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<DonationRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<DonationRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Aggregated calculations
  const summaryStats = useMemo(() => calculateSummaryStats(donations), [donations]);
  const categoryMetrics = useMemo(() => calculateCategoryMetrics(donations), [donations]);
  const monthlyMetrics = useMemo(() => calculateMonthlyMetrics(donations), [donations]);

  // Handlers
  const handleSaveDonation = (data: Omit<DonationRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRecord) {
      const updated = updateDonation(editingRecord.id, data);
      if (updated) {
        setDonations(getStoredDonations());
        showToast('Donation record updated successfully.');
      }
      setEditingRecord(null);
    } else {
      addDonation(data);
      setDonations(getStoredDonations());
      showToast('New donation recorded successfully.');
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteDonation = (id: string) => {
    const success = deleteDonation(id);
    if (success) {
      setDonations(getStoredDonations());
      showToast('Donation record deleted.');
    }
  };

  const handleResetSampleData = () => {
    const fresh = resetToSampleData();
    setDonations(fresh);
    showToast('Restored default realistic benchmark data.');
  };

  const handleExportCSV = () => {
    exportDonationsToCSV(donations);
    showToast('CSV report downloaded.');
  };

  const handleCategorySelectFromChart = (cat: string) => {
    setSelectedCategoryFilter(cat);
    setActiveTab('donations');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Strict Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingRecord(null);
          setIsAddModalOpen(true);
        }}
        donationCount={donations.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Hero / Executive Kicker */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
                  <span>Transparent Non-Profit Ledger</span>
                  <span aria-hidden="true">·</span>
                  <span>Fiscal Year 2026</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Charity Donation Impact Visualizer
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  Real-time visualization connecting philanthropic capital, field expense efficiency, and verified community outcomes.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => {
                    setEditingRecord(null);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Donation</span>
                </button>
              </div>
            </div>

            {/* Dashboard Primary KPIs */}
            <DashboardKpis stats={summaryStats} />

            {/* Interactive Visualizations Preview */}
            <DonationCharts
              monthlyData={monthlyMetrics}
              categoryData={categoryMetrics}
              onSelectCategoryFilter={handleCategorySelectFromChart}
              selectedCategoryFilter={selectedCategoryFilter}
            />

            {/* AI Insights Teaser Card */}
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-sm border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    AI Impact Audit & Intelligence
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                    Run automated syntheses powered by Gemini 3.8 Flash to evaluate capital deployment velocity, program efficiency, and draft donor impact letters.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai-insights')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>Launch AI Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recent Donations Table Snippet */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Recent Donation Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing latest contributions with verified program allocations.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('donations')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  <span>View All {donations.length} Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <DonationTable
                donations={donations}
                onAddClick={() => {
                  setEditingRecord(null);
                  setIsAddModalOpen(true);
                }}
                onEditClick={(record) => {
                  setEditingRecord(record);
                  setIsAddModalOpen(true);
                }}
                onDeleteClick={handleDeleteDonation}
                onViewClick={(record) => setViewingRecord(record)}
                onExportCSV={handleExportCSV}
                selectedCategoryFilter={selectedCategoryFilter}
                onSelectCategoryFilter={setSelectedCategoryFilter}
              />
            </div>
          </div>
        )}

        {/* TAB 2: DONATIONS LEDGER */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Donation Ledger & Impact Records
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete database of donations received, operational program costs, and direct beneficiaries helped.
              </p>
            </div>

            <DonationTable
              donations={donations}
              onAddClick={() => {
                setEditingRecord(null);
                setIsAddModalOpen(true);
              }}
              onEditClick={(record) => {
                setEditingRecord(record);
                setIsAddModalOpen(true);
              }}
              onDeleteClick={handleDeleteDonation}
              onViewClick={(record) => setViewingRecord(record)}
              onExportCSV={handleExportCSV}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectCategoryFilter={setSelectedCategoryFilter}
            />
          </div>
        )}

        {/* TAB 3: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Interactive Analytics & Allocation Charts
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-dimensional views of financial inflows, field deployment efficiency, and community reach.
              </p>
            </div>

            {/* Quick Summary Strip */}
            <DashboardKpis stats={summaryStats} />

            {/* Full Charts Suite */}
            <DonationCharts
              monthlyData={monthlyMetrics}
              categoryData={categoryMetrics}
              onSelectCategoryFilter={handleCategorySelectFromChart}
              selectedCategoryFilter={selectedCategoryFilter}
            />
          </div>
        )}

        {/* TAB 4: AI INSIGHTS */}
        {activeTab === 'ai-insights' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Gemini AI Impact & Financial Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Objective non-profit analytics generated server-side using Google Gemini 3.8 Flash.
              </p>
            </div>

            <AiInsightsSection
              donations={donations}
              stats={summaryStats}
              categoryData={categoryMetrics}
            />
          </div>
        )}

        {/* TAB 5: EXPORT & INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Data Management, Supabase & Deployment
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Download verified CSV reports, connect to Supabase PostgreSQL, and review GitHub deployment configs.
              </p>
            </div>

            <ExportAndIntegrations
              donations={donations}
              stats={summaryStats}
              onExportCSV={handleExportCSV}
              onResetSampleData={handleResetSampleData}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800">
              ImpactLens · Charity Donation Impact Visualizer
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>GuideStar Platinum Standards</span>
            <span aria-hidden="true">·</span>
            <span>Supabase Ready</span>
            <span aria-hidden="true">·</span>
            <span>Gemini AI Grounded</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DonationModal
        isOpen={isAddModalOpen || editingRecord !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveDonation}
        editingRecord={editingRecord}
      />

      <DonationDetailModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
        onEdit={(record) => {
          setViewingRecord(null);
          setEditingRecord(record);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
}
