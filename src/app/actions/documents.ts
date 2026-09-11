"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, getCf, schema } from "@/db/client";
import { requireUser } from "@/lib/auth/dal";
import { DocumentSchema, type DocumentFormState } from "@/lib/validation/document";

const MANAGER_ROLES = ["super_admin", "committee_admin"] as const;

async function logAudit(actorName: string, action: string, target: string) {
  const db = await getDb();
  await db.insert(schema.auditLogs).values({ id: crypto.randomUUID(), actorName, action, target });
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

export async function createDocument(
  _prevState: DocumentFormState,
  formData: FormData
): Promise<DocumentFormState> {
  const user = await requireUser([...MANAGER_ROLES]);

  const parsed = DocumentSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    date: formData.get("date"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const data = parsed.data;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF file to upload." };
  }
  if (file.size > 15 * 1024 * 1024) {
    return { error: "File must be under 15 MB." };
  }
  if (file.type && file.type !== "application/pdf") {
    return { error: "The document must be a PDF file." };
  }

  const id = crypto.randomUUID();
  const { env } = await getCf();
  const fileKey = `documents/${id}/${sanitizeFilename(file.name || "document.pdf")}`;
  await env.UPLOADS.put(fileKey, await file.arrayBuffer(), { httpMetadata: { contentType: "application/pdf" } });

  const db = await getDb();
  await db.insert(schema.documents).values({
    id,
    title: data.title,
    category: data.category,
    description: data.description || null,
    date: data.date,
    fileKey,
    fileName: file.name || "document.pdf",
  });

  await logAudit(user.name, "uploaded a document:", data.title);
  revalidatePath("/admin/dashboard/documents");
  revalidatePath("/documents");
}

export async function deleteDocument(id: string) {
  const user = await requireUser([...MANAGER_ROLES]);
  const db = await getDb();
  const rows = await db.select({ title: schema.documents.title, fileKey: schema.documents.fileKey }).from(schema.documents).where(eq(schema.documents.id, id)).limit(1);
  const doc = rows[0];
  if (!doc) return;

  const { env } = await getCf();
  await env.UPLOADS.delete(doc.fileKey).catch(() => {});
  await db.delete(schema.documents).where(eq(schema.documents.id, id));
  await logAudit(user.name, "removed the document:", doc.title);

  revalidatePath("/admin/dashboard/documents");
  revalidatePath("/documents");
}
