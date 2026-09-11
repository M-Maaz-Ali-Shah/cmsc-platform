"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import {
  CONTENT_BLOCK_DEFS,
  CONTENT_BLOCK_IDS,
  isContentBlockId,
  type ContentBlockId,
  type ContentBlockFields,
  type ContentSaveFormState,
} from "@/lib/validation/content";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

const PUBLIC_PATHS_BY_BLOCK: Record<ContentBlockId, string[]> = {
  "homepage-hero": ["/"],
  "footer-text": ["/"], // footer renders on every page, but revalidating "/" is enough for our fully-dynamic pages
  "committee-intro": ["/committee"],
  "moon-sighting-intro": ["/moon-sighting"],
  "contact-intro": ["/contact"],
  "privacy-policy": ["/privacy-policy"],
  "terms-of-use": ["/terms-of-use"],
};

export interface ContentBlockSummary {
  id: ContentBlockId;
  label: string;
  status: "Never Published" | "Draft changes pending" | "Published";
  updatedByName: string;
  updatedAt: Date;
  publishedAt: Date | null;
}

/** Admin list view — every known block, even if its row hasn't been touched yet. */
export async function listContentBlocks(): Promise<ContentBlockSummary[]> {
  await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select().from(schema.contentBlocks);
  const byId = new Map(rows.map((r) => [r.id, r]));

  return CONTENT_BLOCK_IDS.map((id) => {
    const def = CONTENT_BLOCK_DEFS[id];
    const row = byId.get(id);
    if (!row) {
      return { id, label: def.label, status: "Never Published" as const, updatedByName: "—", updatedAt: new Date(0), publishedAt: null };
    }
    const status = !row.publishedFields
      ? ("Never Published" as const)
      : row.draftFields === row.publishedFields
        ? ("Published" as const)
        : ("Draft changes pending" as const);
    return { id, label: row.label, status, updatedByName: row.updatedByName, updatedAt: row.updatedAt, publishedAt: row.publishedAt };
  });
}

export async function getContentBlockForEdit(id: ContentBlockId) {
  await requireUser([...MANAGER_ROLES]);
  const def = CONTENT_BLOCK_DEFS[id];
  const db = await getDb();
  const rows = await db.select().from(schema.contentBlocks).where(eq(schema.contentBlocks.id, id)).limit(1);
  const row = rows[0];
  let draft: Record<string, string> = {};
  if (row) {
    try {
      draft = JSON.parse(row.draftFields);
    } catch {
      draft = {};
    }
  }
  return { id, label: def.label, draft, hasPublished: !!row?.publishedFields };
}

export async function saveContentDraft(
  id: ContentBlockId,
  _prevState: ContentSaveFormState,
  formData: FormData
): Promise<ContentSaveFormState> {
  const user = await requireUser([...MANAGER_ROLES]);
  if (!isContentBlockId(id)) return { error: "Unknown content block." };
  const def = CONTENT_BLOCK_DEFS[id];

  const parsed = def.schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const db = await getDb();
  const fieldsJson = JSON.stringify(parsed.data);
  await db
    .insert(schema.contentBlocks)
    .values({ id, label: def.label, draftFields: fieldsJson, updatedByName: user.name })
    .onConflictDoUpdate({
      target: schema.contentBlocks.id,
      set: { draftFields: fieldsJson, updatedByName: user.name, updatedAt: new Date() },
    });

  await logAudit(user.name, "saved a draft of", `content block "${def.label}"`);
  revalidatePath("/admin/dashboard/content");
  return { success: true };
}

export async function publishContentBlock(id: ContentBlockId) {
  const user = await requireUser([...MANAGER_ROLES]);
  if (!isContentBlockId(id)) throw new Error("Unknown content block.");

  const db = await getDb();
  const rows = await db.select().from(schema.contentBlocks).where(eq(schema.contentBlocks.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new Error("No draft to publish yet — save a draft first.");

  await db
    .update(schema.contentBlocks)
    .set({ publishedFields: row.draftFields, publishedAt: new Date() })
    .where(eq(schema.contentBlocks.id, id));

  await logAudit(user.name, "published", `content block "${row.label}"`);

  revalidatePath("/admin/dashboard/content");
  for (const path of PUBLIC_PATHS_BY_BLOCK[id]) revalidatePath(path);
}

/**
 * Public, no-auth read for pages — returns the published fields, or
 * `fallback` if nothing has ever been published (or the stored JSON somehow
 * fails validation). Every public page that reads a content block must
 * supply a fallback so the site never regresses to a blank section.
 */
export async function getPublishedContent<Id extends ContentBlockId>(
  id: Id,
  fallback: ContentBlockFields<Id>
): Promise<ContentBlockFields<Id>> {
  const db = await getDb();
  const rows = await db
    .select({ publishedFields: schema.contentBlocks.publishedFields })
    .from(schema.contentBlocks)
    .where(eq(schema.contentBlocks.id, id))
    .limit(1);
  const raw = rows[0]?.publishedFields;
  if (!raw) return fallback;
  try {
    const parsed = CONTENT_BLOCK_DEFS[id].schema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as ContentBlockFields<Id>) : fallback;
  } catch {
    return fallback;
  }
}
