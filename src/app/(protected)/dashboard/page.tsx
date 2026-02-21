"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { JobDetail, JobRow, JobsResponse } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      router.replace("/engineer-home");
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
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{activeCount === null ? "–" : activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{pending.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {approvedCount === null ? "–" : approvedCount}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Pending Review</h2>
        </div>
        {error && (
          <p className="text-sm text-destructive mb-2" role="alert">
            {error}
          </p>
        )}
        <Card>
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
                  className="cursor-pointer"
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
                        <img src={jobPhotoPreview[job.id].pre!} alt="Pre" className="h-10 w-10 rounded border object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded border text-[10px] text-muted-foreground">Pre</div>
                      )}
                      {jobPhotoPreview[job.id]?.post ? (
                        <img src={jobPhotoPreview[job.id].post!} alt="Post" className="h-10 w-10 rounded border object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded border text-[10px] text-muted-foreground">Post</div>
                      )}
                    </div>
                  </TableCell> */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
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

