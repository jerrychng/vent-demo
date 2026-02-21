"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type {
  JobDetail,
  JobRow,
  JobsResponse,
  JobStatus,
  SiteListItem,
  SitesResponse,
  TemplateListItem,
  TemplatesResponse,
  UserListItem,
  UsersResponse,
} from "@/types/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

function toLocalDateTimeInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getNowLocalDateTimeInputValue(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getTodayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatScheduledWindow(start: string | null, end: string | null): string {
  if (!start && !end) return "-";
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const startText = startDate && !Number.isNaN(startDate.getTime()) ? startDate.toLocaleString() : start ?? "-";
  const endText = endDate && !Number.isNaN(endDate.getTime()) ? endDate.toLocaleString() : end ?? "-";
  if (!start) return `Ends: ${endText}`;
  if (!end) return `Starts: ${startText}`;
  return `${startText} - ${endText}`;
}

function getStatusBadgeClass(status: JobStatus): string {
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "in_progress") return "bg-yellow-100 text-yellow-700";
  if (status === "assigned") return "bg-blue-100 text-blue-700";
  return "bg-muted text-muted-foreground";
}

export default function JobsPage() {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [engineers, setEngineers] = useState<UserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [sortOrder, setSortOrder] = useState<"recent" | "old">("recent");
  const [editingJob, setEditingJob] = useState<JobRow | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobRow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const canManageJobs = user?.role === "super_admin" || user?.role === "trade_manager";

  const [form, setForm] = useState({
    title: "",
    description: "",
    site_id: "",
    template_id: "",
    engineer_id: "",
    scheduled_date: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    engineer_id: "",
    status: "assigned" as JobStatus,
    scheduled_date: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
  });

  async function loadJobs() {
    const res = await apiFetch<JobsResponse>("/jobs");
    setJobs(res.jobs);
  }

  useEffect(() => {
    if (!user) return;

    loadJobs().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    });

    if (canManageJobs) {
      Promise.all([
        apiFetch<SitesResponse>("/sites"),
        apiFetch<TemplatesResponse>("/templates?is_active=true"),
        apiFetch<UsersResponse>("/users?role=engineer"),
      ])
        .then(([sitesRes, templatesRes, usersRes]) => {
          setSites(sitesRes.sites);
          setTemplates(templatesRes.templates);
          setEngineers(usersRes.users);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Failed to load job form data");
        });
    }
  }, [user, canManageJobs]);

  async function handleCreateJob(event: FormEvent) {
    event.preventDefault();
    setError(null);

    setSubmitting(true);

    try {
      const nowMs = Date.now();
      if (form.scheduled_date && new Date(`${form.scheduled_date}T00:00:00`).getTime() < new Date(`${getTodayInputValue()}T00:00:00`).getTime()) {
        throw new Error("Scheduled date cannot be in the past");
      }
      if (form.engineer_id) {
        if (!form.scheduled_start_time || !form.scheduled_end_time) {
          throw new Error("Scheduled start and end time are required when assigning an engineer");
        }
        if (new Date(form.scheduled_start_time).getTime() < nowMs) {
          throw new Error("Scheduled start time cannot be before the current time");
        }
        if (new Date(form.scheduled_end_time).getTime() <= new Date(form.scheduled_start_time).getTime()) {
          throw new Error("Scheduled end time must be after start time");
        }
      }
      await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          site_id: Number(form.site_id),
          template_id: Number(form.template_id),
          engineer_id: form.engineer_id ? Number(form.engineer_id) : null,
          scheduled_date: form.scheduled_date || null,
          scheduled_start_time: form.scheduled_start_time || null,
          scheduled_end_time: form.scheduled_end_time || null,
        }),
      });

      await loadJobs();
      const t = toast({ title: "Job created successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        site_id: "",
        template_id: "",
        engineer_id: "",
        scheduled_date: "",
        scheduled_start_time: "",
        scheduled_end_time: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  async function openEditJob(job: JobRow) {
    setError(null);
    try {
      const detail = await apiFetch<JobDetail>(`/jobs/${job.id}`);
      setEditingJob(job);
      setEditForm({
        title: detail.title,
        description: detail.description ?? "",
        engineer_id: detail.engineer?.id ? String(detail.engineer.id) : "",
        status: detail.status,
        scheduled_date: detail.scheduled_date ?? "",
        scheduled_start_time: toLocalDateTimeInputValue(detail.scheduled_start_time ?? null),
        scheduled_end_time: toLocalDateTimeInputValue(detail.scheduled_end_time ?? null),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load job for editing");
    }
  }

  async function handleUpdateJob(event: FormEvent) {
    event.preventDefault();
    if (!editingJob) return;
    setError(null);
    setSavingEdit(true);
    try {
      const nowMs = Date.now();
      if (editForm.scheduled_date && new Date(`${editForm.scheduled_date}T00:00:00`).getTime() < new Date(`${getTodayInputValue()}T00:00:00`).getTime()) {
        throw new Error("Scheduled date cannot be in the past");
      }
      if (editForm.engineer_id) {
        if (!editForm.scheduled_start_time || !editForm.scheduled_end_time) {
          throw new Error("Scheduled start and end time are required when assigning an engineer");
        }
        if (new Date(editForm.scheduled_start_time).getTime() < nowMs) {
          throw new Error("Scheduled start time cannot be before the current time");
        }
        if (new Date(editForm.scheduled_end_time).getTime() <= new Date(editForm.scheduled_start_time).getTime()) {
          throw new Error("Scheduled end time must be after start time");
        }
      }
      await apiFetch(`/jobs/${editingJob.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || null,
          engineer_id: editForm.engineer_id ? Number(editForm.engineer_id) : null,
          status: editForm.status,
          scheduled_date: editForm.scheduled_date || null,
          scheduled_start_time: editForm.scheduled_start_time || null,
          scheduled_end_time: editForm.scheduled_end_time || null,
        }),
      });
      await loadJobs();
      const t = toast({ title: "Job updated successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setEditingJob(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update job");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteJob() {
    if (!deletingJob) return;
    setError(null);
    setDeleting(true);
    try {
      await apiFetch(`/jobs/${deletingJob.id}`, { method: "DELETE" });
      await loadJobs();
      const t = toast({ title: "Job deleted successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setDeletingJob(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeleting(false);
    }
  }

  const visibleJobs = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? jobs
        : jobs.filter((job) => job.status === statusFilter);

    return [...filtered].sort((a, b) => {
      const aTime = Date.parse(a.created_at);
      const bTime = Date.parse(b.created_at);
      const safeATime = Number.isNaN(aTime) ? 0 : aTime;
      const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
      return sortOrder === "recent" ? safeBTime - safeATime : safeATime - safeBTime;
    });
  }, [jobs, statusFilter, sortOrder]);

  if (loading || !user) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        {canManageJobs && (
          <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((v) => !v)}>
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create job
              </>
            )}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive mb-2" role="alert">
          {error}
        </p>
      )}

      {showForm && canManageJobs && (
        <Card className="p-4">
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="job-title">Title</Label>
                <Input
                  id="job-title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Job title"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="job-description">Description</Label>
                <Textarea
                  id="job-description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-site">Site</Label>
                <select
                  id="job-site"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.site_id}
                  onChange={(e) => setForm((f) => ({ ...f, site_id: e.target.value }))}
                >
                  <option value="">Select site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.client_name}
                      {site.site_name ? ` - ${site.site_name}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-template">Template</Label>
                <select
                  id="job-template"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.template_id}
                  onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value }))}
                >
                  <option value="">Select template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-engineer">Engineer</Label>
                <select
                  id="job-engineer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.engineer_id}
                  onChange={(e) => setForm((f) => ({ ...f, engineer_id: e.target.value }))}
                >
                  <option value="">Unassigned (Draft)</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="job-scheduled-date">Scheduled Date</Label>
                <Input
                  id="job-scheduled-date"
                  type="date"
                  min={getTodayInputValue()}
                  value={form.scheduled_date}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="job-scheduled-start-time">Scheduled Start Time</Label>
                <Input
                  id="job-scheduled-start-time"
                  type="datetime-local"
                  min={getNowLocalDateTimeInputValue()}
                  required={!!form.engineer_id}
                  value={form.scheduled_start_time}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-scheduled-end-time">Scheduled End Time</Label>
                <Input
                  id="job-scheduled-end-time"
                  type="datetime-local"
                  min={form.scheduled_start_time || getNowLocalDateTimeInputValue()}
                  required={!!form.engineer_id}
                  value={form.scheduled_end_time}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_end_time: e.target.value }))}
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create job
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="job-status-filter">Filter by status</Label>
            <select
              id="job-status-filter"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | JobStatus)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-sort-order">Sort by</Label>
            <select
              id="job-sort-order"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "recent" | "old")}
            >
              <option value="recent">Most recent</option>
              <option value="old">Oldest</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Window</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleJobs.map((job) => (
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
                    .join(", ") || job.site.postcode || "-"}
                </TableCell>
                <TableCell>{job.engineer?.full_name ?? "Unassigned"}</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(job.status)}`}>
                    {job.status.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell>{formatScheduledWindow(job.scheduled_start_time ?? null, job.scheduled_end_time ?? null)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
                    {canManageJobs && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-transparent hover:text-foreground"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditJob(job);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeletingJob(job);
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visibleJobs.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
        <DialogContent className="max-w-lg rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Edit job</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateJob} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-job-title">Title</Label>
              <Input
                id="edit-job-title"
                required
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-job-description">Description</Label>
              <Textarea
                id="edit-job-description"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-job-engineer">Engineer</Label>
                <select
                  id="edit-job-engineer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.engineer_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, engineer_id: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-status">Status</Label>
                <select
                  id="edit-job-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as JobStatus }))}
                >
                  <option value="draft">Draft</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-job-scheduled-date">Scheduled date</Label>
              <Input
                id="edit-job-scheduled-date"
                type="date"
                min={getTodayInputValue()}
                value={editForm.scheduled_date}
                onChange={(e) => setEditForm((f) => ({ ...f, scheduled_date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-job-scheduled-start-time">Scheduled start time</Label>
                <Input
                  id="edit-job-scheduled-start-time"
                  type="datetime-local"
                  min={getNowLocalDateTimeInputValue()}
                  required={!!editForm.engineer_id}
                  value={editForm.scheduled_start_time}
                  onChange={(e) => setEditForm((f) => ({ ...f, scheduled_start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-scheduled-end-time">Scheduled end time</Label>
                <Input
                  id="edit-job-scheduled-end-time"
                  type="datetime-local"
                  min={editForm.scheduled_start_time || getNowLocalDateTimeInputValue()}
                  required={!!editForm.engineer_id}
                  value={editForm.scheduled_end_time}
                  onChange={(e) => setEditForm((f) => ({ ...f, scheduled_end_time: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingJob(null)} disabled={savingEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingJob} onOpenChange={(open) => !open && setDeletingJob(null)}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Delete job</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {deletingJob?.reference ?? "this job"}?
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeletingJob(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteJob} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
