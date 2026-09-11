import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Download, FileText } from "lucide-react";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Documents",
  description:
    "Official statements, guidelines and reports published by the Central Moon Sighting Committee GB & EU.",
};

export default async function DocumentsPage() {
  const db = await getDb();
  const documents = await db.select().from(schema.documents).orderBy(desc(schema.documents.createdAt));

  return (
    <>
      <PageBanner
        crumb="Documents"
        eyebrow="Library"
        title="Documents"
        description="Official announcements, guidelines, statements and reports published by the committee."
      />
      <section className="py-14 sm:py-16">
        <Container>
          {documents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-subtle p-10 text-center text-sm text-ink-500">
              No documents have been published yet.
            </p>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                      <FileText className="size-5" aria-hidden />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-base font-bold text-navy-900">{doc.title}</p>
                        <Badge variant="navy">{doc.category}</Badge>
                      </div>
                      {doc.description && <p className="mt-1 text-sm text-ink-500">{doc.description}</p>}
                      <p className="mt-1 text-xs text-ink-300">Published {doc.date}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="shrink-0 sm:ml-4">
                    <a href={`/api/public-files/${doc.fileKey}`} target="_blank" rel="noreferrer">
                      <Download className="size-4" aria-hidden />
                      Download
                    </a>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
