import { Container } from "@/components/ui/container";

export function LegalDoc({
  updated,
  sections,
}: {
  updated: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <section className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <div className="rounded-lg border border-gold-500/30 bg-gold-50 p-4 text-sm text-gold-900">
          Draft placeholder text for design review. This has not been
          reviewed by legal counsel and must not be treated as the
          committee&rsquo;s actual policy until finalised.
        </div>
        <p className="mt-6 text-xs text-ink-500">Last updated: {updated}</p>

        <div className="mt-4 space-y-8">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-heading text-lg font-bold text-navy-900">{section.heading}</h2>
              <div className="mt-2 space-y-3">
                {section.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-ink-700">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
