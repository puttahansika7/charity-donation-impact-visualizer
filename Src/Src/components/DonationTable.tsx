import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Edit3,
  Eye,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  Building,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { DonationRecord, CharityCategory, DonationStatus, DonorType } from '../types/donation';
import { CATEGORY_METADATA } from '../data/sampleDonations';

interface DonationTableProps {
  donations: DonationRecord[];
  onAddClick: () => void;
  onEditClick: (record: DonationRecord) => void;
  onDeleteClick: (id: string) => void;
  onViewClick: (record: DonationRecord) => void;
  onExportCSV: () => void;
  selectedCategoryFilter?: string;
  onSelectCategoryFilter?: (cat: string) => void;
}

export const DonationTable: React.FC<DonationTableProps> = ({
  donations,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onExportCSV,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategoryFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [donorTypeFilter, setDonorTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'beneficiariesHelped'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync external category filter if passed
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setCategoryFilter(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const categories: CharityCategory[] = [
    'Clean Water',
    'Food & Nutrition',
    'Healthcare & Medicine',
    'Education & Literacy',
    'Disaster Relief',
    'Shelter & Housing',
  ];

  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      // Search matching
      const matchesSearch =
        item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category matching
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      // Status matching
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      // Donor Type matching
      const matchesDonorType =
        donorTypeFilter === 'all' || item.donorType === donorTypeFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesDonorType;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [donations, searchQuery, categoryFilter, statusFilter, donorTypeFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage) || 1;
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: 'date' | 'amount' | 'beneficiariesHelped') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setDonorTypeFilter('all');
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter('all');
    }
  };

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

  const getStatusBadge = (status: DonationStatus) => {
    switch (status) {
      case 'Deployed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Deployed
          </span>
        );
      case 'Allocated':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            Allocated
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            In Progress
          </span>
        );
    }
  };

  const getDonorTypeIcon = (type: DonorType) => {
    switch (type) {
      case 'Individual':
        return <User className="w-3.5 h-3.5 text-slate-400" />;
      case 'Corporate':
        return <Building className="w-3.5 h-3.5 text-slate-400" />;
      case 'Foundation':
        return <Shield className="w-3.5 h-3.5 text-slate-400" />;
      case 'Anonymous':
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Donation Records Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited donations, program expenses, and direct beneficiary impact accounts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title="Download records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search donor, campaign, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                if (onSelectCategoryFilter) onSelectCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Deployed">Deployed</option>
              <option value="Allocated">Allocated</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          {/* Donor Type Filter */}
          <div className="relative">
            <select
              value={donorTypeFilter}
              onChange={(e) => {
                setDonorTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 cursor-pointer"
            >
              <option value="all">All Donor Types</option>
              <option value="Individual">Individual Donors</option>
              <option value="Corporate">Corporate Sponsors</option>
              <option value="Foundation">Philanthropic Foundations</option>
              <option value="Anonymous">Anonymous</option>
            </select>
          </div>
        </div>

        {/* Active Filters Kicker & Quick Reset */}
        {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || donorTypeFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Showing <strong className="text-slate-800 font-mono tabular-nums">{filteredDonations.length}</strong> of{' '}
              <span className="font-mono tabular-nums">{donations.length}</span> total records
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Responsive Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Donor & Campaign</th>
              <th className="py-3 px-4">Category</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  <span>Donation ($)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Program Cost</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('beneficiariesHelped')}
              >
                <div className="flex items-center gap-1">
                  <span>Beneficiaries</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedDonations.length > 0 ? (
              paginatedDonations.map((item) => {
                const meta = CATEGORY_METADATA[item.category] || {
                  color: '#64748B',
                  textColor: '#1E293B',
                };

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Donor & Campaign */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">
                          {getDonorTypeIcon(item.donorType)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onViewClick(item)}
                            className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors text-left block truncate max-w-full"
                          >
                            {item.donorName}
                          </button>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.campaign}
                          </div>
                          {item.location && (
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category (Clean Unboxed Text with Separator) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-medium text-slate-700">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Donation Amount */}
                    <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </td>

                    {/* Program Expense */}
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {formatCurrency(item.expenseAmount)}
                    </td>

                    {/* Beneficiaries Helped */}
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-800 whitespace-nowrap">
                      <span className="font-semibold text-teal-700">
                        {formatNumber(item.beneficiariesHelped)}
                      </span>{' '}
                      <span className="text-[11px] text-slate-400">people</span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewClick(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="View transparency receipt"
                          aria-label="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditClick(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Edit record"
                          aria-label="Edit Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete donation from ${item.donorName}?`)) {
                              onDeleteClick(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete record"
                          aria-label="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        No matching donations found
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Try modifying your search criteria, category filters, or log a new record.
                      </p>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Page <strong className="font-mono tabular-nums text-slate-800">{currentPage}</strong> of{' '}
          <span className="font-mono tabular-nums">{totalPages}</span> ·{' '}
          <span className="font-mono tabular-nums">{filteredDonations.length}</span> total records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
