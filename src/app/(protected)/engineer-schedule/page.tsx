"use client";

import EngineerBottomBar from "@/app/(protected)/components/EngineerBottomBar";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import type { JobRow, JobsResponse } from "@/types/models";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CircleDot, MapPin, User, FileText, Clock3, Circle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import _ from "lodash"; 

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

function formatShortDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} ${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createdByEmail, setCreatedByEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "engineer") {
      router.replace("/dashboard");
      return;
    }

    if (!user || user.role !== "engineer") return;

    let mounted = true;
    const loadSchedule = (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      setError(null);
      apiFetch<JobsResponse>("/jobs")
        .then((res) => {
          if (mounted) setJobs(res.jobs);
        })
        .catch((err: unknown) => {
          if (mounted) setError(err instanceof Error ? err.message : "Failed to load schedule");
        })
        .finally(() => {
          if (showLoading && mounted) setLoading(false);
        });
    };

    loadSchedule(true);
    const refreshInterval = window.setInterval(() => loadSchedule(false), 30_000);
    return () => {
      mounted = false;
      window.clearInterval(refreshInterval);
    };
  }, [user, router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTick(Date.now());
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user?.created_by) {
      setCreatedByEmail(null);
      return;
    }
    apiFetch<{ email: string }>(`/users/${user.created_by}`)
      .then((creator) => setCreatedByEmail(creator.email))
      .catch(() => setCreatedByEmail(null));
  }, [user?.created_by]);

  const filteredJobs = useMemo(() => {
    const nowMs = nowTick;
    const getScheduleMs = (job: JobRow) => {
      if (job.scheduled_start_time) return new Date(job.scheduled_start_time).getTime();
      if (job.scheduled_date) return new Date(`${job.scheduled_date}T00:00:00`).getTime();
      return null;
    };
    const ownJobs = jobs.filter((job) => job.engineer?.id === user?.id);
    const sorted = [...ownJobs].sort((a, b) => {
      const aTime = getScheduleMs(a) ?? Number.MAX_SAFE_INTEGER;
      const bTime = getScheduleMs(b) ?? Number.MAX_SAFE_INTEGER;
      if (aTime !== bTime) return aTime - bTime;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (activeTab === "ongoing") {
      return sorted.filter((job) => {
        const scheduleMs = getScheduleMs(job);
        return scheduleMs !== null && scheduleMs <= nowMs && job.status !== "approved";
      });
    }
    if (activeTab === "completed") {
      return sorted.filter((job) => job.status === "approved");
    }
    return sorted.filter((job) => {
      const scheduleMs = getScheduleMs(job);
      return scheduleMs !== null && scheduleMs > nowMs && job.status !== "approved";
    });
  }, [activeTab, jobs, user?.id, nowTick]);

  if (!user || user.role !== "engineer") {
    return null;
  }

  if (profileOpen) {
    return (
      <>
        <div className="p-4 pb-32">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold text-primary">
              Welcome <span className="text-dark-primary">to Aspect!</span>
            </p>
          </div>

          <div className="rounded-[12px] border border-subtle bg-[linear-gradient(180deg,var(--color-bg-bakground)_0%,white_100%)] p-5 shadow-[0_2px_8px_rgba(39,84,157,0.06)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-subtle bg-subtle">
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      aria-hidden="true"
                      className="h-7 w-7 bg-primary"
                      style={{
                        maskImage: "url('/assets/user_2.svg')",
                        WebkitMaskImage: "url('/assets/user_2.svg')",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-dark-primary">{user.full_name}</p>
                  <p className="text-base text-text-dark-gray">Engineer</p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-text-body">About</p>
              <span className="inline-flex items-center rounded-[8px] border border-secondary px-3 py-1 text-sm font-medium text-primary">
                <Circle className="mr-1 h-2 w-2 fill-current stroke-current" />
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-4 text-base text-text-body">
              <p className="inline-flex items-center gap-3">
                <Phone className="h-4 w-4 text-text-dark-gray" />
                <span className="font-medium">Phone:</span>
                <span>{user.phone_number?.trim() ? user.phone_number : "Not provided"}</span>
              </p>
              <p className="inline-flex items-center gap-3 break-all">
                <Mail className="h-4 w-4 text-text-dark-gray" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </p>
            </div>

            <hr className="my-5 border-subtle" />

            <div>
              <p className="mb-3 text-lg font-semibold text-text-body">Address</p>
              <p className="inline-flex items-start gap-2 text-base leading-6 text-text-body">
                <MapPin className="mt-1 h-4 w-4 text-text-dark-gray" />
                {user.address?.trim() ? user.address : "Address not provided"}
              </p>
            </div>

            <hr className="my-5 border-subtle" />

            <div>
              <p className="mb-3 text-lg font-semibold text-text-body">System information</p>
              <div className="space-y-2 text-base text-text-body">
                <p className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 bg-primary"
                    style={{
                      maskImage: "url('/assets/user_2.svg')",
                      WebkitMaskImage: "url('/assets/user_2.svg')",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                  Created by: {createdByEmail ?? "-"}
                </p>
                <p>
                  Created on:{" "}
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
              Close
            </Button>
          </div>
        </div>

        {/* <EngineerBottomBar active="schedule" /> */}
      </>
    );
  }

  return (
    <div className="pb-32">
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-primary via-primary to-primary pt-8 px-4 pb-4 text-white">
        <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold text-white">
            Welcome <span className="text-white">to Aspect!</span>
          </p>
          <div className="flex items-center text-primary">
            <button
              type="button"
              aria-label="Open profile"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-subtle"
              onClick={() => setProfileOpen(true)}
            >
              <Image
                src="/assets/profile.svg"
                alt="Profile"
                width={26}
                height={26}
                className="h-[26px] w-[26px]"
              />
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-3 h-20 w-20 rounded-full bg-white/15 z-0" />
        <div className="relative z-10 flex rounded-full border border-white/35 bg-white/10 p-1">
          {scheduleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex-1 rounded-full py-2 text-sm font-semibold ${
                activeTab === tab.key ? "bg-accent text-dark-primary" : "text-white/90"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-b-[10px] border border-subtle border-t-0 bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-text-dark-gray">
          <CircleDot className="h-4 w-4" />
          {filteredJobs.length} {scheduleTabs.find((tab) => tab.key === activeTab)?.label} Service Appointments
        </p>

        {loading && <p className="text-sm text-text-dark-gray">Loading schedule...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && filteredJobs.length === 0 && (
          <p className="text-sm text-text-dark-gray">No scheduled jobs for this tab.</p>
        )}

        <div className="space-y-3">
          {filteredJobs.map((item) => {
            const isCompleted = item.status === "approved";
            const badgeTone = isCompleted
              ? "border-highlight-green bg-light-green"
              : "border-subtle bg-background";
            const accentTone = isCompleted ? "text-highlight-green" : "text-primary";
            const lineTone = isCompleted ? "border-highlight-green" : "border-primary";
            return (
            <div
              key={item.id}
              className={`rounded-[10px] border p-3 shadow-[0_2px_4px_rgba(50,56,67,0.04)] ${
                item.status === "rejected" ? "border-[var(--color-red)] bg-[var(--color-light-red)]" : "border-subtle bg-white"
              } ${
                activeTab === "ongoing" || activeTab === "upcoming" ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (activeTab === "ongoing" || activeTab === "upcoming") {
                  router.push(`/engineer-jobs/${item.id}`);
                }
              }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xl font-semibold text-dark-primary">{item.title}</p>
                </div>
                <div className={`rounded-[18px] border px-4 py-2 text-text-dark-gray ${badgeTone}`}>
                  <div className="mt-1 flex items-start gap-2 text-sm leading-none text-text-dark-gray">
                    <div className={`mt-0.5 flex w-4 flex-col items-center ${accentTone}`}>
                      <Clock3 className="h-4 w-4" />
                      <span className={`my-1 h-1 border-l border-dashed ${lineTone}`} />
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="mt-1 space-y-3">
                      <p>{formatShortDate(item.scheduled_start_time ?? null)} {formatTime(item.scheduled_start_time ?? null)}</p>
                      <p>{formatShortDate(item.scheduled_end_time ?? null)} {formatTime(item.scheduled_end_time ?? null)}</p>
                      {(activeTab === "ongoing" || activeTab === "completed") && (
                        <p className="text-xs text-text-dark-gray">
                          Submitted: {formatDateTime(item.submitted_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-text-dark-gray">
                  <p className={`text-sm font-bold ${item.status === "rejected" ? "text-red-600" : "text-text-dark-gray"}`}>
                    {item.status === "rejected"
                      ? _.capitalize("rejected")
                      : _.capitalize(item.status.replace("_", " "))}
                  </p>
                  {item.status === "rejected" && (
                    <p className="text-sm text-red-600">
                      Reason: {item.review_notes?.trim() ? item.review_notes : "No reason provided"}
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="inline-flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4 text-primary" />
                      {item.reference}
                    </p>
                    <p className="inline-flex items-center gap-2 text-base">
                      <User className="h-4 w-4 text-primary" />
                      {item.engineer?.full_name ?? user.full_name}
                    </p>
                  </div>
                  <p className="inline-flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary" />
                    {getLocation(item) || "No location"}
                  </p>
                </div>

              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* <EngineerBottomBar active="schedule" /> */}
    </div>
  );
}

