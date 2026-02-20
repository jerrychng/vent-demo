"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { JobRow, JobsResponse } from "@/types/models";
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
  const [approvedCount, setApprovedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "engineer") {
      router.replace("/engineer-home");
      return;
    }

    apiFetch<JobsResponse>("/jobs?status=submitted")
      .then((res) => setPending(res.jobs))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load jobs pending review"));
    apiFetch<JobsResponse>("/jobs?status=approved")
      .then((res) => setApprovedCount(res.total))
      .catch(() => setApprovedCount(0));
  }, [loading, user, router]);

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
            <p className="text-3xl font-semibold">–</p>
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
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
