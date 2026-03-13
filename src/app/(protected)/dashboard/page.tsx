"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { JobDetail, JobRow, JobsResponse } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileExpandableList } from "@/components/ui/mobile-expandable-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pending, setPending] = useState<JobRow[]>([]);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobPhotoPreview, setJobPhotoPreview] = useState<Record<number, { pre: string | null; post: string | null }>>({});

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "engineer") {
      router.replace("/engineer-schedule");
      return;
    }

    apiFetch<JobsResponse>("/jobs?status=submitted")
      .then((res) => setPending(res.jobs))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load jobs pending review"));
    apiFetch<JobsResponse>("/jobs?status=in_progress")
      .then((res) => setActiveCount(res.total))
      .catch(() => setActiveCount(0));
    apiFetch<JobsResponse>("/jobs?status=approved")
      .then((res) => setApprovedCount(res.total))
      .catch(() => setApprovedCount(0));
  }, [loading, user, router]);

  useEffect(() => {
    if (pending.length === 0) {
      setJobPhotoPreview({});
      return;
    }

    Promise.all(
      pending.map(async (job) => {
        try {
          const detail = await apiFetch<JobDetail>(`/jobs/${job.id}`);
          const first = detail.captures.find((c) => c.pre_image_url || c.post_image_url) ?? detail.captures[0];
          return [job.id, { pre: first?.pre_image_url ?? null, post: first?.post_image_url ?? null }] as const;
        } catch {
          return [job.id, { pre: null, post: null }] as const;
        }
      })
    ).then((entries) => {
      setJobPhotoPreview(Object.fromEntries(entries));
    });
  }, [pending]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-dark-primary">Dashboard</h1>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase  text-primary">
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-dark-primary">{activeCount === null ? "–" : activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase text-primary">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-dark-primary">{pending.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase  text-primary">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-dark-primary">
              {approvedCount === null ? "–" : approvedCount}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-dark-primary">Pending Review</h2>
        </div>
        {error && (
          <p className="text-sm text-destructive mb-2" role="alert">
            {error}
          </p>
        )}
        <Card className="md:hidden p-3">
          <MobileExpandableList
            items={pending}
            getKey={(job) => job.id}
            emptyMessage="No jobs pending review."
            mobileHeader={(
              <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-text-dark-gray">
                <span>Job</span>
                <span className="text-center">Status</span>
                <span className="text-left">Date</span>
              </div>
            )}
            renderSummary={(job) => (
              <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-2">
                <p className="min-w-0 truncate text-sm font-semibold text-dark-primary">{job.title}</p>
                <span className="justify-self-center rounded-full border border-subtle bg-white px-2 py-0.5 text-[10px] text-text-dark-gray capitalize">
                  {job.status.replace("_", " ")}
                </span>
                <span className="justify-self-start w-full truncate text-xs text-dark-primary">{job.scheduled_date ?? "-"}</span>
              </div>
            )}
            renderDetails={(job) => (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-dark-gray">Reference</p>
                  <p className="text-sm font-semibold text-primary">{job.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-dark-gray">Site</p>
                  <p className="text-sm text-dark-primary">
                    {[job.site.address_line_1, job.site.address_line_2, job.site.city, job.site.postcode]
                      .filter(Boolean)
                      .join(", ") || "No site"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-dark-gray">Engineer</p>
                  <p className="text-sm text-dark-primary">{job.engineer?.full_name ?? "Unassigned"}</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  View Detail
                </Button>
              </div>
            )}
          />
        </Card>
        <Card className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                {/* <TableHead>Photos</TableHead> */}
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((job) => (
                <TableRow
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <TableCell className="font-mono">{job.reference}</TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[job.site.address_line_1, job.site.address_line_2, job.site.city, job.site.postcode]
                      .filter(Boolean)
                      .join(", ") || job.site.postcode || "–"}
                  </TableCell>
                  <TableCell>{job.engineer?.full_name ?? "Unassigned"}</TableCell>
                  <TableCell className="capitalize">{job.status.replace("_", " ")}</TableCell>
                  <TableCell>{job.scheduled_date ?? "-"}</TableCell>
                  {/* <TableCell>
                    <div className="flex items-center gap-2">
                      {jobPhotoPreview[job.id]?.pre ? (
                        <img src={withBlobSas(jobPhotoPreview[job.id].pre) ?? ""} alt="Pre" className="h-10 w-10 rounded border object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded border text-[10px] text-muted-foreground">Pre</div>
                      )}
                      {jobPhotoPreview[job.id]?.post ? (
                        <img src={withBlobSas(jobPhotoPreview[job.id].post) ?? ""} alt="Post" className="h-10 w-10 rounded border object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded border text-[10px] text-muted-foreground">Post</div>
                      )}
                    </div>
                  </TableCell> */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="transparent"
                      className="bg-accent text-accent-foreground hover:opacity-75"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/jobs/${job.id}`);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pending.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No jobs pending review.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}


