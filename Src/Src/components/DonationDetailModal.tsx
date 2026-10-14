import React from 'react';
import {
  X,
  Printer,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  CreditCard,
  HeartHandshake,
} from 'lucide-react';
import { DonationRecord } from '../types/donation';
import { CATEGORY_METADATA } from '../data/sampleDonations';

interface DonationDetailModalProps {
  record: DonationRecord | null;
  onClose: () => void;
  onEdit: (record: DonationRecord) => void;
}

export const DonationDetailModal: React.FC<DonationDetailModalProps> = ({
  record,
  onClose,
  onEdit,
}) => {
  if (!record) return null;

  const meta = CATEGORY_METADATA[record.category] || {
    color: '#0D9488',
    bgColor: '#F0FDFA',
    textColor: '#115E59',
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

  const costPerBeneficiary =
    record.beneficiariesHelped > 0
      ? record.expenseAmount / record.beneficiariesHelped
      : 0;

  const executionRatio =
    record.amount > 0 ? (record.expenseAmount / record.amount) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Audited Transparency Receipt · {record.id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Main Title & Donor */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{record.donorType} Donor</span>
              <span aria-hidden="true">·</span>
              <span>{record.paymentMethod}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">{record.status}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {record.donorName}
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Campaign: <span className="text-slate-900">{record.campaign}</span>
            </p>
          </div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">
                Donation Amount
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {formatCurrency(record.amount)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">
                Deployed Outflow
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-700 mt-0.5">
                {formatCurrency(record.expenseAmount)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">
                Net Reserve
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-blue-700 mt-0.5">
                {formatCurrency(record.amount - record.expenseAmount)}
              </div>
            </div>
          </div>

          {/* Verified Beneficiary Outcomes */}
          <div className="space-y-3 p-4 rounded-xl border border-teal-200 bg-teal-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-700" />
                Verified Community Outcome
              </span>
              <span className="text-xs font-mono tabular-nums text-teal-800 font-semibold">
                {executionRatio.toFixed(1)}% Deployed Directly
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {formatNumber(record.beneficiariesHelped)}
                </span>
                <span className="text-xs text-slate-600 ml-1.5">Individuals Directly Impacted</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono tabular-nums text-teal-800">
                  ${costPerBeneficiary.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 block">per individual helped</span>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Received: <strong className="text-slate-800 font-mono tabular-nums">{record.date}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Location: <strong className="text-slate-800">{record.location || 'Global Headquarters'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Method: <strong className="text-slate-800">{record.paymentMethod}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Category: <strong className="text-slate-800">{record.category}</strong></span>
            </div>
          </div>

          {/* Notes / Narrative */}
          {record.notes && (
            <div className="space-y-1.5 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Impact Narrative & Field Log
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {record.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            Updated {new Date(record.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Edit Record
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
