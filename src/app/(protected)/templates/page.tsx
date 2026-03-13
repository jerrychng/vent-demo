"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import type { TemplateDetail, TemplateListItem, TemplatesResponse } from "@/types/models";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileExpandableList } from "@/components/ui/mobile-expandable-list";
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

type AreaRow = { id?: number; name: string; order_index: string };

function getTemplateValidationError(templateName: string, rows: AreaRow[]): string | null {
  if (!templateName.trim()) return "Template name is required.";

  const areaList = rows.filter((a) => a.name.trim());
  if (areaList.length === 0) return "Add at least one area.";

  const parsedOrders = areaList.map((area) => Number.parseInt(area.order_index, 10));
  if (parsedOrders.some((order) => !Number.isFinite(order) || order <= 0)) {
    return "Each area order must be a positive number.";
  }

  const uniqueOrders = new Set(parsedOrders);
  if (uniqueOrders.size !== parsedOrders.length) {
    return "Each area must have a unique order number.";
  }

  return null;
}

function formatLastEdited(updatedAt?: string, createdAt?: string): string {
  const value = updatedAt || createdAt;
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

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
  const [areas, setAreas] = useState<AreaRow[]>([{ name: "", order_index: "1" }]);
  const [viewDetail, setViewDetail] = useState<TemplateDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateListItem | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<TemplateListItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [editAreas, setEditAreas] = useState<AreaRow[]>([{ name: "", order_index: "1" }]);
  const [originalEditAreaIds, setOriginalEditAreaIds] = useState<number[]>([]);
  const editTemplateValidationError = getTemplateValidationError(editForm.name, editAreas);

  function parseOrderIndex(value: string, fallback: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

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
      const t = toast({ title: "Ensure at least one area." });
      setTimeout(() => t.dismiss(), 4000);
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
            order_index: parseOrderIndex(a.order_index, i + 1),
          }))
        })
      });
      const res = await apiFetch<TemplatesResponse>("/templates");
      setTemplates(res.templates);
      const t = toast({ title: "Template created successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setShowForm(false);
      setName("");
      setDescription("");
      setAreas([{ name: "", order_index: "1" }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  }

  async function startEditTemplate(template: TemplateListItem) {
    setError(null);
    try {
      const detail = await apiFetch<TemplateDetail>(`/templates/${template.id}`);
      setEditingTemplate(template);
      setEditForm({
        name: detail.name,
        description: detail.description ?? "",
        is_active: detail.is_active,
      });
      setEditAreas(
        detail.areas.length > 0
          ? detail.areas
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((a) => ({
                id: a.id,
                name: a.name ?? "",
                order_index: String(a.order_index),
              }))
          : [{ name: "", order_index: "1" }]
      );
      setOriginalEditAreaIds(detail.areas.map((a) => a.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load template for editing");
    }
  }

  async function handleUpdateTemplate(e: FormEvent) {
    e.preventDefault();
    if (!editingTemplate) return;
    if (editTemplateValidationError) {
      setError(editTemplateValidationError);
      return;
    }
    setError(null);
    const areaList = editAreas.filter((a) => a.name.trim());
    setSavingEdit(true);
    try {
      await apiFetch(`/templates/${editingTemplate.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          is_active: editForm.is_active,
        }),
      });

      const currentAreaIds = areaList
        .map((area) => area.id)
        .filter((id): id is number => typeof id === "number");
      const removedAreaIds = originalEditAreaIds.filter((id) => !currentAreaIds.includes(id));

      for (const areaId of removedAreaIds) {
        await apiFetch(`/templates/${editingTemplate.id}/areas/${areaId}`, {
          method: "DELETE",
        });
      }

      for (let i = 0; i < areaList.length; i += 1) {
        const area = areaList[i];
        const payload: { name: string; order_index: number } = {
          name: area.name.trim(),
          order_index: parseOrderIndex(area.order_index, i + 1),
        };

        if (area.id != null) {
          await apiFetch(`/templates/${editingTemplate.id}/areas/${area.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await apiFetch(`/templates/${editingTemplate.id}/areas`, {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
      }

      const res = await apiFetch<TemplatesResponse>("/templates");
      setTemplates(res.templates);
      const t = toast({ title: "Template updated successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setEditingTemplate(null);
      setOriginalEditAreaIds([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update template");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteTemplate() {
    if (!deletingTemplate) return;
    setError(null);
    setDeleting(true);
    try {
      await apiFetch(`/templates/${deletingTemplate.id}`, { method: "DELETE" });
      const res = await apiFetch<TemplatesResponse>("/templates");
      setTemplates(res.templates);
      const t = toast({ title: "Template deleted successfully." });
      setTimeout(() => t.dismiss(), 4000);
      setDeletingTemplate(null);
      if (viewDetail?.id === deletingTemplate.id) {
        setViewDetail(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete template");
    } finally {
      setDeleting(false);
    }
  }

  function addArea() {
    setAreas((prev) => [...prev, { name: "", order_index: String(prev.length + 1) }]);
  }

  function removeArea(i: number) {
    setAreas((prev) => {
      if (prev.length <= 1) {
        const t = toast({ title: "Ensure at least one area." });
        setTimeout(() => t.dismiss(), 4000);
        return prev;
      }
      return prev.filter((_, idx) => idx !== i);
    });
  }

  function removeEditArea(i: number) {
    setEditAreas((prev) => {
      if (prev.length <= 1) {
        const t = toast({ title: "Ensure at least one area." });
        setTimeout(() => t.dismiss(), 4000);
        return prev;
      }
      return prev.filter((_, idx) => idx !== i);
    });
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
        <h1 className="text-2xl font-semibold text-dark-primary">Templates</h1>
        {canManageTemplates && (
          <Button variant={showForm ? "outline" : "primary"} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : (<><Image src="/assets/Plus_rectangle.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden />Create template</>)}
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
                    <div key={i} className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex-1 min-w-[120px] space-y-1">
                          <Label className="text-xs text-muted-foreground">Area Name</Label>
                          <Input
                            placeholder="Area name"
                            value={area.name}
                            onChange={(e) =>
                              setAreas((prev) => prev.map((a, j) => (j === i ? { ...a, name: e.target.value } : a)))
                            }
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs text-muted-foreground">Order</Label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Order"
                            value={area.order_index}
                            onChange={(e) =>
                              setAreas((prev) =>
                                prev.map((a, j) =>
                                  j === i
                                    ? { ...a, order_index: e.target.value.replace(/\D/g, "") }
                                    : a
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                      {/* Photo guidance removed from MVP */}
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeArea(i)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : (<><Image src="/assets/Plus_rectangle.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden />Create template</>)}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="md:hidden p-3">
        <MobileExpandableList
          items={templates}
          getKey={(t) => t.id}
          emptyMessage={canManageTemplates ? "No templates yet. Create one above." : "No templates yet."}
          mobileHeader={(
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-text-dark-gray">
              <span>Template</span>
              <span>Status</span>
            </div>
          )}
          renderSummary={(t) => (
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <p className="min-w-0 truncate text-sm font-semibold text-dark-primary">{t.name}</p>
              <span className={`justify-self-start rounded-full border px-2 py-0.5 text-[10px] ${t.is_active ? "border-highlight-green bg-light-green text-dark-green" : "border-subtle bg-white text-text-dark-gray"}`}>
                {t.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          )}
          renderDetails={(t) => (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-dark-gray">Description</p>
                <p className="text-sm text-dark-primary">{t.description ?? "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-dark-gray">Areas</p>
                <p className="text-sm text-dark-primary">{t.area_count}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  disabled={loadingDetail}
                  onClick={() => openTemplateDetail(t.id)}
                >
                  View Detail
                </Button>
                {canManageTemplates && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => startEditTemplate(t)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeletingTemplate(t)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        />
      </Card>

      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Areas</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{t.description ?? "—"}</TableCell>
                <TableCell>{t.area_count}</TableCell>
                <TableCell>{t.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="transparent"
                      size="sm"
                      className="bg-accent text-accent-foreground hover:opacity-75"
                      disabled={loadingDetail}
                      onClick={() => openTemplateDetail(t.id)}
                    >
                      View
                    </Button>
                    {canManageTemplates && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-transparent hover:text-foreground hover:opacity-75"
                          onClick={() => startEditTemplate(t)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingTemplate(t)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
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
              <p className="text-sm">
                <span className="font-medium text-muted-foreground">Last Edited:</span>{" "}
                {formatLastEdited(viewDetail.updated_at, viewDetail.created_at)}
              </p>
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
                        <p className="font-medium">
                          Order {area.order_index}: {area.name}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTemplate(null);
            setOriginalEditAreaIds([]);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Edit template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTemplate} className="space-y-4">
            {editTemplateValidationError && (
              <p className="text-sm text-destructive" role="alert">{editTemplateValidationError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-template-name">Name</Label>
              <Input
                id="edit-template-name"
                required
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-template-description">Description</Label>
              <Textarea
                id="edit-template-description"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-template-active">Active</Label>
              <select
                id="edit-template-active"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editForm.is_active ? "true" : "false"}
                onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.value === "true" }))}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Areas</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setEditAreas((prev) => [...prev, { name: "", order_index: String(prev.length + 1) }])}
                >
                  + Add area
                </Button>
              </div>
              <div className="space-y-2">
                {editAreas.map((area, i) => (
                  <div key={i} className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="flex-1 min-w-[120px] space-y-1">
                        <Label className="text-xs text-muted-foreground">Area Name</Label>
                        <Input
                          placeholder="Area name"
                          value={area.name}
                          onChange={(e) =>
                            setEditAreas((prev) => prev.map((a, j) => (j === i ? { ...a, name: e.target.value } : a)))
                          }
                        />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs text-muted-foreground">Order</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Order"
                          value={area.order_index}
                          onChange={(e) =>
                            setEditAreas((prev) =>
                              prev.map((a, j) =>
                                j === i
                                  ? { ...a, order_index: e.target.value.replace(/\D/g, "") }
                                  : a
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                    {/* Photo guidance removed from MVP */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEditArea(i)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingTemplate(null);
                  setOriginalEditAreaIds([]);
                }}
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit || !!editTemplateValidationError}>
                {savingEdit ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTemplate} onOpenChange={(open) => !open && setDeletingTemplate(null)}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Delete template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {deletingTemplate?.name ?? "this template"}?
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeletingTemplate(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteTemplate} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

