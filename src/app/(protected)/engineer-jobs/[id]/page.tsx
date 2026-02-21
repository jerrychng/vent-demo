"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import type { JobDetail } from "@/types/models";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera } from "lucide-react";

type CaptureSide = "pre" | "post";

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, content] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] ?? "image/jpeg";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

export default function EngineerJobDetailPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const webcamRef = useRef<Webcam | null>(null);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<{ areaId: number; side: CaptureSide } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  async function loadJob() {
    const jobId = params.id;
    if (!jobId) return;
    const data = await apiFetch<JobDetail>(`/jobs/${jobId}`);
    setJob({
      ...data,
      site: { ...data.site },
      engineer: data.engineer ? { ...data.engineer } : null,
      captures: data.captures.map((capture) => ({ ...capture })),
    });
  }

  useEffect(() => {
    if (user && user.role !== "engineer") {
      router.replace("/dashboard");
      return;
    }
    if (!user || user.role !== "engineer") return;

    setLoading(true);
    setError(null);
    loadJob()
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load job"))
      .finally(() => setLoading(false));
  }, [user, router, params.id]);

  const orderedCaptures = useMemo(
    () => (job?.captures ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    [job?.captures]
  );
  const isCompleteForReview = useMemo(
    () =>
      orderedCaptures.length > 0 &&
      orderedCaptures.every((capture) => !!capture.pre_image_url && !!capture.post_image_url),
    [orderedCaptures]
  );
  const canCapture = useMemo(() => {
    if (!job) return false;
    if (job.status === "approved") return false;
    const scheduleMs = job.scheduled_start_time
      ? new Date(job.scheduled_start_time).getTime()
      : (job.scheduled_date ? new Date(`${job.scheduled_date}T00:00:00`).getTime() : null);
    if (scheduleMs == null || Number.isNaN(scheduleMs)) return false;
    return scheduleMs <= Date.now();
  }, [job]);

  async function captureAndUpload() {
    if (!job || !cameraTarget) return;

    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      setError("Could not capture image. Please try again.");
      return;
    }

    setError(null);
    const side = cameraTarget.side;
    const areaId = cameraTarget.areaId;
    const key = `${areaId}-${side}`;
    setUploadingKey(key);
    try {
      const file = dataUrlToFile(screenshot, `${side}-area-${areaId}.jpg`);
      const formData = new FormData();
      formData.append("image", file);
      await apiFetch(`/jobs/${job.id}/captures/${areaId}/${side}`, {
        method: "POST",
        body: formData,
      });
      await loadJob();
      setCameraTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingKey(null);
    }
  }

  async function submitForReview() {
    if (!job) return;
    if (!isCompleteForReview) {
      setError("You must upload all pre and post images before submitting for review.");
      return;
    }
    setError(null);
    setSubmittingReview(true);
    try {
      await apiFetch(`/jobs/${job.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "submitted",
        }),
      });
      await loadJob();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit for review");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (!user || user.role !== "engineer") {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">{error || "Job not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 px-[20px]">
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => router.push("/engineer-schedule")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to schedule
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <p className="text-sm text-muted-foreground">Reference: {job.reference}</p>
          <p className="text-sm text-muted-foreground">Status: {job.status.replace("_", " ")}</p>
        </CardHeader>
      </Card>

      {orderedCaptures.map((capture) => {
        const preKey = `${capture.template_area_id}-pre`;
        const postKey = `${capture.template_area_id}-post`;
        const preUploading = uploadingKey === preKey;
        const postUploading = uploadingKey === postKey;
        const postBlocked = !capture.pre_image_url;

        return (
          <Card key={capture.template_area_id}>
            <CardHeader>
              <CardTitle className="text-base">
                Area {capture.order_index}: {capture.area_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Photo guidance: {capture.photo_guidance?.trim() ? capture.photo_guidance : "No guidance provided"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Pre</p>
                  {capture.pre_image_url ? (
                    <img
                      src={capture.pre_image_url}
                      alt={`Pre - ${capture.area_name}`}
                      className="h-40 w-full rounded-md border object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-md border text-sm text-muted-foreground">
                      No pre image
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={preUploading || !canCapture}
                    onClick={() => setCameraTarget({ areaId: capture.template_area_id, side: "pre" })}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {preUploading ? "Uploading..." : "Click take picture"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Post</p>
                  {capture.post_image_url ? (
                    <img
                      src={capture.post_image_url}
                      alt={`Post - ${capture.area_name}`}
                      className="h-40 w-full rounded-md border object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-md border text-sm text-muted-foreground">
                      No post image
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={postUploading || postBlocked || !canCapture}
                    onClick={() => setCameraTarget({ areaId: capture.template_area_id, side: "post" })}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {postUploading ? "Uploading..." : "Click take picture"}
                  </Button>
                  {!canCapture && (
                    <p className="text-xs text-muted-foreground">Capture is enabled when job is in progress.</p>
                  )}
                  {canCapture && postBlocked && (
                    <p className="text-xs text-muted-foreground">Upload pre image first.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {cameraTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-base capitalize">
                Capture {cameraTarget.side} image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="h-auto w-full rounded-md border"
                videoConstraints={{ facingMode: "environment" }}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCameraTarget(null)} disabled={!!uploadingKey}>
                  Cancel
                </Button>
                <Button type="button" onClick={captureAndUpload} disabled={!!uploadingKey}>
                  {uploadingKey ? "Uploading..." : "Capture & Upload"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-3">
          {!isCompleteForReview && (
            <p className="text-sm text-destructive">
              You must upload all images before submitting for review.
            </p>
          )}
          {job.status === "submitted" && (
            <p className="text-sm text-muted-foreground">
              This job has already been submitted for review.
            </p>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={submitForReview}
              disabled={submittingReview || !isCompleteForReview || job.status === "submitted" || job.status === "approved"}
            >
              {submittingReview ? "Submitting..." : "Submit for review"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
