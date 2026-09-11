import { Card } from "@/components/ui/card";

export function MagnitudeBars({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Card className="p-6">
      <p className="font-heading text-base font-bold text-navy-900">{title}</p>
      <div className="mt-5 space-y-3.5">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-ink-700">{d.label}</span>
              <span className="font-semibold text-navy-900">{d.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-paper-muted">
              <div
                className="h-full rounded-full bg-emerald-700"
                style={{ width: `${Math.max((d.value / max) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const statusColorMap: Record<string, string> = {
  Confirmed: "bg-emerald-700",
  "Under Review": "bg-navy-600",
  Awaiting: "bg-gold-600",
  Rejected: "bg-ink-300",
};

export function StatusBreakdown({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  return (
    <Card className="p-6">
      <p className="font-heading text-base font-bold text-navy-900">{title}</p>

      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-paper-muted" role="img" aria-label={`${title} distribution`}>
        {data.map((d, i) => (
          <div
            key={d.label}
            className={`h-full ${statusColorMap[d.label] ?? "bg-ink-300"} ${i > 0 ? "ml-0.5" : ""}`}
            style={{ width: `${(d.value / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2.5">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusColorMap[d.label] ?? "bg-ink-300"}`} aria-hidden />
            <span className="text-ink-700">{d.label}</span>
            <span className="ml-auto font-semibold text-navy-900">{d.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
