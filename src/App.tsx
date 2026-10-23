
import { useState } from "react";
import AiInsightsSection from "./AiInsightsSection";

type Donation = {
  id: number;
  donor: string;
  amount: number;
  category: string;
  date: string;
  beneficiaries: number;
};

const initialDonations: Donation[] = [
  { id: 1, donor: "Ananya Foundation", amount: 25000, category: "Education", date: "2026-10-01", beneficiaries: 50 },
  { id: 2, donor: "Rahul Kumar", amount: 12000, category: "Healthcare", date: "2026-10-05", beneficiaries: 24 },
  { id: 3, donor: "Priya Sharma", amount: 18000, category: "Food", date: "2026-10-10", beneficiaries: 60 },
  { id: 4, donor: "Green Future Trust", amount: 30000, category: "Education", date: "2026-10-15", beneficiaries: 75 },
];

export default function App() {
  const [donations, setDonations] = useState(initialDonations);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [donor, setDonor] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Education");
  const [date, setDate] = useState("2026-10-23");
  const [beneficiaries, setBeneficiaries] = useState("");

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const people = donations.reduce((sum, d) => sum + d.beneficiaries, 0);

  const filtered = donations.filter((d) =>
    `${d.donor} ${d.category}`.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setDonor("");
    setAmount("");
    setCategory("Education");
    setDate("2026-10-23");
    setBeneficiaries("");
    setEditingId(null);
    setShowForm(false);
  }

  function saveDonation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const record: Donation = {
      id: editingId ?? Date.now(),
      donor: donor.trim(),
      amount: Number(amount),
      category,
      date,
      beneficiaries: Number(beneficiaries),
    };

    if (editingId !== null) {
      setDonations((old) => old.map((d) => d.id === editingId ? record : d));
    } else {
      setDonations((old) => [record, ...old]);
    }

    resetForm();
  }

  function editDonation(d: Donation) {
    setEditingId(d.id);
    setDonor(d.donor);
    setAmount(String(d.amount));
    setCategory(d.category);
    setDate(d.date);
    setBeneficiaries(String(d.beneficiaries));
    setShowForm(true);
  }

  function exportCSV() {
    const rows = [
      ["Donor", "Amount", "Category", "Date", "Beneficiaries"],
      ...donations.map((d) => [
        d.donor, String(d.amount), d.category, d.date, String(d.beneficiaries)
      ]),
    ];
    const csv = rows.map((row) =>
      row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "charity-donations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-emerald-800 px-5 py-6 text-white sm:px-10">
        <p className="text-sm text-emerald-100">CHARITY MANAGEMENT</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          Charity Donation Impact Visualizer
        </h1>
        <p className="mt-2 text-emerald-100">
          Track donations, expenses and community impact.
        </p>
      </header>

      <section className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Donations</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Expenses</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">₹18,500</p>
            <p className="mt-1 text-xs text-slate-400">Sample figure</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Beneficiaries Helped</p>
            <p className="mt-2 text-2xl font-bold text-blue-700">
              {people.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Donation Records</p>
            <p className="mt-2 text-2xl font-bold text-purple-700">
              {donations.length}
            </p>
          </div>
        </div>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Donation Records</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add, search, edit and remove donation records.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportCSV} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                Export CSV
              </button>
              <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                + Add Donation
              </button>
            </div>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor or category..."
            className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600"
          />

          {showForm && (
            <form onSubmit={saveDonation} className="mt-5 grid gap-4 rounded-xl border bg-slate-50 p-4 sm:grid-cols-2">
              <h3 className="font-bold sm:col-span-2">
                {editingId !== null ? "Edit Donation" : "Add New Donation"}
              </h3>
              <label className="text-sm font-medium">
                Donor Name
                <input required value={donor} onChange={(e) => setDonor(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3" />
              </label>
              <label className="text-sm font-medium">
                Amount (₹)
                <input required min="1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3" />
              </label>
              <label className="text-sm font-medium">
                Category
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3">
                  <option>Education</option>
                  <option>Healthcare</option>
                  <option>Food</option>
                  <option>Environment</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Date
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3" />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Beneficiaries
                <input required min="0" type="number" value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3" />
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white">Save</button>
                <button type="button" onClick={resetForm} className="rounded-lg border px-5 py-2">Cancel</button>
              </div>
            </form>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Donor</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Beneficiaries</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="p-3 font-medium">{d.donor}</td>
                    <td className="p-3">₹{d.amount.toLocaleString("en-IN")}</td>
                    <td className="p-3">{d.category}</td>
                    <td className="p-3">{d.date}</td>
                    <td className="p-3">{d.beneficiaries}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => editDonation(d)} className="rounded border px-3 py-1">Edit</button>
                        <button onClick={() => {
                          if (window.confirm("Delete this donation record?")) {
                            setDonations((old) => old.filter((item) => item.id !== d.id));
                          }
                        }} className="rounded border border-red-200 px-3 py-1 text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">No donation records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-sm text-slate-500">
          Charity Donation Impact Visualizer · Demo data for project preview
        </footer>
      </section>
    </main>
  );
    }
