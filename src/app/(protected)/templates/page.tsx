"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import type { TemplateDetail, TemplateListItem, TemplatesResponse } from "@/types/models";
import { type FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type AreaRow = { name: string; order_index: number; photo_guidance: string };

export default function TemplatesPage() {
  const { user, loading } = useAuth();
  const canManageTemplates =
    user?.role === "super_admin" || user?.role === "trade_manager";

  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [areas, setAreas] = useState<AreaRow[]>([{ name: "", order_index: 1, photo_guidance: "" }]);
  const [viewDetail, setViewDetail] = useState<TemplateDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!user) return;
    apiFetch<TemplatesResponse>("/templates")
      .then((res) => setTemplates(res.templates))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load templates"));
  }, [user]);

  async function openTemplateDetail(id: number) {
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await apiFetch<TemplateDetail>(`/templates/${id}`);
      setViewDetail(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const areaList = areas.filter((a) => a.name.trim());
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }
    if (areaList.length === 0) {
      setError("Add at least one area");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/templates", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          areas: areaList.map((a, i) => ({
            name: a.name.trim(),
            order_index: i + 1,
            photo_guidance: a.photo_guidance.trim() || null
          }))
        })
      });
      const res = await apiFetch<TemplatesResponse>("/templates");
      setTemplates(res.templates);
      setShowForm(false);
      setName("");
      setDescription("");
      setAreas([{ name: "", order_index: 1, photo_guidance: "" }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  }

  function addArea() {
    setAreas((prev) => [...prev, { name: "", order_index: prev.length + 1, photo_guidance: "" }]);
  }

  function removeArea(i: number) {
    setAreas((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
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
        <h1 className="text-2xl font-semibold">Templates</h1>
        {canManageTemplates && (
          <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : (<><Plus className="h-4 w-4" />Create template</>)}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New template</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="template-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-desc">Description</Label>
                <Textarea
                  id="template-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Areas</Label>
                  <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={addArea}>
                    + Add area
                  </Button>
                </div>
                <div className="space-y-2">
                  {areas.map((area, i) => (
                    <div key={i} className="flex flex-wrap gap-2 items-center rounded-md border border-border bg-muted/30 p-3">
                      <Input
                        placeholder="Area name"
                        className="flex-1 min-w-[120px]"
                        value={area.name}
                        onChange={(e) =>
                          setAreas((prev) => prev.map((a, j) => (j === i ? { ...a, name: e.target.value } : a)))
                        }
                      />
                      <Input
                        placeholder="Photo guidance"
                        className="flex-1 min-w-[160px]"
                        value={area.photo_guidance}
                        onChange={(e) =>
                          setAreas((prev) => prev.map((a, j) => (j === i ? { ...a, photo_guidance: e.target.value } : a)))
                        }
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeArea(i)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create template"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Areas</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{t.description ?? "—"}</TableCell>
                <TableCell>{t.area_count}</TableCell>
                <TableCell>{t.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={loadingDetail}
                    onClick={() => openTemplateDetail(t.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {canManageTemplates ? "No templates yet. Create one above." : "No templates yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!viewDetail} onOpenChange={(open) => !open && setViewDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[12px]">
          <DialogHeader>
            <DialogTitle>{viewDetail?.name ?? "Template"}</DialogTitle>
          </DialogHeader>
          {viewDetail && (
            <div className="space-y-4">
              {viewDetail.description && (
                <p className="text-sm text-muted-foreground">{viewDetail.description}</p>
              )}
              <div>
                <p className="text-sm font-medium mb-2">
                  Areas ({viewDetail.areas.length})
                </p>
                <ul className="space-y-3">
                  {viewDetail.areas
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((area) => (
                      <li
                        key={area.id}
                        className="rounded-md border border-border bg-muted/30 p-3 text-sm"
                      >
                        <p className="font-medium">{area.name}</p>
                        {area.photo_guidance && (
                          <p className="text-muted-foreground mt-1">
                            Photo: {area.photo_guidance}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
