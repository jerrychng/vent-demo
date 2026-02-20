"use client";

import EngineerBottomBar from "@/app/(protected)/components/EngineerBottomBar";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import type { JobRow, JobsResponse } from "@/types/models";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Calendar, CircleDot, EllipsisVertical, MapPin, User, FileText, Compass } from "lucide-react";

type ScheduleTab = "upcoming" | "ongoing" | "completed";

const scheduleTabs: Array<{ key: ScheduleTab; label: string }> = [
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getLocation(job: JobRow): string {
  return [job.site.address_line_1, job.site.address_line_2, job.site.city, job.site.postcode]
    .filter(Boolean)
    .join(", ");
}

export default function EngineerSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ScheduleTab>("upcoming");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "engineer") {
      router.replace("/dashboard");
      return;
    }

    if (!user || user.role !== "engineer") return;

    setLoading(true);
    setError(null);
    apiFetch<JobsResponse>("/jobs")
      .then((res) => setJobs(res.jobs))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load schedule");
      })
      .finally(() => setLoading(false));
  }, [user, router]);

  const filteredJobs = useMemo(() => {
    const ownScheduledJobs = jobs.filter((job) => job.engineer?.id === user?.id && Boolean(job.scheduled_date));
    const sorted = [...ownScheduledJobs].sort((a, b) => {
      const aTime = a.scheduled_date ? new Date(a.scheduled_date).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.scheduled_date ? new Date(b.scheduled_date).getTime() : Number.MAX_SAFE_INTEGER;
      if (aTime !== bTime) return aTime - bTime;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (activeTab === "ongoing") {
      return sorted.filter((job) => job.status === "in_progress");
    }
    if (activeTab === "completed") {
      return sorted.filter((job) => job.status === "approved");
    }
    return sorted.filter((job) => job.status === "assigned" || job.status === "submitted" || job.status === "rejected");
  }, [activeTab, jobs, user?.id]);

  if (!user || user.role !== "engineer") {
    return null;
  }

  return (
    <div className="pb-32">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3159a7] via-[#4068b2] to-[#89a4d7] pt-8 px-4 pb-4 text-white">
        <div className="absolute right-0 top-3 h-20 w-20 rounded-full bg-white/15" />
        <div className="relative z-10 flex rounded-full border border-white/35 bg-white/10 p-1">
          {scheduleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 rounded-full py-2 text-sm font-semibold ${
                activeTab === tab.key ? "bg-accent text-[#17325e]" : "text-white/90"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-b-[10px] border border-[#d8e6ff] border-t-0 bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#8b94aa]">
          <CircleDot className="h-4 w-4" />
          {filteredJobs.length} {scheduleTabs.find((tab) => tab.key === activeTab)?.label} Service Appointments
        </p>

        {loading && <p className="text-sm text-[#68728c]">Loading schedule...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && filteredJobs.length === 0 && (
          <p className="text-sm text-[#68728c]">No scheduled jobs for this tab.</p>
        )}

        <div className="space-y-3">
          {filteredJobs.map((item) => (
            <div
              key={item.id}
              className="rounded-[10px] border border-[#d8e6ff] bg-white p-3 shadow-[0_2px_4px_rgba(50,56,67,0.04)]"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xl font-semibold text-[#2a4f97]">{item.title}</p>
                </div>
                <div className="rounded-full border border-[#9eb3dc] px-3 py-1 text-sm text-[#6d7690]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-[#27549d]" />
                    {formatDate(item.scheduled_date)}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-[#68728c]">
                  <p className="inline-flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-[#27549d]" />
                    {item.reference}
                  </p>
                  <p className="inline-flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-[#27549d]" />
                    {item.engineer?.full_name ?? user.full_name}
                  </p>
                  <p className="inline-flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-[#27549d]" />
                    {getLocation(item) || "No location"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1 rounded-[10px] border border-[#3059a7] px-3 py-2 text-base font-semibold text-[#3059a7]"
                    onClick={() => router.push(`/jobs/${item.id}`)}
                  >
                    <Compass className="h-4 w-4" />
                    View
                  </button>
                  <button className="text-[#9ca5bb]">
                    <EllipsisVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EngineerBottomBar active="schedule" />
    </div>
  );
}
