import { FileCode2 } from "lucide-react";
import { SectionPlaceholder } from "@/components/admin/section-placeholder";

export default function AdminContentPage() {
  return (
    <SectionPlaceholder
      icon={FileCode2}
      title="Website Content"
      description="Edit public page text, contact details, and social links without needing a developer."
      bullets={[
        "Edit homepage sections and page copy",
        "Update contact details and social media links",
        "Manage translations for English, Urdu, and Arabic",
      ]}
    />
  );
}
