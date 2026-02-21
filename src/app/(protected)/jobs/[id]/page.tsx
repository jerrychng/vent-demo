"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { JobDetail } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon } from "lucide-react";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jobId = params.id;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    apiFetch<JobDetail>(`/jobs/${jobId}`)
      .then((data) => {
        setJob(data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function submitReview(action: "approve" | "reject") {
    if (!job) return;

    setActionError(null);
    setReviewing(true);

    try {
      if (action === "approve") {
        await apiFetch(`/jobs/${job.id}/approve`, {
          method: "POST",
          body: JSON.stringify({ notes: "" }),
        });
        setApproveOpen(false);
      } else {
        const reason = rejectReason.trim();
        if (!reason) {
          setActionError("Rejection reason is required.");
          setReviewing(false);
          return;
        }

        await apiFetch(`/jobs/${job.id}/reject`, {
          method: "POST",
          body: JSON.stringify({ reason }),
        });
        setRejectOpen(false);
        setRejectReason("");
      }

      router.push("/jobs");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Review action failed");
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading job...</p>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="p-6">
        <p className="text-sm text-destructive">{error || "Job not found"}</p>
      </main>
    );
  }

  const canReview = job.status === "submitted";
  const statusBadgeClass =
    job.status === "rejected"
      ? "bg-red-100 text-red-700"
      : job.status === "approved"
        ? "bg-green-100 text-green-700"
        : job.status === "in_progress"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/jobs")} className="text-muted-foreground">
        <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Jobs
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {job.title}{" "}
              <span className="ml-2 text-xs font-mono font-normal text-muted-foreground">{job.reference}</span>
            </CardTitle>
            <span className={`rounded-md px-2 py-1 text-xs font-medium uppercase ${statusBadgeClass}`}>
              {job.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Site:{" "}
            {[job.site.address_line_1, job.site.address_line_2, job.site.city, job.site.postcode]
              .filter(Boolean)
              .join(", ") || job.site.postcode || "-"}
          </p>
          <p className="text-sm text-muted-foreground">
            Engineer: {job.engineer?.full_name ?? "Unassigned"}
          </p>
          <p className="text-sm text-muted-foreground">
            Scheduled:
            {" "}
            {job.scheduled_start_time ? new Date(job.scheduled_start_time).toLocaleString() : "-"}
            {" "}
            to
            {" "}
            {job.scheduled_end_time ? new Date(job.scheduled_end_time).toLocaleString() : "-"}
          </p>
        </CardHeader>
      </Card>

      {job.status === "rejected" && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Rejection details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Reason</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {job.review_notes?.trim() ? job.review_notes : "No reason provided"}
              </p>
            </div>
            {job.reviewed_at != null && (
              <p className="text-xs text-muted-foreground">
                Rejected on {new Date(job.reviewed_at).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {actionError && <p className="text-sm text-destructive" role="alert">{actionError}</p>}

      <section className="space-y-4">
        {job.captures
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((capture) => (
            <Card key={capture.template_area_id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Area {capture.order_index}: {capture.area_name}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {capture.post_captured_at ? "Done" : "Incomplete"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Photo guidance: {capture.photo_guidance?.trim() ? capture.photo_guidance : "No guidance provided"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Pre-work</p>
                    {capture.pre_image_url ? (
                      <img
                        src={capture.pre_image_url}
                        alt="Pre work"
                        className="w-full max-h-64 object-cover rounded-md border border-border"
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground border border-border rounded-md p-4 text-center">
                        No pre-work photo
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Post-work</p>
                    {capture.post_image_url ? (
                      <img
                        src={capture.post_image_url}
                        alt="Post work"
                        className="w-full max-h-64 object-cover rounded-md border border-border"
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground border border-border rounded-md p-4 text-center">
                        No post-work photo
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </section>

      <section className="flex gap-3">
        <Button
          variant="destructive"
          onClick={() => setRejectOpen(true)}
          disabled={reviewing || !canReview}
        >
          Reject
        </Button>
        <Button
          onClick={() => setApproveOpen(true)}
          className="bg-highlight-green hover:bg-highlight-green/90"
          disabled={reviewing || !canReview}
        >
          Approve
        </Button>
      </section>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Job</DialogTitle>
            <DialogDescription>
            Please double check the information. Once you save a field, you won't be able to change it again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={reviewing}>
              Cancel
            </Button>
            <Button onClick={() => submitReview("approve")} disabled={reviewing}>
              {reviewing ? "Approving..." : "Confirm Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Job</DialogTitle>
            <DialogDescription>
              Enter a rejection reason and confirm to reject this job.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-reason">Rejection reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this job is being rejected"
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
              }}
              disabled={reviewing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => submitReview("reject")} disabled={reviewing}>
              {reviewing ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
