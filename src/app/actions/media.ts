"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, getCf, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { MediaSchema, type MediaFormState } from "@/lib/validation/media";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

export async function createMedia(
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const user = await requireUser([...MANAGER_ROLES]);

  const parsed = MediaSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    type: formData.get("type"),
    videoUrl: formData.get("videoUrl") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;
  const id = crypto.randomUUID();

  let fileKey: string | null = null;
  if (data.type === "photo") {
    const photo = formData.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
      return { error: "Choose a photo to upload." };
    }
    if (photo.size > 8 * 1024 * 1024) return { error: "Photo must be under 8 MB." };
    if (photo.type && !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      return { error: "Photo must be a JPEG, PNG, or WEBP image." };
    }
    const { env } = await getCf();
    fileKey = `media/${id}/photo.${photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg"}`;
    await env.UPLOADS.put(fileKey, await photo.arrayBuffer(), { httpMetadata: { contentType: photo.type } });
  } else if (!data.videoUrl) {
    return { error: "Enter a video URL." };
  }

  const db = await getDb();
  await db.insert(schema.media).values({
    id,
    title: data.title,
    category: data.category,
    type: data.type,
    fileKey,
    videoUrl: data.type === "video" ? data.videoUrl || null : null,
  });

  await logAudit(user.name, "added a media item:", data.title);
  revalidatePath("/admin/dashboard/media");
  revalidatePath("/media");
}

export async function deleteMedia(id: string) {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ title: schema.media.title, fileKey: schema.media.fileKey }).from(schema.media).where(eq(schema.media.id, id)).limit(1);
  const item = rows[0];
  if (!item) return;

  if (item.fileKey) {
    const { env } = await getCf();
    await env.UPLOADS.delete(item.fileKey).catch(() => {});
  }
  await db.delete(schema.media).where(eq(schema.media.id, id));
  await logAudit(user.name, "removed the media item:", item.title);

  revalidatePath("/admin/dashboard/media");
  revalidatePath("/media");
}
