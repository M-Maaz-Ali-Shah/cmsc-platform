import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SectionPlaceholder({
  icon: Icon,
  title,
  description,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Card className="mx-auto max-w-2xl p-8 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700">
        <Icon className="size-7" aria-hidden />
      </div>
      <h2 className="mt-4 font-heading text-xl font-bold text-navy-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
      <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-ink-700">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
            {b}
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-lg bg-gold-50 p-3 text-xs text-gold-900">
        This section is planned for a later build phase, once the database
        and authentication are in place.
      </p>
    </Card>
  );
}
