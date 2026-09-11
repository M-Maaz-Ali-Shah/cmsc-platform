"use client";

import { useActionState, useState, useTransition } from "react";
import { FileText, MapPinned, Trash2, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CreateTeamAccountForm } from "@/components/admin/create-team-account-form";
import { createRegion, assignRegionRepresentative, deleteRegion } from "@/app/actions/regions";
import { REGION_GROUPS, type RegionFormState } from "@/lib/validation/region";

export interface RegionWithStats {
  id: string;
  name: string;
  group: string;
  status: string;
  representativeUserId: string | null;
  representativeName: string | null;
  reportCount: number;
  observerCount: number;
}

export interface RegionalRepOption {
  id: string;
  name: string;
  email: string;
}

const initialState: RegionFormState = undefined;

export function RegionsManager({
  regions,
  regionalReps,
  canEdit,
}: {
  regions: RegionWithStats[];
  regionalReps: RegionalRepOption[];
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(createRegion, initialState);
  const gb = regions.filter((r) => r.group === "Great Britain");
  const eu = regions.filter((r) => r.group === "Europe");

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-ink-500">
        Add or remove GB &amp; EU regions and assign representatives. Report
        and observer counts are computed live from submitted sighting
        reports.
      </p>

      {canEdit && (
        <Card className="p-6">
          <p className="font-heading text-base font-bold text-navy-900">Add a Region</p>
          <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <Field label="Country / region name" htmlFor="region-name" required>
              <Input id="region-name" name="name" placeholder="e.g. Portugal" required />
            </Field>
            <Field label="Group" htmlFor="region-group" required>
              <select
                id="region-group"
                name="group"
                required
                defaultValue="Europe"
                className="h-11 rounded-md border border-border-subtle bg-paper px-3.5 text-sm text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
              >
                {REGION_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Adding…" : "Add Region"}
              </Button>
            </div>
          </form>
          {state?.error && <p className="mt-2 text-xs font-medium text-red-700">{state.error}</p>}
        </Card>
      )}

      {canEdit && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Add a regional representative account</p>
          <CreateTeamAccountForm role="regional_rep" regions={regions} label="New Regional Representative" />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <RegionGroup title="Great Britain" items={gb} regionalReps={regionalReps} canEdit={canEdit} />
        <RegionGroup title="Europe" items={eu} regionalReps={regionalReps} canEdit={canEdit} />
      </div>
    </div>
  );
}

function RegionGroup({
  title,
  items,
  regionalReps,
  canEdit,
}: {
  title: string;
  items: RegionWithStats[];
  regionalReps: RegionalRepOption[];
  canEdit: boolean;
}) {
  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-navy-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((r) => (
          <RegionRow key={r.id} region={r} regionalReps={regionalReps} canEdit={canEdit} />
        ))}
        {items.length === 0 && <p className="text-sm text-ink-400">No regions in this group yet.</p>}
      </div>
    </div>
  );
}

function RegionRow({
  region,
  regionalReps,
  canEdit,
}: {
  region: RegionWithStats;
  regionalReps: RegionalRepOption[];
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [repId, setRepId] = useState(region.representativeUserId ?? "");

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-heading text-base font-bold text-navy-900">
          <MapPinned className="size-4 text-emerald-700" aria-hidden />
          {region.name}
        </p>
        <Badge variant={region.status === "Active" ? "emerald" : "neutral"}>{region.status}</Badge>
      </div>

      <div className="mt-3 flex gap-6 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" aria-hidden />
          {region.observerCount} distinct observers
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="size-3.5" aria-hidden />
          {region.reportCount} reports
        </span>
      </div>

      {canEdit ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={repId}
            disabled={pending}
            onChange={(e) => {
              const value = e.target.value;
              setRepId(value);
              startTransition(() => assignRegionRepresentative(region.id, value || null));
            }}
            className="h-9 rounded-md border border-border-subtle bg-paper px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
          >
            <option value="">Unassigned</option>
            {regionalReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove ${region.name} from the region list?`)) {
                startTransition(() => deleteRegion(region.id));
              }
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-500">
          Representative: {region.representativeName ?? "Unassigned"}
        </p>
      )}
    </Card>
  );
}
