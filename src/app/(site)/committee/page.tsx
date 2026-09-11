import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { UserRound } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { getDb, schema } from "@/db/client";
import { getPublishedContent } from "@/app/actions/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Committee",
  description:
    "Governance and membership structure of the Central Moon Sighting Committee GB & EU.",
  alternates: { canonical: "/committee" },
};

export default async function CommitteePage() {
  const db = await getDb();
  const [members, intro] = await Promise.all([
    db
      .select()
      .from(schema.committeeMembers)
      .where(eq(schema.committeeMembers.approved, true))
      .orderBy(asc(schema.committeeMembers.sortOrder)),
    getPublishedContent("committee-intro", {
      text: "The committee brings together scholars, astronomical advisers and regional representatives across Great Britain and Europe. Member details are published here only once approved by administrators.",
    }),
  ]);

  return (
    <>
      <PageBanner crumb="Committee" eyebrow="Governance" title="Committee" description={intro.text} />

      <section className="py-14 sm:py-16">
        <Container>
          {members.length === 0 ? (
            <div className="rounded-lg border border-gold-500/30 bg-gold-50 p-4 text-sm text-gold-900">
              No committee member profiles have been published yet. Check
              back soon, or contact the committee for more information.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <Card key={member.id} className="p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-navy-50 text-navy-400">
                    {member.photoKey ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/public-files/${member.photoKey}`}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="size-8" aria-hidden />
                    )}
                  </div>
                  <p className="mt-4 font-heading text-sm font-bold text-navy-900">{member.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {member.role}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">{member.region}</p>
                  {member.bio && <p className="mt-3 text-xs leading-relaxed text-ink-600">{member.bio}</p>}
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
