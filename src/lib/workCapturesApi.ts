import { apiFetch } from "@/lib/api";
import type { WorkCaptureUploadResponse, WorkCapturesResponse } from "@/types/models";

export type CaptureSide = "pre" | "post";

export function getJobCaptures(jobId: string | number): Promise<WorkCapturesResponse> {
  return apiFetch<WorkCapturesResponse>(`/jobs/${jobId}/captures`);
}

export async function uploadJobCapture(
  jobId: string | number,
  areaId: number,
  side: CaptureSide,
  imageFile: File
): Promise<WorkCaptureUploadResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);
  return apiFetch<WorkCaptureUploadResponse>(`/jobs/${jobId}/captures/${areaId}/${side}`, {
    method: "POST",
    body: formData,
  });
}
