import React, { useState, useEffect } from 'react';
import { X, DollarSign, Users, Calendar, Sparkles } from 'lucide-react';
import {
  DonationRecord,
  CharityCategory,
  DonorType,
  PaymentMethod,
  DonationStatus,
} from '../types/donation';
import { CATEGORY_METADATA } from '../data/sampleDonations';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<DonationRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingRecord?: DonationRecord | null;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
}) => {
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorType, setDonorType] = useState<DonorType>('Individual');
  const [amount, setAmount] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<CharityCategory>('Clean Water');
  const [campaign, setCampaign] = useState('');
  const [beneficiariesHelped, setBeneficiariesHelped] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [status, setStatus] = useState<DonationStatus>('Deployed');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRecord) {
      setDonorName(editingRecord.donorName);
      setDonorEmail(editingRecord.donorEmail || '');
      setDonorType(editingRecord.donorType);
      setAmount(String(editingRecord.amount));
      setExpenseAmount(String(editingRecord.expenseAmount));
      setDate(editingRecord.date);
      setCategory(editingRecord.category);
      setCampaign(editingRecord.campaign);
      setBeneficiariesHelped(String(editingRecord.beneficiariesHelped));
      setPaymentMethod(editingRecord.paymentMethod);
      setStatus(editingRecord.status);
      setLocation(editingRecord.location || '');
      setNotes(editingRecord.notes || '');
    } else {
      // Defaults for new donation
      setDonorName('');
      setDonorEmail('');
      setDonorType('Individual');
      setAmount('');
      setExpenseAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Clean Water');
      setCampaign('');
      setBeneficiariesHelped('');
      setPaymentMethod('Bank Transfer');
      setStatus('Deployed');
      setLocation('');
      setNotes('');
    }
    setFormErrors({});
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  // Auto calculate recommended expense based on standard overhead ratio (85% to 90% direct program)
  const applyExpenseRatio = (ratio: number) => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      setExpenseAmount(Math.round(numAmount * ratio).toString());
    }
  };

  // Auto calculate beneficiaries heuristic based on category
  const suggestBeneficiaries = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    let costMultiplier = 15; // default ~$15 per person
    if (category === 'Clean Water') costMultiplier = 14;
    else if (category === 'Food & Nutrition') costMultiplier = 9;
    else if (category === 'Healthcare & Medicine') costMultiplier = 26;
    else if (category === 'Education & Literacy') costMultiplier = 32;
    else if (category === 'Disaster Relief') costMultiplier = 21;
    else if (category === 'Shelter & Housing') costMultiplier = 110;

    const estimated = Math.max(Math.round(numAmount / costMultiplier), 1);
    setBeneficiariesHelped(estimated.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!donorName.trim()) errors.donorName = 'Donor name is required';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Valid positive donation amount required';
    }

    const numExpense = parseFloat(expenseAmount);
    if (isNaN(numExpense) || numExpense < 0) {
      errors.expenseAmount = 'Valid program expense required (0 or greater)';
    }

    if (!campaign.trim()) errors.campaign = 'Campaign name is required';

    const numBeneficiaries = parseInt(beneficiariesHelped, 10);
    if (isNaN(numBeneficiaries) || numBeneficiaries < 0) {
      errors.beneficiariesHelped = 'Beneficiaries must be 0 or greater';
    }

    if (!date) errors.date = 'Date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSave({
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim() || undefined,
      donorType,
      amount: numAmount,
      expenseAmount: numExpense,
      date,
      category,
      campaign: campaign.trim(),
      beneficiariesHelped: numBeneficiaries,
      paymentMethod,
      status,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const categories: CharityCategory[] = [
    'Clean Water',
    'Food & Nutrition',
    'Healthcare & Medicine',
    'Education & Literacy',
    'Disaster Relief',
    'Shelter & Housing',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingRecord ? 'Edit Donation Record' : 'Record New Donation'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter verified donation funds, allocated expenses, and community reach.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Donor Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Donor Name / Entity *
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Philanthropy, Jane Doe"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 ${
                  formErrors.donorName ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {formErrors.donorName && (
                <p className="text-[11px] text-rose-600">{formErrors.donorName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Donor Type
              </label>
              <select
                value={donorType}
                onChange={(e) => setDonorType(e.target.value as DonorType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
              >
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Foundation">Foundation</option>
                <option value="Anonymous">Anonymous</option>
              </select>
            </div>
          </div>

          {/* Row 2: Amounts (Donation vs Program Expense) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Donation Received ($) *
                </label>
              </div>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="any"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums text-slate-900 ${
                    formErrors.amount ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {formErrors.amount && (
                <p className="text-[11px] text-rose-600">{formErrors.amount}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Program Expenses ($) *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyExpenseRatio(0.85)}
                    className="text-[10px] text-emerald-700 hover:underline"
                  >
                    85%
                  </button>
                  <span className="text-[10px] text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => applyExpenseRatio(0.92)}
                    className="text-[10px] text-emerald-700 hover:underline"
                  >
                    92%
                  </button>
                  <span className="text-[10px] text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => applyExpenseRatio(1.0)}
                    className="text-[10px] text-emerald-700 hover:underline"
                  >
                    100%
                  </button>
                </div>
              </div>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="any"
                  placeholder="4250"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums text-slate-900 ${
                    formErrors.expenseAmount ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {formErrors.expenseAmount && (
                <p className="text-[11px] text-rose-600">{formErrors.expenseAmount}</p>
              )}
            </div>
          </div>

          {/* Row 3: Category & Campaign */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Charity Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CharityCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                {CATEGORY_METADATA[category]?.description}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Program / Campaign Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Village Solar Borehole Well #4"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 ${
                  formErrors.campaign ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {formErrors.campaign && (
                <p className="text-[11px] text-rose-600">{formErrors.campaign}</p>
              )}
            </div>
          </div>

          {/* Row 4: Beneficiaries & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Beneficiaries Reached *
                </label>
                <button
                  type="button"
                  onClick={suggestBeneficiaries}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Estimate Reach
                </button>
              </div>
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="350"
                  value={beneficiariesHelped}
                  onChange={(e) => setBeneficiariesHelped(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono tabular-nums text-slate-900 ${
                    formErrors.beneficiariesHelped ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {formErrors.beneficiariesHelped && (
                <p className="text-[11px] text-rose-600">{formErrors.beneficiariesHelped}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Donation Date *
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 ${
                    formErrors.date ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
              {formErrors.date && (
                <p className="text-[11px] text-rose-600">{formErrors.date}</p>
              )}
            </div>
          </div>

          {/* Row 5: Payment Method, Status & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Crypto">Crypto (USDC/ETH)</option>
                <option value="Payroll Giving">Payroll Giving</option>
                <option value="Cheque">Direct Cheque</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Deployment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DonationStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
              >
                <option value="Deployed">Deployed in Field</option>
                <option value="Allocated">Allocated to Program</option>
                <option value="In Progress">Execution In Progress</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Location / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Turkana, Kenya"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>
          </div>

          {/* Row 6: Impact Narrative / Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Impact Narrative & Execution Notes
            </label>
            <textarea
              rows={3}
              placeholder="Describe equipment purchased, community feedback, or operational milestones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              {editingRecord ? 'Save Changes' : 'Record Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
