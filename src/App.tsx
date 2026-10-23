import React from "react";

type Donation = {
donorName?: string;
amount: number;
category?: string;
beneficiaries?: number;
};

type Props = {
donations?: Donation[];
};

export default function AiInsightsSection({ donations = [] }: Props) {
const total = donations.reduce(
(sum, d) => sum + Number(d.amount || 0),
0
);

const beneficiaries = donations.reduce(
(sum, d) => sum + Number(d.beneficiaries || 0),
0
);

const categories: Record<string, number> = {};

donations.forEach((d) => {
const category = d.category || "Other";
categories[category] =
(categories[category] || 0) + Number(d.amount || 0);
});

const topCategory = Object.entries(categories).sort(
(a, b) => b[1] - a[1]
)[0];

const insights = [
{
icon: "💰",
title: "Donation Overview",
description:
"You have recorded " +
donations.length +
" donation(s), totaling ₹" +
total.toLocaleString("en-IN") +
".",
},
{
icon: "📊",
title: "Popular Category",
description: topCategory
? topCategory[0] +
" has the highest recorded donations: ₹" +
topCategory[1].toLocaleString("en-IN") +
"."
: "Add categorized donations to see the popular category.",
},
{
icon: "❤️",
title: "Community Impact",
description:
"Your recorded donations have helped " +
beneficiaries +
" beneficiaries.",
},
{
icon: "💡",
title: "Recommendation",
description:
"Review donation distribution across categories to identify causes that may need more support.",
},
];

return (
<section className="my-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
<h2 className="mb-2 text-xl font-bold text-gray-900">
✨ AI Insights
</h2>

  <p className="mb-5 text-sm text-gray-500">
    Donation analysis and impact recommendations
  </p>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {insights.map((item) => (
      <div
        key={item.title}
        className="rounded-xl border bg-gray-50 p-4"
      >
        <h3 className="mb-2 font-semibold text-gray-800">
          {item.icon} {item.title}
        </h3>
        <p className="text-sm leading-6 text-gray-600">
          {item.description}
        </p>
      </div>
    ))}
  </div>

  <p className="mt-4 text-xs text-gray-400">
    These insights are calculated from donation records. Live Gemini AI is not connected.
  </p>
</section>

);
}
