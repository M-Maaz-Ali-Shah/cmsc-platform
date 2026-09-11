import * as z from "zod";

// Each content block has its own small, structured field set — never a
// single freeform HTML field. Rendered as plain text by React (auto-
// escaped), so there's no stored-XSS surface here.

export const CONTENT_BLOCK_DEFS = {
  "homepage-hero": {
    label: "Homepage Hero",
    schema: z.object({
      title: z.string().trim().min(1, { error: "Title is required." }).max(150),
      description: z.string().trim().min(1, { error: "Description is required." }).max(400),
    }),
  },
  "footer-text": {
    label: "Footer Tagline",
    schema: z.object({
      text: z.string().trim().min(1, { error: "Text is required." }).max(300),
    }),
  },
  "committee-intro": {
    label: "Committee Page Intro",
    schema: z.object({
      text: z.string().trim().min(1, { error: "Text is required." }).max(500),
    }),
  },
  "moon-sighting-intro": {
    label: "Moon Sighting Page Intro",
    schema: z.object({
      text: z.string().trim().min(1, { error: "Text is required." }).max(500),
    }),
  },
  "contact-intro": {
    label: "Contact Page Intro",
    schema: z.object({
      text: z.string().trim().min(1, { error: "Text is required." }).max(500),
    }),
  },
  "privacy-policy": {
    label: "Privacy Policy",
    schema: z.object({
      updated: z.string().trim().min(1).max(100),
      body: z.string().trim().min(1, { error: "Body is required." }).max(20000),
    }),
  },
  "terms-of-use": {
    label: "Terms of Use",
    schema: z.object({
      updated: z.string().trim().min(1).max(100),
      body: z.string().trim().min(1, { error: "Body is required." }).max(20000),
    }),
  },
} as const;

export type ContentBlockId = keyof typeof CONTENT_BLOCK_DEFS;
export const CONTENT_BLOCK_IDS = Object.keys(CONTENT_BLOCK_DEFS) as ContentBlockId[];

export type ContentBlockFields<Id extends ContentBlockId> = z.infer<
  (typeof CONTENT_BLOCK_DEFS)[Id]["schema"]
>;

export function isContentBlockId(id: string): id is ContentBlockId {
  return id in CONTENT_BLOCK_DEFS;
}

export type ContentSaveFormState = { error?: string } | { success: true } | undefined;

/**
 * Parses the "## Heading" convention used by the long-form legal blocks
 * (privacy-policy, terms-of-use) into sections for LegalDoc, instead of a
 * rich-text editor / raw HTML field.
 */
export function parseSectionedBody(body: string): { heading: string; body: string[] }[] {
  const lines = body.split("\n");
  const sections: { heading: string; body: string[] }[] = [];
  let current: { heading: string; body: string[] } | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0 && current) {
      current.body.push(paragraph.join(" ").trim());
      paragraph = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith("## ")) {
      flushParagraph();
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), body: [] };
    } else if (line.trim() === "") {
      flushParagraph();
    } else if (current) {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  if (current) sections.push(current);
  return sections;
}
