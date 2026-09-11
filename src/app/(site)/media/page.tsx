import type { Metadata } from "next";
import { desc } from "drizzle-orm";

import { PageBanner } from "@/components/layout/page-banner";
import { Container } from "@/components/ui/container";
import { MediaGallery } from "@/components/media/media-gallery";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media",
  description: "Photos, videos and recordings from the Central Moon Sighting Committee GB & EU.",
};

export default async function MediaPage() {
  const db = await getDb();
  const items = await db.select().from(schema.media).orderBy(desc(schema.media.createdAt));

  return (
    <>
      <PageBanner
        crumb="Media"
        eyebrow="Gallery"
        title="Media"
        description="Photos and videos from sightings, committee activity, and community events across our network."
      />
      <section className="py-14 sm:py-16">
        <Container>
          <MediaGallery items={items} />
        </Container>
      </section>
    </>
  );
}
