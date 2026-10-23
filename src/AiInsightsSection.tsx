import React from "react";

interface Donation {
donorName?: string;
amount: number;
category?: string;
beneficiaries?: number;
}

interface AiInsightsSectionProps {
donations?: Donation[];
}

export default function AiInsightsSection({
donations = [],
}: AiInsightsSectionProps) {
const totalDonations = donations.reduce(
(sum, donation) => sum + Number(donation.amount || 0),
0
);

const totalBeneficiaries = donations.reduce(
(sum, donation) =>
sum + Number(donation.beneficiaries || 0),
0
);

const categoryTotals = donations.reduce(
(totals: Record<string, number>, donation) => {
const category = donation.category || "Other";
totals[category] =
(totals[category] || 0) + Number(donation.amount || 0);
return totals;
},
{}
);

const topCategory = Object.entries(categoryTotals).sort(
(a, b) => b[1] - a[1]
)[0];

const insights = [
{
title: "Donation Overview",
description:
donations.length > 0
? "You have recorded ${donations.length} donation(s), totaling ₹${totalDonations.toLocaleString("en-IN")}."
: "Add donation records to start analyzing your charity impact.",
icon: "💰",
},
{
title: "Popular Donation Category",
description: topCategory
? "${topCategory[0]} has received the highest recorded donations of ₹${topCategory[1].toLocaleString("en-IN")}."
: "Add categorized donations to discover your most supported cause.",
icon: "📊",
},
{
title: "Community Impact",
description:
"Your recorded donations have helped ${totalBeneficiaries} beneficiaries. " +
(totalBeneficiaries > 0
? "Continue tracking beneficiaries to understand your impact."
: "Add beneficiary counts to measure your impact."),
icon: "❤️",
},
{
title: "Recommendation",
description: topCategory
? "Review funding across categories and consider supporting causes with fewer recorded donations."
: "Record donations by category to identify areas that may need more support.",
icon: "💡",
},
];

return (
<section className="my-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
<div className="mb-5 flex items-center gap-3">
<div className="rounded-xl bg-purple-100 p-3 text-2xl">✨</div>
<div>
<h2 className="text-xl font-bold text-gray-900">
AI Insights
</h2>
<p className="text-sm text-gray-500">
Donation analysis and impact recommendations
</p>
</div>
</div>

  &lt;div className="grid grid-cols-1 gap-4 md:grid-cols-2"&gt;
    {insights.map((insight) => (
      &lt;div
        key={insight.title}
        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
      &gt;
        &lt;div className="mb-2 flex items-center gap-2"&gt;
          &lt;span className="text-2xl"&gt;{insight.icon}&lt;/span&gt;
          &lt;h3 className="font-semibold text-gray-800"&gt;
            {insight.title}
          &lt;/h3&gt;
        &lt;/div&gt;
        &lt;p className="text-sm leading-6 text-gray-600"&gt;
          {insight.description}
        &lt;/p&gt;
      &lt;/div&gt;
    ))}
  &lt;/div&gt;

  &lt;p className="mt-4 text-xs text-gray-400"&gt;
    Insights are generated from recorded donation data. They are not live
    Gemini AI responses.
  &lt;/p&gt;
&lt;/section&gt;

);
}
