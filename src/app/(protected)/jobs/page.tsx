"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import type {
  JobRow,
  JobsResponse,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function JobsPage() {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [engineers, setEngineers] = useState<UserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const canManageJobs = user?.role === "super_admin" || user?.role === "trade_manager";

  const [form, setForm] = useState({
    title: "",
    description: "",
    site_id: "",
    template_id: "",
    engineer_id: "",
    scheduled_date: "",
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

    if (!form.engineer_id) {
      setError("Please assign an engineer before creating a job");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          site_id: Number(form.site_id),
          template_id: Number(form.template_id),
          engineer_id: Number(form.engineer_id),
          scheduled_date: form.scheduled_date || null,
        }),
      });

      await loadJobs();
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        site_id: "",
        template_id: "",
        engineer_id: "",
        scheduled_date: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

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
            {showForm ? "Cancel" : "Create job"}
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
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.engineer_id}
                  onChange={(e) => setForm((f) => ({ ...f, engineer_id: e.target.value }))}
                >
                  <option value="">Select engineer</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-scheduled-date">Scheduled Date</Label>
                <Input
                  id="job-scheduled-date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create job"}
            </Button>
          </form>
        </Card>
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
            {jobs.map((job) => (
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
            {jobs.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
