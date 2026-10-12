const planFeatures = [
  { feature: "Outlets", basic: "1", pro: "5", business: "Unlimited" },
  { feature: "Users", basic: "2", pro: "10", business: "Unlimited" },
  { feature: "Support", basic: "Email", pro: "Priority", business: "Dedicated" },
  { feature: "Reports", basic: "Basic", pro: "Advanced", business: "Custom" },
] as const;

export function PlanComparisonTable() {
  return (
    <section aria-labelledby="plan-comparison-title" className="mt-10">
      <h2
        className="mb-4 text-xl font-semibold tracking-tight text-neutral-950"
        id="plan-comparison-title"
      >
        Compare package features
      </h2>
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Feature comparison for Basic, Pro, and Business packages
          </caption>
          <thead className="bg-neutral-50">
            <tr>
              <th
                className="px-4 py-3 font-semibold text-neutral-900"
                scope="col"
              >
                Feature
              </th>
              <th
                className="px-4 py-3 font-semibold text-neutral-900"
                scope="col"
              >
                Basic
              </th>
              <th
                className="px-4 py-3 font-semibold text-neutral-900"
                scope="col"
              >
                Pro
              </th>
              <th
                className="px-4 py-3 font-semibold text-neutral-900"
                scope="col"
              >
                Business
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {planFeatures.map((row) => (
              <tr key={row.feature}>
                <th
                  className="px-4 py-3 font-medium text-neutral-800"
                  scope="row"
                >
                  {row.feature}
                </th>
                <td className="px-4 py-3 text-neutral-700">{row.basic}</td>
                <td className="px-4 py-3 text-neutral-700">{row.pro}</td>
                <td className="px-4 py-3 text-neutral-700">{row.business}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Plan limits are illustrative and may vary by product.
      </p>
    </section>
  );
}
