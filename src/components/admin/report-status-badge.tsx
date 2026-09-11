import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/lib/types/reports";

const map: Record<ReportStatus, "neutral" | "review" | "confirmed" | "awaiting" | "notSighted"> = {
  Submitted: "neutral",
  Received: "neutral",
  "Under Review": "review",
  "Contact Verification": "review",
  Accepted: "confirmed",
  "Included in Decision": "confirmed",
  Rejected: "notSighted",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge variant={map[status]}>{status}</Badge>;
}
