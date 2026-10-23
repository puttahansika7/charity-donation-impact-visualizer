import {
  DonationRecord,
  CategoryMetric,
  MonthlyMetric,
  ImpactSummaryStats,
  CharityCategory,
} from '../types/donation';
import { SAMPLE_DONATIONS, CATEGORY_METADATA } from '../data/sampleDonations';

const STORAGE_KEY = 'impactlens_charity_donations_v1';

export function getStoredDonations(): DonationRecord[] {
  if (typeof window === 'undefined') {
    return SAMPLE_DONATIONS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DONATIONS));
      return SAMPLE_DONATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DONATIONS));
      return SAMPLE_DONATIONS;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to read donations from storage:', error);
    return SAMPLE_DONATIONS;
  }
}

export function saveDonations(donations: DonationRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  } catch (error) {
    console.error('Failed to save donations to storage:', error);
  }
}

export function addDonation(
  record: Omit<DonationRecord, 'id' | 'createdAt' | 'updatedAt'>
): DonationRecord {
  const current = getStoredDonations();
  const now = new Date().toISOString();
  const newRecord: DonationRecord = {
    ...record,
    id: `don-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newRecord, ...current];
  saveDonations(updated);
  return newRecord;
}

export function updateDonation(
  id: string,
  updates: Partial<DonationRecord>
): DonationRecord | null {
  const current = getStoredDonations();
  const index = current.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updatedRecord: DonationRecord = {
    ...current[index],
    ...updates,
    id, // protect id
    updatedAt: now,
  };

  current[index] = updatedRecord;
  saveDonations(current);
  return updatedRecord;
}

export function deleteDonation(id: string): boolean {
  const current = getStoredDonations();
  const filtered = current.filter((d) => d.id !== id);
  if (filtered.length === current.length) return false;
  saveDonations(filtered);
  return true;
}

export function resetToSampleData(): DonationRecord[] {
  saveDonations(SAMPLE_DONATIONS);
  return SAMPLE_DONATIONS;
}

export function calculateSummaryStats(donations: DonationRecord[]): ImpactSummaryStats {
  const totalDonations = donations.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalExpenses = donations.reduce((acc, d) => acc + (Number(d.expenseAmount) || 0), 0);
  const totalBeneficiaries = donations.reduce((acc, d) => acc + (Number(d.beneficiariesHelped) || 0), 0);
  const recordCount = donations.length;
  const netReserve = totalDonations - totalExpenses;
  const averageDonation = recordCount > 0 ? totalDonations / recordCount : 0;
  const costPerBeneficiary = totalBeneficiaries > 0 ? totalExpenses / totalBeneficiaries : 0;
  const deploymentRate = totalDonations > 0 ? (totalExpenses / totalDonations) * 100 : 0;

  return {
    totalDonations,
    totalExpenses,
    netReserve,
    totalBeneficiaries,
    averageDonation,
    costPerBeneficiary,
    deploymentRate,
    recordCount,
  };
}

export function calculateCategoryMetrics(donations: DonationRecord[]): CategoryMetric[] {
  const totalDonationsOverall = donations.reduce((acc, d) => acc + (Number(d.amount) || 0), 0) || 1;

  const categories: CharityCategory[] = [
    'Clean Water',
    'Food & Nutrition',
    'Healthcare & Medicine',
    'Education & Literacy',
    'Disaster Relief',
    'Shelter & Housing',
  ];

  return categories.map((cat) => {
    const matching = donations.filter((d) => d.category === cat);
    const totalDonations = matching.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
    const totalExpenses = matching.reduce((acc, d) => acc + (Number(d.expenseAmount) || 0), 0);
    const totalBeneficiaries = matching.reduce((acc, d) => acc + (Number(d.beneficiariesHelped) || 0), 0);
    const meta = CATEGORY_METADATA[cat] || {
      color: '#64748B',
      bgColor: '#F1F5F9',
      textColor: '#1E293B',
      description: '',
    };

    return {
      category: cat,
      totalDonations,
      totalExpenses,
      totalBeneficiaries,
      donationCount: matching.length,
      percentageOfTotal: (totalDonations / totalDonationsOverall) * 100,
      color: meta.color,
      bgColor: meta.bgColor,
      textColor: meta.textColor,
      iconName: cat,
    };
  }).sort((a, b) => b.totalDonations - a.totalDonations);
}

export function calculateMonthlyMetrics(donations: DonationRecord[]): MonthlyMetric[] {
  const map = new Map<string, { donations: number; expenses: number; beneficiaries: number }>();

  donations.forEach((d) => {
    if (!d.date) return;
    const monthKey = d.date.substring(0, 7); // "YYYY-MM"
    const current = map.get(monthKey) || { donations: 0, expenses: 0, beneficiaries: 0 };
    current.donations += Number(d.amount) || 0;
    current.expenses += Number(d.expenseAmount) || 0;
    current.beneficiaries += Number(d.beneficiariesHelped) || 0;
    map.set(monthKey, current);
  });

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const val = map.get(key)!;
    const [year, month] = key.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      month: key,
      label,
      donations: val.donations,
      expenses: val.expenses,
      beneficiaries: val.beneficiaries,
      netReserve: val.donations - val.expenses,
    };
  });
}

export function exportDonationsToCSV(donations: DonationRecord[]): void {
  const headers = [
    'ID',
    'Donor Name',
    'Donor Email',
    'Donor Type',
    'Donation Amount ($)',
    'Program Expenses ($)',
    'Date',
    'Category',
    'Campaign',
    'Beneficiaries Helped',
    'Payment Method',
    'Status',
    'Location',
    'Notes',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = donations.map((d) => [
    escapeCSV(d.id),
    escapeCSV(d.donorName),
    escapeCSV(d.donorEmail || ''),
    escapeCSV(d.donorType),
    escapeCSV(d.amount),
    escapeCSV(d.expenseAmount),
    escapeCSV(d.date),
    escapeCSV(d.category),
    escapeCSV(d.campaign),
    escapeCSV(d.beneficiariesHelped),
    escapeCSV(d.paymentMethod),
    escapeCSV(d.status),
    escapeCSV(d.location || ''),
    escapeCSV(d.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `charity_donation_impact_report_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
